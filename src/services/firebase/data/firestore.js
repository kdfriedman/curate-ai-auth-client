import { db } from '../firebase';

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
    return console.error({ Error: `uid is null or undefined: ${payloadName}` });
  if (!payload ?? Object.entries(payload).length === 0) {
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
    if (error ?? !record) return console.error({ Error: error });

    // TODO: loop through records and setup conditionals for duplicate writes
    record?.data()[payloadName].forEach((record) => {
      console.log(record);
    });
    // if record exist and payload id is equal to previous
    // if (record.exists && payload.adAccountId === payloadName.adAccountId) {
    //   console.warn(
    //     'The record cannot be added a because a record from the same provider, uid, or account already exists'
    //   );
    //   return 'duplicate record';
    // }

    // if (record.exists && !(payload.id === payloadName.id)) {

    // }
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
      .set({
        [payloadName]: [payload],
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
