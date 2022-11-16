import { Flex, Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption, TableContainer } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

export const ModelTable = ({
  hasEmptyModelCollection,
  consolidatedTableData,
  integrationId,
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
          <Td isNumeric>{coef}</Td>
        </Tr>
      );
    });
  };

  const sortTableData = () => setIsSorted((prev) => !prev);

  return (
    <>
      {!hasEmptyModelCollection && consolidatedTableData && (
        <>
          <TableContainer>
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
