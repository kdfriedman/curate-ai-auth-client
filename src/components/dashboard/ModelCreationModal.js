import {
  useMediaQuery,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';

export const ModelCreationModal = ({ modalTitle, modalHeader, isOpen, onClose, children }) => {
  const isEqualToOrLessThan450 = useMediaQuery('(max-width: 450px)');

  return (
    <>
      <Modal scrollBehavior={'inside'} size={'xl'} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center" margin="1rem 0 0">
            {modalTitle}
            <Heading as="h6" size="xs">
              {modalHeader}
            </Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>{children}</ModalBody>
          <ModalFooter
            flexDir={isEqualToOrLessThan450[0] ? 'column' : 'row'}
            justifyContent="space-evenly"
          ></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
