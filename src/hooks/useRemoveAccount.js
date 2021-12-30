export const useRemoveAccount = () => {
  // remove curateai fb system user from client's business account
  const handleRemoveAccount = async (
    e,
    setLoading,
    setIntegrationRecord,
    hasIntegrationRecord,
    handleUnlinkProvider,
    handleReadFirestoreRecord,
    handleDeleteFacebookSystemUser,
    handleRefreshFacebookAccessToken,
    removeRecordFromFirestore,
    addRecordToFirestore,
    fbProviderPopup,
    currentUser
  ) => {
    // set refreshAccessToken state if saved access token is expired
    let refreshedAccessToken = null;
    // set loading state to active
    setLoading(true);
    // get ref to parent container with business acct id as dom id
    const hasMatchingContainerElement = e.target.closest(
      '.dashboard__integration-vendor-card-container'
    );
    if (!hasMatchingContainerElement) {
      // reset loader
      setLoading(false);
      return console.error({
        hasMatchingContainerElement,
      });
    }
    // unlink provider to allow user to prevent firebase duplicate provider error
    const providerUnlinked = await handleUnlinkProvider('facebook.com', true);
    // check if provider was successfully unlinked
    if (providerUnlinked !== 'provider unlinked') {
      console.error({
        errMsg: providerUnlinked,
      });
      // get current list of firestore records
      const firestoreRecords = await handleReadFirestoreRecord(
        ['clients', 'integrations'],
        ['facebook']
      );
      // set hasMatching record var to set with filtered record if firestoreRecords is truthy
      let hasMatchingRecord;
      if (firestoreRecords) {
        // check if record exists which was clicked on to be removed
        hasMatchingRecord = firestoreRecords.filter((record) => {
          return record.businessAcctId === hasMatchingContainerElement.id;
        });
      }
      // if this error occurs, it most likely means that the Db is out of sync with react state
      // flush the state to re-read the db for updated state via refresh
      if (!hasMatchingRecord) window.location.reload();
    }

    // filter clicked element parent container,
    // which holds business acct id with business acct being requested to be removed
    const selectedFacebookBusinessAccount =
      hasIntegrationRecord.facebookBusinessAccts.filter((acct) => {
        return acct.businessAcctId === hasMatchingContainerElement.id;
      });
    if (selectedFacebookBusinessAccount.length === 0) {
      // reset loader
      setLoading(false);
      return console.error({
        errMsg:
          'Err: filtering for matching business acct ids from remove acct click',
        errVar: selectedFacebookBusinessAccount,
      });
    }
    // remove system user from facebook - this will wipe out the curateAi
    // system user from their business account
    const deletedFacebookSystemUser = await handleDeleteFacebookSystemUser(
      selectedFacebookBusinessAccount[0].businessAcctId,
      // pass access token from db if still valid, otherwise handle refresh token and replace in db
      selectedFacebookBusinessAccount[0].userAccessToken
    );
    if (!deletedFacebookSystemUser) {
      // reset loader
      console.error({
        errMsg: 'Err: deleting facebook system user failed',
        errVar: deletedFacebookSystemUser,
      });
      // if token is expired or invalid, refresh token
      refreshedAccessToken = await handleRefreshFacebookAccessToken(
        fbProviderPopup
      );
      //check that provider was linked properly
      if (!refreshedAccessToken) {
        // reset loader
        setLoading(false);
        return console.error({
          errMsg: 'linking provider error',
          refreshedAccessToken: refreshedAccessToken,
        });
      }
      // attempt to delete fb system user using refresh token because
      // first attemp failed due to expired token or other error
      const deletedUserUsingRefreshToken = await handleDeleteFacebookSystemUser(
        selectedFacebookBusinessAccount[0].businessAcctId,
        // pass access token from db if still valid, otherwise handle refresh token and replace in db
        refreshedAccessToken
      );
      // check if system user was properly deleted from client's fb business account
      if (!deletedUserUsingRefreshToken) {
        // reset loader
        setLoading(false);
        return console.error({
          errMsg: 'deleted fb system user using refresh token failed',
          errVar: deletedUserUsingRefreshToken,
        });
      }
    }
    // remove associated record data from firestore db
    const removedRecord = await removeRecordFromFirestore(
      currentUser.uid,
      ['clients', 'integrations'],
      ['facebook'],
      'facebookBusinessAccts',
      selectedFacebookBusinessAccount[0].businessAcctId
    );
    if (!removedRecord) {
      // reset loader
      setLoading(false);
      return console.error({
        errMsg: 'deleting record from firestore failed',
        errVar: removedRecord,
      });
    }
    // get current list of firestore records
    const firestoreRecord = await handleReadFirestoreRecord(
      ['clients', 'integrations'],
      ['facebook']
    );
    // if record is found, update state to render record
    if (firestoreRecord) {
      // reset integration record
      setIntegrationRecord({
        facebookBusinessAccts: firestoreRecord,
      });
      // if refreshAccessToken exists, remove all records for further processing
      if (refreshedAccessToken) {
        const deletedFBAcctPromiseList = firestoreRecord.map(async (acct) => {
          acct.userAccessToken = refreshedAccessToken;
          // remove associated record data from firestore db
          return await removeRecordFromFirestore(
            currentUser.uid,
            ['clients', 'integrations'],
            ['facebook'],
            'facebookBusinessAccts',
            acct.businessAcctId
          );
        });
        const deletedFBAcctPromiseResponses = await Promise.allSettled(
          deletedFBAcctPromiseList
        );
        const hasDeleteRecordPromiseErrors =
          deletedFBAcctPromiseResponses.filter((response) => {
            return /[4][0][0-4]/g.test(response.status);
          });
        if (
          !deletedFBAcctPromiseResponses ||
          hasDeleteRecordPromiseErrors.length > 0
        ) {
          // reset loader
          setLoading(false);
          return console.error({
            errMsg: 'failed to delete fb account list after refresh token',
            errVar: deletedFBAcctPromiseResponses,
          });
        }
        // add back the records that were currently still in firestore with new refreshed access token
        const addedFBAcctPromiseList = firestoreRecord.map(async (acct) => {
          acct.userAccessToken = refreshedAccessToken;
          // update firestore with system user access token, auth uid, and email
          return await addRecordToFirestore(
            currentUser.uid,
            ['clients', 'integrations'],
            ['facebook'],
            acct,
            'facebookBusinessAccts'
          );
        });
        const addedFBAcctPromiseResponses = await Promise.allSettled(
          addedFBAcctPromiseList
        );
        const hasAddRecordPromiseErrors = addedFBAcctPromiseResponses.filter(
          (response) => {
            return /[4][0][0-4]/g.test(response.status);
          }
        );
        if (
          !addedFBAcctPromiseResponses ||
          hasAddRecordPromiseErrors.length > 0
        ) {
          // reset loader
          setLoading(false);
          return console.error({
            errMsg: 'failed to add fb account list after refresh token',
            errVar: addedFBAcctPromiseResponses,
          });
        }
      }
    } else {
      // if no record is found, reset dashboard
      setIntegrationRecord(null);
    }
    // reset loader
    setLoading(false);
  };

  return { handleRemoveAccount };
};
