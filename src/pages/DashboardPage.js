import { useEffect, useState } from 'react';
import {
  Flex,
  Button,
  Box,
  Text,
  Link,
  CircularProgress,
  useMediaQuery,
  useDisclosure,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import FacebookAppIntegration from '../components/FacebookIntegration';
import {
  fbProviderPopup,
  fbProviderRedirect,
} from '../services/firebase/auth/facebook';
import firestoreHandlers from '../services/firebase/data/firestore';
import { Header } from '../components/Header';
import { SettingsModal } from '../components/SettingsModal';
import { FaFacebook } from 'react-icons/fa';
import { useIntegrationError } from '../hooks/useIntegrationError';
import { useAddMoreFacebookBusinessAccounts } from '../hooks/useAddMoreFacebookBusinessAccounts';
import { useUnlinkProvider } from '../hooks/useUnlinkProvider';
import { useDeleteFacebookSystemUser } from '../hooks/useDeleteFacebookSystemUser';
import { useRefreshFacebookAccessToken } from '../hooks/useRefreshFacebookAccessToken';
import { useReadRecordFromFirestore } from '../hooks/useReadRecordFromFirestore';

export const DashboardPage = () => {
  const isEqualToOrLessThan450 = useMediaQuery('(max-width: 450px)');
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');
  const isEqualToOrLessThan950 = useMediaQuery('(max-width: 950px)');

  const [hasError, setError] = useState(false);
  const [hasIntegrationError, setIntegrationError] = useState(null);
  const [providerType, setProviderType] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [hasIntegrationRecord, setIntegrationRecord] = useState(null);
  const [facebookAuth, setFacebookAuth] = useState({});
  const [isIntegrationClick, setIntegrationClick] = useState(false);
  const [hasActiveIntegration, setActiveIntegration] = useState(false);
  const [settingsModalId, updateSettingsModalId] = useState(null);
  const [
    isRenderFacebookIntegrationComponent,
    setRenderFacebookIntegrationComponent,
  ] = useState(false);
  const { linkToProvider, currentUser, getRedirectResult } = useAuth();
  const {
    readUserRecordFromFirestore,
    removeRecordFromFirestore,
    addRecordToFirestore,
  } = firestoreHandlers;
  //unlink auth provider handler
  const { handleUnlinkProvider } = useUnlinkProvider(setProviderType);
  // setup custom hook to handle integration errors
  const { handleIntegrationError } = useIntegrationError(
    setIntegrationError,
    setProviderType
  );
  // setup custom hook to handle removing system user from facebook and clearing record
  const { handleDeleteFacebookSystemUser } = useDeleteFacebookSystemUser();
  // setup custom hook to refresh facebook access token
  const { handleRefreshFacebookAccessToken } = useRefreshFacebookAccessToken();
  // setup custom hook to handle additional accounts per integration
  const {
    handleAddMoreFacebookBusinessAccounts,
    addMoreFacebookBusinessAccountsError,
    addMoreFacebookBusinessAccountsLoading,
    addMoreFacebookBusinessAccountsAuth,
  } = useAddMoreFacebookBusinessAccounts();
  const { handleReadFirestoreRecord } = useReadRecordFromFirestore();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // remove curateai fb system user from client's business account
  const handleRemoveAccount = async (e) => {
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
    // unlink provider to to allow user to prevent firebase duplicate provider error
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
      // check if record exists which was clicked on to be removed
      const hasMatchingRecord = firestoreRecords.filter((record) => {
        return record.businessAcctId === hasMatchingContainerElement.id;
      });
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

  // setup error map object to handle specific errors
  // return function when errorMap object matches query via .get() method
  const errorMap = new Map();
  const errorHandler = () => {
    return (
      <Text
        fontSize="13px"
        color="#c5221f"
        fontWeight="500"
        className="error__provider-already-linked"
        padding={
          isEqualToOrLessThan450
            ? '1rem 1rem 0rem 1rem'
            : isEqualToOrLessThan800[0]
            ? '1rem 0 0 0'
            : '1rem 2rem 0 2rem'
        }
      >
        Error: Oops there's been an error. Please reach out to{' '}
        <Link
          textDecoration="underline"
          href="mailto:ryanwelling@gmail.com?cc=kev.d.friedman@gmail.com&amp;subject=CurateAI%20Technical%20Support"
        >
          our tech team
        </Link>{' '}
        for assistance.
      </Text>
    );
  };
  errorMap.set('auth/popup-closed-by-user', errorHandler);
  errorMap.set('auth/provider-already-linked', errorHandler);
  errorMap.set('failed to read record from firestore', errorHandler);

  // read data from firebase to set integration state
  useEffect(() => {
    let isMounted = true;
    const readrecord = async () => {
      // set loading state
      setLoading(true);

      // ****** FACEBOOK record ******
      // read facebook record from firestore to validate if integration exists
      const [record, error] = await readUserRecordFromFirestore(
        // user id
        currentUser.uid,
        // collections
        ['clients', 'integrations'],
        // docs
        ['facebook']
      );

      // log out any errors from firestore fetch
      if (error && isMounted) {
        // reset loading state
        setLoading(false);
        // set error state
        setError('failed to read record from firestore');
        return console.error('Error: failed to read record from firestore');
      }

      // if record exists, update state with firestore integration record
      if (
        record &&
        record?.exists &&
        record?.data()?.facebookBusinessAccts?.length > 0 &&
        isMounted
      ) {
        const { facebookBusinessAccts } = record?.data();
        // update firestore integration record state
        setIntegrationRecord({
          facebookBusinessAccts,
        });
        // reset loading state
        setLoading(false);
      }
      // reset loading state
      setLoading(false);
    };

    // call firestore read wrapper function to initiate firestore read handler
    readrecord();

    return () => {
      isMounted = false;
    };
  }, [currentUser, readUserRecordFromFirestore]);

  // link credential with facebook authentication provider
  useEffect(() => {
    let isMounted = true;
    const linkAuthProviders = async () => {
      // set loading state
      setLoading(true);

      // filter current user provider object by facebook
      const hasFacebookProvider = currentUser.providerData.filter(
        (providerObj) => providerObj?.providerId === 'facebook.com'
      );
      // if facebook has been linked previously but no integration record exists,
      // unlink facebook. Otherwise Firebase will throw error (already linked provider)!
      if (hasFacebookProvider.length > 0 && !hasIntegrationRecord) {
        if (isMounted) await handleUnlinkProvider('facebook.com', true);
      }

      try {
        // link facebook provider which will promt fb dialog login module
        await linkToProvider(fbProviderRedirect);
      } catch (error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // log errors
        console.error({ errorCode, errorMessage });

        if (isMounted) {
          // reset loading state
          setLoading(false);
          // reset facebook integration click event state
          setIntegrationClick(false);
          // set error state
          setError(errorCode);
        }
      }
    };

    // check if integration action is fb login click
    if (isIntegrationClick && !hasError) {
      linkAuthProviders();
    }
    return () => {
      isMounted = false;
    };
  }, [
    isIntegrationClick,
    linkToProvider,
    hasError,
    currentUser,
    hasIntegrationRecord,
    handleUnlinkProvider,
  ]);

  // receive results from redirected auth login
  useEffect(() => {
    let isMounted = true;
    const getRedirectResultsFromProvider = async () => {
      // set loading state
      setLoading(true);
      try {
        const result = await getRedirectResult();
        // check that result exists
        if (!result?.credential) return;

        // facebook credential
        const credential = result.credential;
        // The signed-in user info.
        const user = result.user;
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        const accessToken = credential.accessToken;

        if (isMounted) {
          setFacebookAuth({ credential, user, accessToken });
          // reset facebook integration click event state
          setIntegrationClick(false);
          // reset loading state
          setLoading(false);
          // trigger the rendering of facebook integration component
          // used to prevent facebook integration component from rendering on removal of business accounts
          setRenderFacebookIntegrationComponent(true);
        }
      } catch (error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // log errors
        console.error({ errorCode, errorMessage });
        // reset loading state
        setLoading(false);
        // reset facebook integration click event state
        setIntegrationClick(false);
        // set error state
        setError(errorCode);
      }
    };

    // load redirect data from provider's auth
    getRedirectResultsFromProvider();

    return () => {
      isMounted = false;
    };
  }, [getRedirectResult]);

  // handle any integration errors if they occur
  useEffect(() => {
    let isMounted = true;
    if (isMounted && hasIntegrationError && providerType) {
      handleIntegrationError(isMounted, providerType);
    }
    return () => {
      isMounted = false;
    };
  });

  return (
    <>
      <Header />
      {(isLoading || addMoreFacebookBusinessAccountsLoading) && (
        <CircularProgress
          className="loading__spinner"
          minHeight="100vh"
          display="flex"
          justifyContent="center"
          alignItems="center"
          isIndeterminate
          color="#635bff"
        />
      )}

      {!isLoading && !addMoreFacebookBusinessAccountsLoading && (
        <Box maxHeight="100vh" className="dashboard__container">
          <section className="dashboard__integration-container">
            <Box
              gridColumn={
                isEqualToOrLessThan800[0] ? '1 / span 3' : '1 / span 2'
              }
              gridRow={isEqualToOrLessThan800[0] ? 2 : ''}
              id="facebookIntegrationWidget"
              className="dashboard__integration-widget"
              display="flex"
              maxHeight={!hasIntegrationRecord ? '12rem' : '14rem'}
              minHeight={!hasIntegrationRecord ? 0 : '14rem'}
            >
              <Text className="dashboard__integration-info">
                Integrate CurateAI with Facebook
              </Text>
              <Flex className="dashboard__integration-status-container">
                <Box
                  className="dashboard__integration-status-indicator"
                  h="10px"
                  w="10px"
                  borderRadius="50%"
                  backgroundColor={
                    !hasIntegrationRecord ? '#dc3545' : '#35b653'
                  }
                />
                <Text
                  display="flex"
                  flexDir="column"
                  className="dashboard__integration-status-text"
                  color="#6c757d"
                >
                  Status: {!hasIntegrationRecord ? 'Inactive' : 'Active'}
                </Text>
              </Flex>
              {!hasIntegrationRecord && (
                <Button
                  disabled={isLoading || hasActiveIntegration ? true : false}
                  onClick={() => {
                    // set facebook integration click
                    setIntegrationClick(true);
                  }}
                  _hover={{
                    opacity: '.8',
                    textDecoration: 'none',
                  }}
                  color="#fff"
                  height="40px"
                  backgroundColor="#1877f2"
                  marginTop="7px"
                  marginBottom="1rem"
                  width="14rem"
                  alignSelf="center"
                >
                  <FaFacebook className="dashboard__fb-login-btn-icon" />{' '}
                  <span
                    style={{ margin: '0 0 0 10px', fontWeight: '800' }}
                    className="dashboard__fb-login-btn-text"
                  >
                    Log In With Facebook
                  </span>
                </Button>
              )}
              {hasIntegrationRecord && (
                <>
                  <Text
                    fontWeight="500"
                    fontSize="13px"
                    color="rgb(26, 32, 44)"
                    textAlign="center"
                    marginTop="1rem"
                  >
                    Add a new business account
                  </Text>
                  <Button
                    disabled={isLoading || hasActiveIntegration ? true : false}
                    onClick={async () => {
                      await handleAddMoreFacebookBusinessAccounts(
                        'facebook.com',
                        fbProviderPopup,
                        setRenderFacebookIntegrationComponent
                      );
                    }}
                    _hover={{
                      opacity: '.8',
                      textDecoration: 'none',
                    }}
                    color="#fff"
                    height="40px"
                    backgroundColor="#635bff"
                    marginTop="7px"
                    width="10rem"
                    alignSelf="center"
                  >
                    Add Account
                  </Button>
                </>
              )}
            </Box>

            <Box
              gridColumn={isEqualToOrLessThan800[0] ? '1 / span 3' : '3'}
              gridRow={isEqualToOrLessThan800[0] ? '1' : '1 / span 3'}
              className="dashboard__integration-dashboard"
              minHeight="20rem"
              paddingBottom="2rem"
            >
              <Flex
                boxShadow="0 0.125rem 0.25rem rgb(0 0 0 / 8%)"
                padding="2rem"
                fontSize="18px"
                color="rgb(26, 32, 44)"
                fontWeight="800"
                textTransform="uppercase"
                letterSpacing=".2em"
                className="dashboard__integration-dashboard-header"
                justifyContent={isEqualToOrLessThan800[0] ? 'center' : ''}
              >
                App Integrations
              </Flex>
              <Flex
                flexDirection="column"
                className="dashboard__integration-dashboard-body"
              >
                <Box
                  className="dashboard__integration-dashboard-vendor"
                  padding={
                    isEqualToOrLessThan800[0]
                      ? '1rem 1rem 0 1rem'
                      : '2rem 0 0 2rem'
                  }
                  fontSize="16px"
                  color="#6c757d"
                  fontWeight="800"
                  textAlign={isEqualToOrLessThan800[0] ? 'center' : 'left'}
                >
                  Facebook
                </Box>
                {!hasIntegrationRecord &&
                  (hasError ?? addMoreFacebookBusinessAccountsError) && (
                    <>
                      {errorMap.get(hasError)
                        ? errorMap.get(hasError)()
                        : "Oops, there's been en error, please reach out to the CurateAI team for assistance."}
                    </>
                  )}
                {/* invoke FB integration component on first integration action */}
                {!hasIntegrationRecord &&
                  isRenderFacebookIntegrationComponent &&
                  Object.keys(facebookAuth).length > 0 && (
                    <FacebookAppIntegration
                      facebookAuthData={facebookAuth}
                      setIntegrationRecord={setIntegrationRecord}
                      setIntegrationError={setIntegrationError}
                      setProviderType={setProviderType}
                      setActiveIntegration={setActiveIntegration}
                      setRenderFacebookIntegrationComponent={
                        setRenderFacebookIntegrationComponent
                      }
                    />
                  )}
                {/* specific invocation of FB Integration component for add more accts action*/}
                {addMoreFacebookBusinessAccountsAuth &&
                  isRenderFacebookIntegrationComponent &&
                  Object.keys(addMoreFacebookBusinessAccountsAuth).length >
                    0 && (
                    <FacebookAppIntegration
                      facebookAuthData={addMoreFacebookBusinessAccountsAuth}
                      setIntegrationRecord={setIntegrationRecord}
                      setIntegrationError={setIntegrationError}
                      setProviderType={setProviderType}
                      setActiveIntegration={setActiveIntegration}
                      setRenderFacebookIntegrationComponent={
                        setRenderFacebookIntegrationComponent
                      }
                    />
                  )}
                {!hasIntegrationRecord && !hasActiveIntegration && (
                  <Box
                    className="dashboard__integration-dashboard-tip"
                    fontSize="13px"
                    fontWeight="500"
                    color="rgb(26, 32, 44)"
                    padding={
                      isEqualToOrLessThan800[0]
                        ? '1rem 1rem 0 1rem'
                        : '.5rem 0 0 2rem'
                    }
                  >
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: '800',
                        color: 'rgb(26, 32, 44)',
                      }}
                    >
                      Tip:{' '}
                    </span>
                    Get started now by integrating your Facebook account.
                  </Box>
                )}

                {hasIntegrationRecord && (
                  <>
                    {hasIntegrationRecord.facebookBusinessAccts.map(
                      (record) => {
                        return (
                          <Flex
                            key={record.id}
                            id={record.businessAcctId}
                            flexDir={
                              isEqualToOrLessThan950[0] ? 'column' : 'row'
                            }
                            maxWidth={
                              isEqualToOrLessThan450[0] ? '20rem' : '750px'
                            }
                            className="dashboard__integration-vendor-card-container"
                            boxShadow="0 0.5rem 1rem rgb(0 0 0 / 15%)"
                            margin="1rem 2rem"
                            borderRadius="10px"
                            border="1px solid #f0f0f0"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Box
                              className="dashboard__integration-vendor-card"
                              key={`vendor-card-${record.id}`}
                              fontWeight="800"
                              fontSize="14px"
                              color="rgb(26, 32, 44)"
                              minWidth={isEqualToOrLessThan450[0] ? 0 : '25rem'}
                              padding="1rem 2rem"
                            >
                              <Text key={`user-email-${record.id}`}>
                                User Email:{' '}
                                <span style={{ fontWeight: '500' }}>
                                  {record.email ?? 'N/A'}
                                </span>
                              </Text>
                              <Text key={`business-account-${record.id}`}>
                                Business Account Name:{' '}
                                <span style={{ fontWeight: '500' }}>
                                  {record.businessAcctName ?? 'N/A'}
                                </span>
                              </Text>
                              <Text key={`business-id-${record.id}`}>
                                Business Account Id:{' '}
                                <span style={{ fontWeight: '500' }}>
                                  {record.businessAcctId ?? 'N/A'}
                                </span>
                              </Text>
                              <Text key={`ad-account-id-${record.id}`}>
                                Ad Account Id:{' '}
                                <span style={{ fontWeight: '500' }}>
                                  {record.adAccountId ?? 'N/A'}
                                </span>
                              </Text>
                            </Box>
                            <Flex
                              flexDir="column"
                              className="dashboard__integration-vendor-card-btn-container"
                            >
                              <Button
                                onClick={(e) => {
                                  // get ref to parent container with business acct id as dom id
                                  const vendorCardParentElement =
                                    e.target.closest(
                                      '.dashboard__integration-vendor-card-container'
                                    );
                                  // check if parent element exists, then open modal
                                  if (vendorCardParentElement) {
                                    updateSettingsModalId(
                                      vendorCardParentElement.id
                                    );
                                    onOpen();
                                  }
                                }}
                                _hover={{
                                  opacity: '.8',
                                }}
                                className="dashboard__integration-vendor-card-btn"
                                margin={
                                  isEqualToOrLessThan950[0]
                                    ? '0 1rem 1rem'
                                    : '1rem'
                                }
                                minWidth="11rem"
                                border="1px solid #ece9e9"
                                backgroundColor="#dadada"
                              >
                                Select Campaigns
                              </Button>
                              <Button
                                _hover={{
                                  opacity: '.8',
                                }}
                                onClick={handleRemoveAccount}
                                disabled={isLoading ? true : false}
                                alignSelf="center"
                                backgroundColor="#E53E3E"
                                color="#fff"
                                className="dashboard__integration-vendor-card-btn"
                                margin={
                                  isEqualToOrLessThan950[0]
                                    ? '0 1rem 1rem'
                                    : '0 0 1rem'
                                }
                                minWidth="11rem"
                              >
                                Remove Account
                              </Button>
                              {settingsModalId && (
                                <SettingsModal
                                  isOpen={isOpen}
                                  onClose={onClose}
                                  dbRecord={record}
                                  id={settingsModalId}
                                  updateSettingsModalId={updateSettingsModalId}
                                />
                              )}
                            </Flex>
                          </Flex>
                        );
                      }
                    )}
                  </>
                )}
              </Flex>
            </Box>
          </section>
        </Box>
      )}
    </>
  );
};
