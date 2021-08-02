import { useEffect, useState, useRef } from 'react';
import { Flex, Heading, Button } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import FacebookAppIntegration from '../components/FacebookIntegration';
import { provider } from '../services/firebase/auth/facebook';
import { Header } from '../components/Header';

export const DashboardPage = () => {
  const [facebookAuth, setFacebookAuth] = useState({});
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
      <Flex className="dashboard__container">
        {/* <Button onClick={() => setFacebookIntegrationClick(true)}></Button> */}
        {/* <FacebookAppIntegration /> */}
      </Flex>
    </>
  );
};
