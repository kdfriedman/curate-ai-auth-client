import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useIntegrationError = (setIntegrationError, setProviderType) => {
  const { unlinkProvider, currentUser } = useAuth();
  const handleIntegrationError = useCallback(
    async (isMounted, providerType) => {
      // if linked provider error occurs, unlink provider first before handling error further
      try {
        // filter provider object by providerType param
        const providerObj = currentUser.providerData.filter(
          (providerObj) => providerObj?.providerId === providerType
        )[0];
        // unlink provider by providerId
        await unlinkProvider(currentUser, providerObj?.providerId);
        console.log(`${providerType} unlinked`);

        if (isMounted) {
          // reset integration error
          setIntegrationError(null);
          // reset provider type
          setProviderType(null);
        }
      } catch (err) {
        if (isMounted) {
          // reset integration error
          setIntegrationError(null);
          // reset provider type
          setProviderType(null);
        }
        console.error({ errMsg: 'unlinkedProvider has err', err });
      }
    },
    [currentUser, setIntegrationError, setProviderType, unlinkProvider]
  );
  return { handleIntegrationError };
};
