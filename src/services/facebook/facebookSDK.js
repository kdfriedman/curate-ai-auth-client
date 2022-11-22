import { FACEBOOK_API } from '../facebook/constants';
import fetchData from '../fetch/fetch';
import { HTTP_METHODS } from '../fetch/constants';
import { FIREBASE } from '../firebase/constants';
import firestoreHandlers from '../firebase/data/firestore';

const appId = process.env.REACT_APP_FACEBOOK_APP_ID;
const { readCurateAIRecordFromFirestore } = firestoreHandlers;
const { GET } = HTTP_METHODS;

const fetchCurateAISystemUserAccessToken = async () => {
  // read record from firestore to retrieve curateai sys user token
  const [record, error] = await readCurateAIRecordFromFirestore(
    FIREBASE.FIRESTORE.CURATEAI.UID,
    FIREBASE.FIRESTORE.CURATEAI.COLLECTION
  );
  if (error || !record?.exists()) return console.error('Cannot fetch CurateAI access token');
  const { curateAiSysUserAccessToken } = record?.data();
  return curateAiSysUserAccessToken;
};

export const handleValidateFacebookAccessToken = async (facebookAccessToken) => {
  const adminToken = await fetchCurateAISystemUserAccessToken();
  try {
    const [validatedAccessToken, validatedAccessTokenError] = await fetchData({
      method: GET,
      url: `${FACEBOOK_API.GRAPH.HOSTNAME}${FACEBOOK_API.GRAPH.DEBUG_TOKEN}?input_token=${facebookAccessToken}&access_token=${adminToken}`,
    });
    if (validatedAccessTokenError) throw validatedAccessTokenError;
    return [validatedAccessToken, null];
  } catch (err) {
    return [null, err];
  }
};

const getFbLoginStatus = (resolve, reject) => {
  if (!window.FB?.getLoginStatus) {
    console.error('window.FB.getLoginStatus is undefined');
    reject();
  }
  window.FB.getLoginStatus((response) => {
    resolve(response);
  });
};

const handleValidateFacebookSession = async () => {
  // reference FB sdk getAccessToken
  if (window.FB?.getAccessToken && window.FB.getAccessToken()) {
    // get active session fb payload
    const loginStatus = await getFacebookLoginStatus();
    // validate token to ensure it's not expired
    const [validatedAccessPayload, validatedAccessError] = await handleValidateFacebookAccessToken(
      loginStatus.authResponse?.accessToken
    );
    if (validatedAccessError) return console.error(validatedAccessError);
    if (validatedAccessPayload.data?.data?.is_valid) {
      return loginStatus;
    }
  }
};

export const getFacebookLoginStatus = async () => {
  return new Promise((resolve, reject) => {
    getFbLoginStatus(resolve, reject);
  });
};

export const setFbAsyncInit = (resolve) => {
  window.fbAsyncInit = () => {
    if (!window.FB?.init) return console.error('window.FB.init is undefined');
    window.FB.init({
      appId,
      autoLogAppEvents: true,
      xfbml: true,
      version: FACEBOOK_API.GRAPH.VERSION,
    });
    getFbLoginStatus(resolve);
  };
};

export const loadSdkAsynchronously = () => {
  ((d, s, id) => {
    var js,
      fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
      return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = `https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=${FACEBOOK_API.GRAPH.VERSION}&appId=${appId}&autoLogAppEvents=1`;
    js.nonce = 'mBTlHUSw';
    fjs.parentNode.insertBefore(js, fjs);
  })(document, 'script', 'facebook-jssdk');
};

export const handleFacebookLogin = async (setFacebookAuthChange) => {
  return new Promise(async (resolve, reject) => {
    if (!window.FB?.login) {
      console.error('window.FB.login is undefined');
      reject(null);
    }
    // check if access token exists in session storage
    const validatedFacebookSession = await handleValidateFacebookSession();
    if (validatedFacebookSession) {
      setFacebookAuthChange(validatedFacebookSession);
      return resolve(validatedFacebookSession);
    }
    // if session is null or expired re-authenticate user
    window.FB.login(
      (response) => {
        if (response.status === 'connected') {
          setFacebookAuthChange(response);
          return resolve(response);
        }
        console.error('handleFacebookLogin failed to log in user - response', response);
        reject(response);
      },
      {
        scope: 'business_management,public_profile,email,ads_read ,ads_management',
      }
    );
  });
};
