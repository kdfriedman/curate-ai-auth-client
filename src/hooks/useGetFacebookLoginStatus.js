import { getFbLoginStatus } from '../services/facebook/facebookSDK';

export const useGetFacebookLoginStatus = () => {
  const getFacebookLoginStatus = async () => {
    return new Promise((resolve, reject) => {
      getFbLoginStatus(resolve);
    });
  };
  return { getFacebookLoginStatus };
};
