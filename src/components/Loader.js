import { Flex, CircularProgress } from '@chakra-ui/react';

export const Loader = ({ isLoading, loadingMessage, minHeight = '100vh' }) => {
  return (
    <>
      {isLoading && <Flex className="loading__message">{loadingMessage}</Flex>}
      {isLoading && (
        <CircularProgress
          className="loading__spinner"
          minHeight={minHeight}
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
