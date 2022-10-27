import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import firestoreHandlers from '../services/firebase/data/firestore';

export const useUpdateStateWithFirestoreRecord = (collections, docs, setLoading, setError, setRecord, recordKey) => {
  const { currentUser } = useAuth();
  const { readUserRecordFromFirestore } = firestoreHandlers;

  const updateStateWithFirestoreRecord = useCallback(async () => {
    setLoading(true);
    try {
      const [record, recordError] = await readUserRecordFromFirestore(currentUser.uid, collections, docs);
      if (recordError) throw recordError;

      const { [recordKey]: recordCollection } = record?.data() || {};
      if (Array.isArray(recordCollection) && recordCollection.length > 0) {
        const recordCollectionWithIds = recordCollection.map((record, i) => ({ ...record, id: (record.id = i + 1) }));
        setRecord((prev) => [...prev, { [recordKey]: recordCollectionWithIds }]);
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
    updateStateWithFirestoreRecord().catch((err) => console.error(err));
  }, [updateStateWithFirestoreRecord]);
};
