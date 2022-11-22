import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';

export const ModelTabs = ({
  hasNoIntegrations,
  hasEmptyModelCollection,
  modelCreationCard,
  modelCreationModal,
  modelMenuSelect,
  modelTable,
  modelBanner,
  isModelLoading,
}) => {
  return (
    <Tabs isFitted variant="enclosed">
      <TabList mb="2em">
        <Tab
          pt="1rem"
          fontWeight="700"
          fontSize="1.25rem"
          lineHeight="1.2"
          color="rgb(26, 32, 44) !important"
          isDisabled={hasNoIntegrations}
        >
          Create Models
        </Tab>
        <Tab
          pt="1rem"
          fontWeight="700"
          fontSize="1.25rem"
          lineHeight="1.2"
          color="rgb(26, 32, 44) !important"
          isDisabled={hasEmptyModelCollection}
        >
          Completed Models
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          {isModelLoading && <>{modelBanner}</>}
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
