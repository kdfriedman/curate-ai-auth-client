import { useState, useEffect } from 'react';
import { Loader } from '../components/Loader';
import { NavLink } from 'react-router-dom';
import {
  Flex,
  Box,
  Text,
  useMediaQuery,
  Link,
  Button,
  Heading,
  Card,
  CardBody,
  Stack,
  StackDivider,
  CardHeader,
  CardFooter,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import firestoreHandlers from '../services/firebase/data/firestore';
import { errorMap } from '../components/ErrorMap';
import { FIREBASE } from '../services/firebase/constants';
import { ERROR } from '../constants/error';

export const ProfilePage = () => {
  const [hasError, setError] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [hasIntegrationRecord, setIntegrationRecord] = useState(null);
  const isEqualToOrLessThan450 = useMediaQuery('(max-width: 450px)');
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');
  const { currentUser } = useAuth();
  const { readUserRecordFromFirestore } = firestoreHandlers;

  // read data from firebase to set integration state
  useEffect(() => {
    const readrecord = async () => {
      // ****** FACEBOOK record ******
      // read facebook record from firestore to validate if integration exists
      const [record, error] = await readUserRecordFromFirestore([
        FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS[0],
        currentUser.uid,
        FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS[1],
        FIREBASE.FIRESTORE.FACEBOOK.DOCS[0],
      ]);

      // log out any errors from firestore fetch
      if (error) {
        // reset loading state
        setLoading(false);
        // set error state
        setError('failed to read record from firestore');
        return console.error('Error: failed to read record from firestore');
      }

      // if record exists, update state with firestore integration record
      if (record?.exists() && record?.data()?.facebookBusinessAccts?.length > 0) {
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
  }, [currentUser, readUserRecordFromFirestore]);

  return (
    <>
      {isLoading ? (
        <Loader isLoading={isLoading} loadingMessage="Loading..." />
      ) : (
        <>
          {hasError && (
            <>
              {errorMap.get(hasError) ? (
                errorMap.get(hasError)()
              ) : (
                <Text
                  color="#c5221f"
                  fontWeight="500"
                  className="error"
                  padding={
                    isEqualToOrLessThan450
                      ? '1rem 1rem 0rem 2rem'
                      : isEqualToOrLessThan800[0]
                      ? '1rem 0 0 0'
                      : '1rem 2rem 0 2rem'
                  }
                >
                  {ERROR.DASHBOARD.MAIN}
                </Text>
              )}
            </>
          )}
          <section>
            <Box gridColumn="1 / 5" gridRow="1" className="profile__dashboard" minHeight="20rem" paddingBottom="2rem">
              <Flex
                padding="2rem"
                fontSize="18px"
                color="rgb(26, 32, 44)"
                fontWeight="800"
                textTransform="uppercase"
                letterSpacing=".2em"
                className="profile__dashboard-header"
                justifyContent={isEqualToOrLessThan800[0] ? 'center' : ''}
              >
                Profile
              </Flex>
              <Flex flexDirection="column" className="profile__dashboard-body">
                <Flex
                  maxWidth={isEqualToOrLessThan450[0] ? '20rem' : '750px'}
                  className="profile__dashboard-card-container"
                  alignItems="center"
                  justifyContent={isEqualToOrLessThan800[0] ? 'center' : 'space-between'}
                >
                  <Box
                    className="profile__dashboard-card"
                    fontWeight="800"
                    fontSize="14px"
                    color="rgb(26, 32, 44)"
                    minWidth={isEqualToOrLessThan450[0] ? 0 : '25rem'}
                    padding="1rem 2rem"
                  >
                    <Card minWidth="50%">
                      <CardHeader>
                        <Heading size="md">User Details</Heading>
                      </CardHeader>
                      <CardBody>
                        <Stack divider={<StackDivider />} spacing="4">
                          <Box>
                            <Heading size="xs" textTransform="uppercase">
                              Email
                            </Heading>
                            <Text pt="2" fontSize="sm">
                              <span style={{ fontWeight: '500' }}>{currentUser.email}</span>
                            </Text>
                          </Box>
                          <Box>
                            <Heading size="xs" textTransform="uppercase">
                              Integrations
                            </Heading>
                            <Text pt="2" fontSize="sm">
                              <span style={{ fontWeight: '500' }}>
                                {' '}
                                {hasIntegrationRecord?.facebookBusinessAccts?.length ? 'Facebook' : 'None'}
                              </span>
                            </Text>
                          </Box>
                        </Stack>
                      </CardBody>
                      <CardFooter>
                        <Link
                          as={NavLink}
                          to="/password-reset"
                          style={{
                            textDecoration: 'none',
                            display: 'flex',
                            justifyContent: `${isEqualToOrLessThan800[0] ? 'center' : 'start'}`,
                          }}
                        >
                          <Button
                            _hover={{
                              opacity: '.8',
                            }}
                            _focus={{
                              outline: 0,
                              boxShadow: 'none',
                            }}
                            color="#fff"
                            backgroundColor="#635bff"
                            type="submit"
                            fontSize="16px"
                            textAlign={isEqualToOrLessThan800[0] ? 'center' : 'start'}
                          >
                            Reset Password
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </Box>
                </Flex>
              </Flex>
            </Box>
          </section>
        </>
      )}
    </>
  );
};
