import { Flex, CircularProgress } from '@chakra-ui/react';

export const Loader = ({ isLoading, loadingMessage }) => {
  return (
    <>
      {isLoading && <Flex className="loading__message">{loadingMessage}</Flex>}
      {isLoading && (
        <CircularProgress
          className="loading__spinner"
          minHeight="100vh"
          display="flex"
          justifyContent="center"
          alignItems="center"
          isIndeterminate
          color="#635bff"
        />
      )}
    </>
  );
};
