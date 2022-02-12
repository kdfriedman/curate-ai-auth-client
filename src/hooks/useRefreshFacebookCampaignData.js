import fetchData from '../services/fetch/fetch';
import firestoreHandlers from '../services/firebase/data/firestore';
import { FACEBOOK_API } from '../services/facebook/constants';
import { HTTP_METHODS } from '../services/fetch/constants';

export const useRefreshFacebookCampaignData = (setProviderType) => {
  const { GET } = HTTP_METHODS;
  const { addRecordToFirestore, readUserRecordFromFirestore, removeRecordFromFirestore } = firestoreHandlers;

  const handleRefreshFacebookCampaignData = async (provider, facebookRecord, setIntegrationRecord, setLoading) => {
    // set loading to true to trigger loader component
    setLoading(true);
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

    const [adCampaignListResult, adCampaignListError] = await getFacebookCampaignData(
      facebookRecord.adAccountId,
      facebookRecord.userAccessToken
    );

    // setup state for refresh token campign data fetch call
    let refreshTokenAdCampaignResult = null;
    if (adCampaignListError) {
      // unlink provider before refreshing token to avoid firebase error
      const providerUnlinked = await handleUnlinkProvider('facebook.com', true);
      if (providerUnlinked !== 'provider unlinked') {
        return console.error({
          errMsg: providerUnlinked,
        });
      }
      const refreshedAccessUserToken = await handleRefreshFacebookAccessToken(provider);
      if (!refreshedAccessUserToken) {
        return console.error(
          '[line 45: refreshedAccessToken] Err failed to refresh facebook user access token, see useRefreshFacebookCampaignData for details'
        );
      }
      const [adCampaignListResult, adCampaignListError] = await getFacebookCampaignData(
        facebookRecord.adAccountId,
        refreshedAccessUserToken
      );
      if (adCampaignListError) {
        return console.error(
          '[line: 58 adCampaignListError]: fetch err has occured, fetch facebook campaign data with refreshed fb token has failed. see useRefreshFacebookCampaignData for details'
        );
      }
      // assign refreshed token fb campign data fetch result to outer scoped var for usage in db update
      refreshTokenAdCampaignResult = adCampaignListResult;
      console.log(
        '[refreshTokenAdCampaignResult]: fb user token expired, refreshed token used to fetch fb campaign data.'
      );
    }

    // if adCampaignList is valid, saved fb user token is valid and was able to fetch fb campaign data
    // if adCampaignList is falsey, use refreshed fb token, meaning that the saved fb user token had been expired
    const adCampaignList = generateAdCampaignPayload(
      !adCampaignListResult ? refreshTokenAdCampaignResult : adCampaignListResult
    );

    if (adCampaignList.length === 0 || (!adCampaignListResult && !refreshTokenAdCampaignResult)) {
      return console.error(
        '[Line 106: adCampaignList.length === 0] Err failed to fetch fb ad campaign data using saved fb user token or refreshed fb user token. See useRefreshFacebookCampaignData for details.'
      );
    }

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
      const removedRecord = await removeRecordFromFirestore(
        facebookRecord?.uid,
        ['clients', 'integrations'],
        ['facebook'],
        'facebookBusinessAccts',
        facebookRecord?.businessAcctId
      );
      if (!removedRecord) {
        console.error('[line 86: removedRecordFromFirestore] Err firestore record not removed');
      }
      // update firestore with copy of old record with the addition of the refreshed fb campaign data
      const addedFirestoreRecord = await addRecordToFirestore(
        facebookRecord?.uid,
        ['clients', 'integrations'],
        ['facebook'],
        facebookFirebasePayload,
        'facebookBusinessAccts'
      );
      // read facebook record from firestore to render contents to page
      const [record, error] = await readUserRecordFromFirestore(
        // user id
        facebookRecord?.uid,
        // collections
        ['clients', 'integrations'],
        // docs
        ['facebook']
      );

      if (addedFirestoreRecord?.warnMsg || error) {
        console.error(error);
        return console.error('[line 93: useRefreshFacebookCampaigndata] Error: failed to read record from firestore');
      }

      // check if records exists in firestore
      if (record && record?.exists) {
        const { facebookBusinessAccts } = record?.data();
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
