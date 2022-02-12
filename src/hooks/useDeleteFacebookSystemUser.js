import fetchData from '../services/fetch/fetch';
import { HTTP_METHODS } from '../services/fetch/constants';
import { FACEBOOK_API, FACEBOOK_APP } from '../services/facebook/constants';

export const useDeleteFacebookSystemUser = () => {
  const { DELETE } = HTTP_METHODS;
  const handleDeleteFacebookSystemUser = async (userBusinessId, accessToken) => {
    try {
      const [deletedSystemUserData, deletedSystemUserError] = await fetchData({
        method: DELETE,
        url: `${FACEBOOK_API.GRAPH.HOSTNAME}/${FACEBOOK_API.GRAPH.VERSION}/${FACEBOOK_APP.CURATEAI.BUSINESS_ID}/managed_businesses?existing_client_business_id=${userBusinessId}&access_token=${accessToken}`,
      });
      if (deletedSystemUserError) throw deletedSystemUserError;
      return deletedSystemUserData;
    } catch (err) {
      return err;
    }
  };
  return { handleDeleteFacebookSystemUser };
};
