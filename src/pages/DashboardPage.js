import { useEffect, useState, useRef } from 'react';
import { Flex, Heading, Button, Box, Text } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import FacebookAppIntegration from '../components/FacebookIntegration';
import { provider } from '../services/firebase/auth/facebook';
import { Header } from '../components/Header';
import { FaFacebook } from 'react-icons/fa';

export const DashboardPage = () => {
  const [facebookAuth, setFacebookAuth] = useState({});
  console.log('facebookAuth', facebookAuth);
  const [isFacebookIntegrationClick, setFacebookIntegrationClick] =
    useState(false);
  const { linkToProvider } = useAuth();

  useEffect(() => {
    let isMounted = true;
    const linkAuthProviders = async () => {
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
      <Box className="dashboard__container">
        <section className="dashboard__integrations-container">
          <Box
            gridColumn="1 / span 2"
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
                backgroundColor="#dc3545"
              />
              <Text
                display="flex"
                flexDir="column"
                className="dashboard__integration-status-text"
                color="#6c757d"
              >
                Status: Inactive
              </Text>
            </Flex>
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
          </Box>

          <Box
            gridColumn="3"
            gridRow="1 / span 3"
            className="dashboard__integration-dashboard"
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
            >
              <Box
                className="dashboard__integration-dashboard-vendor"
                padding="2rem 0 0 2rem"
                fontSize="16px"
                color="#6c757d"
                fontWeight="800"
              >
                Facebook
              </Box>
              <Box
                className="dashboard__integration-dashboard-tip"
                fontSize="13px"
                fontWeight="500"
                color="rgb(26, 32, 44)"
                padding=".5rem 0 0 2rem"
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
              <FacebookAppIntegration facebookAuthData={facebookAuth} />
            </Flex>
          </Box>
        </section>
      </Box>
    </>
  );
};
