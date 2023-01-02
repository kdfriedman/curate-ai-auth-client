import { Flex, Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption, TableContainer } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { FIREBASE } from '../../services/firebase/constants';

export const ModelTable = ({
  hasEmptyModelCollection,
  consolidatedTableData,
  modelId,
  integrationId,
  modelsStore,
  integrationsStore,
  setIsSorted,
  tableHeaders = [],
  tableCaption,
}) => {
  const [headerOne, headerTwo] = tableHeaders;
  const renderTable = (tableData) => {
    if (!tableData) return;
    return tableData?.map((data) => {
      const [index, label, coef] = data;
      return (
        <Tr key={index}>
          <Td>{label}</Td>
          <Td isNumeric>{Math.round(coef)}</Td>
        </Tr>
      );
    });
  };

  const sortTableData = () => setIsSorted((prev) => !prev);
  const displayedModel = modelsStore?.[FIREBASE.FIRESTORE.MODELS.PAYLOAD_NAME].find((model) => model.id === modelId);
  const displayedModelObjectiveType =
    displayedModel?.campaigns?.find((campaign) => campaign.objective)?.objective || null;

  return (
    <>
      {!hasEmptyModelCollection && consolidatedTableData && (
        <>
          <TableContainer>
            <Flex flexDir="column" mt="2rem">
              <Flex>
                <span>AD ACCOUNT:&nbsp;</span>
                <span style={{ fontWeight: '500' }}>{integrationId || 'N/A'}</span>
              </Flex>
              <Flex>
                <span>MODEL NAME:&nbsp;</span>
                <span style={{ fontWeight: '500' }}>{displayedModel?.name || 'N/A'}</span>
              </Flex>
              <Flex>
                <span>OBJECTIVE:&nbsp;</span>
                <span style={{ fontWeight: '500' }}>{displayedModelObjectiveType || 'N/A'}</span>
              </Flex>
              {Array.isArray(displayedModel.campaigns) && (
                <Flex flexFlow="column">
                  <span>AD CAMPAIGN LIST:</span>
                  <ul style={{ listStyle: 'none', fontWeight: '500' }}>
                    {displayedModel.campaigns.map((model) => (
                      <li key={model.id}>
                        {model?.name || 'N/A'} | {model?.id || 'N/A'} | {model?.flight || 'N/A'}
                      </li>
                    ))}
                  </ul>
                </Flex>
              )}
            </Flex>
            <Table marginTop="2rem" variant="simple">
              <TableCaption>{tableCaption}</TableCaption>
              <Thead>
                <Tr>
                  <Th>{headerOne}</Th>
                  <Th onClick={() => {}} isNumeric>
                    <Flex cursor="pointer" justifyContent="end" alignItems="center" onClick={sortTableData}>
                      {headerTwo}
                      <ChevronDownIcon w={4} h={4} />
                    </Flex>
                  </Th>
                </Tr>
              </Thead>
              {!hasEmptyModelCollection && <Tbody>{renderTable(consolidatedTableData)}</Tbody>}
              <Tfoot>
                <Tr>
                  <Th>{headerOne}</Th>
                  <Th isNumeric>{headerTwo}</Th>
                </Tr>
              </Tfoot>
            </Table>
          </TableContainer>
        </>
      )}
    </>
  );
};
