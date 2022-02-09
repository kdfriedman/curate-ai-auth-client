import { useEffect, useState } from 'react';
import { Flex, Button, Box, Text, CircularProgress, useMediaQuery, useDisclosure } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import FacebookAppIntegration from '../components/FacebookIntegration';
import { fbProviderPopup } from '../services/firebase/auth/facebook';
import firestoreHandlers from '../services/firebase/data/firestore';
import { Header } from '../components/Header';
import { IntegrationVendorWidget } from '../components/IntegrationVendorWidget';
import { IntegrationVendorLoginButton } from '../components/IntegrationVendorLoginButton';
import { IntegrationVendorSwitchAccount } from '../components/IntegrationVendorSwitchAccount';
import { SettingsModal } from '../components/SettingsModal';
import { ErrorMessage } from '../components/ErrorMessage';
import { FaFacebook } from 'react-icons/fa';
import { useDeleteFacebookSystemUser } from '../hooks/useDeleteFacebookSystemUser';
import { useRefreshFacebookAccessToken } from '../hooks/useRefreshFacebookAccessToken';
import { useReadRecordFromFirestore } from '../hooks/useReadRecordFromFirestore';
import { useRemoveAccount } from '../hooks/useRemoveAccount';
import { useUpdateStateWithFirestoreRecord } from '../hooks/useUpdateStateWithFirebaseRecord';
import { useFacebookAuth } from '../contexts/FacebookContext';
import { ERROR } from '../constants/error';
import { FIREBASE } from '../services/firebase/constants';

export const DashboardPage = () => {
  const isEqualToOrLessThan450 = useMediaQuery('(max-width: 450px)');
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');
  const isEqualToOrLessThan950 = useMediaQuery('(max-width: 950px)');
  const [hasError, setError] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [hasIntegrationRecord, setIntegrationRecord] = useState(null);
  const [isIntegrationActiveStatus, setIntegrationActiveStatus] = useState(false);
  const [isUpdateStateWithFirestoreRecord, setUpdateStateWithFirestoreRecord] = useState(true);
  const [settingsModalId, updateSettingsModalId] = useState(null);
  const { currentUser } = useAuth();
  const { removeRecordFromFirestore, addRecordToFirestore } = firestoreHandlers;
  const { handleDeleteFacebookSystemUser } = useDeleteFacebookSystemUser();
  const { handleRefreshFacebookAccessToken } = useRefreshFacebookAccessToken();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { handleRemoveAccount } = useRemoveAccount();
  const { handleReadFirestoreRecord } = useReadRecordFromFirestore();
  const { facebookAuthChange, loginToFacebook, switchFacebookAdAccounts } = useFacebookAuth();
  const { updateStateWithFirestoreRecord } = useUpdateStateWithFirestoreRecord(
    FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS,
    FIREBASE.FIRESTORE.FACEBOOK.DOCS,
    setLoading,
    setError,
    setIntegrationRecord,
    setUpdateStateWithFirestoreRecord
  );

  useEffect(() => {
    setLoading(true);
    if (!isUpdateStateWithFirestoreRecord) return setLoading(false);
    updateStateWithFirestoreRecord().catch((err) => console.error(err));
  }, [updateStateWithFirestoreRecord, isUpdateStateWithFirestoreRecord]);

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
            <IntegrationVendorWidget
              integrationRecord={hasIntegrationRecord}
              setIntegrationActiveStatus={setIntegrationActiveStatus}
              integrationVendorInfo={'Integrate CurateAI with Facebook'}
              IntegrationVendorLoginButton={IntegrationVendorLoginButton}
              integrationVendorLoginHandler={loginToFacebook}
              integrationVendorLoginCTA={'Login With Facebook'}
              IntegrationVendorSwitchAccount={IntegrationVendorSwitchAccount}
              integrationVendorSwitchAccountHandler={switchFacebookAdAccounts}
              IntegrationVendorIcon={FaFacebook}
              isLoading={isLoading}
            />

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
              <Flex flexDirection="column" className="dashboard__integration-dashboard-body">
                <Box
                  className="dashboard__integration-dashboard-vendor"
                  padding={isEqualToOrLessThan800[0] ? '1rem 1rem 0 1rem' : '2rem 0 0 2rem'}
                  fontSize="16px"
                  color="#6c757d"
                  fontWeight="800"
                  textAlign={isEqualToOrLessThan800[0] ? 'center' : 'left'}
                >
                  Facebook
                </Box>

                {!hasIntegrationRecord && hasError && <ErrorMessage errorMessage={ERROR.DASHBOARD.MAIN} />}

                {/* invoke FB integration component on first integration action */}
                {isIntegrationActiveStatus && facebookAuthChange?.authResponse && (
                  <FacebookAppIntegration
                    setIntegrationActiveStatus={setIntegrationActiveStatus}
                    setIntegrationRecord={setIntegrationRecord}
                  />
                )}
                {!hasIntegrationRecord && (
                  <Box
                    className="dashboard__integration-dashboard-tip"
                    fontSize="13px"
                    fontWeight="500"
                    color="rgb(26, 32, 44)"
                    padding={isEqualToOrLessThan800[0] ? '1rem 1rem 0 1rem' : '.5rem 0 0 2rem'}
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
                    {hasIntegrationRecord?.facebookBusinessAccts?.map((record) => {
                      return (
                        <Flex
                          key={record.id}
                          id={record.businessAcctId}
                          flexDir={isEqualToOrLessThan950[0] ? 'column' : 'row'}
                          maxWidth={isEqualToOrLessThan450[0] ? '20rem' : '750px'}
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
                              User Email: <span style={{ fontWeight: '500' }}>{record.email ?? 'N/A'}</span>
                            </Text>
                            <Text key={`business-account-${record.id}`}>
                              Business Account Name:{' '}
                              <span style={{ fontWeight: '500' }}>{record.businessAcctName ?? 'N/A'}</span>
                            </Text>
                            <Text key={`business-id-${record.id}`}>
                              Business Account Id:{' '}
                              <span style={{ fontWeight: '500' }}>{record.businessAcctId ?? 'N/A'}</span>
                            </Text>
                            <Text key={`ad-account-id-${record.id}`}>
                              Ad Account Id: <span style={{ fontWeight: '500' }}>{record.adAccountId ?? 'N/A'}</span>
                            </Text>
                          </Box>
                          <Flex flexDir="column" className="dashboard__integration-vendor-card-btn-container">
                            <Button
                              onClick={(e) => {
                                // get ref to parent container with business acct id as dom id
                                const vendorCardParentElement = e.target.closest(
                                  '.dashboard__integration-vendor-card-container'
                                );
                                // check if parent element exists, then open modal
                                if (vendorCardParentElement) {
                                  updateSettingsModalId(vendorCardParentElement.id);
                                  onOpen();
                                }
                              }}
                              _hover={{
                                opacity: '.8',
                              }}
                              className="dashboard__integration-vendor-card-btn"
                              margin={isEqualToOrLessThan950[0] ? '0 1rem 1rem' : '1rem'}
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
                              margin={isEqualToOrLessThan950[0] ? '0 1rem 1rem' : '0 0 1rem'}
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
                    })}
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
