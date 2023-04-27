import { Flex, CircularProgress } from '@chakra-ui/react';

export const Loader = ({ isLoading, loadingMessage, minHeight = '100vh' }) => {
  return (
    <>
      {isLoading && (
        <Flex className="loading__message" flexDir="column">
          <Flex marginTop="1.5rem" justifyContent="center">
            {loadingMessage}
          </Flex>
        </Flex>
      )}
    </>
  );
};
