import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import firestoreHandlers from '../services/firebase/data/firestore';

export const useReadRecordFromFirestore = () => {
  const { currentUser } = useAuth();
  const { readUserRecordFromFirestore } = firestoreHandlers;

  // read data from firebase to set integration state
  const handleReadFirestoreRecord = useCallback(
    async (collections, docs) => {
      if (
        !collections ||
        !docs ||
        !Array.isArray(collections) ||
        !Array.isArray(docs)
      ) {
        return console.error({
          errMsg:
            'useReadRecordFromFirestore has args which are not type array, undefined, or null',
          errVar: { collections, docs },
        });
      }
      const [collection1, collection2] = collections;
      const [doc1] = docs;
      try {
        // read facebook record from firestore to validate if integration exists
        const [record, error] = await readUserRecordFromFirestore(
          // user id
          currentUser.uid,
          // collections
          [collection1, collection2],
          // docs
          [doc1]
        );

        if (error) {
          return console.error({
            errMsg: 'Err: firestore returned an error instead of a value',
            errVar: error,
          });
        }

        // if record exists, update state with firestore integration record
        if (
          record &&
          record?.exists &&
          record?.data().facebookBusinessAccts.length > 0
        ) {
          const { facebookBusinessAccts } = record?.data();
          return facebookBusinessAccts;
        }
      } catch (error) {
        console.error({
          errMsg: 'Err: failed to read data from firestore',
          errVar: error,
        });
        return null;
      }
    },
    [currentUser, readUserRecordFromFirestore]
  );
  return { handleReadFirestoreRecord };
};