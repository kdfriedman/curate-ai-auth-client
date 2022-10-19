import { Box, useMediaQuery } from '@chakra-ui/react';
export const IntegrationVendor = ({ vendor }) => {
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');

  return (
    <Box
      className="dashboard__integration-dashboard-vendor"
      padding={isEqualToOrLessThan800[0] ? '1rem 1rem 0 1rem' : '2rem 0 0 2rem'}
      fontSize="16px"
      color="#6c757d"
      fontWeight="800"
      textAlign={isEqualToOrLessThan800[0] ? 'center' : 'left'}
    >
      {vendor}
    </Box>
  );
};
