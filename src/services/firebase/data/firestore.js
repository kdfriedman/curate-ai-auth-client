import { db, Firebase } from '../firebase';
import { FIREBASE_ERROR, FIREBASE } from '../constants';

const readUserRecordFromFirestore = async (uid, collections, docs) => {
  const [collection1, collection2] = collections;
  const [doc1] = docs;
  try {
    const record = await db.collection(collection1).doc(uid).collection(collection2).doc(doc1).get();
    return [record, null];
  } catch (error) {
    console.error(FIREBASE_ERROR.FIRESTORE.GENERIC.FAILED_READING_DATA);
    return [null, error];
  }
};

const readCurateAIRecordFromFirestore = async (uid, collection) => {
  try {
    const record = await db.collection(collection).doc(uid).get();
    return [record, null];
  } catch (error) {
    console.error(FIREBASE_ERROR.FIRESTORE.CURATEAI.SYSTEM_USER_ACCESS_TOKEN_CANNOT_BE_FETCHED);
    return [null, error];
  }
};

const addRecordToFirestore = async (uid, collections, docs, payload, payloadName) => {
  const [collection1, collection2] = collections;
  const [doc1] = docs;

  // read record to check if uid exists in database, otherwise create new record
  const [record, error] = await readUserRecordFromFirestore(uid, [collection1, collection2], [doc1]);
  // check for request error
  if (error) {
    console.error(FIREBASE_ERROR.FIRESTORE.GENERIC.FAILED_READING_DATA);
    return [null, error];
  }

  try {
    // check if record exists before further processing
    if (record?.exists && record.data() && Array.isArray(record?.data()[payloadName])) {
      // loop through all records within vendor array
      const hasDuplicateRecord = record?.data()[payloadName]?.find((record) => {
        // if record exist and payload id is equal to previous
        return record.adAccountId === payload.adAccountId;
      });
      if (hasDuplicateRecord) return [null, FIREBASE_ERROR.FIRESTORE.GENERIC.DUPLICATE_RECORD];

      // if record exist, push new payload into array
      await db
        .collection(collection1)
        .doc(uid)
        .collection(collection2)
        .doc(doc1)
        .update({
          [payloadName]: Firebase.firestore.FieldValue.arrayUnion(payload),
        });
      return [FIREBASE.FIRESTORE.GENERIC.UNION_ADDED, null];
    }
  } catch (error) {
    console.error(FIREBASE_ERROR.FIRESTORE.GENERIC.FAILED_TO_UNION_TO_ARRAY);
    return [null, error];
  }

  // if record does not exist, create new record in firestore
  try {
    await db
      .collection(collection1)
      .doc(uid)
      .collection(collection2)
      .doc(doc1)
      .set({
        [payloadName]: [payload],
      });

    return [FIREBASE.FIRESTORE.GENERIC.RECORD_CREATED, null];
  } catch (error) {
    console.error(FIREBASE_ERROR.FIRESTORE.GENERIC.FAILED_TO_CREATE_NEW_RECORD);
    return [null, error];
  }
};

const removeRecordFromFirestore = async (uid, collections, docs, payloadName, removalRecordPropertyId) => {
  // destructure collection and doc lists
  const [collection1, collection2] = collections;
  const [doc1] = docs;

  // read record to check if uid exists in database, return without doing anything
  const [record, error] = await readUserRecordFromFirestore(uid, [collection1, collection2], [doc1]);
  if (error) {
    console.error(FIREBASE_ERROR.FIRESTORE.GENERIC.FAILED_READING_DATA);
    return [null, error];
  }

  if (record?.exists) {
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
      await db
        .collection(collection1)
        .doc(uid)
        .collection(collection2)
        .doc(doc1)
        .update({
          [payloadName]: Firebase.firestore.FieldValue.arrayRemove(selectedRecord[0]),
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
  addRecordToFirestore,
  removeRecordFromFirestore,
  readUserRecordFromFirestore,
  readCurateAIRecordFromFirestore,
};

export default firestoreHandlers;
