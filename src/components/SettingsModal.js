import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Table,
  Thead,
  Tbody,
  Checkbox,
  Tr,
  Th,
  Td,
  Heading,
  useMediaQuery,
} from '@chakra-ui/react';

export const SettingsModal = ({ isOpen, onClose, dbRecord, id }) => {
  const isEqualToOrGreaterThan870 = useMediaQuery('(min-width: 870px)');
  const isEqualToOrLessThan400 = useMediaQuery('(max-width: 400px)');

  const { adAccountId, adCampaignList, businessAcctId, businessAcctName } =
    dbRecord;
  return (
    <>
      {id === businessAcctId && (
        <Modal
          scrollBehavior={'inside'}
          size={'xl'}
          isOpen={isOpen}
          onClose={onClose}
        >
          <ModalOverlay />
          <ModalContent
            minWidth={isEqualToOrGreaterThan870[0] ? '53rem' : false}
            maxWidth={isEqualToOrLessThan400[0] ? '21rem' : '36rem'}
            maxHeight="30rem"
          >
            <ModalHeader textAlign="center" margin="1rem 0 0">
              {businessAcctName}
              <Heading as="h6" size="xs">
                Ad Account | {adAccountId}
              </Heading>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Campaign ID</Th>
                    <Th>Campaign Name</Th>
                    <Th
                      minWidth={isEqualToOrGreaterThan870[0] ? false : '10rem'}
                    >
                      Campaign Flight
                    </Th>
                    <Th>Active Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {adCampaignList.map((campaign) => {
                    return (
                      <Tr key={campaign.id}>
                        <Td>{campaign.id}</Td>
                        <Td>{campaign.name}</Td>
                        <Td>{campaign.flight}</Td>
                        <Td>
                          <Checkbox />
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </ModalBody>

            <ModalFooter ml={'auto'} mr={'auto'}>
              <Button
                border="1px solid #ece9e9"
                backgroundColor="#dadada"
                mr={3}
                onClick={onClose}
              >
                Close
              </Button>
              <Button backgroundColor="#635bff" color="#fff" variant="ghost">
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};
