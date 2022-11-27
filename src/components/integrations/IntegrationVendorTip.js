import { Box, useMediaQuery } from '@chakra-ui/react';

export const IntegrationVendorTip = ({ vendorTipMessage }) => {
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');

  return (
    <Box
      className="integrations__dashboard-tip"
      fontSize="13px"
      fontWeight="500"
      color="rgb(26, 32, 44)"
      padding={isEqualToOrLessThan800[0] ? '1rem 1rem 0 1rem' : '.5rem 0 0 2rem'}
      textAlign={isEqualToOrLessThan800[0] ? 'center' : 'left'}
    >
      <span
        style={{
          fontSize: '13px',
          fontWeight: '800',
          color: 'rgb(26, 32, 44)',
        }}
      >
        Tip:{' '}
      </span>
      {vendorTipMessage}
    </Box>
  );
};
