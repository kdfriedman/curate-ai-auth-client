import React, { useContext, useState, useEffect } from 'react';
import { handleFacebookLogin, handleSwitchFacebookAdAccounts } from '../services/facebook/facebookSDK';
import { useFacebookSDK } from '../hooks/useFacebookSDK';

const FacebookContext = React.createContext();

export const useFacebookAuth = () => {
  return useContext(FacebookContext);
};

export const FacebookAuthProvider = ({ children }) => {
  const { facebookInitSDK } = useFacebookSDK();
  const [isFacebookSDKLoaded, setIsFacebookSDKLoaded] = useState(false);
  const [facebookAuthChange, setFacebookAuthChange] = useState(null);

  const loginToFacebook = async () => {
    return await handleFacebookLogin(setFacebookAuthChange);
  };

  const switchFacebookAdAccounts = () => {
    return handleSwitchFacebookAdAccounts(setFacebookAuthChange);
  };

  const handleFacebookAuthResponse = (response) => {
    setFacebookAuthChange(response);
  };

  useEffect(() => {
    // only set auth subscriptions when page loads
    if (isFacebookSDKLoaded) return;
    // listen for auth changes
    // unsubscribe when component unmounts
    facebookInitSDK()
      .then((response) => {
        setIsFacebookSDKLoaded(true);
        setFacebookAuthChange(response);
        // prettier-ignore
        window.FB?.Event?.subscribe('auth.authResponseChange', handleFacebookAuthResponse);
        // prettier-ignore
        window.FB?.Event?.subscribe('auth.statusChange', handleFacebookAuthResponse);
      })
      .catch((err) => {
        console.error(err);
      });
    return () => {
      // prettier-ignore
      window.FB?.Event?.unsubscribe('auth.authResponseChange', handleFacebookAuthResponse);
      // prettier-ignore
      window.FB?.Event?.unsubscribe('auth.statusChange', handleFacebookAuthResponse);
    };
  }, [facebookInitSDK, isFacebookSDKLoaded]);

  const value = {
    facebookAuthChange,
    loginToFacebook,
    switchFacebookAdAccounts,
  };

  return <FacebookContext.Provider value={value}>{children}</FacebookContext.Provider>;
};
