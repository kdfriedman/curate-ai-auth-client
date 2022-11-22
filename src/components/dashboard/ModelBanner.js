import { Alert, AlertIcon, Box, AlertTitle, AlertDescription } from '@chakra-ui/react';

export const ModelBanner = () => {
  return (
    <Alert marginBottom="2rem" status="info">
      <AlertIcon />
      <Box>
        <AlertTitle fontSize="16px">Model Processing</AlertTitle>
        <AlertDescription fontWeight="400" fontSize="16px">
          Your model is currently processing. We will notify you via email once it has completed and is ready for
          viewing.
        </AlertDescription>
      </Box>
    </Alert>
  );
};
