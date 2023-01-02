import { FIREBASE } from '../services/firebase/constants';
import { useAuth } from '../contexts/AuthContext';
import { useFacebookAuth } from '../contexts/FacebookContext';
import firestoreHandlers from '../services/firebase/data/firestore';
import { handleValidateFacebookAccessToken } from '../services/facebook/facebookSDK';

const findRecordForRemoval = (event, integrationRecord) => {
  // reference parent element to scrape business account id
  const facebookBusinessAccountId = event.target.closest('[data-vendor-card-id]')?.id;
  // filter clicked element parent container, which holds business acct id with business acct being requested to be removed
  return integrationRecord?.facebookBusinessAccts?.find((acct) => acct.businessAcctId === facebookBusinessAccountId);
};

const findAssociatedModelsForRemoval = async (integrationId, currentUserUid, removeRecordFromFirestore) => {
  // remove selected record from firestore db
  const [, removedModelError] = await removeRecordFromFirestore(
    [
      FIREBASE.FIRESTORE.MODELS.COLLECTIONS[0],
      currentUserUid,
      FIREBASE.FIRESTORE.MODELS.COLLECTIONS[1],
      FIREBASE.FIRESTORE.MODELS.DOCS[0],
    ],
    FIREBASE.FIRESTORE.MODELS.PAYLOAD_NAME,
    integrationId,
    FIREBASE.FIRESTORE.MODELS.KEY_TO_USE_FOR_REMOVAL
  );

  if (removedModelError) {
    console.error(removedModelError);
  }
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
  if (facebookAuth?.authResponse) {
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

const refreshState = (record, error, setLoading, setIntegrationRecord, setModelsStore) => {
  setLoading(false);

  // clear models context
  setModelsStore(null);

  if (error) {
    return console.error(error);
  }
  // if record is found or record has length of other records, update state
  if (record && record?.data()?.facebookBusinessAccts?.length > 0) {
    const { facebookBusinessAccts } = record?.data();
    return setIntegrationRecord({ facebookBusinessAccts });
  }
  // if no record is found, reset dashboard
  setIntegrationRecord(null);
};

export const useRemoveAccount = () => {
  const { currentUser } = useAuth();
  const { loginToFacebook, facebookAuthChange } = useFacebookAuth();
  const { removeRecordFromFirestore, readUserRecordFromFirestore, addListOfRecordsToFirestore } = firestoreHandlers;
  // remove curateai fb system user from client's business account
  const handleRemoveAccount = async (
    event,
    setLoading,
    setIntegrationRecord,
    setModelsStore,
    modelsStore,
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
    if (!deletedFacebookSystemUser) {
      console.error('failed to delete facebook system user onbehalf of client');
      return setLoading(false);
    }

    // if associated models exist, remove them from db
    if (modelsStore) {
      Promise.all(
        modelsStore[FIREBASE.FIRESTORE.MODELS.PAYLOAD_NAME].map((model) => {
          if (model.ad_account_id === selectedRecordForRemoval.adAccountId) {
            // remove all models associated with ad acct id from db
            return findAssociatedModelsForRemoval(model?.ad_account_id, currentUser.uid, removeRecordFromFirestore);
          }
          return null;
        })
      );
    }

    // remove selected record from firestore db
    const [, removedRecordError] = await removeRecordFromFirestore(
      [
        FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS[0],
        currentUser.uid,
        FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS[1],
        FIREBASE.FIRESTORE.FACEBOOK.DOCS[0],
      ],
      FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME,
      selectedRecordForRemoval?.businessAcctId,
      FIREBASE.FIRESTORE.FACEBOOK.KEY_TO_USE_FOR_REMOVAL
    );
    if (removedRecordError) {
      console.error(removedRecordError);
      return setLoading(false);
    }

    // get current list of firestore records to re-render components since removal has occurred
    const [firestoreRecord, firestoreError] = await readUserRecordFromFirestore([
      FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS[0],
      currentUser.uid,
      FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS[1],
      FIREBASE.FIRESTORE.FACEBOOK.DOCS[0],
    ]);

    // if facebook db records exist, update previous access token with refreshed token
    if (firestoreRecord?.data().facebookBusinessAccts.length > 0) {
      // update latest firestore record with refreshed access token
      const lastGeneratedFirestoreRecord = getLastGeneratedRecord(firestoreRecord?.data());
      lastGeneratedFirestoreRecord.accessToken = facebookAccessToken;

      // check if fb session token exists, and check if access token is same as saved db record
      // if different, update most recent record in db with refreshed access token
      if (
        facebookAuthChange.authResponse?.accessToken &&
        lastGeneratedFirestoreRecord.accessToken !== facebookAuthChange.authResponse?.accessToken
      ) {
        const [, addedFirebaseRecordError] = await addListOfRecordsToFirestore(
          [
            FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS[0],
            currentUser.uid,
            FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS[1],
            FIREBASE.FIRESTORE.FACEBOOK.DOCS[0],
          ],
          lastGeneratedFirestoreRecord,
          FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME
        );
        if (addedFirebaseRecordError) {
          console.error(addedFirebaseRecordError);
          return setLoading(false);
        }
      }
    }
    return refreshState(firestoreRecord, firestoreError, setLoading, setIntegrationRecord, setModelsStore);
  };

  return { handleRemoveAccount };
};
