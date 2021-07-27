import { useEffect, useReducer } from 'react';
import { useFirebaseFBAuth } from '../hooks/useFirebaseFBAuth';
import fetchData from '../services/fetch/fetch';
import AcctSelector from '../components/AcctSelector';
import addRecordToFirestore from '../services/firebase/data/firestore';

const HomePage = () => {
  // setup useReducer callback function
  const reducer = (state, action) => {
    const { type, payload } = action;
    return { ...state, [type]: payload };
  };

  // setup initial field object for reducer function
  const initialState = {
    hasErrors: null,
    isFacebookLoginAction: false,
    isBtnClicked: false,
    userBusinessList: null,
    asyncDataReady: false,
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
    hasErrors,
    isFacebookLoginAction,
    isBtnClicked,
    userBusinessList,
    asyncDataReady,
    hasUserBusinessId,
    userBusinessId,
    sysUserAccessToken,
    businessAdAcctList,
    businessSystemUserId,
    businessAssetId,
  } = state;

  // generic error handler for fb specific api response errors
  const catchErrors = (error) => {
    dispatch({
      type: 'hasErrors',
      payload: {
        errMessage: error?.response?.data?.error?.message,
        errUserMsg: error?.response?.data?.error?.error_user_msg,
      },
    });
    return console.error({
      errMessage: error?.response?.data?.error?.message,
      errUserMsg: error?.response?.data?.error?.error_user_msg,
    });
  };

  // custom hook - firebase facebook auth
  const { facebookAuthData } = useFirebaseFBAuth(isFacebookLoginAction);
  const hasFacebookAuthData =
    facebookAuthData && Object.keys(facebookAuthData).length > 0;

  /******* 
  1st useEffect hook - handle facebook login, 
  fetch user business accts list 
  *******/
  useEffect(() => {
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
      // reset facebook login action state to false, preventing future login attempts
      dispatch({
        type: 'isFacebookLoginAction',
        payload: false,
      });

      if (userBusinessList && userBusinessList?.data?.data.length > 0) {
        // update local state with user business list data
        dispatch({
          type: 'userBusinessList',
          payload: userBusinessList?.data?.data,
        });
        // update local state with async completion update
        dispatch({
          type: 'asyncDataReady',
          payload: true,
        });
      } else {
        console.error(
          `Error: userBusinessList has a falsy value - ${userBusinessList}`
        );
      }
    };
    if (hasFacebookAuthData) {
      handleAsyncWork();
    }
  }, [hasFacebookAuthData, facebookAuthData]);

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

      // fetch system user token and create sys user in client's business acct
      const [sysUserData, sysUserError] = await fetchData({
        method: 'POST',
        url: `https://graph.facebook.com/v11.0/${clientBusinessAcctId}/access_token?scope=ads_read,read_insights&app_id=1198476710574497&access_token=EAARCAhqaZBaEBAAfHb6CQwfTkxZAtBQCrRwUqoA71ds5h4EMOkFdrPsr31FIILF77ZCYLywwpwchoG18VNQXeZCH73j7ZBHh7dPZBUdj7WOJyCHZAI2rwnIrnfmBgLUdD2SKFLrDDgSLtp1qqWl1txFXSH2xMRDaDFCd7x5B8B19s84Rn9ioSVY83s0TUvvW7dww6nZCPtz8AQZDZD`,
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
        type: 'asyncDataReady',
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
      } else {
        console.error(
          `Error: userBusinessList has a falsy value - ${adAcctAssetList}`
        );
      }
    };
    if (hasUserBusinessId) {
      handleAsyncWork();
    }
  }, [hasUserBusinessId, userBusinessId, facebookAuthData]);

  /******* 
  3rd useEffect hook - add assets to sys user within client's business acct 
  *******/
  useEffect(() => {
    // async wrapper function to allow multiple requests
    const handleAsyncWork = async () => {
      // assign assets to system user on behalf of client business manager acct
      const [sysUserAssetAssignmentData, sysUserAssetAssignmentDataError] =
        await fetchData({
          method: 'POST',
          url: `https://graph.facebook.com/v11.0/${businessAssetId}/assigned_users?user=${businessSystemUserId}&tasks=MANAGE&access_token=${facebookAuthData.accessToken}`,
          params: {},
          data: {},
          headers: {},
        });
      if (sysUserAssetAssignmentDataError) {
        catchErrors(sysUserAssetAssignmentDataError);
      }

      // TODO: update firestore with system user access token
      addRecordToFirestore({
        uid: facebookAuthData.user.uid,
        email: facebookAuthData.user.email,
        sysUserAccessToken,
      });

      // reset business asset it to prevent 3rd useEffect from firing
      dispatch({
        type: 'businessAssetId',
        payload: null,
      });
    };
    if (businessAssetId) {
      handleAsyncWork();
    }
  }, [
    businessAssetId,
    facebookAuthData,
    businessSystemUserId,
    sysUserAccessToken,
  ]);

  // handle user business list select element event
  const handleSelectUserBusinessList = (e) => {
    // get select element value and update user business id state with chosen value
    if (e.target?.value && e.target?.value !== '') {
      dispatch({
        type: 'userBusinessId',
        payload: e.target?.value,
      });
    }
    // update user business id trigger state to reredner component and call useEffect async work
    dispatch({
      type: 'hasUserBusinessId',
      payload: true,
    });
  };

  // handle business ad account select element event
  const handleSelectBusinessAdAcct = (e) => {
    // get select element value and update user business id state with chosen value
    if (e.target?.value && e.target?.value !== '') {
      dispatch({
        type: 'businessAssetId',
        payload: e.target?.value,
      });
    }
  };

  return (
    <>
      <main
        className="home-container"
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <header
          style={{
            margin: '1.5rem',
            color: 'black',
            fontWeight: 700,
            fontSize: '2rem',
            display: 'flex',
          }}
        >
          CurateApp.AI facebook login
        </header>
        {!isBtnClicked && !businessSystemUserId && (
          <button
            id="facebookLogin"
            onClick={(e) => {
              dispatch({
                type: 'isFacebookLoginAction',
                payload: true,
              });
              dispatch({
                type: 'isBtnClicked',
                payload: true,
              });
            }}
          >
            Facebook Login
          </button>
        )}
        {/* setup user business account selector */}
        {isBtnClicked && asyncDataReady && (
          <AcctSelector
            acctList={userBusinessList}
            onChangeHandler={handleSelectUserBusinessList}
            labelText="Choose your facebook business account:"
          />
        )}

        {/* setup business ad account selector */}
        {businessAdAcctList &&
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
            <p style={{ color: '#c5221f' }}>
              Oops, we've encountered an error. Please try again by refreshing
              the page. If the issue persists,{' '}
              <a
                href={`mailto:
                ryanwelling@gmail.com?cc=kev.d.friedman@gmail.com&subject=CurateApp.AI%20Integration%20Error&body=Error: ${
                  hasErrors.errMessage
                    ? hasErrors.errMessage
                    : hasErrors.errUserMsg
                }`}
              >
                please let us know
              </a>
            </p>
            <p style={{ color: '#c5221f' }}>
              Error:
              {hasErrors.errMessage
                ? hasErrors.errMessage
                : hasErrors.errUserMsg}
            </p>
          </>
        )}
      </main>
    </>
  );
};

export default HomePage;
