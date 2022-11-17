import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';

export const ModelTabs = ({
  hasNoIntegrations,
  hasEmptyModelCollection,
  modelCreationCard,
  modelCreationModal,
  modelMenuSelect,
  modelTable,
}) => {
  return (
    <Tabs isFitted variant="enclosed">
      <TabList mb="1em">
        <Tab isDisabled={hasNoIntegrations}>Create Models</Tab>
        <Tab isDisabled={hasEmptyModelCollection}>Completed Models</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          {modelCreationCard}
          {!hasNoIntegrations && <>{modelCreationModal}</>}
        </TabPanel>
        <TabPanel>
          {modelMenuSelect}
          {modelTable}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};
