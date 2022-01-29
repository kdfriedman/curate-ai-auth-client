import { useEffect, useState } from 'react';
import {
  setFbAsyncInit,
  loadSdkAsynchronously,
  createFbRoot,
} from '../services/facebook/facebookSDK';

export const useFacebookSDK = () => {
  const [fbSdkLoaded, setFbSdkLoaded] = useState(false);
  const [fbLoginStatus, setFbLoginStatus] = useState(null);

  useEffect(() => {
    const setupFacebook = (
      setFbAsyncInit,
      loadSdkAsynchronously,
      createFbRoot
    ) => {
      const hasFacebookJavaScriptSdk =
        document.getElementById('facebook-jssdk');
      if (hasFacebookJavaScriptSdk) {
        setFbSdkLoaded(true);
        return;
      }
      setFbAsyncInit(setFbSdkLoaded, setFbLoginStatus);
      loadSdkAsynchronously();
      createFbRoot();
    };
    setupFacebook(setFbAsyncInit, loadSdkAsynchronously, createFbRoot);
  }, []);

  return {
    fbSdkLoaded,
    fbLoginStatus,
  };
};
