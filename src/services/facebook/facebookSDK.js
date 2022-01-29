const appId = process.env.REACT_APP_FACEBOOK_APP_ID || 'dev_app_id';

export const getFbLoginStatus = (FB, setFbLoginStatus) => {
  FB.getLoginStatus((response) => {
    setFbLoginStatus(response);
  });
};

export const setFbAsyncInit = (setFbSdkLoaded, setFbLoginStatus) => {
  window.fbAsyncInit = () => {
    window.FB.init({
      appId,
      autoLogAppEvents: true,
      xfbml: true,
      version: 'v12.0',
    });
    setFbSdkLoaded(true);
    getFbLoginStatus(window.FB, setFbLoginStatus);
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
    js.src = 'https://connect.facebook.net/en_US/sdk.js';
    fjs.parentNode.insertBefore(js, fjs);
  })(document, 'script', 'facebook-jssdk');
};

export const createFbRoot = () => {
  let fbRoot = document.getElementById('fb-root');
  if (!fbRoot) {
    fbRoot = document.createElement('div');
    fbRoot.id = 'fb-root';
    document.body.appendChild(fbRoot);
  }
};
