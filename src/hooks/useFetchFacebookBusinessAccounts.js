import fetchData from '../services/fetch/fetch';
import { ERROR } from '../constants/error';
import { HTTP_METHODS } from '../services/fetch/constants';
import { FACEBOOK_API, ACTION_TYPES, FACEBOOK_ERROR } from '../services/facebook/constants';
import { useFacebookAuth } from '../contexts/FacebookContext';

// Constants
const { GET } = HTTP_METHODS;
const { IS_LOADING, HAS_ERRORS, USER_BUSINESS_LIST, HAS_USER_BUSINESS_LIST, IS_FETCH_FACEBOOK_BUSINESS_ACCOUNTS } =
  ACTION_TYPES;

const fetchFacebookUserData = async (dispatch, facebookAuthChange) => {
  // reset state to prevent unwanted useEffect renders
  dispatch({ type: IS_FETCH_FACEBOOK_BUSINESS_ACCOUNTS, payload: false });

  // fetch account user data
  const [userData, userError] = await fetchData({
    method: GET,
    url: `${FACEBOOK_API.GRAPH.HOSTNAME}${FACEBOOK_API.GRAPH.VERSION}/me?fields=id&access_token=${facebookAuthChange?.authResponse?.accessToken}`,
  });

  if (userError) {
    // set isLoading to true to render progress
    dispatch({
      type: IS_LOADING,
      payload: false,
    });
    dispatch({
      type: HAS_ERRORS,
      payload: {
        errorMessage: userError,
        errorUIMessage: ERROR.DASHBOARD.MAIN,
      },
    });
    throw new Error('userError is type ' + userError);
  }
  return userData;
};

const fetchFacebookUserBusinessAccounts = async (userId, dispatch, facebookAuthChange) => {
  // fetch user business list
  const [userBusinessList, userBusinessError] = await fetchData({
    method: GET,
    url: `${FACEBOOK_API.GRAPH.HOSTNAME}${FACEBOOK_API.GRAPH.VERSION}/${userId}/businesses?&access_token=${facebookAuthChange?.authResponse?.accessToken}`,
  });
  if (userBusinessError) {
    // set isLoading to true to render progress
    dispatch({
      type: IS_LOADING,
      payload: false,
    });
    dispatch({
      type: HAS_ERRORS,
      payload: {
        errorMessage: userBusinessError,
        errorUIMessage: ERROR.DASHBOARD.MAIN,
      },
    });
    throw new Error('userBusinessError is type ' + userBusinessError);
  }
  return userBusinessList;
};

// prettier-ignore
const validateFacebookUserBusinessList = (userBusinessList, dispatch) => {
  // check if user has valid businesses
  if (userBusinessList && userBusinessList?.data?.data.length > 0) {
    // update local state with user business list data
    dispatch({
      type: USER_BUSINESS_LIST,
      payload: userBusinessList?.data?.data,
    });
    // update local state with async completion update
    dispatch({
      type: HAS_USER_BUSINESS_LIST,
      payload: true,
    });
  } else {
    dispatch(
      {
        type: HAS_ERRORS,
        payload: {
          errorMessage:
            FACEBOOK_ERROR.MARKETING_API.USER_BUSINESS_LIST_IS_EMPTY,
          errorUIMessage:
            FACEBOOK_ERROR.MARKETING_API.MUST_HAVE_VALID_BUSINESS_ACCOUNT,
        },
      }
    );
  }
};

export const useFetchFacebookBusinessAccounts = () => {
  const { facebookAuthChange } = useFacebookAuth();
  const handleFetchFacebookBusinessAccounts = async (dispatch, catchErrors) => {
    dispatch({ type: HAS_ERRORS, payload: null });
    const facebookUserData = await fetchFacebookUserData(dispatch, facebookAuthChange);

    const facebookUserID = facebookUserData?.data?.id;
    const facebookBusinessAccounts = await fetchFacebookUserBusinessAccounts(
      facebookUserID,
      dispatch,
      facebookAuthChange
    );

    validateFacebookUserBusinessList(facebookBusinessAccounts, dispatch);
  };
  return { handleFetchFacebookBusinessAccounts };
};
