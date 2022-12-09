import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import firestoreHandlers from '../services/firebase/data/firestore';

export const useUpdateStateWithFirestoreRecord = (
  collections,
  doc,
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
      const [record, recordError] = await readUserRecordFromFirestore(currentUser.uid, collections, doc);
      if (recordError) throw recordError;

      // recordKey will be false if updating single object record vs array of objects
      if (!recordKey) {
        const data = record.data() || null;
        setRecord(data);
        return setLoading(false);
      }

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
  }, [collections, currentUser.uid, readUserRecordFromFirestore, doc, recordKey, setError, setLoading, setRecord]);

  useEffect(() => {
    if (!shouldFetchRecord) return;
    updateStateWithFirestoreRecord().catch((err) => console.error(err));
  }, [updateStateWithFirestoreRecord, shouldFetchRecord]);
};
