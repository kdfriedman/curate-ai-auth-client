import { FIREBASE } from '../services/firebase/constants';
import { useAuth } from '../contexts/AuthContext';
import { useFacebookAuth } from '../contexts/FacebookContext';
import firestoreHandlers from '../services/firebase/data/firestore';
import { useValidateFacebookAccessToken } from '../hooks/useValidateFacebookAccessToken';

const findRecordForRemoval = (event, hasIntegrationRecord) => {
  // reference parent element to scrape business account id
  const facebookBusinessAccountId = event.target.closest('.dashboard__integration-vendor-card-container')?.id;

  // filter clicked element parent container, which holds business acct id with business acct being requested to be removed
  const selectedFacebookBusinessAccount = hasIntegrationRecord?.facebookBusinessAccts?.find((acct) => {
    return acct.businessAcctId === facebookBusinessAccountId;
  });
  return selectedFacebookBusinessAccount;
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
  if (hasIntegrationRecord) {
    const lastGeneratedRecord = getLastGeneratedRecord(hasIntegrationRecord);
    console.log(lastGeneratedRecord.userAccessToken);
    const [validatedLastGenAccessToken, validatedLastGenAccessTokenError] = await handleValidateFacebookAccessToken(
      lastGeneratedRecord.userAccessToken
    );
    console.log(validatedLastGenAccessToken);
    return;
    // TODO: create conditional block which checks if DB access token is valid, then if session storage access token, then fetches new one
  }
  // get fb access token and return, otherwise refresh token by prompting user login flow
  if (facebookAuth.authResponse) {
    const [validatedAccessToken, validatedAccessTokenError] = await handleValidateFacebookAccessToken(
      facebookAuth.authResponse?.accessToken
    );
    if (validatedAccessToken) return facebookAuth.authResponse?.accessToken;
    console.error('Error validating facebook access token: ', validatedAccessTokenError);
  }
  const loginStatus = await loginToFacebook();
  return loginStatus.authResponse?.accessToken;
};

export const useRemoveAccount = () => {
  const { currentUser } = useAuth();
  const { loginToFacebook, facebookAuthChange } = useFacebookAuth();
  const { handleValidateFacebookAccessToken } = useValidateFacebookAccessToken();
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

    const facebookAccessToken = await handleGetFacebookAccessToken(
      facebookAuthChange,
      hasIntegrationRecord,
      loginToFacebook,
      handleValidateFacebookAccessToken
    );
    console.log(facebookAccessToken);
    return;

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

    if (firestoreError) {
      setLoading(false);
      return console.error(firestoreError);
    }
    // if record is found, update state to render record
    if (firestoreRecord) {
      setLoading(false);
      const { facebookBusinessAccts } = firestoreRecord?.data();
      return setIntegrationRecord({ facebookBusinessAccts });
    }
    // if no record is found, reset dashboard
    setIntegrationRecord(null);
  };

  return { handleRemoveAccount };
};
