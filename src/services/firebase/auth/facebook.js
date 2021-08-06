import firebase from 'firebase/app';

// instantiate new Facebook provider
export const provider = new firebase.auth.FacebookAuthProvider();
// add business_manager scope to access user's business manager data
provider.addScope(
  'business_management, public_profile, ads_read, read_insights'
);
