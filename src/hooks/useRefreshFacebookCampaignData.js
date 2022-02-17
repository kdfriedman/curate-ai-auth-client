import fetchData from '../services/fetch/fetch';
import firestoreHandlers from '../services/firebase/data/firestore';
import { FACEBOOK_API } from '../services/facebook/constants';
import { FIREBASE } from '../services/firebase/constants';
import { HTTP_METHODS } from '../services/fetch/constants';
const { GET } = HTTP_METHODS;

// fetch list of ad campaigns to render refreshed facebook ad campaign data
const getFacebookCampaignData = async (adAccountId, userAccessToken) => {
  // fetch list of ad campaigns to render refreshed facebook ad campaign data
  const [adCampaignListResult, adCampaignListError] = await fetchData({
    method: GET,
    url: `${FACEBOOK_API.GRAPH.HOSTNAME}/${FACEBOOK_API.GRAPH.VERSION}/${adAccountId}/campaigns?fields=name,start_time,stop_time&access_token=${userAccessToken}`,
  });
  return [adCampaignListResult, adCampaignListError];
};

const generateAdCampaignPayload = (adCampaignListResult) => {
  return adCampaignListResult?.data?.data.map((campaign) => {
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
        startDate = startFormattedDateList.join('-');
        stopDate = stopFormattedDateList.join('-');
      }
    } catch (err) {
      console.error(err);
    }
    return {
      id: campaign.id,
      name: campaign.name,
      flight: startDate && stopDate ? `${startDate} - ${stopDate}` : 'N/A',
      isActive: false,
    };
  });
};

export const useRefreshFacebookCampaignData = () => {
  const { addRecordToFirestore, readUserRecordFromFirestore, removeRecordFromFirestore } = firestoreHandlers;

  const handleRefreshFacebookCampaignData = async (facebookRecord, setIntegrationRecord, setLoading) => {
    // set loading to true to trigger loader component
    setLoading(true);

    const [adCampaignListResult, adCampaignListError] = await getFacebookCampaignData(
      facebookRecord?.adAccountId,
      facebookRecord?.userAccessToken
    );
    if (adCampaignListError) throw adCampaignListError;

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
      userAccessToken: facebookRecord?.userAccessToken,
      id: facebookRecord?.id,
      createdAt: facebookRecord?.createdAt,
    };
    try {
      // remove associated record data from firestore db
      // we must remove the full record and re-add to update individual records
      // this is a firebase limitation - cannot update specific array of object indices
      const [, removedRecordError] = await removeRecordFromFirestore(
        facebookRecord?.uid,
        FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS,
        FIREBASE.FIRESTORE.FACEBOOK.DOCS,
        FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME,
        facebookRecord?.businessAcctId
      );
      if (removedRecordError) throw removedRecordError;

      // update firestore with copy of old record with the addition of the refreshed fb campaign data
      const [, addedRecordError] = await addRecordToFirestore(
        facebookRecord?.uid,
        FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS,
        FIREBASE.FIRESTORE.FACEBOOK.DOCS,
        facebookFirebasePayload,
        FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME
      );
      if (addedRecordError) throw addedRecordError;

      // read facebook record from firestore to render contents to page
      const [readRecord, readRecordError] = await readUserRecordFromFirestore(
        // user id
        facebookRecord?.uid,
        FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS,
        FIREBASE.FIRESTORE.FACEBOOK.DOCS
      );
      if (readRecordError) throw readRecordError;

      // check if records exists in firestore
      if (readRecord && readRecord?.exists) {
        const { facebookBusinessAccts } = readRecord?.data();
        // update parent state with firestore record update
        setIntegrationRecord({
          facebookBusinessAccts,
        });
        // remove loader
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
    }
  };
  return {
    handleRefreshFacebookCampaignData,
  };
};
