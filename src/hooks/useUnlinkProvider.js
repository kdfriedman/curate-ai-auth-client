import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useUnlinkProvider = (setProviderType) => {
  const { unlinkProvider, currentUser } = useAuth();
  const handleUnlinkProvider = useCallback(
    async (providerType, isMounted) => {
      // if linked provider error occurs, unlink provider first before handling error further
      try {
        // filter provider object by providerType param
        const providerObj = currentUser.providerData.filter(
          (providerObj) => providerObj?.providerId === providerType
        );
        if (!providerObj ?? providerObj.length === 0) {
          console.error({
            errMsg: 'provider cannot be unlinked because it does not exist',
            errVar: providerObj,
          });
          return 'provider does not exist';
        }
        // unlink provider by providerId
        await unlinkProvider(currentUser, providerObj[0]?.providerId);
        console.log(`${providerType} unlinked`);

        if (isMounted) setProviderType(null);
      } catch (err) {
        if (isMounted) setProviderType(null);
        console.error({ errMsg: 'unlinkedProvider has err', err });
      }
    },
    [currentUser, setProviderType, unlinkProvider]
  );
  return { handleUnlinkProvider };
};
