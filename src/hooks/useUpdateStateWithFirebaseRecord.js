import { useReadRecordFromFirestore } from './useReadRecordFromFirestore';

export const useUpdateStateWithFirestoreRecord = (
  collections,
  docs,
  setLoading,
  setError,
  setIntegrationRecord
) => {
  const { handleReadFirestoreRecord } = useReadRecordFromFirestore();
  const updateStateWithFirestoreRecord = async () => {
    try {
      const result = await handleReadFirestoreRecord(collections, docs);
      setIntegrationRecord({
        facebookBusinessAccts: result,
      });
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };
  return { updateStateWithFirestoreRecord };
};
