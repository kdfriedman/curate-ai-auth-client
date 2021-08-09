import firebase from 'firebase/app';
import { db } from '../firebase';

// used to generate firebase managed timestamp for new records
const { serverTimestamp } = firebase.firestore.FieldValue;

const readUserRecordFromFirestore = async (
  uid,
  [collection1, collection2, collection3],
  [doc1, doc2]
) => {
  // check if uid is falsy
  if (!uid) return console.error({ uid });
  try {
    const record = await db
      .collection(collection1)
      .doc(uid)
      .collection(collection2)
      .doc(doc1)
      .collection(collection3)
      .doc(doc2)
      .get();
    return [record, null];
  } catch (error) {
    console.error('Error getting document: ', error);
    return [null, error];
  }
};

const readCurateAIRecordFromFirestore = async (uid, collection) => {
  // check if uid is falsy
  if (!uid) return console.error({ uid });
  try {
    const record = await db.collection(collection).doc(uid).get();
    return [record, null];
  } catch (error) {
    console.error('Error getting document: ', error);
    return [null, error];
  }
};

const addRecordToFirestore = async (uid, collections, docs, payload) => {
  // validate types of params and check for falsy values
  if (!uid) return console.error({ uid });
  if (!payload ?? Object.entries(payload).length === 0) {
    return console.error({ payload });
  }
  if (!Array.isArray(collections) && !Array.isArray(docs)) {
    return console.error({ collections, docs });
  }

  // destructure collection and doc lists
  const [collection1, collection2, collection3] = collections;
  const [doc1, doc2] = docs;

  try {
    // read record to check if uid exists in database, otherwise create new record
    const record = await db
      .collection(collection1)
      .doc(uid)
      .collection(collection2)
      .doc(doc1)
      .collection(collection3)
      .doc(doc2)
      .get();

    if (record.exists) {
      console.warn(
        'The record cannot be added a because a record from the same provider, uid, or account already exists'
      );
      return 'duplicate record';
    }
  } catch (error) {
    console.error('Error getting document: ', error);
  }

  // write record to firestore if record does not exist and arguments are valid
  try {
    await db
      .collection(collection1)
      .doc(uid)
      .collection(collection2)
      .doc(doc1)
      .collection(collection3)
      .doc(doc2)
      .set({
        ...payload,
        createdAt: serverTimestamp(),
      });
    return 'Document written with ID: ' + uid;
  } catch (error) {
    console.error('Error adding document: ', error);
  }
};

const firestoreHandlers = {
  addRecordToFirestore,
  readUserRecordFromFirestore,
  readCurateAIRecordFromFirestore,
};

export default firestoreHandlers;
