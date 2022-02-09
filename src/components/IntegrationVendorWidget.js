import { Flex, Box, Text, useMediaQuery } from '@chakra-ui/react';

export const IntegrationVendorWidget = ({
  integrationRecord,
  setIntegrationActiveStatus,
  integrationVendorInfo,
  IntegrationVendorLoginButton,
  integrationVendorLoginHandler,
  integrationVendorLoginCTA,
  IntegrationVendorSwitchAccount,
  integrationVendorSwitchAccountHandler,
  IntegrationVendorIcon,
  isLoading,
}) => {
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');
  return (
    <>
      <Box
        gridColumn={isEqualToOrLessThan800[0] ? '1 / span 3' : '1 / span 2'}
        gridRow={isEqualToOrLessThan800[0] ? 2 : ''}
        className="integration-widget"
        display="flex"
        maxHeight={!integrationRecord ? '12rem' : '14rem'}
        minHeight={!integrationRecord ? 0 : '14rem'}
        background="#fff"
        boxShadow="0 0.5rem 1rem rgb(0 0 0 / 15%)"
        borderRadius="10px"
        height="100%"
        flexDirection="column"
      >
        <Text
          className="integration-info"
          fontWeight="800"
          fontSize="14px"
          color="rgb(26, 32, 44)"
          padding="10px"
          margin="0.5rem 1rem"
          textAlign="center"
        >
          {integrationVendorInfo}
        </Text>
        <Flex className="integration-status-container" flexDirection="row" justifyContent="center" alignItems="center">
          <Box
            className="integration-status-indicator"
            h="10px"
            w="10px"
            borderRadius="50%"
            backgroundColor={!integrationRecord ? '#dc3545' : '#35b653'}
          />
          <Text
            display="flex"
            flexDir="column"
            className="integration-status-text"
            color="#6c757d"
            fontWeight="800"
            fontSize="12px"
            padding="10px"
          >
            Status: {!integrationRecord ? 'Inactive' : 'Active'}
          </Text>
        </Flex>
        {!integrationRecord && (
          <IntegrationVendorLoginButton
            integrationRecord={integrationRecord}
            integrationVendorLoginHandler={integrationVendorLoginHandler}
            integrationVendorLoginCTA={integrationVendorLoginCTA}
            IntegrationVendorIcon={IntegrationVendorIcon}
            isLoading={isLoading}
          />
        )}
        {integrationRecord && (
          <IntegrationVendorSwitchAccount
            isLoading={isLoading}
            integrationVendorSwitchAccountHandler={integrationVendorSwitchAccountHandler}
            setIntegrationActiveStatus={setIntegrationActiveStatus}
          />
        )}
      </Box>
    </>
  );
};
