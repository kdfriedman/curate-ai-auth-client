import {
  Box,
  Text,
  Flex,
  useMediaQuery,
  Card,
  CardHeader,
  CardBody,
  StackDivider,
  Stack,
  Heading,
} from '@chakra-ui/react';

export const IntegrationVendorCard = ({ record, children }) => {
  const isEqualToOrLessThan450 = useMediaQuery('(max-width: 450px)');
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');
  const isEqualToOrLessThan950 = useMediaQuery('(max-width: 950px)');
  return (
    <Flex
      key={record.id}
      id={record.businessAcctId}
      flexDir={isEqualToOrLessThan950[0] ? 'column' : 'row'}
      maxWidth={isEqualToOrLessThan450[0] ? '20rem' : '750px'}
      className="integrations__vendor-card-container"
      margin="1rem 2rem"
      borderRadius="10px"
      border="1px solid #f0f0f0"
      alignItems="center"
      justifyContent="space-between"
      data-vendor-card-id
    >
      <Card minWidth="50%">
        <CardHeader>
          <Heading size="md">Business Account</Heading>
        </CardHeader>
        <CardBody>
          <Stack divider={<StackDivider />} spacing="4">
            <Box>
              <Heading size="xs" textTransform="uppercase">
                Account Name
              </Heading>
              <Text pt="2" fontSize="sm" key={`business-account-${record.id}`}>
                <span style={{ fontWeight: '500' }}>{record.businessAcctName ?? 'N/A'}</span>
              </Text>
            </Box>
            <Box>
              <Heading size="xs" textTransform="uppercase">
                Business Id
              </Heading>
              <Text pt="2" fontSize="sm" key={`business-id-${record.id}`}>
                <span style={{ fontWeight: '500' }}>{record.businessAcctId ?? 'N/A'}</span>
              </Text>
            </Box>
            <Box>
              <Heading size="xs" textTransform="uppercase">
                Ad Account Id
              </Heading>
              <Text pt="2" fontSize="sm" key={`ad-account-id-${record.id}`}>
                <span style={{ fontWeight: '500' }}>{record.adAccountId ?? 'N/A'}</span>
              </Text>
            </Box>
          </Stack>
        </CardBody>
      </Card>
      {children}
    </Flex>
  );
};
