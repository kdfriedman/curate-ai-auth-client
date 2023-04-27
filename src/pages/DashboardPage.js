import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Loader } from '../components/Loader';
import { ModelCreationModal } from '../components/dashboard/ModelCreationModal';
import { ModelCreationForm } from '../components/dashboard/ModelCreationForm';
import { ModelCreationCard } from '../components/dashboard/ModelCreationCard';
import { ModelMenuSelect } from '../components/dashboard/ModelMenuSelect';
import { ModelBanner } from '../components/dashboard/ModelBanner';
import { ModelTable } from '../components/dashboard/ModelTable';
import { ModelTabs } from '../components/dashboard/ModelTabs';
import { ErrorMessage } from '../components/ErrorMessage';
import { Flex, Box, useMediaQuery, useDisclosure } from '@chakra-ui/react';
import { useFirestoreStore } from '../contexts/FirestoreContext';
import { ERROR } from '../constants/error';
import { FIREBASE } from '../services/firebase/constants';
import { useUpdateStateWithFirestoreRecord } from '../hooks/useUpdateStateWithFirebaseRecord';

export const DashboardPage = () => {
  const [hasError, setError] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [modelId, setModelId] = useState(null);
  const [isSorted, setIsSorted] = useState(false);
  const [integrationId, setIntegrationId] = useState(null);
  const { modelsStore, setModelsStore, setIntegrationsStore, integrationsStore, modelState, setModelState } =
    useFirestoreStore();
  const isEqualToOrLessThan450 = useMediaQuery('(max-width: 450px)');
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  useUpdateStateWithFirestoreRecord(
    FIREBASE.FIRESTORE.MODELS.COLLECTIONS,
    FIREBASE.FIRESTORE.MODELS.DOCS[1],
    setLoading,
    setError,
    setModelState,
    null,
    !modelState
  );

  const hasEmptyModelCollection = !modelsStore
    ? true
    : modelsStore?.[FIREBASE.FIRESTORE.MODELS.PAYLOAD_NAME]?.length === 0;

  const hasNoIntegrations = !integrationsStore
    ? true
    : integrationsStore?.[FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME]?.length === 0;

  const isModelCreationLimit = !modelState ? false : modelState?.modelCreationLimit >= 3;

  const consolidateTableData = () => {
    if (!modelId) return;
    const consolidatedTableData = [];
    const filteredTableData = modelsStore?.[FIREBASE.FIRESTORE.MODELS.PAYLOAD_NAME]?.filter(
      (model) => model.id === modelId
    );

    const tableData = JSON.parse(filteredTableData[0]?.data);
    const labels = Object.entries(tableData[0]);
    const coefs = Object.entries(tableData.Coefs);

    consolidatedTableData.push(...labels.map((label, i) => [...label, coefs[i]?.[1]]));
    // if sort exists, sort coefs descendingly
    if (isSorted) return consolidatedTableData.sort((a, b) => b[2] - a[2]);
    return consolidatedTableData;
  };
  const consolidatedTableData = consolidateTableData();

  return (
    <>
      <Header />
      <Loader isLoading={isLoading} loadingMessage="Loading..." />
      {hasError && <ErrorMessage errorMessage={ERROR.DASHBOARD.MAIN} />}
      <Box className="dashboard">
        <Flex
          boxShadow="0 0.125rem 0.25rem rgb(0 0 0 / 8%)"
          padding="2rem"
          fontSize="18px"
          color="rgb(26, 32, 44)"
          fontWeight="800"
          textTransform="uppercase"
          letterSpacing=".2em"
          justifyContent={isEqualToOrLessThan800[0] ? 'center' : ''}
        >
          Dashboard
        </Flex>
        <Flex flexDirection="column">
          <Box
            padding={isEqualToOrLessThan800[0] ? '1rem 1rem 0 1rem' : '2rem 0 0 2rem'}
            fontSize="16px"
            color="#6c757d"
            fontWeight="800"
            textAlign={isEqualToOrLessThan800[0] ? 'center' : 'left'}
          >
            Model Analysis
          </Box>
          <Flex
            maxWidth={isEqualToOrLessThan450[0] ? '20rem' : ''}
            boxShadow="0 0.5rem 1rem rgb(0 0 0 / 15%)"
            margin="1rem 2rem"
            borderRadius="10px"
            border="1px solid #f0f0f0"
            alignItems="center"
            justifyContent={isEqualToOrLessThan800[0] ? 'center' : 'space-between'}
          >
            <Box
              fontWeight="800"
              fontSize="14px"
              color="rgb(26, 32, 44)"
              minWidth={isEqualToOrLessThan450[0] ? 0 : '25rem'}
              padding="1rem 2rem"
              width="100%"
            >
              <ModelTabs
                hasNoIntegrations={hasNoIntegrations}
                hasEmptyModelCollection={hasEmptyModelCollection}
                modelBanner={<ModelBanner />}
                modelCreationCard={
                  <ModelCreationCard
                    modelsStore={modelsStore}
                    modelState={modelState}
                    hasNoIntegrations={hasNoIntegrations}
                    isModelCreationLimit={isModelCreationLimit}
                    onOpen={onOpen}
                    modelCardHeading={`You currently have ${modelsStore?.output?.length ?? 0} model output${
                      modelsStore?.output?.length === 1 ? '' : 's'
                    } to view.`}
                    modelCardDesc="If you'd like to generate a new model, please select the Create Model button below, provide a unique name and
    select the associated ad account for your model."
                    createModelBtnTxt="Create Model"
                  />
                }
                modelCreationModal={
                  <ModelCreationModal
                    modalTitle="New Model"
                    modalHeader=" Please complete the details below to run your model."
                    isOpen={isOpen}
                    onClose={onClose}
                  >
                    <ModelCreationForm
                      onClose={onClose}
                      integrationsStore={integrationsStore}
                      integrationsPayloadName={FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME}
                      formSubmitBtn="Run Model"
                    />
                  </ModelCreationModal>
                }
                modelMenuSelect={
                  <ModelMenuSelect
                    consolidatedTableData={consolidatedTableData}
                    modelId={modelId}
                    setModelId={setModelId}
                    modelsStore={modelsStore}
                    integrationsStore={integrationsStore}
                    integrationsStorePayload={FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME}
                    setIntegrationId={setIntegrationId}
                    openMenuBtnTxt="Completed Models"
                    closeMenuBtnTxt="Clear Model"
                  />
                }
                modelTable={
                  <ModelTable
                    hasEmptyModelCollection={hasEmptyModelCollection}
                    consolidatedTableData={consolidatedTableData}
                    modelId={modelId}
                    integrationId={integrationId}
                    setIsSorted={setIsSorted}
                    modelsStore={modelsStore}
                    integrationsStore={integrationsStore}
                    tableHeaders={['Labels', 'Campaign KPI']}
                    tableCaption={`Model output for ad account: ${integrationId}`}
                  />
                }
              />
            </Box>
          </Flex>
        </Flex>
      </Box>
    </>
  );
};
