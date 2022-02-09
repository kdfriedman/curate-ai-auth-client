import fetchData from '../services/fetch/fetch';
import { ERROR } from '../constants/error';
import { HTTP_METHODS } from '../services/fetch/constants';
import { FACEBOOK_API, ACTION_TYPES, FACEBOOK_ERROR, FACEBOOK_APP } from '../services/facebook/constants';
import { FIREBASE } from '../services/firebase/constants';
import { useFacebookAuth } from '../contexts/FacebookContext';
import firestoreHandlers from '../services/firebase/data/firestore';

// firestore db functions
const { readCurateAIRecordFromFirestore } = firestoreHandlers;

// fb app id
const appId = process.env.REACT_APP_FACEBOOK_APP_ID;

// Constants
const { GET, POST } = HTTP_METHODS;
const {
  IS_LOADING,
  HAS_ERRORS,
  BUSINESS_AD_ACCOUNT_LIST,
  BUSINESS_SYSTEM_USER_ID,
  IS_BUTTON_CLICKED,
  SYSTEM_USER_ACCESS_TOKEN,
  IS_FETCH_FACEBOOK_SYSTEM_USER_TOKEN,
} = ACTION_TYPES;

const fetchFacebookUserBusinessAccount = async (dispatch, facebookAuthChange, userBusinessId) => {
  // reset state to prevent unwanted useEffect renders
  dispatch({ type: IS_FETCH_FACEBOOK_SYSTEM_USER_TOKEN, payload: false });

  // fetch client business data
  const [clientBusinessData, clientBusinessError] = await fetchData({
    method: POST,
    url: `${FACEBOOK_API.GRAPH.HOSTNAME}${FACEBOOK_API.GRAPH.VERSION}/${FACEBOOK_APP.CURATEAI.BUSINESS_ID}/managed_businesses?existing_client_business_id=${userBusinessId}&access_token=${facebookAuthChange?.authResponse?.accessToken}`,
  });
  if (clientBusinessError) {
    // set isLoading to true to render progress
    dispatch({
      type: IS_LOADING,
      payload: false,
    });
    dispatch({
      type: HAS_ERRORS,
      payload: {
        errorMessage: clientBusinessError,
        errorUIMessage: ERROR.DASHBOARD.MAIN,
      },
    });
    throw new Error('clientBusinessData is type ' + clientBusinessData);
  }
  return clientBusinessData;
};

const fetchCurateAISystemUserAccessToken = async (dispatch) => {
  // read record from firestore to retrieve curateai sys user token
  const [record, error] = await readCurateAIRecordFromFirestore(
    FIREBASE.FIRESTORE.CURATEAI.UID,
    FIREBASE.FIRESTORE.CURATEAI.COLLECTION
  );
  if (error || !record?.exists) {
    dispatch({
      type: HAS_ERRORS,
      payload: {
        errorMessage: error,
        errorUIMessage: ERROR.DASHBOARD.MAIN,
      },
    });
    throw new Error('readCurateAIRecordFromFirestore returned an error: ' + error);
  }
  const { curateAiSysUserAccessToken } = record?.data();
  return curateAiSysUserAccessToken;
};

const generateFacebookUserSystemUserAccessToken = async (
  dispatch,
  clientBusinessAcctId,
  curateAiSysUserAccessToken
) => {
  // fetch system user token and create sys user in client's business acct
  const [sysUserData, sysUserError] = await fetchData({
    method: POST,
    url: `${FACEBOOK_API.GRAPH.HOSTNAME}${FACEBOOK_API.GRAPH.VERSION}/${clientBusinessAcctId}/access_token?scope=ads_read,read_insights&app_id=${appId}&access_token=${curateAiSysUserAccessToken}`,
  });
  if (sysUserError) {
    // set isLoading to true to render progress
    dispatch({
      type: IS_LOADING,
      payload: false,
    });
    dispatch({
      type: HAS_ERRORS,
      payload: {
        errorMessage: sysUserError,
        errorUIMessage: ERROR.DASHBOARD.MAIN,
      },
    });
    throw new Error('sysUserError is type ' + sysUserError);
  }
  return sysUserData;
};

