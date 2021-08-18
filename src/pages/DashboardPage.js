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
import {
  fbProviderPopup,
  fbProviderRedirect,
} from '../services/firebase/auth/facebook';
import firestoreHandlers from '../services/firebase/data/firestore';
import { Header } from '../components/Header';
import { FaFacebook } from 'react-icons/fa';
import { useIntegrationError } from '../hooks/useIntegrationError';
import { useAddMoreFacebookBusinessAccounts } from '../hooks/useAddMoreFacebookBusinessAccounts';

export const DashboardPage = () => {
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');
  const [hasError, setError] = useState(false);
  const [hasIntegrationError, setIntegrationError] = useState(null);
  const [providerType, setProviderType] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [hasIntegrationRecord, setIntegrationRecord] = useState(null);
  const [facebookAuth, setFacebookAuth] = useState({});
  const [isIntegrationClick, setIntegrationClick] = useState(false);
  const { linkToProvider, currentUser, getRedirectResult } = useAuth();
  const { readUserRecordFromFirestore } = firestoreHandlers;
  // setup custom hook to handle integration errors
  const { handleIntegrationError } = useIntegrationError(
    setIntegrationError,
    setProviderType
  );
  // setup custom hook to handle additional accounts per integration
  const {
    handleAddMoreFacebookBusinessAccounts,
    addMoreFacebookBusinessAccountsError,
    addMoreFacebookBusinessAccountsLoading,
    addMoreFacebookBusinessAccountsAuth,
  } = useAddMoreFacebookBusinessAccounts();

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
      if (record && record?.exists && isMounted) {
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
    const linkAuthProviders = async () => {
      // set loading state
      setLoading(true);

      try {
        // link facebook provider which will promt fb dialog login module
        await linkToProvider(fbProviderRedirect);
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

    // check if integration action is fb login click
    if (isIntegrationClick && !hasError) {
      linkAuthProviders();
    }
  }, [isIntegrationClick, linkToProvider, hasError, currentUser]);

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

  // unlink auth provider when integration error occurs
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

      {(!isLoading || !addMoreFacebookBusinessAccountsLoading) && (
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
                    onClick={() => {
                      handleAddMoreFacebookBusinessAccounts(
                        'facebook.com',
                        fbProviderPopup
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
                {!hasIntegrationRecord &&
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

                {!hasIntegrationRecord &&
                  (hasError ?? addMoreFacebookBusinessAccountsError) && (
                    <>{errorMap.get(hasError)()}</>
                  )}

                {hasIntegrationRecord && (
                  <>
                    {hasIntegrationRecord.facebookBusinessAccts.map(
                      (record) => {
                        return (
                          <Box
                            key={record.id}
                            fontWeight="800"
                            fontSize="14px"
                            color="rgb(26, 32, 44)"
                            padding={
                              isEqualToOrLessThan800[0]
                                ? '.5rem 0 0 0'
                                : '.5rem 0 0 2rem'
                            }
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
                        );
                      }
                    )}
                  </>
                )}
                {/* invoke FB integration component on first integration action */}
                {!hasIntegrationRecord &&
                  Object.keys(facebookAuth).length > 0 && (
                    <FacebookAppIntegration
                      facebookAuthData={facebookAuth}
                      setIntegrationRecord={setIntegrationRecord}
                      setIntegrationError={setIntegrationError}
                      setProviderType={setProviderType}
                    />
                  )}
                {/* specific invocation of FB Integration component for add more accts action*/}
                {addMoreFacebookBusinessAccountsAuth &&
                  Object.keys(addMoreFacebookBusinessAccountsAuth).length >
                    0 && (
                    <FacebookAppIntegration
                      facebookAuthData={addMoreFacebookBusinessAccountsAuth}
                      setIntegrationRecord={setIntegrationRecord}
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
