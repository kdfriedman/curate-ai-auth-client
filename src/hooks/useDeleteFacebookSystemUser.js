import { useCallback } from 'react';
import fetchData from '../services/fetch/fetch';

export const useDeleteFacebookSystemUser = () => {
  const handleDeleteFacebookSystemUser = useCallback(
    async (userBusinessId, accessToken) => {
      try {
        // TODO: provide delete sys user for clients - figure out how to store access token, refresh if needed, and allow user to unintegrate
        const [deletedSystemUserData, deletedSystemUserError] = await fetchData(
          {
            method: 'DELETE',
            url: `https://graph.facebook.com/v11.0/419312452044680/managed_businesses?existing_client_business_id=${userBusinessId}&access_token=${accessToken}`,
            params: {},
            data: {},
            headers: {},
          }
        );
        if (deletedSystemUserError) {
          return console.error({ deletedSystemUserError });
        }
        return deletedSystemUserData;
      } catch (err) {
        console.error({ errMsg: 'deletion of system user has err', err });
      }
    },
    []
  );
  return { handleDeleteFacebookSystemUser };
};
