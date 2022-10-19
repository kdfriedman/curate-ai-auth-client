import { Button } from '@chakra-ui/react';

export const IntegrationVendorLoginButton = ({
  setIntegrationActiveStatus,
  setLoading,
  authenticateWithVendor,
  IntegrationVendorIcon,
  content,
  isDisabled,
  setError,
}) => {
  const handleVendorAuth = async (authenticateWithVendor, setLoading, setIntegrationActiveStatus) => {
    setLoading(true);
    setError(false);
    try {
      await authenticateWithVendor();
      // activate integration status to render integration components
      setIntegrationActiveStatus(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError(true);
    }
  };
  return (
    <>
      <Button
        disabled={isDisabled}
        onClick={async () => await handleVendorAuth(authenticateWithVendor, setLoading, setIntegrationActiveStatus)}
        _hover={{
          opacity: '.8',
          textDecoration: 'none',
        }}
        color="#fff"
        height="40px"
        backgroundColor="#1877f2"
        marginTop="7px"
        marginBottom="1rem"
        width="14rem"
        alignSelf="center"
      >
        <IntegrationVendorIcon className="login-btn-icon" />{' '}
        <span style={{ margin: '0 0 0 10px', fontWeight: '800' }} className="dashboard__fb-login-btn-text">
          {content.cta}
        </span>
      </Button>
    </>
  );
};
