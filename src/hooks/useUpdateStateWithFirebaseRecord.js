import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import firestoreHandlers from '../services/firebase/data/firestore';

export const useUpdateStateWithFirestoreRecord = (
  collections,
  docs,
  setLoading,
  setError,
  setRecord,
  recordKey,
  shouldFetchRecord = false
) => {
  const { currentUser } = useAuth();
  const { readUserRecordFromFirestore } = firestoreHandlers;

  const updateStateWithFirestoreRecord = useCallback(async () => {
    setLoading(true);
    try {
      const [record, recordError] = await readUserRecordFromFirestore(currentUser.uid, collections, docs);
      if (recordError) throw recordError;

      const { [recordKey]: recordCollection } = record?.data() || {};
      if (Array.isArray(recordCollection) && recordCollection.length > 0) {
        setRecord({ [recordKey]: recordCollection });
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  }, [collections, currentUser.uid, readUserRecordFromFirestore, docs, recordKey, setError, setLoading, setRecord]);

  useEffect(() => {
    if (!shouldFetchRecord) return;
    updateStateWithFirestoreRecord().catch((err) => console.error(err));
  }, [updateStateWithFirestoreRecord, shouldFetchRecord]);
};
