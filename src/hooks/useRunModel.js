import fetchData from '../services/fetch/fetch';
import { HTTP_METHODS } from '../services/fetch/constants';
import firestoreHandlers from '../services/firebase/data/firestore';
import { FIREBASE } from '../services/firebase/constants';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreStore } from '../contexts/FirestoreContext';
const { updateFirestoreRecordByKey, addRecordToFirestore, hasFirestoreRecord, readUserRecordFromFirestore } =
  firestoreHandlers;
const { POST } = HTTP_METHODS;

const writeModelState = async (currentUser, key, value, moreProps = {}) => {
  const [hasRecord] = await hasFirestoreRecord([
    FIREBASE.FIRESTORE.MODELS.COLLECTIONS[0],
    currentUser.uid,
    FIREBASE.FIRESTORE.MODELS.COLLECTIONS[1],
    FIREBASE.FIRESTORE.MODELS.DOCS[1],
  ]);
  if (hasRecord) {
    return await updateFirestoreRecordByKey(
      currentUser.uid,
      FIREBASE.FIRESTORE.MODELS.COLLECTIONS,
      FIREBASE.FIRESTORE.MODELS.DOCS[1],
      key,
      value,
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
    { ...moreProps, [key]: value }
  );
};

export const useRunModel = () => {
  const { currentUser } = useAuth();
  const { setModelState } = useFirestoreStore();

  const handleRunModel = async (payload, appCheckId) => {
    try {
      const [, modelStateErr] = await writeModelState(currentUser, FIREBASE.FIRESTORE.MODELS.IS_MODEL_LOADING, true);
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
      const [modelStateRecordSuccess] = await readUserRecordFromFirestore([
        FIREBASE.FIRESTORE.MODELS.COLLECTIONS[0],
        currentUser.uid,
        FIREBASE.FIRESTORE.MODELS.COLLECTIONS[1],
        FIREBASE.FIRESTORE.MODELS.DOCS[1],
      ]);
      if (modelStateRecordSuccess?.exists()) {
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
