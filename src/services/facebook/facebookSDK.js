import { FACEBOOK_API } from '../facebook/constants';
const appId = process.env.REACT_APP_FACEBOOK_APP_ID;

export const getFbLoginStatus = (resolve) => {
  if (!window.FB?.getLoginStatus) {
    return console.error('window.FB.getLoginStatus is undefined');
  }
  window.FB.getLoginStatus((response) => {
    resolve(response);
  }, true);
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
    js.src = `https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v12.0&appId=${appId}&autoLogAppEvents=1`;
    js.nonce = 'mBTlHUSw';
    fjs.parentNode.insertBefore(js, fjs);
  })(document, 'script', 'facebook-jssdk');
};

export const handleFacebookLogin = async (setFacebookAuthChange) => {
  return new Promise((resolve, reject) => {
    if (!window.FB?.login) return console.error('window.FB.login is undefined');
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

export const handleSwitchFacebookAdAccounts = (setFacebookAuthChange) => {
  if (!window.FB?.logout) return console.error('window.FB.logout is undefined');
  if (!window.FB?.getAccessToken()) {
    console.log('facebook access token is null, log in user');
    return handleFacebookLogin(setFacebookAuthChange);
  }
  window.FB.logout((response) => {
    console.log('facebook access token is valid, log out user, then proceed to log them back in');
    handleFacebookLogin(setFacebookAuthChange);
  });
};
