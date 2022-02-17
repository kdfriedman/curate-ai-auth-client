import { Button } from '@chakra-ui/react';

export const IntegrationVendorLoginButton = ({
  integrationRecord,
  isLoading,
  integrationVendorLoginHandler,
  IntegrationVendorIcon,
  integrationVendorLoginCTA,
}) => {
  return (
    <>
      {!integrationRecord && (
        <Button
          disabled={isLoading}
          onClick={async () => await integrationVendorLoginHandler()}
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
            {integrationVendorLoginCTA}
          </span>
        </Button>
      )}
    </>
  );
};
