import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Loader } from '../components/Loader';
import { NavLink } from 'react-router-dom';
import { Flex, Box, Text, useMediaQuery, Link, Button } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import firestoreHandlers from '../services/firebase/data/firestore';
import { errorMap } from '../components/ErrorMap';
import { FIREBASE } from '../services/firebase/constants';
import { ERROR } from '../constants/error';

export const HelpPage = () => {
  const [isLoading, setLoading] = useState(false);
  const isEqualToOrLessThan450 = useMediaQuery('(max-width: 450px)');
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');
  const { currentUser } = useAuth();

  return (
    <>
      <Header />
      {isLoading ? (
        <Loader isLoading={isLoading} loadingMessage="Loading..." />
      ) : (
        <>
          <section className="profile__section">
            <Box gridColumn="1 / 5" gridRow="1" className="profile__dashboard" minHeight="20rem" paddingBottom="2rem">
              <Flex
                boxShadow="0 0.125rem 0.25rem rgb(0 0 0 / 8%)"
                padding="2rem"
                fontSize="18px"
                color="rgb(26, 32, 44)"
                fontWeight="800"
                textTransform="uppercase"
                letterSpacing=".2em"
                className="profile__dashboard-header"
                justifyContent={isEqualToOrLessThan800[0] ? 'center' : ''}
              >
                Help & Support
              </Flex>
              <Flex flexDirection="column" className="profile__dashboard-body">
                <Box
                  className="profile__dashboard-account-info"
                  padding={isEqualToOrLessThan800[0] ? '1rem 1rem 0 1rem' : '2rem 0 0 2rem'}
                  fontSize="16px"
                  color="#6c757d"
                  fontWeight="800"
                  textAlign={isEqualToOrLessThan800[0] ? 'center' : 'left'}
                >
                  Contact Us
                </Box>

                <Flex
                  maxWidth={isEqualToOrLessThan450[0] ? '20rem' : '750px'}
                  className="profile__dashboard-card-container"
                  boxShadow="0 0.5rem 1rem rgb(0 0 0 / 15%)"
                  margin="1rem 2rem"
                  borderRadius="10px"
                  border="1px solid #f0f0f0"
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
                  ></Box>
                </Flex>
              </Flex>
            </Box>
          </section>
        </>
      )}
    </>
  );
};
