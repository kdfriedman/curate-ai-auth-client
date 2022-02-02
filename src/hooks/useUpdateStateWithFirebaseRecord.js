import { useReadRecordFromFirestore } from './useReadRecordFromFirestore';

export const useUpdateStateWithFirestoreRecord = (
  collections,
  docs,
  setLoading,
  setError,
  setIntegrationRecord,
  setUpdateStateWithFirestoreRecord
) => {
  const { handleReadFirestoreRecord } = useReadRecordFromFirestore();
  const updateStateWithFirestoreRecord = async () => {
    try {
      const result = await handleReadFirestoreRecord(collections, docs);
      setIntegrationRecord({
        facebookBusinessAccts: result,
      });
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
