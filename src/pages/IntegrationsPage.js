import { useState } from 'react';
import { Flex, Button, Box, CircularProgress, useMediaQuery, useDisclosure } from '@chakra-ui/react';
import { FacebookAppIntegration } from '../components/integrations/FacebookIntegration';
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
import { useFirestoreStore } from '../contexts/FirestoreContext';
import { ERROR } from '../constants/error';
import { FIREBASE } from '../services/firebase/constants';

export const IntegrationsPage = () => {
  const isEqualToOrLessThan950 = useMediaQuery('(max-width: 950px)');
  const [hasError, setError] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [isIntegrationActiveStatus, setIntegrationActiveStatus] = useState(false);
  const [settingsModalId, updateSettingsModalId] = useState(null);
  const { handleDeleteFacebookSystemUser } = useDeleteFacebookSystemUser();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { handleRemoveAccount } = useRemoveAccount();
  const { facebookAuthChange, loginToFacebook } = useFacebookAuth();
  const { setIntegrationsStore, integrationsStore, setModelsStore, modelsStore } = useFirestoreStore();

  useUpdateStateWithFirestoreRecord(
    FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS,
    FIREBASE.FIRESTORE.FACEBOOK.DOCS[0],
    setLoading,
    setError,
    setIntegrationsStore,
    FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME,
    !integrationsStore
  );

  useUpdateStateWithFirestoreRecord(
    FIREBASE.FIRESTORE.MODELS.COLLECTIONS,
    FIREBASE.FIRESTORE.MODELS.DOCS[0],
    setLoading,
    setError,
    setModelsStore,
    FIREBASE.FIRESTORE.MODELS.PAYLOAD_NAME,
    !modelsStore
  );
  const hasEmptyIntegrationCollection = !integrationsStore
    ? true
    : integrationsStore?.[FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME]?.length === 0;

  return (
    <>
      {isLoading ? (
        <Loader isLoading={isLoading} loadingMessage="Loading..." />
      ) : (
        <Box maxHeight="100vh" className="container">
          <section className="integrations__container">
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
                  setIntegrationRecord={setIntegrationsStore}
                  setError={setError}
                />
              )}

              {hasEmptyIntegrationCollection ? (
                <IntegrationVendorTip vendorTipMessage={'Get started now by integrating your Facebook account.'} />
              ) : (
                <>
                  {integrationsStore?.[FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME]?.map((record) => {
                    return (
                      <IntegrationVendorCard key={record.id} record={record}>
                        <Flex
                          flexDir="column"
                          marginLeft="auto"
                          marginRight="auto"
                          className="integrations__vendor-card-btn-container"
                        >
                          <Button
                            onClick={(e) => {
                              // get parent container element with business acct id as dom id
                              const vendorCardParentElement = e.target.closest('[data-vendor-card-id]');
                              // check if parent element exists, then open modal
                              if (vendorCardParentElement) {
                                updateSettingsModalId(vendorCardParentElement.id);
                                onOpen();
                                // prevent modal overflow movement when opening/closing
                                if (document?.body) document.body.setAttribute('style', 'overflow: auto !important');
                              }
                            }}
                            _hover={{
                              opacity: '.8',
                            }}
                            className="integrations__vendor-card-btn"
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
                                setIntegrationsStore,
                                setModelsStore,
                                modelsStore,
                                integrationsStore,
                                handleDeleteFacebookSystemUser
                              );
                            }}
                            disabled={isLoading ? true : false}
                            alignSelf="center"
                            backgroundColor="#E53E3E"
                            color="#fff"
                            className="integrations__vendor-card-btn"
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
                              setIntegrationRecord={setIntegrationsStore}
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
