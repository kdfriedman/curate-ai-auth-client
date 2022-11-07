import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import {
  Flex,
  Button,
  Box,
  useMediaQuery,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

import { useAuth } from '../contexts/AuthContext';
import { useFirestoreStore } from '../contexts/FirestoreContext';
import { ERROR } from '../constants/error';
import { FIREBASE } from '../services/firebase/constants';
import { useUpdateStateWithFirestoreRecord } from '../hooks/useUpdateStateWithFirebaseRecord';

export const DashboardPage = () => {
  const [hasError, setError] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [modelId, setModelId] = useState(null);
  const [integrationId, setIntegrationId] = useState(null);
  const { modelsStore, setModelsStore, setIntegrationsStore, integrationsStore } = useFirestoreStore();
  const isEqualToOrLessThan450 = useMediaQuery('(max-width: 450px)');
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');
  useUpdateStateWithFirestoreRecord(
    FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS,
    FIREBASE.FIRESTORE.FACEBOOK.DOCS,
    setLoading,
    setError,
    setIntegrationsStore,
    FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME,
    integrationsStore === null
  );

  useUpdateStateWithFirestoreRecord(
    FIREBASE.FIRESTORE.MODELS.COLLECTIONS,
    FIREBASE.FIRESTORE.MODELS.DOCS,
    setLoading,
    setError,
    setModelsStore,
    FIREBASE.FIRESTORE.MODELS.PAYLOAD_NAME,
    true
  );

  const hasEmptyModelCollection = !modelsStore
    ? true
    : modelsStore?.[FIREBASE.FIRESTORE.MODELS.PAYLOAD_NAME]?.length === 0;

  const setMenuListStyles = () => {
    const menuItemList = document.querySelector('[data-id="modelListItems"]');
    const menuItems = [...menuItemList.children];
    menuItems.forEach((menuItemGroup) => {
      const models = menuItemGroup.querySelectorAll('[data-model-id]');
      [...models].forEach((model) => {
        if (model.dataset.modelId === modelId) {
          console.log('model should be highlighted', model);
          return (model.style.backgroundColor = '#EDF2F7');
        }
        model.style.backgroundColor = '#FFF';
      });
    });
  };

  const consolidateTableData = (modelOutput) => {
    if (!modelOutput) return;
    const consolidatedTableData = [];
    modelOutput.forEach((output) => {
      const data = JSON.parse(output?.data);
      const labels = Object.entries(data[0]);
      const coefs = Object.entries(data.Coefs);
      consolidatedTableData.push(...labels.map((label, i) => [...label, coefs[i]?.[1]]));
    });
    return consolidatedTableData;
  };

  const renderTable = (tableData) => {
    if (!tableData) return;
    return tableData?.map((data) => {
      const [index, label, coef] = data;
      return (
        <Tr key={index}>
          <Td>{label}</Td>
          <Td isNumeric>{coef}</Td>
        </Tr>
      );
    });
  };

  return (
    <>
      <Header />
      <Loader isLoading={isLoading} loadingMessage="Loading..." />
      {hasError && <ErrorMessage errorMessage={ERROR.DASHBOARD.MAIN} />}
      <section className="profile__section">
        <Box gridColumn="1 / span 4" gridRow="1" className="profile__dashboard" minHeight="20rem" paddingBottom="2rem">
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
            Dashboard
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
              Model Analysis
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
              >
                <Menu onOpen={setMenuListStyles}>
                  <MenuButton minWidth="20rem" as={Button} rightIcon={<ChevronDownIcon />}>
                    Completed Models
                  </MenuButton>
                  <MenuList minWidth="240px" data-id="modelListItems">
                    {integrationsStore?.[FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME]?.map((integration, i) => {
                      return (
                        <MenuOptionGroup key={integration.adAccountId} title={integration.businessAcctName}>
                          {modelsStore?.output?.map((model) => {
                            return (
                              <React.Fragment key={model.id}>
                                {model.ad_account_id === integration.adAccountId && (
                                  <MenuItemOption
                                    onClick={() => {
                                      setModelId(model.id);
                                      setIntegrationId(integration.adAccountId);
                                    }}
                                    key={model.id}
                                    data-model-id={model.id}
                                  >
                                    {model.name}
                                  </MenuItemOption>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </MenuOptionGroup>
                      );
                    })}
                  </MenuList>
                </Menu>
                <TableContainer>
                  <Table variant="simple">
                    <TableCaption>Model output for ad account: {integrationId}</TableCaption>
                    <Thead>
                      <Tr>
                        <Th>Labels</Th>
                        <Th isNumeric>Coefs</Th>
                      </Tr>
                    </Thead>
                    {!hasEmptyModelCollection && <Tbody></Tbody>}
                    <Tfoot>
                      <Tr>
                        <Th>Labels</Th>
                        <Th isNumeric>Coefs</Th>
                      </Tr>
                    </Tfoot>
                  </Table>
                </TableContainer>
              </Box>
            </Flex>
          </Flex>
        </Box>
      </section>
    </>
  );
};
