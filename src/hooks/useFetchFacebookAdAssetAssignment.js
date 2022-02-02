import fetchData from '../services/fetch/fetch';
import { ERROR } from '../constants/error';
import { HTTP_METHODS } from '../services/fetch/constants';
import { FACEBOOK_API, ACTION_TYPES } from '../services/facebook/constants';
import { FIREBASE } from '../services/firebase/constants';
import { useFacebookAuth } from '../contexts/FacebookContext';
import firestoreHandlers from '../services/firebase/data/firestore';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../contexts/AuthContext';

// firestore db functions
const { addRecordToFirestore, readUserRecordFromFirestore } = firestoreHandlers;

// Constants
const { GET, POST } = HTTP_METHODS;
const { IS_LOADING, HAS_ERRORS, BUSINESS_ASSET_ID, BUSINESS_SYSTEM_USER_ID } = ACTION_TYPES;

const fetchFacebookUserAdAssetAssignment = async (
  dispatch,
  catchErrors,
  facebookAuthChange,
  businessAssetId,
  businessSystemUserId
) => {
  // assign assets to system user on behalf of client business manager acct
  const [, sysUserAssetAssignmentDataError] = await fetchData({
    method: POST,
    url: `${FACEBOOK_API.GRAPH.HOSTNAME}${FACEBOOK_API.GRAPH.VERSION}/${businessAssetId}/assigned_users?user=${businessSystemUserId}&tasks=MANAGE&access_token=${facebookAuthChange?.authResponse?.accessToken}`,
  });
  if (sysUserAssetAssignmentDataError) {
    // set isLoading to true to render progress
    dispatch({
      type: IS_LOADING,
      payload: false,
    });
    catchErrors(
      {
        type: HAS_ERRORS,
        payload: {
          errorMessage: sysUserAssetAssignmentDataError,
          errorUIMessage: ERROR.DASHBOARD.MAIN,
        },
      },
      dispatch
    );
  }
};

const fetchFacebookUserAdCampaigns = async (dispatch, catchErrors, facebookAuthChange, businessAssetId) => {
  // fetch list of ad campaigns to provide user for selection
  const [adCampaignListResult, adCampaignListError] = await fetchData({
    method: GET,
    url: `${FACEBOOK_API.GRAPH.HOSTNAME}${FACEBOOK_API.GRAPH.VERSION}/${businessAssetId}/campaigns?fields=name,start_time,stop_time&access_token=${facebookAuthChange?.authResponse?.accessToken}`,
  });

  if (adCampaignListError) {
    // set isLoading to true to render progress
    dispatch({
      type: IS_LOADING,
      payload: false,
    });
    catchErrors(
      {
        type: HAS_ERRORS,
        payload: {
          errorMessage: adCampaignListError,
          errorUIMessage: ERROR.DASHBOARD.MAIN,
        },
      },
      dispatch
    );
    return;
  }
  return adCampaignListResult;
};

