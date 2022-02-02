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
  const { IS_LOADING, HAS_USER_BUSINESS_ID, USER_BUSINESS_ID, BUSINESS_ASSET_ID } = ACTION_TYPES;

  // setup initial field object for reducer function
  const initialState = {
    isLoading: false,
    hasErrors: null,
    isFacebookLoginAction: false,
    isBtnClicked: false,
    userBusinessList: null,
    hasUserBusinessList: false,
    hasUserBusinessId: false,
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
    isLoading,
    hasErrors,
    userBusinessList,
    hasUserBusinessList,
    hasUserBusinessId,
    userBusinessId,
    businessAdAcctList,
    businessSystemUserId,
    businessAssetId,
  } = state;

  // custom hooks for fetching fb business lists
  const { handleFetchFacebookBusinessAccounts } = useFetchFacebookBusinessAccounts();
  const { handleFetchFacebookSystemUserToken } = useFetchFacebookSystemUserToken();
  const { handleFetchFacebookAdAssetAssignment } = useFetchFacebookAdAssetAssignment();

  // fetch user business accts list
  useEffect(() => {
    if (!facebookAuthChange?.authResponse) return null;
    handleFetchFacebookBusinessAccounts(dispatch, catchErrors).catch((err) => console.error(err));
  }, [handleFetchFacebookBusinessAccounts, facebookAuthChange]);

  // connect partner biz with client biz, create sys user in client biz, fetch client ad account list
  useEffect(() => {
    if (!hasUserBusinessId) return null;
    handleFetchFacebookSystemUserToken(dispatch, catchErrors, userBusinessId).catch((err) => console.error(err));
  }, [handleFetchFacebookSystemUserToken, hasUserBusinessId, userBusinessId]);

  // add assets to system user within client's facebook business account
  useEffect(() => {
    if (!businessAssetId) return null;
    handleFetchFacebookAdAssetAssignment(dispatch, catchErrors, state, setIntegrationRecord).catch((err) =>
      console.error(err)
    );
  }, [handleFetchFacebookAdAssetAssignment, businessAssetId, state, setIntegrationRecord]);

  // handle user business list select element event
  const handleSelectUserBusinessList = (e) => {
    // get select element value and update user business id state with chosen value
    if (e.target?.value) {
      dispatch({
        type: USER_BUSINESS_ID,
        payload: e.target?.value,
      });

      // update user business id trigger state to re-render component and call useEffect
      dispatch({
        type: HAS_USER_BUSINESS_ID,
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
      {!isLoading && hasUserBusinessList && (
        <AcctSelector
          acctList={userBusinessList}
          onChangeHandler={handleSelectUserBusinessList}
          labelText="Choose your facebook business account:"
        />
      )}

      {/* setup business ad account selector */}
      {!isLoading && businessAdAcctList && businessAdAcctList.length > 0 && businessSystemUserId && (
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
