import { useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useAddMoreFacebookBusinessAccounts = () => {
  const [
    addMoreFacebookBusinessAccountsError,
    setAddMoreFacebookBusinessAccountsError,
  ] = useState(null);
  const [
    addMoreFacebookBusinessAccountsLoading,
    setAddMoreFacebookBusinessAccountsLoading,
  ] = useState(false);
  const [
    addMoreFacebookBusinessAccountsAuth,
    setAddMoreFacebookBusinessAccountsAuth,
  ] = useState(null);
  const { unlinkProvider, currentUser, linkToProviderWithPopup } = useAuth();

  const handleAddMoreFacebookBusinessAccounts = useCallback(
    async (providerType, provider) => {
      // set loading state
      setAddMoreFacebookBusinessAccountsLoading(true);
      // filter provider object by providerType param
      const providerObj = currentUser.providerData.filter(
        (providerObj) => providerObj?.providerId === providerType
      );
      if (!providerObj ?? providerObj.length === 0) {
        return console.error({ providerObj });
      }
      try {
        // unlink provider by providerId
        const unlinkedProvider = await unlinkProvider(
          currentUser,
          providerObj[0]?.providerId
        );
        if (!unlinkedProvider) console.error({ unlinkedProvider });

        const result = await linkToProviderWithPopup(provider);
        // check that result exists
        if (!result?.credential) return;

        // facebook credential
        const credential = result.credential;
        // The signed-in user info.
        const user = result.user;
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        const accessToken = credential.accessToken;

        setAddMoreFacebookBusinessAccountsAuth({
          credential,
          user,
          accessToken,
        });
        // reset loading state
        setAddMoreFacebookBusinessAccountsLoading(false);
      } catch (error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // log errors
        console.error({ errorCode, errorMessage });
        // reset loading state
        setAddMoreFacebookBusinessAccountsLoading(false);
        // set error state
        setAddMoreFacebookBusinessAccountsError(errorCode);
      }
    },
    [currentUser, unlinkProvider, linkToProviderWithPopup]
  );
  return {
    handleAddMoreFacebookBusinessAccounts,
    addMoreFacebookBusinessAccountsError,
    addMoreFacebookBusinessAccountsLoading,
    addMoreFacebookBusinessAccountsAuth,
  };
};
