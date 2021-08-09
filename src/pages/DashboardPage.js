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
  const [hasError, setError] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [hasFirestoreIntegrationRecord, setFirestoreIntegrationRecord] =
    useState(null);
  const [facebookAuth, setFacebookAuth] = useState({});
  const [isFacebookIntegrationClick, setFacebookIntegrationClick] =
    useState(false);
  const { linkToProvider, currentUser } = useAuth();
  const { readUserRecordFromFirestore } = firestoreHandlers;

  const errorMap = new Map();
  errorMap.set('auth/provider-already-linked', () => {
    return (
      <Text
        fontSize="13px"
        color="#c5221f"
        fontWeight="500"
        className="error__provider-already-linked"
        padding={isEqualToOrLessThan800[0] ? '1rem 0 0 0' : '1rem 2rem 0 2rem'}
      >
        Error: Users can only integrate with one Facebook business account.{' '}
        <br />
        <br /> If you need to integrate with a separate account or have any
        other questions, please reach out to{' '}
        <Link
          textDecoration="underline"
          href="mailto:ryanwelling@gmail.com?cc=kev.d.friedman@gmail.com&amp;subject=CurateAI%20Technical%20Support"
        >
          our tech team.
        </Link>
      </Text>
    );
  });
  errorMap.set('failed to read record from firestore', () => {
    return (
      <Text
        fontSize="13px"
        color="#c5221f"
        fontWeight="500"
        className="error__provider-already-linked"
        padding={isEqualToOrLessThan800[0] ? '1rem 0 0 0' : '1rem 2rem 0 2rem'}
      >
        Error: Failed to read record from database. <br />
        <br /> Please reach out to{' '}
        <Link
          textDecoration="underline"
          href="mailto:ryanwelling@gmail.com?cc=kev.d.friedman@gmail.com&amp;subject=CurateAI%20Technical%20Support"
        >
          our tech team.
        </Link>
        for further assistance.
      </Text>
    );
  });

  // read data from firebase to set integration state
  useEffect(() => {
    let isMounted = true;
    const readFirestoreRecord = async () => {
      // set loading state
      setLoading(true);

      // ****** FACEBOOK record ******
      // read facebook record from firestore to validate if integration exists
      const [record, error] = await readUserRecordFromFirestore(
        currentUser.uid,
        ['clients', 'integrations', 'facebookBusinessAccounts'],
        ['facebook', 'facebookBusinessAccountName']
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
        const { email, fbBusinessAcctName, fbBusinessAcctId, fbAdAccountId } =
          record?.data();
        // update firestore integration record state
        setFirestoreIntegrationRecord({
          email,
          fbBusinessAcctName,
          fbBusinessAcctId,
          fbAdAccountId,
          hasFacebookIntegration: true,
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

  // link credential with facebook authentication provider
  useEffect(() => {
    let isMounted = true;

    const linkAuthProviders = async () => {
      // set loading state
      setLoading(true);
      try {
        // link facebook provider which will promt fb dialog login module
        const result = await linkToProvider(provider);
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
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = error.credential;
        // log errors
        console.error({ errorCode, errorMessage, email, credential });
        // reset loading state
        setLoading(false);
        // set error state
        setError(errorCode);
      }
    };

    // check if integration action is fb login click
    if (isFacebookIntegrationClick) {
      linkAuthProviders();
    }

    // clean up function to represent unmount of the component
    return () => {
      isMounted = false;
    };
  }, [isFacebookIntegrationClick, linkToProvider]);

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
                  onClick={() => setFacebookIntegrationClick(true)}
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
                  <Box
                    fontWeight="800"
                    fontSize="14px"
                    color="rgb(26, 32, 44)"
                    padding={
                      isEqualToOrLessThan800[0]
                        ? '.5rem 0 0 0'
                        : '.5rem 0 0 2rem'
                    }
                  >
                    <Text>
                      Facebook Business Account Name:{' '}
                      <span style={{ fontWeight: '500' }}>
                        {hasFirestoreIntegrationRecord.fbBusinessAcctName ??
                          'N/A'}
                      </span>
                    </Text>
                    <Text>
                      Facebook Business Account User:{' '}
                      <span style={{ fontWeight: '500' }}>
                        {hasFirestoreIntegrationRecord.email ?? 'N/A'}
                      </span>
                    </Text>
                    <Text>
                      Facebook Business Account Id:{' '}
                      <span style={{ fontWeight: '500' }}>
                        {hasFirestoreIntegrationRecord.fbBusinessAcctId ??
                          'N/A'}
                      </span>
                    </Text>
                    <Text>
                      Facebook Ad Account Id:{' '}
                      <span style={{ fontWeight: '500' }}>
                        {hasFirestoreIntegrationRecord.fbAdAccountId ?? 'N/A'}
                      </span>
                    </Text>
                    <Text>
                      System User created:{' '}
                      <span style={{ fontWeight: '500' }}>
                        {`${hasFirestoreIntegrationRecord.hasFacebookIntegration}`}
                      </span>
                    </Text>
                  </Box>
                )}
                {!hasFirestoreIntegrationRecord &&
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
