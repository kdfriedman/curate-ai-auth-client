import { useState, useEffect } from 'react';
import { useFirebaseFBAuth } from '../hooks/useFirebaseFBAuth';
import axios from 'axios';

const HomePage = () => {
  // setup local state to handle if fb auth interaction is triggered
  const [isFacebookLoginAction, updateFacebookLoginAction] = useState(false);
  // setup login btn disabled state
  const [isBtnClicked, setIsBtnClicked] = useState(false);
  // setup user business list state
  const [userBusinessList, setUserBusinessList] = useState(null);
  // setup async work update ready state
  const [asyncDataReady, updateAsyncReadyState] = useState(false);
  //setup hasUserBusinessId state
  const [hasUserBusinessId, updateUserBusinessIdState] = useState(false);
  // setup state for business id state
  const [userBusinessId, setUserBusinessId] = useState(null);
  // setup business ad acct list state
  const [businessAdAcctList, setBusinessAdAcctList] = useState(null);
  // setup business system user id
  const [businessSystemUserId, setBusinessSystemUserId] = useState(null);
  // update business asset id
  const [businessAssetId, setBuinessAssetId] = useState(null);

  // custom hook - firebase facebook auth
  const { facebookAuthData } = useFirebaseFBAuth(isFacebookLoginAction);
  const hasFacebookAuthData =
    facebookAuthData && Object.keys(facebookAuthData).length > 0;

  // data fetcher util function using axios library
  const fetchData = async (params) => {
    try {
      const data = await axios.request(params);
      return [data, null];
    } catch (error) {
      console.error(error);
      return [null, error];
    }
  };

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
        url: `https://graph.facebook.com/v11.0/me?fields=id&access_token=${facebookAuthData.accessToken}`,
        params: {},
        data: {},
        headers: {},
      });
      if (userError) return;
      const userId = userData.data.id;

      // fetch user business list
      const [userBusinessList, userBusinessError] = await fetchData({
        method: 'GET',
        url: `https://graph.facebook.com/v11.0/${userId}/businesses?&access_token=${facebookAuthData.accessToken}`,
        params: {},
        data: {},
        headers: {},
      });
      if (userBusinessError) {
        return console.error({
          errMessage: userBusinessError.response.data.error.message,
          errUserMsg: userBusinessError.response.data.error.error_user_msg,
        });
      }
      // reset facebook login action state to false, preventing future login attempts
      updateFacebookLoginAction(false);

      if (userBusinessList && userBusinessList?.data?.data.length > 0) {
        // update local state with user business list data
        setUserBusinessList(userBusinessList.data.data);
        // update local state with async completion update
        updateAsyncReadyState(true);
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
        url: `https://graph.facebook.com/v11.0/419312452044680/managed_businesses?existing_client_business_id=${userBusinessId}&access_token=${facebookAuthData.accessToken}`,
        params: {},
        data: {},
        headers: {},
      });
      if (clientBusinessError) {
        return console.error({
          errMessage: clientBusinessError?.response?.data?.error?.message,
          errUserMsg:
            clientBusinessError?.response?.data?.error?.error_user_msg,
        });
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
        return console.error({
          errMessage: sysUserError?.response?.data?.error?.message,
          errUserMsg: sysUserError?.response?.data?.error?.error_user_msg,
        });
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
        return console.error({
          errMessage: sysUserIdError?.response?.data?.error?.message,
          errUserMsg: sysUserIdError?.response?.data?.error?.error_user_msg,
        });
      }
      const sysUserId = sysUserIdData?.data?.id;
      if (!sysUserId) return console.error({ sysUserId });

      const [adAcctAssetList, adAcctAssetListError] = await fetchData({
        method: 'GET',
        url: `https://graph.facebook.com/v11.0/${clientBusinessAcctId}/owned_ad_accounts?access_token=${facebookAuthData.accessToken}&fields=name`,
        params: {},
        data: {},
        headers: {},
      });
      if (adAcctAssetListError) {
        return console.error({
          errMessage: adAcctAssetListError?.response?.data?.error?.message,
          errUserMsg:
            adAcctAssetListError?.response?.data?.error?.error_user_msg,
        });
      }

      // reset facebook login btn click state
      setIsBtnClicked(false);
      // reset async ready state to false to signify completion of 2nd useEffect
      updateAsyncReadyState(false);
      // reset user business id state, preventing further fb business asset look up requests
      updateUserBusinessIdState(false);

      if (adAcctAssetList && adAcctAssetList?.data?.data.length > 0) {
        // update local state with user business list data
        setBusinessAdAcctList(adAcctAssetList.data.data);
        // set business system user id
        setBusinessSystemUserId(sysUserId);
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
        return console.error({
          errMessage:
            sysUserAssetAssignmentDataError?.response?.data?.error?.message,
          errUserMsg:
            sysUserAssetAssignmentDataError?.response?.data?.error
              ?.error_user_msg,
        });
      }
      console.log(sysUserAssetAssignmentData);
    };
    if (businessAssetId) {
      handleAsyncWork();
    }
  }, [businessAssetId, facebookAuthData, businessSystemUserId]);

  // handle user business list select element event
  const handleSelectUserBusinessList = (e) => {
    // get select element value and update user business id state with chosen value
    if (e.target.value && e.target.value !== '') {
      setUserBusinessId(e.target.value);
    }
    // update async work trigger state to reredner component and call useEffect async work
    updateUserBusinessIdState(true);
  };

  // handle business ad account select element event
  const handleSelectBusinessAdAcct = (e) => {
    // get select element value and update user business id state with chosen value
    if (e.target.value && e.target.value !== '') {
      setBuinessAssetId(e.target.value);
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
              updateFacebookLoginAction(true);
              setIsBtnClicked(true);
            }}
          >
            Facebook Login
          </button>
        )}
        {isBtnClicked && asyncDataReady && (
          <>
            <label htmlFor="business list">
              Choose your facebook business account:
            </label>
            <select onChange={handleSelectUserBusinessList}>
              <option value="">--Please select an option--</option>
              {userBusinessList.map((userBusiness) => {
                return (
                  <option key={userBusiness.id} value={userBusiness.id}>
                    {userBusiness.name}
                  </option>
                );
              })}
            </select>
          </>
        )}
        {businessAdAcctList &&
          businessAdAcctList.length > 0 &&
          businessSystemUserId && (
            <>
              <label htmlFor="ad account list">
                Choose your facebook business ad account:
              </label>
              <select onChange={handleSelectBusinessAdAcct}>
                <option value="">--Please select an option--</option>
                {businessAdAcctList.map((businessAdAcct) => {
                  return (
                    <option key={businessAdAcct.id} value={businessAdAcct.id}>
                      {businessAdAcct.name}
                    </option>
                  );
                })}
              </select>
            </>
          )}
      </main>
    </>
  );
};

export default HomePage;
