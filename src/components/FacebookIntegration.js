import { useEffect, useReducer } from 'react';
import fetchData from '../services/fetch/fetch';
import AcctSelector from './AcctSelector';
import firestoreHandlers from '../services/firebase/data/firestore';
import { Progress, Text, Link } from '@chakra-ui/react';
import { v4 as uuidv4 } from 'uuid';

const FacebookAppIntegration = ({
  facebookAuthData,
  setFirestoreIntegrationRecord,
  setIntegrationError,
  setProviderType,
}) => {
  // destructure firestore handlers
  const { addRecordToFirestore, readCurateAIRecordFromFirestore } =
    firestoreHandlers;

  // setup useReducer callback function
  const reducer = (state, action) => {
    const { type, payload } = action;
    return { ...state, [type]: payload };
  };

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
    sysUserAccessToken,
    businessAdAcctList,
    businessSystemUserId,
    businessAssetId,
  } = state;

  // generic error handler for fb specific api response errors
  const catchErrors = (error) => {
    // custom errors
    if (error?.isCustom) {
      dispatch({
        type: 'hasErrors',
        payload: {
          errMsg: error?.errMsg,
          errUserMsg: error?.errUserMsg,
        },
      });
      return console.error({
        isCustom: error?.isCustom,
        errMsg: error?.errMsg,
        errUserMsg: error?.errUserMsg,
      });
    }
    // fb vendor specific errors
    dispatch({
      type: 'hasErrors',
      payload: {
        errMsg: error?.response?.data?.error?.message,
        errUserMsg: error?.response?.data?.error?.error_user_msg,
      },
    });
    return console.error({
      errMessage: error?.response?.data?.error?.message,
      errUserMsg: error?.response?.data?.error?.error_user_msg,
    });
  };

  // custom hook - firebase facebook auth
  const hasFacebookAuthData =
    facebookAuthData && Object.keys(facebookAuthData).length > 0;

  /******* 
  1st useEffect hook - handle facebook login, 
  fetch user business accts list 
  *******/
  useEffect(() => {
    let isMounted = true;
    // async wrapper function to allow multiple requests
    const handleAsyncWork = async () => {
      // fetch account user data
      const [userData, userError] = await fetchData({
        method: 'GET',
        url: `https://graph.facebook.com/v11.0/me?fields=id&access_token=${facebookAuthData?.accessToken}`,
        params: {},
        data: {},
        headers: {},
      });
      if (userError) {
        catchErrors(userError);
      }
      const userId = userData?.data?.id;

      // fetch user business list
      const [userBusinessList, userBusinessError] = await fetchData({
        method: 'GET',
        url: `https://graph.facebook.com/v11.0/${userId}/businesses?&access_token=${facebookAuthData?.accessToken}`,
        params: {},
        data: {},
        headers: {},
      });
      if (userBusinessError) {
        catchErrors(userBusinessError);
      }

      if (userBusinessList && userBusinessList?.data?.data.length > 0) {
        // update local state with user business list data
        dispatch({
          type: 'userBusinessList',
          payload: userBusinessList?.data?.data,
        });
        // update local state with async completion update
        dispatch({
          type: 'hasUserBusinessList',
          payload: true,
        });
      } else {
        catchErrors({
          isCustom: true,
          errMsg:
            'User must be logged into facebook with an account that has one or more associated facebook business accounts. Log into facebook.com to select a different account.',
          errUserMsg: 'Error: userBusinessList is empty array',
        });
        if (isMounted) {
          setIntegrationError(
            'User must be logged into facebook with an account that has one or more associated facebook business accounts.'
          );
          setProviderType('facebook.com');
        }
      }
      return () => {
        isMounted = false;
      };
    };
    if (hasFacebookAuthData) {
      handleAsyncWork();
    }
  }, [
    hasFacebookAuthData,
    facebookAuthData,
    setIntegrationError,
    setProviderType,
  ]);

  /******* 
  2nd useEffect hook - connect partner business with client business, 
  create sys user in client business, fetch client ad account list 
  *******/
  useEffect(() => {
    // async wrapper function to allow multiple requests
    const handleAsyncWork = async () => {
      // fetch account user data
      const [clientBusinessData, clientBusinessError] = await fetchData({
        method: 'POST',
        url: `https://graph.facebook.com/v11.0/419312452044680/managed_businesses?existing_client_business_id=${userBusinessId}&access_token=${facebookAuthData?.accessToken}`,
        params: {},
        data: {},
        headers: {},
      });
      if (clientBusinessError) {
        catchErrors(clientBusinessError);
      }
      const clientBusinessAcctId = clientBusinessData?.data?.id;
      if (!clientBusinessAcctId) return console.error({ clientBusinessAcctId });

      // read record from firestore to retrieve curateai sys user token
      const [record, error] = await readCurateAIRecordFromFirestore(
        'oixaOBWftYMd2kZjD2Yx',
        'curateai'
      );
      if (error || !record?.exists) {
        return console.error('Error: CurateAi system user token not fetchable');
      }
      const { curateAiSysUserAccessToken } = record?.data();

      // fetch system user token and create sys user in client's business acct
      const [sysUserData, sysUserError] = await fetchData({
        method: 'POST',
        url: `https://graph.facebook.com/v11.0/${clientBusinessAcctId}/access_token?scope=ads_read,read_insights&app_id=1198476710574497&access_token=${curateAiSysUserAccessToken}`,
        params: {},
        data: {},
        headers: {},
      });
      if (sysUserError) {
        catchErrors(sysUserError);
      }
      // system user access token
      const sysUserAccessToken = sysUserData?.data?.access_token;
      if (!sysUserAccessToken) return console.error({ sysUserAccessToken });

      // fetch system user id
      const [sysUserIdData, sysUserIdError] = await fetchData({
        method: 'GET',
        url: `https://graph.facebook.com/v11.0/me?access_token=${sysUserAccessToken}`,
        params: {},
        data: {},
        headers: {},
      });
      if (sysUserIdError) {
        catchErrors(sysUserIdError);
      }
      const sysUserId = sysUserIdData?.data?.id;
      if (!sysUserId) return console.error({ sysUserId });

      const [adAcctAssetList, adAcctAssetListError] = await fetchData({
        method: 'GET',
        url: `https://graph.facebook.com/v11.0/${clientBusinessAcctId}/owned_ad_accounts?access_token=${facebookAuthData?.accessToken}&fields=name`,
        params: {},
        data: {},
        headers: {},
      });
      if (adAcctAssetListError) {
        catchErrors(adAcctAssetListError);
      }

      // reset user business id state, preventing further fb business asset look up requests
      dispatch({
        type: 'hasUserBusinessId',
        payload: false,
      });
      // reset facebook login btn click state
      dispatch({
        type: 'isBtnClicked',
        payload: false,
      });
      // reset async ready state to false to signify completion of 2nd useEffect
      dispatch({
        type: 'hasUserBusinessList',
        payload: false,
      });
      // update state with system user access token for later storage
      dispatch({
        type: 'sysUserAccessToken',
        payload: sysUserAccessToken,
      });

      if (adAcctAssetList && adAcctAssetList?.data?.data.length > 0) {
        // update local state with user business list data
        dispatch({
          type: 'businessAdAcctList',
          payload: adAcctAssetList?.data?.data,
        });
        // set business system user id
        dispatch({
          type: 'businessSystemUserId',
          payload: sysUserId,
        });

        // reset loading state
        dispatch({
          type: 'isLoading',
          payload: false,
        });
      } else {
        console.error(
          'Error: adAcctAssetList has a falsy value:',
          adAcctAssetList
        );
      }
    };
    if (hasUserBusinessId) {
      handleAsyncWork();
    }
  }, [
    readCurateAIRecordFromFirestore,
    hasUserBusinessId,
    userBusinessId,
    facebookAuthData,
  ]);

  /******* 
  3rd useEffect hook - add assets to sys user within client's business acct 
  *******/
  useEffect(() => {
    // set component isMounted state to prevent memory leak on state updates to parent
    let isMounted = true;

    // async wrapper function to allow multiple requests
    const handleAsyncWork = async () => {
      // assign assets to system user on behalf of client business manager acct
      const [, sysUserAssetAssignmentDataError] = await fetchData({
        method: 'POST',
        url: `https://graph.facebook.com/v11.0/${businessAssetId}/assigned_users?user=${businessSystemUserId}&tasks=MANAGE&access_token=${facebookAuthData.accessToken}`,
        params: {},
        data: {},
        headers: {},
      });
      if (sysUserAssetAssignmentDataError) {
        catchErrors(sysUserAssetAssignmentDataError);
      }

      // filter facebook business acct name from user business list chosen user selected id
      const fbBusinessAcctName = userBusinessList.filter((businessObject) => {
        return businessObject.id === userBusinessId;
      });

      // create payload object for facebook integration
      const facebookFirebasePayload = {
        uid: facebookAuthData.user.uid,
        email: facebookAuthData.user.email,
        sysUserAccessToken,
        businessAcctName: fbBusinessAcctName[0].name,
        businessAcctId: userBusinessId,
        adAccountId: businessAssetId,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };

      // update firestore with system user access token, auth uid, and email
      await addRecordToFirestore(
        facebookAuthData.user.uid,
        ['clients', 'integrations'],
        ['facebook'],
        facebookFirebasePayload,
        'facebookBusinessAccts'
      );

      if (isMounted) {
        // update parent component with firestore new record data
        setFirestoreIntegrationRecord({
          facebookBusinessAccts: [facebookFirebasePayload],
        });
      }

      // reset business asset it to prevent 3rd useEffect from firing
      dispatch({
        type: 'businessAssetId',
        payload: null,
      });

      dispatch({
        type: 'businessSystemUserId',
        payload: null,
      });

      // set isLoading to true to render progress
      dispatch({
        type: 'isLoading',
        payload: false,
      });
    };
    if (businessAssetId) {
      handleAsyncWork();
    }
    // clean up function to signify when component is unmounted
    return () => {
      isMounted = false;
    };
  }, [
    businessAssetId,
    facebookAuthData,
    businessSystemUserId,
    sysUserAccessToken,
    addRecordToFirestore,
    setFirestoreIntegrationRecord,
    userBusinessId,
    userBusinessList,
  ]);

  // handle user business list select element event
  const handleSelectUserBusinessList = (e) => {
    // get select element value and update user business id state with chosen value
    if (e.target?.value) {
      dispatch({
        type: 'userBusinessId',
        payload: e.target?.value,
      });

      // update user business id trigger state to re-render component and call useEffect
      dispatch({
        type: 'hasUserBusinessId',
        payload: true,
      });

      // set isLoading to true to render spinner
      dispatch({
        type: 'isLoading',
        payload: true,
      });
    }
  };

  // handle business ad account select element event
  const handleSelectBusinessAdAcct = (e) => {
    // get select element value and update user business id state with chosen value
    if (e.target?.value) {
      dispatch({
        type: 'businessAssetId',
        payload: e.target?.value,
      });

      // set isLoading to true to render spinner
      dispatch({
        type: 'isLoading',
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
          margin="1rem 0 0 2rem"
          width="20rem"
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
      {!isLoading &&
        businessAdAcctList &&
        businessAdAcctList.length > 0 &&
        businessSystemUserId && (
          <AcctSelector
            acctList={businessAdAcctList}
            onChangeHandler={handleSelectBusinessAdAcct}
            labelText="Choose your facebook business ad account:"
          />
        )}

      {hasErrors && (
        <>
          <Text margin="1rem 2rem 0 2rem" color="#c5221f">
            Oops, we've encountered an error. Please contact our{' '}
            <Link
              href={`mailto:ryanwelling@gmail.com?cc=kev.d.friedman@gmail.com&subject=CurateApp.AI%20Integration%20Error&body=Error: ${
                hasErrors?.errMsg ? hasErrors?.errMsg : hasErrors?.errUserMsg
              }`}
            >
              <span style={{ textDecoration: 'underline' }}>
                tech team for assistance.
              </span>
            </Link>
          </Text>
          <Text margin="1rem 2rem 0 2rem" color="#c5221f">
            Error:{' '}
            {hasErrors?.errMsg ? hasErrors?.errMsg : hasErrors?.errUserMsg}
          </Text>
        </>
      )}
    </>
  );
};

export default FacebookAppIntegration;
