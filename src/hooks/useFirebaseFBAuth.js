import { useState, useEffect } from 'react';
import authenticateWithFacebook from '../services/firebase/auth/facebook';

export const useFirebaseFBAuth = (isFbLoginAction) => {
  const [facebookAuthData, updateFacebookAuthData] = useState({});

  const retrieveFacebookAuthResponse = async () => {
    // call firebase facebook auth client
    const facebookAuthResponse = await authenticateWithFacebook();

    // update facebook auth data state for return value via custom hook
    updateFacebookAuthData(facebookAuthResponse);
  };

  useEffect(() => {
    if (isFbLoginAction) {
      retrieveFacebookAuthResponse();
    }
  }, [isFbLoginAction]);

  return { facebookAuthData };
};
