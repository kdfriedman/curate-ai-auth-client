import { FIREBASE } from '../services/firebase/constants';
import { useAuth } from '../contexts/AuthContext';
import { useFacebookAuth } from '../contexts/FacebookContext';
import firestoreHandlers from '../services/firebase/data/firestore';
import { handleValidateFacebookAccessToken } from '../services/facebook/facebookSDK';

const findRecordForRemoval = (event, integrationRecord) => {
  // reference parent element to scrape business account id
  const facebookBusinessAccountId = event.target.closest('.dashboard__integration-vendor-card-container')?.id;
  // filter clicked element parent container, which holds business acct id with business acct being requested to be removed
  return integrationRecord?.facebookBusinessAccts?.find((acct) => acct.businessAcctId === facebookBusinessAccountId);
};

const getLastGeneratedRecord = (integrationRecord) => {
  // convert isostring date into milliseconds since epoch
  const createdDateInMS = integrationRecord.facebookBusinessAccts?.map((record) => {
    const createdAtEpochMS = Math.floor(Date.parse(record.createdAt) / 1000);
    return { id: record.id, createdAtEpochMS };
  });
  // sort by ascending order and pop the most recent record from the list
  const lastGeneratedEpochWithId = [...createdDateInMS].sort((a, b) => a.createdAtEpochMS - b.createdAtEpochMS).pop();
  return integrationRecord.facebookBusinessAccts?.find((record) => record.id === lastGeneratedEpochWithId.id);
};

const handleGetFacebookAccessToken = async (
  facebookAuth,
  hasIntegrationRecord,
  loginToFacebook,
  handleValidateFacebookAccessToken
) => {
  // check session storage for valid access token
  if (facebookAuth.authResponse) {
    const [validatedAccessToken, validatedAccessTokenError] = await handleValidateFacebookAccessToken(
      facebookAuth.authResponse?.accessToken
    );
    if (validatedAccessTokenError) return console.error(validatedAccessTokenError);
    if (validatedAccessToken.data?.data?.is_valid) return facebookAuth.authResponse?.accessToken;
  }
  // check db record for valid access token
  if (hasIntegrationRecord) {
    const lastGeneratedRecord = getLastGeneratedRecord(hasIntegrationRecord);
    const [validatedLastGenAccessToken, validatedLastGenAccessTokenError] = await handleValidateFacebookAccessToken(
      lastGeneratedRecord.userAccessToken
    );
    if (validatedLastGenAccessTokenError) return console.error(validatedLastGenAccessTokenError);
    if (validatedLastGenAccessToken.data?.data?.is_valid) return lastGeneratedRecord.userAccessToken;
  }
  const loginStatus = await loginToFacebook();
  return loginStatus.authResponse?.accessToken;
};

const refreshState = (record, error, setLoading, setIntegrationRecord) => {
  if (error) {
    setLoading(false);
    return console.error(error);
  }
  // if record is found or record has length of other records, update state
  if (record && record?.data()?.facebookBusinessAccts?.length > 0) {
    setLoading(false);
    const { facebookBusinessAccts } = record?.data();
    return setIntegrationRecord({ facebookBusinessAccts });
  }
  // if no record is found, reset dashboard
  setLoading(false);
  setIntegrationRecord(null);
};

export const useRemoveAccount = () => {
  const { currentUser } = useAuth();
  const { loginToFacebook, facebookAuthChange } = useFacebookAuth();
  const { removeRecordFromFirestore, readUserRecordFromFirestore, addRecordToFirestore } = firestoreHandlers;
  // remove curateai fb system user from client's business account
  const handleRemoveAccount = async (
    event,
    setLoading,
    setIntegrationRecord,
    hasIntegrationRecord,
    handleDeleteFacebookSystemUser
  ) => {
    setLoading(true);
    // check if ui removal selection exists in the current integration records from firestore
    const selectedRecordForRemoval = findRecordForRemoval(event, hasIntegrationRecord);
    // if record selcted does not exist in current db, state is out of sync wit db and must refresh to reset state
    if (!selectedRecordForRemoval) return window.location.reload();

    const facebookAccessToken = await handleGetFacebookAccessToken(
      facebookAuthChange,
      hasIntegrationRecord,
      loginToFacebook,
      handleValidateFacebookAccessToken
    );

    // remove system user from facebook - this will wipe out the curateAi system user from their business account
    const deletedFacebookSystemUser = await handleDeleteFacebookSystemUser(
      selectedRecordForRemoval?.businessAcctId,
      facebookAccessToken
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
    if (removedRecordError) return console.error(removedRecordError);

    // get current list of firestore records to re-render components since removal has occurred
    const [firestoreRecord, firestoreError] = await readUserRecordFromFirestore(
      currentUser.uid,
      FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS,
      FIREBASE.FIRESTORE.FACEBOOK.DOCS
    );

    // if facebook db records exist, update previous access token with refreshed token
    if (firestoreRecord?.data().facebookBusinessAccts.length > 0) {
      // update latest firestore record with refreshed access token
      const lastGeneratedFirestoreRecord = getLastGeneratedRecord(firestoreRecord?.data());
      lastGeneratedFirestoreRecord.accessToken = facebookAccessToken;

      const [, addedFirebaseRecordError] = await addRecordToFirestore(
        currentUser.uid,
        FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS,
        FIREBASE.FIRESTORE.FACEBOOK.DOCS,
        lastGeneratedFirestoreRecord,
        FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME
      );
      if (addedFirebaseRecordError) return console.error(addedFirebaseRecordError);
    }
    return refreshState(firestoreRecord, firestoreError, setLoading, setIntegrationRecord);
  };

  return { handleRemoveAccount };
};
