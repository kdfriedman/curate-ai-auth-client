import { useEffect, useState } from 'react';
import { Flex, Button, Box, CircularProgress, useMediaQuery, useDisclosure } from '@chakra-ui/react';
import { FacebookAppIntegration } from '../components/integrations/FacebookIntegration';
import { Header } from '../components/Header';
import { Loader } from '../components/Loader';
import { IntegrationDashboard } from '../components/integrations/IntegrationDashboard';
import { IntegrationVendor } from '../components/integrations/IntegrationVendor';
import { IntegrationVendorCard } from '../components/integrations/IntegrationVendorCard';
import { IntegrationVendorTip } from '../components/integrations/IntegrationVendorTip';
import { IntegrationVendorWidget } from '../components/integrations/IntegrationVendorWidget';
import { IntegrationVendorLoginButton } from '../components/integrations/IntegrationVendorLoginButton';
import { IntegrationVendorSwitchAccount } from '../components/integrations/IntegrationVendorSwitchAccount';
import { SettingsModal } from '../components/SettingsModal';
import { ErrorMessage } from '../components/ErrorMessage';
import { FaFacebook } from 'react-icons/fa';
import { useDeleteFacebookSystemUser } from '../hooks/useDeleteFacebookSystemUser';
import { useRemoveAccount } from '../hooks/useRemoveAccount';
import { useUpdateStateWithFirestoreRecord } from '../hooks/useUpdateStateWithFirebaseRecord';
import { useFacebookAuth } from '../contexts/FacebookContext';
import { ERROR } from '../constants/error';
import { FIREBASE } from '../services/firebase/constants';

export const IntegrationsPage = () => {
  const isEqualToOrLessThan950 = useMediaQuery('(max-width: 950px)');
  const [hasError, setError] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [hasIntegrationRecord, setIntegrationRecord] = useState(null);
  const [isIntegrationActiveStatus, setIntegrationActiveStatus] = useState(false);
  const [hasEmptyIntegrationCollection, setHasEmptyIntegrationCollection] = useState(false);
  const [isUpdateStateWithFirestoreRecord, setUpdateStateWithFirestoreRecord] = useState(true);
  const [settingsModalId, updateSettingsModalId] = useState(null);
  const { handleDeleteFacebookSystemUser } = useDeleteFacebookSystemUser();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { handleRemoveAccount } = useRemoveAccount();
  const { facebookAuthChange, loginToFacebook } = useFacebookAuth();
  const { updateStateWithFirestoreRecord } = useUpdateStateWithFirestoreRecord(
    FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS,
    FIREBASE.FIRESTORE.FACEBOOK.DOCS,
    setLoading,
    setError,
    setIntegrationRecord,
    setUpdateStateWithFirestoreRecord
  );

  useEffect(() => {
    if (!isUpdateStateWithFirestoreRecord) return;
    updateStateWithFirestoreRecord().catch((err) => console.error(err));
  }, [updateStateWithFirestoreRecord, isUpdateStateWithFirestoreRecord]);

  useEffect(() => {
    if (!hasIntegrationRecord) return setHasEmptyIntegrationCollection(true);
    const integrationCollectionKey = Object.keys(hasIntegrationRecord)[0];
    // convert integration array length into bool to make checking integration status more efficient
    const integrationCollectionStatus = hasIntegrationRecord?.[integrationCollectionKey]?.length === 0;
    setHasEmptyIntegrationCollection(integrationCollectionStatus);
  }, [hasIntegrationRecord]);

  return (
    <>
      <Header />
      <Loader isLoading={isLoading} loadingMessage="Loading..." />

      {!isLoading && (
        <Box maxHeight="100vh" className="dashboard__container">
          <section className="dashboard__integration-container">
            <IntegrationVendorWidget
              hasEmptyIntegrationCollection={hasEmptyIntegrationCollection}
              integrationVendorInfo={'Integrate CurateAI with Facebook'}
              integrationVendorLoginButton={
                <IntegrationVendorLoginButton
                  setIntegrationActiveStatus={setIntegrationActiveStatus}
                  authenticateWithVendor={loginToFacebook}
                  content={{ cta: 'Login With Facebook' }}
                  IntegrationVendorIcon={FaFacebook}
                  setLoading={setLoading}
                  isDisabled={isIntegrationActiveStatus}
                  setError={setError}
                />
              }
              integrationVendorSwitchAccount={
                <IntegrationVendorSwitchAccount
                  setLoading={setLoading}
                  authenticateWithVendor={loginToFacebook}
                  setIntegrationActiveStatus={setIntegrationActiveStatus}
                  isDisabled={isIntegrationActiveStatus}
                  content={{ cta: 'Add Account' }}
                  setError={setError}
                />
              }
            ></IntegrationVendorWidget>

            <IntegrationDashboard>
              <IntegrationVendor vendor={'Facebook'} />

              {hasError && <ErrorMessage errorMessage={ERROR.DASHBOARD.MAIN} />}

              {isIntegrationActiveStatus && facebookAuthChange?.authResponse && (
                <FacebookAppIntegration
                  setIntegrationActiveStatus={setIntegrationActiveStatus}
                  setIntegrationRecord={setIntegrationRecord}
                  setError={setError}
                />
              )}

              {hasEmptyIntegrationCollection && (
                <IntegrationVendorTip vendorTipMessage={'Get started now by integrating your Facebook account.'} />
              )}

              {!hasEmptyIntegrationCollection && (
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
                            onClick={async (event) => {
                              await handleRemoveAccount(
                                event,
                                setLoading,
                                setIntegrationRecord,
                                hasIntegrationRecord,
                                handleDeleteFacebookSystemUser
                              );
                            }}
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
