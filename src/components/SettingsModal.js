import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from '@chakra-ui/react';

export const SettingsModal = ({ isOpen, onClose, dbRecord }) => {
  const { adAccountId, adCampaignList, businessAcctId, businessAcctName } =
    dbRecord[0];
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Facebook Business Account: {businessAcctName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>Facebook Ad Account: {adAccountId}</ModalBody>

          <ModalFooter>
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
    </>
  );
};
