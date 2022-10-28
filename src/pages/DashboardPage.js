import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import {
  Flex,
  Button,
  Box,
  useMediaQuery,
  Text,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Select,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreStore } from '../contexts/FirestoreContext';
import { ERROR } from '../constants/error';
import { FIREBASE } from '../services/firebase/constants';
import { useUpdateStateWithFirestoreRecord } from '../hooks/useUpdateStateWithFirebaseRecord';

export const DashboardPage = () => {
  const [hasError, setError] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [modelId, setModelId] = useState(null);
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
                {!hasEmptyModelCollection && (
                  <Select
                    onChange={(e) => {
                      console.log(e);
                    }}
                    placeholder="Please select an option"
                    size="lg"
                  >
                    {modelsStore?.[FIREBASE.FIRESTORE.MODELS.PAYLOAD_NAME]?.map((model, i) => {
                      //TODO: replace value with id of model to store in state
                      // this will allow the component to render correct model table data
                      // look into sub menu within select, if not possible look to replace select with menu or list all models with associated business acct name e.g. {business name}-{Model Name}
                      return (
                        <option key={i} value={i}>
                          {
                            integrationsStore?.[FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME]?.find((integration) => {
                              return integration.adAccountId === model.ad_account_id;
                            }).businessAcctName
                          }
                        </option>
                      );
                    })}
                  </Select>
                )}
                <TableContainer>
                  <Table variant="simple">
                    <TableCaption>Model output for ad account: {true}</TableCaption>
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