const formatFacebookUserAdCampaignList = (adCampaignListResult) => {
  const formattedAdCampaignList = adCampaignListResult?.data?.data.map((campaign) => {
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
  return formattedAdCampaignList;
};

const generateFacebookFirestorePayload = (
  sysUserAccessToken,
  userBusinessId,
  businessAssetId,
  fbBusinessAcctName,
  adCampaignList,
  currentUser,
  facebookAuthChange
) => {
  // create payload object for facebook integration
  const facebookFirebasePayload = {
    uid: currentUser?.user?.uid,
    email: currentUser?.user?.email,
    sysUserAccessToken,
    businessAcctName: fbBusinessAcctName.name,
    businessAcctId: userBusinessId,
    adAccountId: businessAssetId,
    adCampaignList: adCampaignList,
    userAccessToken: facebookAuthChange?.authResponse?.accessToken,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  return facebookFirebasePayload;
};

const updateFirestoreWithFacebookUserRecord = async (currentUser, facebookFirebasePayload) => {
  // update firestore with system user access token, auth uid, and email
  return await addRecordToFirestore(
    currentUser.user.uid,
    FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS,
    FIREBASE.FIRESTORE.FACEBOOK.DOCS,
    facebookFirebasePayload,
    FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME
  );
};

const validateFacebookUserFirestoreRecord = async (dispatch, catchErrors, currentUser, addedFirestoreRecord) => {
  // read facebook record from firestore to validate if integration exists
  const [record, error] = await readUserRecordFromFirestore(
    currentUser.user.uid,
    FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS,
    FIREBASE.FIRESTORE.FACEBOOK.DOCS
  );

  if (addedFirestoreRecord?.warnMsg || error) {
    // reset business asset it to prevent 3rd useEffect from firing
    dispatch({
      type: BUSINESS_ASSET_ID,
      payload: null,
    });

    dispatch({
      type: BUSINESS_SYSTEM_USER_ID,
      payload: null,
    });

    // set isLoading to true to render progress
    dispatch({
      type: IS_LOADING,
      payload: false,
    });
    catchErrors(
      {
        type: HAS_ERRORS,
        payload: {
          errorMessage: addedFirestoreRecord?.warnMsg,
          errorUIMessage: ERROR.DASHBOARD.MAIN,
        },
      },
      dispatch
    );
    return;
  }
  return record;
};

const updateStateWithFacebookFirestoreRecord = (dispatch, record, setIntegrationRecord) => {
  if (record?.exists) {
    const { facebookBusinessAccts } = record?.data();
    // update parent component with firestore new record data
    setIntegrationRecord({
      facebookBusinessAccts,
    });

    // reset business asset it to prevent 3rd useEffect from firing
    dispatch({
      type: BUSINESS_ASSET_ID,
      payload: null,
    });

    dispatch({
      type: BUSINESS_SYSTEM_USER_ID,
      payload: null,
    });

    // set isLoading to true to render progress
    dispatch({
      type: IS_LOADING,
      payload: false,
    });
  }
};

export const useFetchFacebookAdAssetAssignment = () => {
  const { currentUser } = useAuth();
  const { facebookAuthChange } = useFacebookAuth();
  const handleFetchFacebookAdAssetAssignment = async (dispatch, catchErrors, state, setIntegrationRecord) => {
    const { businessAssetId, businessSystemUserId, userBusinessList, userBusinessId, sysUserAccessToken } = state;
    await fetchFacebookUserAdAssetAssignment(
      dispatch,
      catchErrors,
      facebookAuthChange,
      businessAssetId,
      businessSystemUserId
    );
    const facebooUserAdCampaignData = await fetchFacebookUserAdCampaigns(
      dispatch,
      catchErrors,
      facebookAuthChange,
      businessAssetId
    );
    // find facebook business acct name from user business list chosen with user selected id
    const facebookBusinessAccountName = userBusinessList.find((businessObject) => businessObject.id === userBusinessId);
    const formattedFacebookUserAdCampaignList = formatFacebookUserAdCampaignList(facebooUserAdCampaignData);
    const facebookFirestorePayload = generateFacebookFirestorePayload(
      sysUserAccessToken,
      userBusinessId,
      businessAssetId,
      facebookBusinessAccountName,
      formattedFacebookUserAdCampaignList,
      currentUser,
      facebookAuthChange
    );
    const facebookFirestoreAddedRecord = await updateFirestoreWithFacebookUserRecord(
      currentUser,
      facebookFirestorePayload
    );
    const validatedFacebookUserFirestoreRecord = await validateFacebookUserFirestoreRecord(
      dispatch,
      catchErrors,
      currentUser,
      facebookFirestoreAddedRecord
    );
    updateStateWithFacebookFirestoreRecord(dispatch, validatedFacebookUserFirestoreRecord, setIntegrationRecord);
  };
  return { handleFetchFacebookAdAssetAssignment };
};
