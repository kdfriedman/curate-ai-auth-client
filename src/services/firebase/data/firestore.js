import firebase from 'firebase/app';
import { db } from '../firebase';

// used to generate firebase managed timestamp for new records
const { serverTimestamp } = firebase.firestore.FieldValue;

const addRecordToFirestore = async (payload) => {
  const { uid, email, sysUserAccessToken } = payload;
  // validate that arguments are not falsy
  if (!uid ?? !email ?? !sysUserAccessToken) {
    return console.error({ uid, email, sysUserAccessToken });
  }

  try {
    const record = await db.collection('clients').doc(uid).get();

    if (record.exists) {
      console.warn(
        'The record cannot be added because the user id already exists'
      );
      return 'duplicate record';
    }
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
    return 'Document written with ID: ' + uid;
  } catch (error) {
    console.error('Error adding document: ', error);
  }
};

export default addRecordToFirestore;
