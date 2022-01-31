import {
  setFbAsyncInit,
  loadSdkAsynchronously,
} from '../services/facebook/facebookSDK';

export const useFacebookSDK = () => {
  const facebookInitSDK = async () => {
    return new Promise((resolve, reject) => {
      setFbAsyncInit(resolve);
      loadSdkAsynchronously();
    });
  };

  return {
    facebookInitSDK,
  };
};
