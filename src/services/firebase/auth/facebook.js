import firebase from 'firebase/app';

// instantiate new Facebook provider
export const fbProviderRedirect = new firebase.auth.FacebookAuthProvider();
// add business_manager scope to access user's business manager data
fbProviderRedirect.addScope('business_management');
fbProviderRedirect.addScope('public_profile');
fbProviderRedirect.addScope('email');
fbProviderRedirect.addScope('ads_read');
fbProviderRedirect.addScope('ads_management');
fbProviderRedirect.setCustomParameters({ auth_type: 'reauthenticate' });

// instantiate new Facebook provider
export const fbProviderPopup = new firebase.auth.FacebookAuthProvider();
// add business_manager scope to access user's business manager data
fbProviderPopup.addScope('business_management');
fbProviderPopup.addScope('public_profile');
fbProviderPopup.addScope('email');
fbProviderPopup.addScope('ads_read');
fbProviderPopup.addScope('ads_management');
