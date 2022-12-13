import { db } from '../firebase';
import { updateDoc, doc, getDoc, arrayUnion, arrayRemove, setDoc, increment } from 'firebase/firestore';
import { FIREBASE_ERROR, FIREBASE } from '../constants';

const readUserRecordFromFirestore = async (uid, collections, document) => {
  const [collection1, collection2] = collections;
  try {
    const record = await getDoc(doc(db, collection1, uid, collection2, document));
    return [record, null];
  } catch (error) {
    console.log(error);
    console.error(FIREBASE_ERROR.FIRESTORE.GENERIC.FAILED_READING_DATA);
    return [null, error];
  }
};

const readCurateAIRecordFromFirestore = async (uid, collection) => {
  try {
    const record = await getDoc(doc(db, collection, uid));
    return [record, null];
  } catch (error) {
    console.error(FIREBASE_ERROR.FIRESTORE.CURATEAI.SYSTEM_USER_ACCESS_TOKEN_CANNOT_BE_FETCHED);
    return [null, error];
  }
};

const incrementFirebaseRecord = async (uid, collections, document, keyToIncrement, valueToIncrement, moreProps) => {
  const [collection1, collection2] = collections;

  try {
    await updateDoc(doc(db, collection1, uid, collection2, document), {
      [keyToIncrement]: increment(valueToIncrement),
      ...moreProps,
    });
    return [FIREBASE.FIRESTORE.GENERIC.UNION_ADDED, null];
  } catch (error) {
    return [null, error];
  }
};

const addRecordToFirestore = async (recordConfig, payload) => {
  try {
    await setDoc(doc(db, ...recordConfig), payload);
    return [FIREBASE.FIRESTORE.GENERIC.RECORD_CREATED, null];
  } catch (error) {
    console.error(FIREBASE_ERROR.FIRESTORE.GENERIC.FAILED_TO_CREATE_NEW_RECORD);
    return [null, error];
  }
};

const hasFirestoreRecord = async (uid, collections, doc) => {
  const [collection1, collection2] = collections;
  // read record to check if uid exists in database, otherwise create new record
  const [record, error] = await readUserRecordFromFirestore(uid, [collection1, collection2], doc);
  // check for request error
  if (error) {
    console.error(FIREBASE_ERROR.FIRESTORE.GENERIC.FAILED_READING_DATA);
    return [null, error];
  }
  if (record?.exists()) return [true, record];
  return [false, null];
};

const addListOfRecordsToFirestore = async (uid, collections, docs, payload, payloadName) => {
  const [collection1, collection2] = collections;
  const [doc1] = docs;
  const [hasRecord, record] = await hasFirestoreRecord(uid, collections, doc1);
  try {
    // check if record exists before further processing
    if (hasRecord && record.data() && Array.isArray(record?.data()[payloadName])) {
      // loop through all records within vendor array
      const hasDuplicateRecord = record?.data()[payloadName]?.find((record) => {
        // if record exist and access token is same as prev, return duplicate err
        return record.adAccountId === payload.adAccountId && record.userAccessToken === payload.userAccessToken;
      });
      if (hasDuplicateRecord) return [null, FIREBASE_ERROR.FIRESTORE.GENERIC.DUPLICATE_RECORD];

      // if record exist but new payload has different access token, add payload into arr
      await updateDoc(doc(db, collection1, uid, collection2, doc1), {
        [payloadName]: arrayUnion(payload),
      });
      return [FIREBASE.FIRESTORE.GENERIC.UNION_ADDED, null];
    }
  } catch (error) {
    console.error(FIREBASE_ERROR.FIRESTORE.GENERIC.FAILED_TO_UNION_TO_ARRAY);
    return [null, error];
  }
  return await addRecordToFirestore([collection1, uid, collection2, doc1], { [payloadName]: [payload] });
};

const removeRecordFromFirestore = async (uid, collections, docs, payloadName, removalRecordPropertyId) => {
  // destructure collection and doc lists
  const [collection1, collection2] = collections;
  const [doc1] = docs;
  const [hasRecord, record] = await hasFirestoreRecord(uid, collections, doc1);

  if (hasRecord) {
    // this check is used for users who attempt to remove record which has been manually removed by admin prior, therefore no record exists to remove
    if (!record.data() || !Array.isArray(record?.data()[payloadName])) {
      // if this error occurs, most likely caused by db getting unsynced with app
      // reload page as fail safe
      window.location.reload();
    }
    const selectedRecord = record?.data()[payloadName].find((record) => {
      return record.businessAcctId === removalRecordPropertyId;
    });
    if (!selectedRecord) {
      // if this error occurs, most likely caused by db getting unsynced with app
      // reload page as fail safe
      window.location.reload();
    }
    try {
      // if record exist, push new payload into array
      await updateDoc(doc(db, collection1, uid, collection2, doc1), {
        [payloadName]: arrayRemove(selectedRecord),
      });
      return [selectedRecord, null];
    } catch (error) {
      console.error(FIREBASE_ERROR.FIRESTORE.GENERIC.FAILED_REMOVING_DATA);
      console.error(error);
      return [null, error];
    }
  }
};

const firestoreHandlers = {
  addListOfRecordsToFirestore,
  addRecordToFirestore,
  removeRecordFromFirestore,
  readUserRecordFromFirestore,
  readCurateAIRecordFromFirestore,
  incrementFirebaseRecord,
  hasFirestoreRecord,
};

export default firestoreHandlers;
