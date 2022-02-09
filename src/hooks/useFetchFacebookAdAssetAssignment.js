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
const { IS_LOADING, HAS_ERRORS, BUSINESS_ASSET_ID, BUSINESS_SYSTEM_USER_ID, IS_FETCH_FACEBOOK_AD_ASSET_ASSIGNMENT } =
  ACTION_TYPES;

const fetchFacebookUserAdAssetAssignment = async (
  dispatch,
  facebookAuthChange,
  businessAssetId,
  businessSystemUserId
) => {
  // reset state to prevent unwanted useEffect renders
  dispatch({ type: IS_FETCH_FACEBOOK_AD_ASSET_ASSIGNMENT, payload: false });

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
    dispatch({
      type: HAS_ERRORS,
      payload: {
        errorMessage: sysUserAssetAssignmentDataError,
        errorUIMessage: ERROR.DASHBOARD.MAIN,
      },
    });
    throw new Error('sysUserAssetAssignmentDataError is type ' + sysUserAssetAssignmentDataError);
  }
};

const fetchFacebookUserAdCampaigns = async (dispatch, facebookAuthChange, businessAssetId) => {
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
    dispatch({
      type: HAS_ERRORS,
      payload: {
        errorMessage: adCampaignListError,
        errorUIMessage: ERROR.DASHBOARD.MAIN,
      },
    });
    throw new Error('adCampaignListError is type ' + adCampaignListError);
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
    uid: currentUser.uid,
    email: currentUser.providerData?.[0]?.email,
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
    currentUser.uid,
    FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS,
    FIREBASE.FIRESTORE.FACEBOOK.DOCS,
    facebookFirebasePayload,
    FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME
  );
};

const validateFacebookUserFirestoreRecord = async (dispatch, currentUser, addedFirestoreRecord) => {
  // read facebook record from firestore to validate if integration exists
  const [record, error] = await readUserRecordFromFirestore(
    currentUser.uid,
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
    dispatch({
      type: HAS_ERRORS,
      payload: {
        errorMessage: addedFirestoreRecord?.warnMsg,
        errorUIMessage: ERROR.DASHBOARD.MAIN,
      },
    });
    throw new Error('readUserRecordFromFirestore returned an error: ' + error);
  }
  return record;
};

const updateStateWithFacebookFirestoreRecord = (dispatch, record, setIntegrationRecord, setIntegrationActiveStatus) => {
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

    // reset integration status to hide FB integration related components
    setIntegrationActiveStatus(false);
  }
};

export const useFetchFacebookAdAssetAssignment = () => {
  const { currentUser } = useAuth();
  const { facebookAuthChange } = useFacebookAuth();
  const handleFetchFacebookAdAssetAssignment = async (
    dispatch,
    state,
    setIntegrationRecord,
    setIntegrationActiveStatus
  ) => {
    const { businessAssetId, businessSystemUserId, userBusinessList, userBusinessId, sysUserAccessToken } = state;
    await fetchFacebookUserAdAssetAssignment(dispatch, facebookAuthChange, businessAssetId, businessSystemUserId);

    const facebooUserAdCampaignData = await fetchFacebookUserAdCampaigns(dispatch, facebookAuthChange, businessAssetId);

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
      currentUser,
      facebookFirestoreAddedRecord
    );

    updateStateWithFacebookFirestoreRecord(
      dispatch,
      validatedFacebookUserFirestoreRecord,
      setIntegrationRecord,
      setIntegrationActiveStatus
    );
  };
  return { handleFetchFacebookAdAssetAssignment };
};
