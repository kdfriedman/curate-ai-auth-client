import fetchData from '../services/fetch/fetch';
import firestoreHandlers from '../services/firebase/data/firestore';
import { FACEBOOK_API, FACEBOOK_ERROR } from '../services/facebook/constants';
import { FIREBASE } from '../services/firebase/constants';
import { HTTP_METHODS } from '../services/fetch/constants';
import { useFacebookAuth } from '../contexts/FacebookContext';
const { GET } = HTTP_METHODS;

// fetch list of ad campaigns to render refreshed facebook ad campaign data
const getFacebookCampaignData = async (adAccountId, userAccessToken) => {
  // fetch list of ad campaigns to render refreshed facebook ad campaign data
  const [adCampaignListResult, adCampaignListError] = await fetchData({
    method: GET,
    url: `${FACEBOOK_API.GRAPH.HOSTNAME}${FACEBOOK_API.GRAPH.VERSION}/${adAccountId}/campaigns?fields=objective,name,start_time,stop_time,insights.date_preset(maximum).level(campaign){actions}&limit=250&access_token=${userAccessToken}`,
  });
  return [adCampaignListResult, adCampaignListError];
};

const preservePrevCampaignIsActiveState = (prevAdCampaignList, refreshedAdCampaignList) => {
  const refreshedAdCampaignListWithPrevIsActive = refreshedAdCampaignList.map((campaign) => {
    const hasMatchingPrevCampaign = prevAdCampaignList.find((preCampaign) => preCampaign.id === campaign.id)?.isActive;
    return {
      ...campaign,
      isActive: hasMatchingPrevCampaign ?? false,
    };
  });
  return refreshedAdCampaignListWithPrevIsActive;
};

const generateAdCampaignPayload = (adCampaignListResult) => {
  return adCampaignListResult?.data?.data?.map((campaign) => {
    let startDate;
    let stopDate;
    try {
      if (campaign.start_time && campaign.stop_time) {
        const startFormattedDate = new Date(campaign.start_time).toISOString().slice(0, 10);
        const stopFormattedDate = new Date(campaign.stop_time).toISOString().slice(0, 10);
        const startFormattedDateList = startFormattedDate.split('-');
        const stopFormattedDateList = stopFormattedDate.split('-');
        const startFormattedDateLastItem = startFormattedDateList.shift();
        const stopFormattedDateLastItem = stopFormattedDateList.shift();
        startFormattedDateList.push(startFormattedDateLastItem);
        stopFormattedDateList.push(stopFormattedDateLastItem);
        startDate = startFormattedDateList.join('/');
        stopDate = stopFormattedDateList.join('/');
      }
    } catch (err) {
      console.error(err);
    }
    return {
      id: campaign.id,
      name: campaign.name,
      flight: startDate && stopDate ? `${startDate} - ${stopDate}` : 'N/A',
      objective: campaign.objective,
      actions: campaign.insights
        ? campaign.insights?.data?.[0].actions
            .map((action) => action.action_type)
            .filter((action, index, actions) => actions.indexOf(action) === index)
        : null,
    };
  });
};

export const useRefreshFacebookCampaignData = () => {
  const { addListOfRecordsToFirestore, readUserRecordFromFirestore, removeRecordFromFirestore } = firestoreHandlers;
  const { loginToFacebook } = useFacebookAuth();

  const handleRefreshFacebookCampaignData = async (facebookRecord, setIntegrationRecord, setLoading) => {
    // set loading to true to trigger loader component
    setLoading(true);

    let [adCampaignListResult, adCampaignListError] = await getFacebookCampaignData(
      facebookRecord?.adAccountId,
      facebookRecord?.userAccessToken
    );
    let refreshedUserAccessToken = null;
    if (adCampaignListError) {
      if (
        adCampaignListError?.response?.data?.error?.message?.includes(
          FACEBOOK_ERROR.MARKETING_API.ERROR_VALIDATING_TOKEN
        )
      ) {
        refreshedUserAccessToken = await loginToFacebook();
        if (refreshedUserAccessToken?.authResponse?.accessToken) {
          [adCampaignListResult, adCampaignListError] = await getFacebookCampaignData(
            facebookRecord?.adAccountId,
            refreshedUserAccessToken?.authResponse?.accessToken
          );
        }
      } else {
        console.error(adCampaignListError?.response?.data?.error?.message);
        return setLoading(false);
      }
    }

    const adCampaignList = generateAdCampaignPayload(adCampaignListResult);

    // create payload object for facebook integration
    const facebookFirebasePayload = {
      uid: facebookRecord?.uid,
      email: facebookRecord?.email,
      sysUserAccessToken: facebookRecord?.sysUserAccessToken,
      businessAcctName: facebookRecord?.businessAcctName,
      businessAcctId: facebookRecord?.businessAcctId,
      adAccountId: facebookRecord?.adAccountId,
      adCampaignList,
      userAccessToken: refreshedUserAccessToken?.authResponse?.accessToken || facebookRecord?.userAccessToken,
      id: facebookRecord?.id,
      createdAt: facebookRecord?.createdAt,
    };
    // remove associated record data from firestore db
    // we must remove the full record and re-add to update individual records
    // this is a firebase limitation - cannot update specific array of object indices
    const [removedRecord, removedRecordError] = await removeRecordFromFirestore(
      [
        FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS[0],
        facebookRecord?.uid,
        FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS[1],
        FIREBASE.FIRESTORE.FACEBOOK.DOCS[0],
      ],
      FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME,
      facebookRecord?.businessAcctId,
      FIREBASE.FIRESTORE.FACEBOOK.KEY_TO_USE_FOR_REMOVAL
    );

    if (removedRecordError) {
      console.error(removedRecordError);
      return setLoading(false);
    }

    facebookFirebasePayload.adCampaignList = preservePrevCampaignIsActiveState(
      removedRecord.adCampaignList,
      facebookFirebasePayload.adCampaignList
    );

    // update firestore with copy of old record with the addition of the refreshed fb campaign data
    const [, addedRecordError] = await addListOfRecordsToFirestore(
      [
        FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS[0],
        facebookRecord?.uid,
        FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS[1],
        FIREBASE.FIRESTORE.FACEBOOK.DOCS[0],
      ],
      facebookFirebasePayload,
      FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME
    );
    if (addedRecordError) {
      console.error(addedRecordError);
      return setLoading(false);
    }

    // read facebook record from firestore to render contents to page
    const [readRecord, readRecordError] = await readUserRecordFromFirestore([
      FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS[0],
      facebookRecord?.uid,
      FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS[1],
      FIREBASE.FIRESTORE.FACEBOOK.DOCS[0],
    ]);
    if (readRecordError) {
      console.error(readRecordError);
      return setLoading(false);
    }

    // check if records exists in firestore
    if (readRecord && readRecord?.exists()) {
      const { facebookBusinessAccts } = readRecord?.data();
      // update parent state with firestore record update
      setIntegrationRecord({
        facebookBusinessAccts,
      });
      // remove loader
      return setLoading(false);
    }
    setLoading(false);
  };
  return {
    handleRefreshFacebookCampaignData,
  };
};
