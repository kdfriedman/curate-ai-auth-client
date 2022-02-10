import { useEffect, useState } from 'react';
import { Flex, Button, Box, CircularProgress, useMediaQuery, useDisclosure } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import FacebookAppIntegration from '../components/FacebookIntegration';
import { fbProviderPopup } from '../services/firebase/auth/facebook';
import firestoreHandlers from '../services/firebase/data/firestore';
import { Header } from '../components/Header';
import { IntegrationDashboard } from '../components/IntegrationDashboard';
import { IntegrationVendor } from '../components/IntegrationVendor';
import { IntegrationVendorCard } from '../components/IntegrationVendorCard';
import { IntegrationVendorTip } from '../components/IntegrationVendorTip';
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

            <IntegrationDashboard>
              <IntegrationVendor vendor={'Facebook'} />

              {!hasIntegrationRecord && hasError && <ErrorMessage errorMessage={ERROR.DASHBOARD.MAIN} />}

              {isIntegrationActiveStatus && facebookAuthChange?.authResponse && (
                <FacebookAppIntegration
                  setIntegrationActiveStatus={setIntegrationActiveStatus}
                  setIntegrationRecord={setIntegrationRecord}
                />
              )}

              {!hasIntegrationRecord && (
                <IntegrationVendorTip vendorTipMessage={'Get started now by integrating your Facebook account.'} />
              )}

              {hasIntegrationRecord && (
                <>
                  {hasIntegrationRecord?.facebookBusinessAccts?.map((record) => {
                    return (
                      <IntegrationVendorCard key={record.id} record={record}>
                        <Flex flexDir="column" className="dashboard__integration-vendor-card-btn-container">
                          <Button
                            onClick={(e) => {
                              // get parent container element with business acct id as dom id
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
                      </IntegrationVendorCard>
                    );
                  })}
                </>
              )}
            </IntegrationDashboard>
          </section>
        </Box>
      )}
    </>
  );
};
