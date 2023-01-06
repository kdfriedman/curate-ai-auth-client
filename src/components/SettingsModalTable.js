import { Flex, Box, Table, Thead, Tbody, Checkbox, Tr, Th, Td } from '@chakra-ui/react';

export const SettingsModalTable = ({ adCampaignList, campaignStatus, setCampaignStatus, activeObjective }) => {
  const allChecked = campaignStatus.every((campaignStatus) => campaignStatus.isActive);
  const isIndeterminate = campaignStatus.some((campaignStatus) => campaignStatus.isActive) && !allChecked;

  // set isActive checkbox value and campaign id in local state
  const activateAdCampaign = (e) => {
    // get table row parent element
    const trElement = e.target.closest(['[data-campaign-id]']);
    // get campaign id from element to use for state update
    const campaignId = trElement.dataset.campaignId;

    // update campaign status list via state
    setCampaignStatus((campaignStatusList) => {
      const copiedCampaignStatusList = [...campaignStatusList];
      // if record already exists, replace isActive value only
      const hasExistingCampaignId = copiedCampaignStatusList.findIndex((campaign) => {
        return campaign.id === campaignId;
      });

      // if state contains existing campaign id, only update isActive property on existing record
      if (hasExistingCampaignId !== -1) {
        // update object
        copiedCampaignStatusList[hasExistingCampaignId].isActive = e.target.checked;
        return copiedCampaignStatusList;
      }

      // update state with new campaign record
      return [...campaignStatusList, { isActive: e.target.checked, id: campaignId }];
    });
  };

  const handleBulkActivateAdCampaign = (e) => {
    const updatedCampaignStatuses = campaignStatus.map((campaignStatus) => ({
      isActive: e.target.checked,
      id: campaignStatus.id,
    }));
    // set all campaigns in bulk
    setCampaignStatus(updatedCampaignStatuses);
  };

  return (
    <>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>
              <Checkbox
                onChange={handleBulkActivateAdCampaign}
                colorScheme="brand"
                isChecked={allChecked}
                isIndeterminate={isIndeterminate}
              />
            </Th>
            <Th>Campaign ID</Th>
            <Th>Campaign Name</Th>
            <Th width="10rem">Campaign Flight</Th>
            <Th>Active Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {adCampaignList.map((campaign) => {
            return (
              <Tr data-campaign-id={campaign.id} key={campaign.id}>
                <Td>
                  <Checkbox
                    isChecked={campaignStatus.find((campaignStatus) => campaignStatus.id === campaign.id).isActive}
                    onChange={activateAdCampaign}
                    colorScheme="brand"
                    defaultChecked={campaign.isActive ? true : false}
                  />
                </Td>
                <Td>{campaign.id}</Td>
                <Td>{campaign.name}</Td>
                <Td>{campaign.flight}</Td>
                <Td>
                  {campaign.isActive ? (
                    <>
                      <Flex
                        className="integration-status-container"
                        flexDirection="row"
                        justifyContent="start"
                        alignItems="center"
                        columnGap="6px"
                      >
                        <Box
                          className="integration-status-indicator"
                          h="10px"
                          w="10px"
                          borderRadius="50%"
                          backgroundColor="#35b653"
                        />
                        <Box>ACTIVE</Box>
                      </Flex>
                    </>
                  ) : (
                    <>
                      <Flex
                        className="integration-status-container"
                        flexDirection="row"
                        justifyContent="center"
                        alignItems="center"
                        columnGap="6px"
                      >
                        <Box
                          className="integration-status-indicator"
                          h="10px"
                          w="10px"
                          borderRadius="50%"
                          backgroundColor="#dc3545"
                        />
                        <Box>INACTIVE</Box>
                      </Flex>
                    </>
                  )}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </>
  );
};
