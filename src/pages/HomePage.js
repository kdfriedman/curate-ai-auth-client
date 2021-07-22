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
  //setup async work trigger state
  const [hasAsyncWorkTrigger, triggerAsyncWork] = useState(false);
  // setup state for business id state
  const [userBusinessId, setUserBusinessId] = useState(null);

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
      // update facebook login action state
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

  useEffect(() => {
    // async wrapper function to allow multiple requests
    const handleAsyncWork = async () => {
      // fetch account user data
      const [userData, userError] = await fetchData({
        method: 'POST',
        url: `https://graph.facebook.com/v11.0/419312452044680/managed_businesses?existing_client_business_id=${userBusinessId}&access_token=${facebookAuthData.accessToken}`,
        params: {},
        data: {},
        headers: {},
      });
      if (userError) {
        return console.error({
          errMessage: userError.response.data.error.message,
          errUserMsg: userError.response.data.error.error_user_msg,
        });
      }
      console.log(userData);
    };
    if (hasAsyncWorkTrigger) {
      handleAsyncWork();
    }
  }, [hasAsyncWorkTrigger, userBusinessId, facebookAuthData]);

  const handleSelectionChange = (e) => {
    // get select element value and update user business id state with chosen value
    if (e.target.value && e.target.value !== '') {
      setUserBusinessId(e.target.value);
    }
    // update async work trigger state to reredner component and call useEffect async work
    triggerAsyncWork(true);
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
        {!isBtnClicked && (
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
          <select onChange={handleSelectionChange}>
            <option value="">
              --Please select a business for CurateApp to integrate with--
            </option>
            {userBusinessList.map((userBusiness) => {
              return (
                <option key={userBusiness.id} value={userBusiness.id}>
                  {userBusiness.name}
                </option>
              );
            })}
          </select>
        )}
      </main>
    </>
  );
};

export default HomePage;
