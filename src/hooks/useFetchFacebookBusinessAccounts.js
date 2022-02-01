import { fetchData } from '../services/fetch/fetch';
import { ERROR } from '../constants/error';
import { HTTP_METHODS } from '../services/fetch/constants';
import {
  FACEBOOK_API,
  ACTION_TYPES,
  FACEBOOK_ERROR,
} from '../services/facebook/constants';
import { facebookAuthChange } from '../contexts/FacebookContext';

// Constants
const { GET } = HTTP_METHODS;
const { IS_LOADING, HAS_ERRORS, USER_BUSINESS_LIST, HAS_USER_BUSINESS_LIST } =
  ACTION_TYPES;

const fetchFacebookUserData = async (dispatch, catchErrors) => {
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
    catchErrors({ type: HAS_ERRORS, payload: userError }, dispatch);
    return;
  }
  return userData;
};

const fetchFacebookBusinessAccounts = async (userId, dispatch, catchErrors) => {
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
    catchErrors(
      {
        type: HAS_ERRORS,
        payload: {
          errorMessage: userBusinessError,
          errorUIMessage: ERROR.DASHBOARD.MAIN,
        },
      },
      dispatch
    );
    return;
  }
  return userBusinessList;
};

const validateFacebookBusinessList = (
  userBusinessList,
  dispatch,
  catchErrors
) => {
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
    catchErrors(
      {
        type: HAS_ERRORS,
        payload: {
          errorMessage:
            FACEBOOK_ERROR.MARKETING_API.USER_BUSINESS_LIST_IS_EMPTY,
          errorUIMessage:
            FACEBOOK_ERROR.MARKETING_API.MUST_HAVE_VALID_BUSINESS_ACCOUNT,
        },
      },
      dispatch
    );
  }
};

export const useFetchFacebookBusinessAccounts = () => {
  const handleFetchFacebookBusinessAccounts = async (dispatch, catchErrors) => {
    catchErrors({ type: HAS_ERRORS, payload: null }, dispatch);
    const facebookUserData = await fetchFacebookUserData();
    const facebookUserID = facebookUserData?.data?.id;
    const facebookBusinessAccounts = await fetchFacebookBusinessAccounts(
      facebookUserID,
      dispatch,
      catchErrors
    );
    validateFacebookBusinessList(facebookBusinessAccounts);
  };
  return { handleFetchFacebookBusinessAccounts };
};
