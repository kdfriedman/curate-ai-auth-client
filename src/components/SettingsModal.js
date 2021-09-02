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
  const isEqualToOrGreaterThan750 = useMediaQuery('(min-width: 750px)');

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
          <ModalContent minWidth="40rem" maxHeight="30rem">
            <ModalHeader textAlign="center" margin="1rem 0 0">
              Facebook Business Account | {businessAcctName}
              <Heading as="h6" size="xs">
                Facebook Ad Account | {adAccountId}
              </Heading>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {isEqualToOrGreaterThan750[0] && (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Campaign ID</Th>
                      <Th>Campaign Name</Th>
                      <Th>Campaign Flight</Th>
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
              )}
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
