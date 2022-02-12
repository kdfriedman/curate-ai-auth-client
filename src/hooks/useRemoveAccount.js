import { FIREBASE, FIREBASE_ERROR } from '../services/firebase/constants';
import { useAuth } from '../contexts/AuthContext';
import firestoreHandlers from '../services/firebase/data/firestore';

const findRecordForRemoval = (event, hasIntegrationRecord) => {
  // reference parent element to scrape business account id
  const facebookBusinessAccountId = event.target.closest('.dashboard__integration-vendor-card-container')?.id;

  // filter clicked element parent container, which holds business acct id with business acct being requested to be removed
  const selectedFacebookBusinessAccount = hasIntegrationRecord?.facebookBusinessAccts?.find((acct) => {
    return acct.businessAcctId === facebookBusinessAccountId;
  });
  return selectedFacebookBusinessAccount;
};

export const useRemoveAccount = () => {
  const { currentUser } = useAuth();
  const { removeRecordFromFirestore, readUserRecordFromFirestore } = firestoreHandlers;
  // remove curateai fb system user from client's business account
  const handleRemoveAccount = async (
    event,
    setLoading,
    setIntegrationRecord,
    hasIntegrationRecord,
    handleDeleteFacebookSystemUser
  ) => {
    // set loading state to active
    setLoading(true);

    // check if ui removal selection exists in the current integration records from firestore
    const selectedRecordForRemoval = findRecordForRemoval(event, hasIntegrationRecord);

    // remove system user from facebook - this will wipe out the curateAi system user from their business account
    const deletedFacebookSystemUser = await handleDeleteFacebookSystemUser(
      selectedRecordForRemoval?.businessAcctId,
      selectedRecordForRemoval?.userAccessToken
    );
    if (!deletedFacebookSystemUser) return console.error('failed to delete facebook system user onbehalf of client');

    // remove selected record from firestore db
    const [, removedRecordError] = await removeRecordFromFirestore(
      currentUser.uid,
      FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS,
      FIREBASE.FIRESTORE.FACEBOOK.DOCS,
      FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME,
      selectedRecordForRemoval?.businessAcctId
    );
    if (removedRecordError) return console.error(FIREBASE_ERROR.FIRESTORE.GENERIC.FAILED_REMOVING_DATA);

    // get current list of firestore records to re-render components since removal has occurred
    const [firestoreRecord, firestoreError] = await readUserRecordFromFirestore(
      currentUser.uid,
      FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS,
      FIREBASE.FIRESTORE.FACEBOOK.DOCS
    );

    // reset loader
    setLoading(false);

    if (firestoreError) return console.error(FIREBASE_ERROR.FIRESTORE.GENERIC.FAILED_READING_DATA);
    // if record is found, update state to render record
    if (firestoreRecord) return setIntegrationRecord({ facebookBusinessAccts: firestoreRecord });
    // if no record is found, reset dashboard
    setIntegrationRecord(null);
  };

  return { handleRemoveAccount };
};
