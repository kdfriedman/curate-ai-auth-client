import { useRefreshFacebookAccessToken } from '../hooks/useRefreshFacebookAccessToken';
import fetchData from '../services/fetch/fetch';
import firestoreHandlers from '../services/firebase/data/firestore';

export const useRefreshFacebookCampaignData = () => {
  const { handleRefreshFacebookAccessToken } = useRefreshFacebookAccessToken();
  const {
    addRecordToFirestore,
    readUserRecordFromFirestore,
    removeRecordFromFirestore,
  } = firestoreHandlers;

  const handleRefreshFacebookCampaignData = async (
    provider,
    facebookRecord,
    setIntegrationRecord,
    setLoading
  ) => {
    // set loading to true to trigger loader component
    setLoading(true);
    // handleRefreshFacebookAccessToken(provider);
    // fetch list of ad campaigns to render refreshed facebook ad campaign data
    const [adCampaignListResult, adCampaignListError] = await fetchData({
      method: 'GET',
      url: `https://graph.facebook.com/v11.0/${facebookRecord.adAccountId}/campaigns?fields=name,start_time,stop_time&access_token=${facebookRecord?.userAccessToken}`,
      params: {},
      data: {},
      headers: {},
    });
    if (adCampaignListError) {
      return console.error(
        '[line: 17 adCampaignListError]: fetch err has occured, check useRefreshCampaignData for details'
      );
    }

    const adCampaignList = adCampaignListResult?.data?.data.map((campaign) => {
      let startDate;
      let stopDate;
      try {
        if (campaign.start_time && campaign.stop_time) {
          const startFormattedDate = new Date(campaign.start_time)
            .toISOString()
            .slice(0, 10);
          const stopFormattedDate = new Date(campaign.stop_time)
            .toISOString()
            .slice(0, 10);
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
      const removedRecord = await removeRecordFromFirestore(
        facebookRecord?.uid,
        ['clients', 'integrations'],
        ['facebook'],
        'facebookBusinessAccts',
        facebookRecord?.businessAcctId
      );
      if (!removedRecord) {
        console.error(
          '[line 86: removedRecordFromFirestore] Err firestore record not removed'
        );
      }
      // update firestore with system user access token, auth uid, and email
      const addedFirestoreRecord = await addRecordToFirestore(
        facebookRecord?.uid,
        ['clients', 'integrations'],
        ['facebook'],
        facebookFirebasePayload,
        'facebookBusinessAccts'
      );
      // read facebook record from firestore to validate if integration exists
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
        return console.error(
          '[line 93: useRefreshFacebookCampaigndata] Error: failed to read record from firestore'
        );
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
