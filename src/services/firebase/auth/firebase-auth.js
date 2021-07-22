import firebase from 'firebase/app';
import 'firebase/auth';

// instantiate new Facebook provider
const provider = new firebase.auth.FacebookAuthProvider();
// add business_manager scope to access user's business manager data
provider.addScope('business_management, public_profile');

const authenticateWithFacebook = async () => {
  try {
    // call facebook login sdk and pass in provider
    const result = await firebase.auth().signInWithPopup(provider);
    // facebook credential
    const credential = result.credential;
    // The signed-in user info.
    const user = result.user;
    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    const accessToken = credential.accessToken;

    return { credential, user, accessToken };
  } catch (error) {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.email;
    // The AuthCredential type that was used.
    const credential = error.credential;
    // log errors
    console.error({ errorCode, errorMessage, email, credential });
  }
};

export default authenticateWithFacebook;
