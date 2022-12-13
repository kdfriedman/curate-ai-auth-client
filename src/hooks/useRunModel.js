import fetchData from '../services/fetch/fetch';
import { HTTP_METHODS } from '../services/fetch/constants';
import firestoreHandlers from '../services/firebase/data/firestore';
import { FIREBASE } from '../services/firebase/constants';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreStore } from '../contexts/FirestoreContext';
const { incrementFirebaseRecord, addRecordToFirestore, hasFirestoreRecord, readUserRecordFromFirestore } =
  firestoreHandlers;
const { POST } = HTTP_METHODS;

const writeModelState = async (currentUser, valueToIncrement, moreProps) => {
  // update firestore with system user access token, auth uid, and email
  const [hasRecord] = await hasFirestoreRecord(
    currentUser.uid,
    FIREBASE.FIRESTORE.MODELS.COLLECTIONS,
    FIREBASE.FIRESTORE.MODELS.DOCS[1]
  );
  if (hasRecord) {
    return await incrementFirebaseRecord(
      currentUser.uid,
      FIREBASE.FIRESTORE.MODELS.COLLECTIONS,
      FIREBASE.FIRESTORE.MODELS.DOCS[1],
      FIREBASE.FIRESTORE.MODELS.CREATION_LIMIT,
      valueToIncrement,
      moreProps
    );
  }
  return await addRecordToFirestore(
    [
      FIREBASE.FIRESTORE.MODELS.COLLECTIONS[0],
      currentUser.uid,
      FIREBASE.FIRESTORE.MODELS.COLLECTIONS[1],
      FIREBASE.FIRESTORE.MODELS.DOCS[1],
    ],
    { ...moreProps, [FIREBASE.FIRESTORE.MODELS.CREATION_LIMIT]: valueToIncrement }
  );
};

export const useRunModel = () => {
  const { currentUser } = useAuth();
  const { setModelState } = useFirestoreStore();

  const handleRunModel = async (payload, appCheckId) => {
    const MODEL_STATE_VALUE_TO_INCREMENT = 1;
    const moreProps = { [FIREBASE.FIRESTORE.MODELS.IS_MODEL_LOADING]: true };
    try {
      const [, modelStateErr] = await writeModelState(currentUser, MODEL_STATE_VALUE_TO_INCREMENT, moreProps);
      if (modelStateErr) throw modelStateErr;

      const [modelSuccess, modelErr] = await fetchData({
        method: POST,
        url:
          process.env.NODE_ENV === 'development'
            ? `${process.env.REACT_APP_MODELS_CREATE_HOST_DEV}${process.env.REACT_APP_MODELS_CREATE_PATH}`
            : `${process.env.REACT_APP_MODELS_CREATE_HOST_PROD}${process.env.REACT_APP_MODELS_CREATE_PATH}`,
        data: payload,
        headers: { [process.env.REACT_APP_FIREBASE_APP_CHECK_CUSTOM_HEADER]: appCheckId },
      });
      if (modelErr) throw modelErr;

      // set modelState in context
      const [modelStateRecordSuccess] = await readUserRecordFromFirestore(
        currentUser.uid,
        FIREBASE.FIRESTORE.MODELS.COLLECTIONS,
        FIREBASE.FIRESTORE.MODELS.DOCS[1]
      );
      if (modelStateRecordSuccess.exists()) {
        // set modelStateRecord
        setModelState(modelStateRecordSuccess?.data());
      }
      return modelSuccess;
    } catch (err) {
      console.error(err);
      return null;
    }
  };
  return { handleRunModel };
};
