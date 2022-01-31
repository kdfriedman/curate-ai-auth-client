const appId = process.env.REACT_APP_FACEBOOK_APP_ID || 'dev_app_id';

export const getFbLoginStatus = (resolve) => {
  window.FB.getLoginStatus((response) => {
    resolve(response);
  }, true);
};

export const setFbAsyncInit = (resolve) => {
  window.fbAsyncInit = () => {
    window.FB.init({
      appId,
      autoLogAppEvents: true,
      xfbml: true,
      version: 'v12.0',
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

export const handleFacebookLogin = (setFacebookAuthChange) => {
  window.FB.login(
    (response) => {
      setFacebookAuthChange(response);
    },
    {
      scope:
        'business_management,public_profile,email,ads_read ,ads_management',
    }
  );
};
