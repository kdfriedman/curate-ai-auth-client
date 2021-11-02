import { db, Firebase } from '../firebase';

const readUserRecordFromFirestore = async (uid, collections, docs) => {
  // check if uid is falsy
  if (!uid) return console.error({ Error: `uid is null or undefined: ${uid}` });
  if (!Array.isArray(collections) && !Array.isArray(docs)) {
    return console.error({
      Error1: `collections is not type array: ${collections}`,
      Error2: `docs is not type array: ${docs}`,
    });
  }

  // destructure collection and doc lists
  const [collection1, collection2] = collections;
  const [doc1] = docs;
  try {
    const record = await db
      .collection(collection1)
      .doc(uid)
      .collection(collection2)
      .doc(doc1)
      .get();
    return [record, null];
  } catch (error) {
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
    return [null, error];
  }
};

const addRecordToFirestore = async (
  uid,
  collections,
  docs,
  payload,
  payloadName
) => {
  // validate types of params and check for falsy values
  if (!uid) return console.error({ Error: `uid is null or undefined: ${uid}` });
  if (!payloadName)
    return console.error({
      Error: `payloadName is null or undefined: ${payloadName}`,
    });
  if (!payload || Object.entries(payload).length === 0) {
    return console.error({
      Error: `payload is undefined, null, or an empty object: ${payload}`,
    });
  }
  if (!Array.isArray(collections) && !Array.isArray(docs)) {
    return console.error({
      Error1: `collections is not type array: ${collections}`,
      Error2: `docs is not type array: ${docs}`,
    });
  }

  // destructure collection and doc lists
  const [collection1, collection2] = collections;
  const [doc1] = docs;

  try {
    // read record to check if uid exists in database, otherwise create new record
    const [record, error] = await readUserRecordFromFirestore(
      uid,
      [collection1, collection2],
      [doc1]
    );
    // check for request error
    if (error) return console.error({ Error: error });

    // check if record exists before further processing
    if (
      record?.exists &&
      record.data() &&
      Array.isArray(record?.data()[payloadName])
    ) {
      // setup object to catch duplicate record data
      const duplicateRecord = {};
      // loop through all records within vendor array
      record?.data()[payloadName]?.forEach((record) => {
        // if record exist and payload id is equal to previous
        if (record.adAccountId === payload.adAccountId) {
          duplicateRecord.warnMsg =
            'The record cannot be added because a record using this ad account already exists.';
          duplicateRecord.adAcctInUse = record.adAccountId;
        }
      });
      if (Object.keys(duplicateRecord).length > 0) return duplicateRecord;
      // vendor document ref in firestore
      return await db
        .collection(collection1)
        .doc(uid)
        .collection(collection2)
        .doc(doc1)
        .update({
          [payloadName]: Firebase.firestore.FieldValue.arrayUnion(payload),
        });
    }
  } catch (error) {
    console.error('Error getting document: ', error);
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

    return 'Document written with ID: ' + uid;
  } catch (error) {
    console.error('Error adding document: ', error);
  }
};

const removeRecordFromFirestore = async (
  uid,
  collections,
  docs,
  payloadName,
  removalRecordPropertyId
) => {
  // validate types of params and check for falsy values
  if (!uid) return console.error({ Error: `uid is null or undefined: ${uid}` });
  if (!payloadName)
    return console.error({
      Error: `payloadName is null or undefined: ${payloadName}`,
    });
  if (!Array.isArray(collections) && !Array.isArray(docs)) {
    return console.error({
      Error1: `collections is not type array: ${collections}`,
      Error2: `docs is not type array: ${docs}`,
    });
  }

  // destructure collection and doc lists
  const [collection1, collection2] = collections;
  const [doc1] = docs;

  // read record to check if uid exists in database, return without doing anything
  const [record, error] = await readUserRecordFromFirestore(
    uid,
    [collection1, collection2],
    [doc1]
  );
  if (error) {
    return console.error({
      errMsg: 'Err: there was an err getting data from firestore',
      errVar: error,
    });
  }

  if (record?.exists) {
    // this check is used for users who attempt to remove record which has been manually removed by admin prior, therefore no record exists to remove
    if (!record.data() || !Array.isArray(record?.data()[payloadName])) {
      // if this error occurs, most likely caused by db getting unsynced with app
      // reload page as fail safe
      window.location.reload();
    }
    const selectedRecord = record?.data()[payloadName].filter((record) => {
      return record.businessAcctId === removalRecordPropertyId;
    });
    if (selectedRecord.length === 0) {
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
          [payloadName]: Firebase.firestore.FieldValue.arrayRemove(
            selectedRecord[0]
          ),
        });

      return { msg: 'firestore record removed', record: selectedRecord[0] };
    } catch (error) {
      console.error('Error removing record: ', error);
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
