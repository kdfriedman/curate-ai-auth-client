import { Flex, Box, useMediaQuery } from '@chakra-ui/react';

export const IntegrationDashboard = ({ children }) => {
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');

  return (
    <Box
      gridColumn={isEqualToOrLessThan800[0] ? '1 / span 4' : '3'}
      gridRow={isEqualToOrLessThan800[0] ? '1' : '1 / span 3'}
      className="integrations__dashboard"
      paddingBottom="2rem"
      marginBottom={isEqualToOrLessThan800[0] ? '0' : '.5rem'}
    >
      <Flex
        boxShadow="0 0.125rem 0.25rem rgb(0 0 0 / 8%)"
        padding="2rem"
        fontSize="18px"
        color="rgb(26, 32, 44)"
        fontWeight="800"
        textTransform="uppercase"
        letterSpacing=".2em"
        className="integrations__dashboard-header"
        justifyContent={isEqualToOrLessThan800[0] ? 'center' : ''}
      >
        App Integrations
      </Flex>
      <Flex flexDirection="column" className="integrations__dashboard-body">
        {children}
      </Flex>
    </Box>
  );
};
