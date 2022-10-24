import { Box, Text, Flex, useMediaQuery } from '@chakra-ui/react';

export const IntegrationVendorCard = ({ record, children }) => {
  const isEqualToOrLessThan450 = useMediaQuery('(max-width: 450px)');
  const isEqualToOrLessThan950 = useMediaQuery('(max-width: 950px)');
  return (
    <Flex
      key={record.id}
      id={record.businessAcctId}
      flexDir={isEqualToOrLessThan950[0] ? 'column' : 'row'}
      maxWidth={isEqualToOrLessThan450[0] ? '20rem' : '750px'}
      className="integrations__vendor-card-container"
      boxShadow="0 0.5rem 1rem rgb(0 0 0 / 15%)"
      margin="1rem 2rem"
      borderRadius="10px"
      border="1px solid #f0f0f0"
      alignItems="center"
      justifyContent="space-between"
      data-vendor-card-id
    >
      <Box
        className="integrations__vendor-card"
        key={`vendor-card-${record.id}`}
        fontWeight="800"
        fontSize="14px"
        color="rgb(26, 32, 44)"
        minWidth={isEqualToOrLessThan450[0] ? 0 : '25rem'}
        padding="1rem 2rem"
      >
        <Text key={`user-email-${record.id}`}>
          User Email: <span style={{ fontWeight: '500' }}>{record.email ?? 'N/A'}</span>
        </Text>
        <Text key={`business-account-${record.id}`}>
          Business Account Name: <span style={{ fontWeight: '500' }}>{record.businessAcctName ?? 'N/A'}</span>
        </Text>
        <Text key={`business-id-${record.id}`}>
          Business Account Id: <span style={{ fontWeight: '500' }}>{record.businessAcctId ?? 'N/A'}</span>
        </Text>
        <Text key={`ad-account-id-${record.id}`}>
          Ad Account Id: <span style={{ fontWeight: '500' }}>{record.adAccountId ?? 'N/A'}</span>
        </Text>
      </Box>
      {children}
    </Flex>
  );
};
