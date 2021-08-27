import firebase from 'firebase/app';

// instantiate new Facebook provider
export const fbProviderRedirect = new firebase.auth.FacebookAuthProvider();
// add business_manager scope to access user's business manager data
fbProviderRedirect.addScope(
  'business_management, public_profile, ads_read, read_insights, ads_management'
);
fbProviderRedirect.setCustomParameters({ auth_type: 'reauthenticate' });

// instantiate new Facebook provider
export const fbProviderPopup = new firebase.auth.FacebookAuthProvider();
// add business_manager scope to access user's business manager data
fbProviderPopup.addScope(
  'business_management, public_profile, ads_read, read_insights, ads_management'
);
