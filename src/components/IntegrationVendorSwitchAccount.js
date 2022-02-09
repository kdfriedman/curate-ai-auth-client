import { Button, Text } from '@chakra-ui/react';

export const IntegrationVendorSwitchAccount = ({
  isLoading,
  integrationVendorSwitchAccountHandler,
  setIntegrationActiveStatus,
}) => {
  const handleIntegrationVendorSwitchAccount = () => {
    integrationVendorSwitchAccountHandler();
    // activate integration status to render integration components
    setIntegrationActiveStatus(true);
  };
  return (
    <>
      <Text fontWeight="500" fontSize="13px" color="rgb(26, 32, 44)" textAlign="center" marginTop="1rem">
        Add a new ad account.
      </Text>
      <Button
        disabled={isLoading}
        onClick={handleIntegrationVendorSwitchAccount}
        _hover={{
          opacity: '.8',
          textDecoration: 'none',
        }}
        color="#fff"
        height="40px"
        backgroundColor="#635bff"
        marginTop="7px"
        width="10rem"
        alignSelf="center"
      >
        Add Account
      </Button>
    </>
  );
};
