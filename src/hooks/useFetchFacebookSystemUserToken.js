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
  HAS_USER_BUSINESS_LIST,
  HAS_USER_BUSINESS_ID,
  BUSINESS_AD_ACCOUNT_LIST,
  BUSINESS_SYSTEM_USER_ID,
  IS_BUTTON_CLICKED,
  SYSTEM_USER_ACCESS_TOKEN,
} = ACTION_TYPES;

const fetchFacebookUserBusinessAccount = async (dispatch, catchErrors, facebookAuthChange, userBusinessId) => {
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
    catchErrors(
      {
        type: HAS_ERRORS,
        payload: {
          errorMessage: clientBusinessError,
          errorUIMessage: ERROR.DASHBOARD.MAIN,
        },
      },
      dispatch
    );
    return;
  }
  return clientBusinessData;
};

const fetchCurateAISystemUserAccessToken = async (dispatch, catchErrors) => {
  // read record from firestore to retrieve curateai sys user token
  const [record, error] = await readCurateAIRecordFromFirestore(
    FIREBASE.FIRESTORE.CURATEAI.UID,
    FIREBASE.FIRESTORE.CURATEAI.COLLECTION
  );
  if (error || !record?.exists) {
    catchErrors(
      {
        type: HAS_ERRORS,
        payload: {
          errorMessage: error,
          errorUIMessage: ERROR.DASHBOARD.MAIN,
        },
      },
      dispatch
    );
    return;
  }
  const { curateAiSysUserAccessToken } = record?.data();
  return curateAiSysUserAccessToken;
};

const generateFacebookUserSystemUserAccessToken = async (
  dispatch,
  catchErrors,
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
    catchErrors(
      {
        type: HAS_ERRORS,
        payload: {
          errorMessage: sysUserError,
          errorUIMessage: ERROR.DASHBOARD.MAIN,
        },
      },
      dispatch
    );
  }
  return sysUserData;
};

const fetchFacebookUserSystemUserId = async (dispatch, catchErrors, sysUserAccessToken) => {
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
    catchErrors(
      {
        type: HAS_ERRORS,
        payload: {
          errorMessage: sysUserIdError,
          errorUIMessage: ERROR.DASHBOARD.MAIN,
        },
      },
      dispatch
    );
    return;
  }
  return sysUserIdData;
};

const fetchFacebookUserAdAccountAssetList = async (dispatch, catchErrors, facebookAuthChange, clientBusinessAcctId) => {
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
    catchErrors(
      {
        type: HAS_ERRORS,
        payload: {
          errorMessage: adAcctAssetListError,
          errorUIMessage: ERROR.DASHBOARD.MAIN,
        },
      },
      dispatch
    );
    return;
  }
  return adAcctAssetList;
};

const saveFacebookUserSystemUserAccessToken = (dispatch, sysUserAccessToken) => {
  // reset user business id state, preventing further fb business asset look up requests
  dispatch({
    type: HAS_USER_BUSINESS_ID,
    payload: false,
  });
  // reset facebook login btn click state
  dispatch({
    type: IS_BUTTON_CLICKED,
    payload: false,
  });
  // reset async ready state to false to signify completion of 2nd useEffect
  dispatch({
    type: HAS_USER_BUSINESS_LIST,
    payload: false,
  });
  // update state with system user access token for later storage
  dispatch({
    type: SYSTEM_USER_ACCESS_TOKEN,
    payload: sysUserAccessToken,
  });
};

const validateFacebookUserAdAccountAssetList = (dispatch, catchErrors, adAcctAssetList, sysUserId) => {
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
    catchErrors(
      {
        type: HAS_ERRORS,
        payload: {
          errorMessage: FACEBOOK_ERROR.MARKETING_API.AD_ASSET_LIST_IS_EMPTY,
          errorUIMessage: FACEBOOK_ERROR.MARKETING_API.MUST_HAVE_VALID_AD_ACCOUNT,
        },
      },
      dispatch
    );
  }
};

export const useFetchFacebookSystemUserToken = () => {
  const { facebookAuthChange } = useFacebookAuth();
  const handleFetchFacebookSystemUserToken = async (dispatch, catchErrors, userBusinessId) => {
    const facebookUserBusinessAccount = await fetchFacebookUserBusinessAccount(
      dispatch,
      catchErrors,
      facebookAuthChange,
      userBusinessId
    );
    const facebookUserBusinessAccountId = facebookUserBusinessAccount?.data?.id;
    const curateAISystemUserAccessToken = await fetchCurateAISystemUserAccessToken(dispatch, catchErrors);
    const facebookUserSystemUserAccessTokenData = await generateFacebookUserSystemUserAccessToken(
      dispatch,
      catchErrors,
      facebookUserBusinessAccountId,
      curateAISystemUserAccessToken
    );
    const facebookUserSystemUserAccessToken = facebookUserSystemUserAccessTokenData?.data?.access_token;
    const facebookUserSystemUserIdData = await fetchFacebookUserSystemUserId(
      dispatch,
      catchErrors,
      facebookUserSystemUserAccessToken
    );
    const facebookUserSystemUserId = facebookUserSystemUserIdData?.data?.id;
    const facebookUserAdAccountAssetList = await fetchFacebookUserAdAccountAssetList(
      dispatch,
      catchErrors,
      facebookAuthChange,
      facebookUserBusinessAccountId
    );
    saveFacebookUserSystemUserAccessToken(dispatch, facebookUserSystemUserAccessToken);
    validateFacebookUserAdAccountAssetList(
      dispatch,
      catchErrors,
      facebookUserAdAccountAssetList,
      facebookUserSystemUserId
    );
  };
  return { handleFetchFacebookSystemUserToken };
};
