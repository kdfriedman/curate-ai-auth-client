import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useRefreshFacebookAccessToken = () => {
  const { linkToProviderWithPopup } = useAuth();

  const handleRefreshFacebookAccessToken = useCallback(
    async (provider) => {
      try {
        const result = await linkToProviderWithPopup(provider);
        // check that result exists
        if (!result?.credential) return;

        // facebook credential
        const credential = result.credential;
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        const accessToken = credential.accessToken;
        return accessToken;
      } catch (error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // log errors
        console.error({ errorCode, errorMessage });
      }
    },
    [linkToProviderWithPopup]
  );
  return {
    handleRefreshFacebookAccessToken,
  };
};
