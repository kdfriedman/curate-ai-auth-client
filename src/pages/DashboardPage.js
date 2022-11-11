import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Header } from '../components/Header';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import {
  Flex,
  Tooltip,
  Text,
  Button,
  Box,
  useMediaQuery,
  Heading,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Alert,
  AlertIcon,
  CloseButton,
  Link,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreStore } from '../contexts/FirestoreContext';
import { ERROR } from '../constants/error';
import { FIREBASE } from '../services/firebase/constants';
import { useUpdateStateWithFirestoreRecord } from '../hooks/useUpdateStateWithFirebaseRecord';
import { errorMap } from '../components/ErrorMap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

export const DashboardPage = () => {
  const [hasError, setError] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [hasModelCreationErr, setModelCreationErr] = useState(false);
  const [isModelCreationLoading, setModelCreationLoading] = useState(false);
  const [modelId, setModelId] = useState(null);
  const [isSorted, setIsSorted] = useState(false);
  const [integrationId, setIntegrationId] = useState(null);
  const { modelsStore, setModelsStore, setIntegrationsStore, integrationsStore } = useFirestoreStore();
  const isEqualToOrLessThan450 = useMediaQuery('(max-width: 450px)');
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [values, setValues] = useState();
  const [actions, setActions] = useState();

  // form validation schema
  const LoginSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
  });

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

  useEffect(() => {
    if (values?.name) {
      // TODO: create real createModel api call here
      // createModel()
      //   .then((response) => {
      //     // make state updates with response data
      //     onClose();
      //   })
      //   .catch((err) => {
      //     console.error(err);
      //     setModelCreationErr('failed to create model');
      //   });
      onClose();
    }
  }, [values, actions, onClose]);

  const handleCloseBtnClick = () => setModelCreationErr(null);
  const handleSubmit = async (values) => setValues(values);

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
          return (model.style.backgroundColor = '#EDF2F7');
        }
        model.style.backgroundColor = '#FFF';
      });
    });
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

  const sortTableData = () => setIsSorted((prev) => !prev);

  const consolidateTableData = () => {
    if (!modelId) return;
    const consolidatedTableData = [];
    const filteredTableData = modelsStore?.output?.filter((model) => model.id === modelId);

    const tableData = JSON.parse(filteredTableData[0]?.data);
    const labels = Object.entries(tableData[0]);
    const coefs = Object.entries(tableData.Coefs);

    consolidatedTableData.push(...labels.map((label, i) => [...label, coefs[i]?.[1]]));
    // if sort exists, sort coefs descendingly
    if (isSorted) return consolidatedTableData.sort((a, b) => b[2] - a[2]);
    return consolidatedTableData;
  };
  const consolidatedTableData = consolidateTableData();

  console.log(integrationsStore);
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
              maxWidth={isEqualToOrLessThan450[0] ? '20rem' : ''}
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
                width="100%"
              >
                {hasEmptyModelCollection && (
                  <>
                    <Flex flexFlow="column" justifyContent={isEqualToOrLessThan800[0] ? 'center' : 'start'}>
                      <Heading as="h4" size="md">
                        You currently have {modelsStore?.output?.length ?? 0} model outputs to view.
                      </Heading>
                      <Flex fontSize="14px" fontWeight="600" marginTop="1rem">
                        If you'd like to generate a new model, please select the Generate Model button below and provide
                        a unique name for your model.
                      </Flex>

                      {!integrationsStore?.[FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME] ? (
                        <Tooltip
                          label="You currently do not have any integrations. To generate a model, you must have at least one integration."
                          fontSize="sm"
                        >
                          <Button
                            disabled={!integrationsStore?.[FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME]}
                            _hover={{
                              textDecoration: 'none',
                            }}
                            colorScheme="brand"
                            margin={isEqualToOrLessThan800[0] ? '.5rem 0' : '1rem 0'}
                            width="20rem"
                          >
                            Generate Model
                          </Button>
                        </Tooltip>
                      ) : (
                        <Button
                          onClick={onOpen}
                          _hover={{
                            opacity: '.8',
                            textDecoration: 'none',
                          }}
                          colorScheme="brand"
                          margin={isEqualToOrLessThan800[0] ? '.5rem 0' : '1rem 0'}
                          width="20rem"
                        >
                          Generate Model
                        </Button>
                      )}
                    </Flex>
                    <Modal scrollBehavior={'inside'} size={'xl'} isOpen={isOpen} onClose={onClose}>
                      <ModalOverlay />
                      <ModalContent>
                        <ModalHeader textAlign="center" margin="1rem 0 0">
                          New Model
                          <Heading as="h6" size="xs">
                            Please provide a name for your model.
                          </Heading>
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                          <Flex flexDirection="column">
                            {hasModelCreationErr && (
                              <Alert margin="1rem 0" status="error">
                                <AlertIcon />
                                {errorMap.get(hasModelCreationErr)}
                                <CloseButton onClick={handleCloseBtnClick} position="absolute" right="8px" top="8px" />
                              </Alert>
                            )}
                            <Formik
                              initialValues={{
                                name: '',
                              }}
                              validationSchema={LoginSchema}
                              onSubmit={handleSubmit}
                            >
                              {({ errors, touched }) => (
                                <Form width="330px">
                                  <FormControl className="form-floating" isInvalid={errors.name && touched.name}>
                                    <FormLabel fontSize="16px" marginTop="10px" htmlFor="name">
                                      Name
                                    </FormLabel>
                                    <Field
                                      style={{ height: 'calc(2.5rem + 2px' }}
                                      className="form-control"
                                      name="name"
                                      type="text"
                                      placeholder="Name"
                                    />
                                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                                  </FormControl>
                                  <Button
                                    disabled={isModelCreationLoading}
                                    _hover={{
                                      opacity: '.8',
                                    }}
                                    _focus={{
                                      outline: 0,
                                      boxShadow: 'none',
                                    }}
                                    mt={4}
                                    color="#fff"
                                    backgroundColor="#635bff"
                                    type="submit"
                                    fontSize="16px"
                                  >
                                    Run Model
                                  </Button>
                                </Form>
                              )}
                            </Formik>
                          </Flex>
                        </ModalBody>

                        <ModalFooter
                          flexDir={isEqualToOrLessThan450[0] ? 'column' : 'row'}
                          justifyContent="space-evenly"
                        ></ModalFooter>
                      </ModalContent>
                    </Modal>
                  </>
                )}

                {!hasEmptyModelCollection && !consolidatedTableData && (
                  <Flex justifyContent={isEqualToOrLessThan450[0] ? 'center' : 'start'}>
                    Please select a model from the dropdown to view your data.
                  </Flex>
                )}
                {!hasEmptyModelCollection && (
                  <Flex
                    flexDir={isEqualToOrLessThan800[0] ? 'column' : 'row'}
                    columnGap="1rem"
                    justifyContent={isEqualToOrLessThan800[0] ? 'center' : ''}
                  >
                    <Menu onOpen={setMenuListStyles}>
                      <MenuButton
                        _hover={{
                          opacity: '.8',
                          textDecoration: 'none',
                        }}
                        colorScheme="brand"
                        margin={isEqualToOrLessThan800[0] ? '.5rem 0' : '1rem 0'}
                        minWidth={isEqualToOrLessThan800[0] ? '0' : '20rem'}
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
                      >
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
                                        _hover={{
                                          backgroundColor: '#EDF2F7 !important',
                                        }}
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
                    {consolidatedTableData && (
                      <Button
                        onClick={() => setModelId(null)}
                        _hover={{
                          opacity: '.8',
                        }}
                        minWidth={isEqualToOrLessThan800[0] ? '0' : '11rem'}
                        border="1px solid #ece9e9"
                        backgroundColor="#dadada"
                        margin={isEqualToOrLessThan800[0] ? '.5rem 0' : '1rem 0'}
                      >
                        Clear Model
                      </Button>
                    )}
                  </Flex>
                )}

                {!hasEmptyModelCollection && consolidatedTableData && (
                  <>
                    <TableContainer>
                      <Table marginTop="2rem" variant="simple">
                        <TableCaption>Model output for ad account: {integrationId}</TableCaption>
                        <Thead>
                          <Tr>
                            <Th>Labels</Th>
                            <Th onClick={() => {}} isNumeric>
                              <Flex cursor="pointer" justifyContent="end" alignItems="center" onClick={sortTableData}>
                                Coefs
                                <ChevronDownIcon w={4} h={4} />
                              </Flex>
                            </Th>
                          </Tr>
                        </Thead>
                        {!hasEmptyModelCollection && <Tbody>{renderTable(consolidatedTableData)}</Tbody>}
                        <Tfoot>
                          <Tr>
                            <Th>Labels</Th>
                            <Th isNumeric>Coefs</Th>
                          </Tr>
                        </Tfoot>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </Box>
            </Flex>
          </Flex>
        </Box>
      </section>
    </>
  );
};
