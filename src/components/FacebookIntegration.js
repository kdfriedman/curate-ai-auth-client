import { useEffect, useReducer } from 'react';
import AcctSelector from './AcctSelector';
import { Progress, Text, Link, useMediaQuery } from '@chakra-ui/react';
import { ACTION_TYPES } from '../services/facebook/constants';
import { catchErrors } from '../util/error.js';
import { useFacebookAuth } from '../contexts/FacebookContext';
import { useFetchFacebookBusinessAccounts } from '../hooks/useFetchFacebookBusinessAccounts';
import { useFetchFacebookSystemUserToken } from '../hooks/useFetchFacebookSystemUserToken';
import { useFetchFacebookAdAssetAssignment } from '../hooks/useFetchFacebookAdAssetAssignment';

const FacebookAppIntegration = ({ setIntegrationRecord }) => {
  const isEqualToOrLessThan450 = useMediaQuery('(max-width: 450px)');

  // facebook auth context
  const { facebookAuthChange } = useFacebookAuth();

  // setup useReducer callback function
  const reducer = (state, action) => {
    const { type, payload } = action;
    return { ...state, [type]: payload };
  };

  // reducer action types
  const {
    IS_LOADING,
    USER_BUSINESS_ID,
    BUSINESS_ASSET_ID,
    IS_FETCH_FACEBOOK_SYSTEM_USER_TOKEN,
    IS_FETCH_FACEBOOK_AD_ASSET_ASSIGNMENT,
  } = ACTION_TYPES;

  // setup initial field object for reducer function
  const initialState = {
    isFetchFacebookBusinessAccounts: true,
    isFetchFacebookSystemUserToken: false,
    isFetchFacebookAdAssetAssignment: false,
    isLoading: false,
    hasErrors: null,
    isFacebookLoginAction: false,
    isBtnClicked: false,
    userBusinessList: null,
    userBusinessId: null,
    sysUserAccessToken: null,
    businessAdAcctList: null,
    businessSystemUserId: null,
    businessAssetId: null,
  };

  // setup reducer hook
  const [state, dispatch] = useReducer(reducer, initialState);

  // destructure state object into individual state properties
  const {
    isFetchFacebookBusinessAccounts,
    isFetchFacebookSystemUserToken,
    isFetchFacebookAdAssetAssignment,
    isLoading,
    hasErrors,
    userBusinessList,
    userBusinessId,
    businessAdAcctList,
    businessSystemUserId,
  } = state;

  // custom hooks for fetching fb business lists
  const { handleFetchFacebookBusinessAccounts } = useFetchFacebookBusinessAccounts();
  const { handleFetchFacebookSystemUserToken } = useFetchFacebookSystemUserToken();
  const { handleFetchFacebookAdAssetAssignment } = useFetchFacebookAdAssetAssignment();

  // fetch user business accts list
  useEffect(() => {
    if (!isFetchFacebookBusinessAccounts) return null;
    handleFetchFacebookBusinessAccounts(dispatch, catchErrors).catch((err) => console.error(err));
  }, [handleFetchFacebookBusinessAccounts, facebookAuthChange, isFetchFacebookBusinessAccounts]);

  // connect partner biz with client biz, create sys user in client biz, fetch client ad account list
  useEffect(() => {
    if (!isFetchFacebookSystemUserToken) return null;
    handleFetchFacebookSystemUserToken(dispatch, catchErrors, userBusinessId).catch((err) => console.error(err));
  }, [handleFetchFacebookSystemUserToken, userBusinessId, isFetchFacebookSystemUserToken]);

  // add assets to system user within client's facebook business account
  useEffect(() => {
    if (!isFetchFacebookAdAssetAssignment) return null;
    handleFetchFacebookAdAssetAssignment(dispatch, catchErrors, state, setIntegrationRecord).catch((err) =>
      console.error(err)
    );
  }, [handleFetchFacebookAdAssetAssignment, isFetchFacebookAdAssetAssignment, state, setIntegrationRecord]);

  // handle user business list select element event
  const handleSelectUserBusinessList = (e) => {
    // get select element value and update user business id state with chosen value
    if (e.target?.value) {
      dispatch({
        type: USER_BUSINESS_ID,
        payload: e.target?.value,
      });

      // update fetch facebook system user state to trigger 2nd batch of facebook fetch calls
      dispatch({
        type: IS_FETCH_FACEBOOK_SYSTEM_USER_TOKEN,
        payload: true,
      });

      // set isLoading to true to render spinner
      dispatch({
        type: IS_LOADING,
        payload: true,
      });
    }
  };

  // handle business ad account select element event
  const handleSelectBusinessAdAcct = (e) => {
    // get select element value and update user business id state with chosen value
    if (e.target?.value) {
      dispatch({
        type: BUSINESS_ASSET_ID,
        payload: e.target?.value,
      });

      // update fetch facebook ad asset assignment state to trigger 3rd batch of facebook fetch calls
      dispatch({
        type: IS_FETCH_FACEBOOK_AD_ASSET_ASSIGNMENT,
        payload: true,
      });

      // set isLoading to true to render spinner
      dispatch({
        type: IS_LOADING,
        payload: true,
      });
    }
  };

  return (
    <>
      {/* setup spinner for fetching external data */}
      {isLoading && (
        <Progress
          colorScheme="brand"
          size="xs"
          className="loading__progress"
          margin={isEqualToOrLessThan450 ? '1.5rem 1rem 1rem 2rem' : '1rem 0 2rem 2rem'}
          width="16rem"
          isIndeterminate
        />
      )}

      {/* setup user business account selector */}
      {!isLoading && userBusinessList?.length > 0 && !businessAdAcctList && (
        <AcctSelector
          acctList={userBusinessList}
          onChangeHandler={handleSelectUserBusinessList}
          labelText="Choose your facebook business account:"
        />
      )}

      {/* setup business ad account selector */}
      {!isLoading && businessAdAcctList?.length > 0 && businessSystemUserId && (
        <AcctSelector
          acctList={businessAdAcctList}
          onChangeHandler={handleSelectBusinessAdAcct}
          labelText="Choose your facebook business ad account:"
        />
      )}

      {hasErrors && !isLoading && (
        <>
          <Text margin="1rem 2rem 0 2rem" color="#c5221f">
            Oops, we've encountered an error. Please contact our{' '}
            <Link
              href={`mailto:ryanwelling@gmail.com?cc=kev.d.friedman@gmail.com&subject=CurateApp.AI%20Integration%20Error&body=Error: ${hasErrors?.errUserMsg}`}
            >
              <span style={{ textDecoration: 'underline' }}>tech team for assistance.</span>
            </Link>
          </Text>
          <Text margin="1rem 2rem 0 2rem" color="#c5221f">
            {hasErrors?.errUserMsg}
          </Text>
        </>
      )}
    </>
  );
};

export default FacebookAppIntegration;
