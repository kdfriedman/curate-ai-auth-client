import { Button, Text } from '@chakra-ui/react';

export const IntegrationVendorSwitchAccount = ({
  setLoading,
  authenticateWithVendor,
  setIntegrationActiveStatus,
  content,
  isDisabled,
}) => {
  const handleVendorAuth = async (authenticateWithVendor, setLoading, setIntegrationActiveStatus) => {
    setLoading(true);
    try {
      await authenticateWithVendor();
      // activate integration status to render integration components
      setIntegrationActiveStatus(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };
  return (
    <>
      <Text fontWeight="500" fontSize="13px" color="rgb(26, 32, 44)" textAlign="center" marginTop="1rem">
        Add a new ad account.
      </Text>
      <Button
        disabled={isDisabled}
        onClick={async () => await handleVendorAuth(authenticateWithVendor, setLoading, setIntegrationActiveStatus)}
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
        {content.cta}
      </Button>
    </>
  );
};
