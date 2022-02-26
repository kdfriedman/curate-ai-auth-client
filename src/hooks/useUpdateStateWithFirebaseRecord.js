import { useAuth } from '../contexts/AuthContext';
import firestoreHandlers from '../services/firebase/data/firestore';

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
    try {
      const [record, recordError] = await readUserRecordFromFirestore(currentUser.uid, collections, docs);
      if (recordError) throw recordError;

      const { facebookBusinessAccts } = record?.data();
      if (facebookBusinessAccts) {
        setIntegrationRecord({
          facebookBusinessAccts,
        });
      } else {
        setIntegrationRecord(null);
      }
      setLoading(false);
      setUpdateStateWithFirestoreRecord(false);
    } catch (error) {
      setError(error);
      setLoading(false);
      setUpdateStateWithFirestoreRecord(false);
    }
  };
  return { updateStateWithFirestoreRecord };
};
