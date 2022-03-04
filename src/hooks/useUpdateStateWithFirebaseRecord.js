import { useAuth } from '../contexts/AuthContext';
import firestoreHandlers from '../services/firebase/data/firestore';

const resetState = (setLoading, setUpdateStateWithFirestoreRecord) => {
  setLoading(false);
  setUpdateStateWithFirestoreRecord(false);
};

export const useUpdateStateWithFirestoreRecord = (
  collections,
  docs,
  setLoading,
  setError,
  setIntegrationRecord,
  setUpdateStateWithFirestoreRecord
) => {
  const { currentUser } = useAuth();
  const { readUserRecordFromFirestore } = firestoreHandlers;
  const updateStateWithFirestoreRecord = async () => {
    setLoading(true);
    try {
      const [record, recordError] = await readUserRecordFromFirestore(currentUser.uid, collections, docs);
      if (recordError) throw recordError;

      const { facebookBusinessAccts } = record?.data();
      if (facebookBusinessAccts) {
        setIntegrationRecord({
          facebookBusinessAccts,
        });
        resetState(setLoading, setUpdateStateWithFirestoreRecord);
      } else {
        setIntegrationRecord(null);
        resetState(setLoading, setUpdateStateWithFirestoreRecord);
      }
    } catch (error) {
      setError(error);
      resetState(setLoading, setUpdateStateWithFirestoreRecord);
    }
  };
  return { updateStateWithFirestoreRecord };
};
