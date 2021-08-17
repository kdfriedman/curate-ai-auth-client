import { useEffect, useState } from 'react';
import {
  Flex,
  Button,
  Box,
  Text,
  Link,
  CircularProgress,
  useMediaQuery,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import FacebookAppIntegration from '../components/FacebookIntegration';
import { provider } from '../services/firebase/auth/facebook';
import firestoreHandlers from '../services/firebase/data/firestore';
import { Header } from '../components/Header';
import { FaFacebook } from 'react-icons/fa';

export const DashboardPage = () => {
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');
  const [hasError, setError] = useState(false);
  const [hasIntegrationError, setIntegrationError] = useState(null);
  const [providerType, setProviderType] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [hasFirestoreIntegrationRecord, setFirestoreIntegrationRecord] =
    useState(null);
  const [facebookAuth, setFacebookAuth] = useState({});
  const [isFacebookIntegrationClick, setFacebookIntegrationClick] =
    useState(false);
  const [isAddMoreAcctsClick, setAddMoreAcctsClick] = useState(null);
  const [hasFacebookAddMoreAcctsInit, setFacebookAddMoreAcctsInit] =
    useState(null);
  const { linkToProvider, unlinkProvider, currentUser, getRedirectResult } =
    useAuth();
  const { readUserRecordFromFirestore } = firestoreHandlers;

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
        padding={isEqualToOrLessThan800[0] ? '1rem 0 0 0' : '1rem 2rem 0 2rem'}
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

  /************************ 1st side effect - read from database ***************************/
  // read data from firebase to set integration state
  useEffect(() => {
    let isMounted = true;
    const readFirestoreRecord = async () => {
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
      if (record && record?.exists && isMounted) {
        const { facebookBusinessAccts } = record?.data();
        // update firestore integration record state
        setFirestoreIntegrationRecord({
          facebookBusinessAccts,
        });
        // reset loading state
        setLoading(false);
      }
      // reset loading state
      setLoading(false);
    };

    // call firestore read wrapper function to initiate firestore read handler
    readFirestoreRecord();

    return () => {
      isMounted = false;
    };
  }, [currentUser, readUserRecordFromFirestore]);

  /************************ 2nd side effect - link provider with auth client  ***************************/
  // link credential with facebook authentication provider
  useEffect(() => {
    const linkAuthProviders = async () => {
      // set loading state
      setLoading(true);

      try {
        // link facebook provider which will promt fb dialog login module
        await linkToProvider(provider);
      } catch (error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // log errors
        console.error({ errorCode, errorMessage });
        // reset loading state
        setLoading(false);
        // reset facebook integration click event state
        setFacebookIntegrationClick(false);
        // set error state
        setError(errorCode);
      }
    };

    // check if integration action is fb login click
    if (
      isFacebookIntegrationClick &&
      !hasFirestoreIntegrationRecord &&
      !hasError
    ) {
      linkAuthProviders();
    }
  }, [
    isFacebookIntegrationClick,
    linkToProvider,
    hasError,
    hasFirestoreIntegrationRecord,
    currentUser,
  ]);

  /************************ 3rd side effect - get redirect results from vendor  ***************************/
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
          setFacebookIntegrationClick(false);
          // reset loading state
          setLoading(false);
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
        setFacebookIntegrationClick(false);
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

  /************************ 4th side effect - unlink auth provider  ***************************/
  // unlink auth provider when integration error occurs
  useEffect(() => {
    let isMounted = true;
    const unlinkAuthProvider = async () => {
      // if linked provider error occurs, unlink provider first before handling error further
      try {
        // filter provider object by providerType param
        const providerObj = currentUser.providerData.filter(
          (providerObj) => providerObj?.providerId === providerType
        )[0];
        // unlink provider by providerId
        await unlinkProvider(currentUser, providerObj?.providerId);
        console.log(`${providerType} unlinked`);

        if (isMounted) {
          // reset integration error
          setIntegrationError(null);
          // reset provider type
          setProviderType(null);
        }
      } catch (err) {
        if (isMounted) {
          // reset integration error
          setIntegrationError(null);
          // reset provider type
          setProviderType(null);
        }
        console.error({ errMsg: 'unlinkedProvider has err', err });
      }
    };

    if (hasIntegrationError && providerType) {
      unlinkAuthProvider();
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser, hasIntegrationError, providerType, unlinkProvider]);

  /************************ 3rd side effect - unlink provider to reset process of integration new account ***************************/
  // work around to allow users to integrate multiple provider accounts under the same user
  useEffect(() => {
    let isMounted = true;
    const unlinkAuthProvider = async (providerType) => {
      // filter provider object by providerType param
      const providerObj = currentUser.providerData.filter(
        (providerObj) => providerObj?.providerId === providerType
      )[0];
      if (providerObj) {
        // unlink provider by providerId
        await unlinkProvider(currentUser, providerObj?.providerId);
      }
      if (isMounted) {
        // start integration process over again
        setFacebookIntegrationClick(true);
        // reset facebook add more accts click state
        setAddMoreAcctsClick(false);
        // trigger add more accts action
        setFacebookAddMoreAcctsInit(true);
      }
    };
    if (isAddMoreAcctsClick && hasFirestoreIntegrationRecord) {
      unlinkAuthProvider(providerType);
    }
    return () => {
      isMounted = false;
    };
  }, [
    isAddMoreAcctsClick,
    hasFirestoreIntegrationRecord,
    currentUser,
    providerType,
    unlinkProvider,
  ]);

  return (
    <>
      <Header />
      {isLoading && (
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

      {!isLoading && (
        <Box className="dashboard__container">
          <section className="dashboard__integrations-container">
            <Box
              gridColumn={
                isEqualToOrLessThan800[0] ? '1 / span 3' : '1 / span 2'
              }
              gridRow={isEqualToOrLessThan800[0] ? 2 : ''}
              id="facebookIntegrationWidget"
              className="dashboard__integration-widget"
              display="flex"
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
                    !hasFirestoreIntegrationRecord ? '#dc3545' : '#35b653'
                  }
                />
                <Text
                  display="flex"
                  flexDir="column"
                  className="dashboard__integration-status-text"
                  color="#6c757d"
                >
                  Status:{' '}
                  {!hasFirestoreIntegrationRecord ? 'Inactive' : 'Active'}
                </Text>
              </Flex>
              {!hasFirestoreIntegrationRecord && (
                <Button
                  onClick={() => {
                    // set facebook integration click
                    setFacebookIntegrationClick(true);
                  }}
                  _hover={{
                    opacity: '.8',
                    textDecoration: 'none',
                  }}
                  color="#fff"
                  height="40px"
                  backgroundColor="#1877f2"
                  marginTop="7px"
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
              {hasFirestoreIntegrationRecord && (
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
                    onClick={() => {
                      // init side effect to add a new fb business account
                      setAddMoreAcctsClick(true);
                      // set provider type to facebook.com
                      setProviderType('facebook.com');
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
              >
                App Integrations
              </Flex>
              <Flex
                flexDirection="column"
                className="dashboard__integration-dashboard-body"
                padding={isEqualToOrLessThan800[0] ? '2rem' : ''}
              >
                <Box
                  className="dashboard__integration-dashboard-vendor"
                  padding={isEqualToOrLessThan800[0] ? '' : '2rem 0 0 2rem'}
                  fontSize="16px"
                  color="#6c757d"
                  fontWeight="800"
                >
                  Facebook
                </Box>
                {!hasFirestoreIntegrationRecord &&
                  Object.keys(facebookAuth).length === 0 && (
                    <Box
                      className="dashboard__integration-dashboard-tip"
                      fontSize="13px"
                      fontWeight="500"
                      color="rgb(26, 32, 44)"
                      padding={
                        isEqualToOrLessThan800[0] ? '' : '.5rem 0 0 2rem'
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

                {!hasFirestoreIntegrationRecord && hasError && (
                  <>{errorMap.get(hasError)()}</>
                )}

                {hasFirestoreIntegrationRecord && (
                  <>
                    {console.log(hasFirestoreIntegrationRecord)}
                    {hasFirestoreIntegrationRecord.facebookBusinessAccts.map(
                      (firestoreRecord) => {
                        return (
                          <Box
                            key={firestoreRecord.id}
                            fontWeight="800"
                            fontSize="14px"
                            color="rgb(26, 32, 44)"
                            padding={
                              isEqualToOrLessThan800[0]
                                ? '.5rem 0 0 0'
                                : '.5rem 0 0 2rem'
                            }
                          >
                            <Text key={`user-email-${firestoreRecord.id}`}>
                              Facebook User Email:{' '}
                              <span style={{ fontWeight: '500' }}>
                                {firestoreRecord.email ?? 'N/A'}
                              </span>
                            </Text>
                            <Text
                              key={`business-account-${firestoreRecord.id}`}
                            >
                              Facebook Business Account Name:{' '}
                              <span style={{ fontWeight: '500' }}>
                                {firestoreRecord.businessAcctName ?? 'N/A'}
                              </span>
                            </Text>
                            <Text key={`business-id-${firestoreRecord.id}`}>
                              Facebook Business Account Id:{' '}
                              <span style={{ fontWeight: '500' }}>
                                {firestoreRecord.businessAcctId ?? 'N/A'}
                              </span>
                            </Text>
                            <Text key={`ad-account-id-${firestoreRecord.id}`}>
                              Facebook Ad Account Id:{' '}
                              <span style={{ fontWeight: '500' }}>
                                {firestoreRecord.adAccountId ?? 'N/A'}
                              </span>
                            </Text>
                          </Box>
                        );
                      }
                    )}
                  </>
                )}
                {/* invoke FB integration component on first integration action */}
                {!hasFirestoreIntegrationRecord &&
                  Object.keys(facebookAuth).length > 0 && (
                    <FacebookAppIntegration
                      facebookAuthData={facebookAuth}
                      setFirestoreIntegrationRecord={
                        setFirestoreIntegrationRecord
                      }
                      setIntegrationError={setIntegrationError}
                      setProviderType={setProviderType}
                    />
                  )}
                {/* specific invocation of FB Integration component for add more accts action*/}
                {hasFacebookAddMoreAcctsInit &&
                  Object.keys(facebookAuth).length > 0 && (
                    <FacebookAppIntegration
                      facebookAuthData={facebookAuth}
                      setFirestoreIntegrationRecord={
                        setFirestoreIntegrationRecord
                      }
                    />
                  )}
              </Flex>
            </Box>
          </section>
        </Box>
      )}
    </>
  );
};