const fetchFacebookUserSystemUserId = async (dispatch, sysUserAccessToken) => {
  // fetch system user id
  const [sysUserIdData, sysUserIdError] = await fetchData({
    method: GET,
    url: `${FACEBOOK_API.GRAPH.HOSTNAME}${FACEBOOK_API.GRAPH.VERSION}/me?access_token=${sysUserAccessToken}`,
  });
  if (sysUserIdError) {
    // set isLoading to true to render progress
    dispatch({
      type: IS_LOADING,
      payload: false,
    });
    dispatch({
      type: HAS_ERRORS,
      payload: {
        errorMessage: sysUserIdError,
        errorUIMessage: ERROR.DASHBOARD.MAIN,
      },
    });
    throw new Error('sysUserIdError is type ' + sysUserIdError);
  }
  return sysUserIdData;
};

const fetchFacebookUserAdAccountAssetList = async (dispatch, facebookAuthChange, clientBusinessAcctId) => {
  const [adAcctAssetList, adAcctAssetListError] = await fetchData({
    method: GET,
    url: `${FACEBOOK_API.GRAPH.HOSTNAME}${FACEBOOK_API.GRAPH.VERSION}/${clientBusinessAcctId}/owned_ad_accounts?access_token=${facebookAuthChange?.authResponse?.accessToken}&fields=name`,
  });
  if (adAcctAssetListError) {
    // set isLoading to true to render progress
    dispatch({
      type: IS_LOADING,
      payload: false,
    });
    dispatch({
      type: HAS_ERRORS,
      payload: {
        errorMessage: adAcctAssetListError,
        errorUIMessage: ERROR.DASHBOARD.MAIN,
      },
    });
    throw new Error('adAcctAssetListError is type ' + adAcctAssetListError);
  }
  return adAcctAssetList;
};

const saveFacebookUserSystemUserAccessToken = (dispatch, sysUserAccessToken) => {
  // reset facebook login btn click state
  dispatch({
    type: IS_BUTTON_CLICKED,
    payload: false,
  });
  // update state with system user access token for later storage
  dispatch({
    type: SYSTEM_USER_ACCESS_TOKEN,
    payload: sysUserAccessToken,
  });
};

const validateFacebookUserAdAccountAssetList = (dispatch, adAcctAssetList, sysUserId) => {
  if (adAcctAssetList && adAcctAssetList?.data?.data.length > 0) {
    // update local state with user business list data
    dispatch({
      type: BUSINESS_AD_ACCOUNT_LIST,
      payload: adAcctAssetList?.data?.data,
    });
    // set business system user id
    dispatch({
      type: BUSINESS_SYSTEM_USER_ID,
      payload: sysUserId,
    });

    // reset loading state
    dispatch({
      type: IS_LOADING,
      payload: false,
    });
  } else {
    dispatch({
      type: HAS_ERRORS,
      payload: {
        errorMessage: FACEBOOK_ERROR.MARKETING_API.AD_ASSET_LIST_IS_EMPTY,
        errorUIMessage: FACEBOOK_ERROR.MARKETING_API.MUST_HAVE_VALID_AD_ACCOUNT,
      },
    });
  }
};

export const useFetchFacebookSystemUserToken = () => {
  const { facebookAuthChange } = useFacebookAuth();

  const handleFetchFacebookSystemUserToken = async (dispatch, userBusinessId) => {
    const facebookUserBusinessAccount = await fetchFacebookUserBusinessAccount(
      dispatch,
      facebookAuthChange,
      userBusinessId
    );

    const facebookUserBusinessAccountId = facebookUserBusinessAccount?.data?.id;
    const curateAISystemUserAccessToken = await fetchCurateAISystemUserAccessToken(dispatch);

    const facebookUserSystemUserAccessTokenData = await generateFacebookUserSystemUserAccessToken(
      dispatch,
      facebookUserBusinessAccountId,
      curateAISystemUserAccessToken
    );

    const facebookUserSystemUserAccessToken = facebookUserSystemUserAccessTokenData?.data?.access_token;
    const facebookUserSystemUserIdData = await fetchFacebookUserSystemUserId(
      dispatch,
      facebookUserSystemUserAccessToken
    );

    const facebookUserSystemUserId = facebookUserSystemUserIdData?.data?.id;
    const facebookUserAdAccountAssetList = await fetchFacebookUserAdAccountAssetList(
      dispatch,
      facebookAuthChange,
      facebookUserBusinessAccountId
    );

    saveFacebookUserSystemUserAccessToken(dispatch, facebookUserSystemUserAccessToken);
    validateFacebookUserAdAccountAssetList(dispatch, facebookUserAdAccountAssetList, facebookUserSystemUserId);
  };
  return { handleFetchFacebookSystemUserToken };
};
