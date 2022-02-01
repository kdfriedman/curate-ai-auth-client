import fetchData from '../services/fetch/fetch';
import { HTTP_METHODS } from '../services/fetch/constants';
import { FACEBOOK_API, FACEBOOK_APP } from '../services/facebook/constants';

export const useDeleteFacebookSystemUser = () => {
  const { DELETE } = HTTP_METHODS;
  const handleDeleteFacebookSystemUser = async (
    userBusinessId,
    accessToken
  ) => {
    try {
      // TODO: provide delete sys user for clients - figure out how to store access token, refresh if needed, and allow user to unintegrate
      const [deletedSystemUserData, deletedSystemUserError] = await fetchData({
        method: DELETE,
        url: `${FACEBOOK_API.GRAPH.HOSTNAME}/${FACEBOOK_API.GRAPH.VERSION}/${FACEBOOK_APP.CURATEAI.BUSINESS_ID}/managed_businesses?existing_client_business_id=${userBusinessId}&access_token=${accessToken}`,
      });
      if (deletedSystemUserError) {
        return deletedSystemUserError;
      }
      return deletedSystemUserData;
    } catch (err) {
      return err;
    }
  };
  return { handleDeleteFacebookSystemUser };
};
