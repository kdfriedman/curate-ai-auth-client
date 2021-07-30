import { Flex, Heading } from '@chakra-ui/react';
import FacebookAppIntegration from '../components/FacebookIntegration';

export const DashboardPage = () => {
  return (
    <Flex className="dashboard__container">
      <Heading margin="1rem 0" as="h2" size="xl">
        Welcome to the dashboard page
      </Heading>
      <FacebookAppIntegration />
    </Flex>
  );
};
