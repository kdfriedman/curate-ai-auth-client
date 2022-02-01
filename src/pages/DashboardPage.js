import { useEffect, useState } from 'react';
import {
  Flex,
  Button,
  Box,
  Text,
  CircularProgress,
  useMediaQuery,
  useDisclosure,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import FacebookAppIntegration from '../components/FacebookIntegration';
import { fbProviderPopup } from '../services/firebase/auth/facebook';
import firestoreHandlers from '../services/firebase/data/firestore';
import { Header } from '../components/Header';
import { SettingsModal } from '../components/SettingsModal';
import { errorMap } from '../components/ErrorMap';
import { FaFacebook } from 'react-icons/fa';
import { useDeleteFacebookSystemUser } from '../hooks/useDeleteFacebookSystemUser';
import { useRefreshFacebookAccessToken } from '../hooks/useRefreshFacebookAccessToken';
import { useReadRecordFromFirestore } from '../hooks/useReadRecordFromFirestore';
import { useRemoveAccount } from '../hooks/useRemoveAccount';
import { useUpdateStateWithFirestoreRecord } from '../hooks/useUpdateStateWithFirebaseRecord';
import { useFacebookAuth } from '../contexts/FacebookContext';
import { ERROR } from '../constants/error';

export const DashboardPage = () => {
  const isEqualToOrLessThan450 = useMediaQuery('(max-width: 450px)');
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');
  const isEqualToOrLessThan950 = useMediaQuery('(max-width: 950px)');
  const [hasError, setError] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [hasIntegrationRecord, setIntegrationRecord] = useState(null);
  const [settingsModalId, updateSettingsModalId] = useState(null);
  const { currentUser } = useAuth();
  const { removeRecordFromFirestore, addRecordToFirestore } = firestoreHandlers;
  const { handleDeleteFacebookSystemUser } = useDeleteFacebookSystemUser();
  const { handleRefreshFacebookAccessToken } = useRefreshFacebookAccessToken();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { handleRemoveAccount } = useRemoveAccount();
  const { handleReadFirestoreRecord } = useReadRecordFromFirestore();
  const { facebookAuthChange, loginToFacebook } = useFacebookAuth();
  const firebaseCollections = ['clients', 'integrations'];
  const firebaseDocs = ['facebook'];
  const { updateStateWithFirestoreRecord } = useUpdateStateWithFirestoreRecord(
    firebaseCollections,
    firebaseDocs,
    setLoading,
    setError,
    setIntegrationRecord
  );

  useEffect(() => {
    if (!hasIntegrationRecord?.facebookBusinessAccts) return setLoading(false);
    updateStateWithFirestoreRecord().catch((err) => console.error(err));
  }, [updateStateWithFirestoreRecord, hasIntegrationRecord]);

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
                  disabled={isLoading}
                  onClick={() => loginToFacebook()}
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
                    Login With Facebook
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
                    Switch FB Accounts
                  </Text>
                  <Button
                    disabled={isLoading}
                    onClick={async () => {
                      console.log(
                        'TODO: change to log out of current FB account'
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
                {!hasIntegrationRecord && hasError && (
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
                {/* invoke FB integration component on first integration action */}
                {!hasIntegrationRecord && facebookAuthChange?.authResponse && (
                  <FacebookAppIntegration
                    setIntegrationRecord={setIntegrationRecord}
                  />
                )}
                {!hasIntegrationRecord && (
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
                    {hasIntegrationRecord?.facebookBusinessAccts?.map(
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
                                onClick={(e) =>
                                  handleRemoveAccount(
                                    e,
                                    setLoading,
                                    setIntegrationRecord,
                                    hasIntegrationRecord,
                                    handleReadFirestoreRecord,
                                    handleDeleteFacebookSystemUser,
                                    handleRefreshFacebookAccessToken,
                                    removeRecordFromFirestore,
                                    addRecordToFirestore,
                                    fbProviderPopup,
                                    currentUser
                                  )
                                }
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
                                  setIntegrationRecord={setIntegrationRecord}
                                  Loading={CircularProgress}
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
