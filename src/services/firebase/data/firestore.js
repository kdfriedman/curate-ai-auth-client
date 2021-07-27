import firebase from 'firebase/app';
import 'firebase/firestore';
const { serverTimestamp } = firebase.firestore.FieldValue;

const addRecordToFirestore = async (payload) => {
  const { uid, email, sysUserAccessToken } = payload;
  // validate that arguments are not falsy
  if (!uid ?? !email ?? !sysUserAccessToken) {
    return console.error({ uid, email, sysUserAccessToken });
  }
  // initialize database via firebase object
  const db = firebase.firestore();

  try {
    const record = await db.collection('clients').doc(uid).get();
    if (record.exists)
      return console.warn(
        'The record cannot be added because the user id already exists'
      );
  } catch (error) {
    console.error('Error getting document: ', error);
  }

  try {
    await db.collection('clients').doc(uid).set({
      uid,
      email,
      sysUserAccessToken,
      createdAt: serverTimestamp(),
    });
    console.log('Document written with ID: ', uid);
  } catch (error) {
    console.error('Error adding document: ', error);
  }
};

export default addRecordToFirestore;
