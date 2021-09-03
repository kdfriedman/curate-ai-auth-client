import { useState } from 'react';
import firestoreHandlers from '../services/firebase/data/firestore';
import { useAuth } from '../contexts/AuthContext';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Table,
  Thead,
  Tbody,
  Checkbox,
  Tr,
  Th,
  Td,
  Heading,
  useMediaQuery,
} from '@chakra-ui/react';

export const SettingsModal = ({ isOpen, onClose, dbRecord, id }) => {
  const isEqualToOrGreaterThan870 = useMediaQuery('(min-width: 870px)');
  const isEqualToOrLessThan400 = useMediaQuery('(max-width: 400px)');

  // upack firestore handlers
  const { addRecordToFirestore, removeRecordFromFirestore } = firestoreHandlers;
  // unpack auth context handlers
  const { currentUser } = useAuth();

  // set campaign status state (isActive checkbox)
  const [campaignStatus, setCampaignStatus] = useState([]);

  const { adAccountId, adCampaignList, businessAcctId, businessAcctName } =
    dbRecord;

  const saveModalSettings = async (dbRecord) => {
    // create deep clone to prevent unintentional isActive getting set on array of objects orignal state
    const cloneAdCampaignList = JSON.parse(
      JSON.stringify(dbRecord.adCampaignList)
    );
    const updatedAdCampaignList = cloneAdCampaignList.map((campaign) => {
      // check if campaign status has changed for each campaign
      const hasUpdatedCampaign = campaignStatus.find(
        (campaignObj) => campaignObj.id === campaign.id
      );
      // if campaign has associated change stored in state, update record with new state
      if (hasUpdatedCampaign) {
        campaign.id = hasUpdatedCampaign.id;
        campaign.isActive = hasUpdatedCampaign.isActive;
      }
      return campaign;
    });

    // TODO: using diffing function to only update db if changes exist between adCampaignLists
    const diffOfAdCampaignList = dbRecord.adCampaignList.filter(
      (campaign, i) => {
        // loop through both arrays and compare the isActive property as type strings
        return (
          updatedAdCampaignList[i].isActive.toString() !==
          campaign.isActive.toString()
        );
      }
    );
    //update db record with updated campaign list
    if (diffOfAdCampaignList.length > 0) {
      console.log('diff exists, update firestore');
      dbRecord.adCampaignList = updatedAdCampaignList;
      // update db with new updated db record
      const removedRecord = await removeRecordFromFirestore(
        currentUser.uid,
        ['clients', 'integrations'],
        ['facebook'],
        'facebookBusinessAccts',
        dbRecord.businessAcctId
      );
      if (!removedRecord) {
        console.error({
          errMsg:
            'Err: failed to remove record from firestore, check SettingsModal for issues',
          errVar: removedRecord,
        });
      }
      await addRecordToFirestore(
        currentUser.uid,
        ['clients', 'integrations'],
        ['facebook'],
        dbRecord,
        'facebookBusinessAccts'
      );
    }
  };

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
      const hasExistingCampaignId = copiedCampaignStatusList.findIndex(
        (campaign) => {
          return campaign.id === campaignId;
        }
      );

      // if state contains existing campaign id, only update isActive property on existing record
      if (hasExistingCampaignId !== -1) {
        // update object
        copiedCampaignStatusList[hasExistingCampaignId].isActive =
          e.target.checked;
        return copiedCampaignStatusList;
      }

      // update state with new campaign record
      return [
        ...campaignStatusList,
        { isActive: e.target.checked, id: campaignId },
      ];
    });
  };

  return (
    <>
      {id === businessAcctId && (
        <Modal
          scrollBehavior={'inside'}
          size={'xl'}
          isOpen={isOpen}
          onClose={onClose}
        >
          <ModalOverlay />
          <ModalContent
            minWidth={isEqualToOrGreaterThan870[0] ? '53rem' : false}
            maxWidth={isEqualToOrLessThan400[0] ? '21rem' : '36rem'}
            maxHeight="30rem"
          >
            <ModalHeader textAlign="center" margin="1rem 0 0">
              {businessAcctName}
              <Heading as="h6" size="xs">
                Ad Account | {adAccountId}
              </Heading>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Campaign ID</Th>
                    <Th>Campaign Name</Th>
                    <Th
                      minWidth={isEqualToOrGreaterThan870[0] ? false : '10rem'}
                    >
                      Campaign Flight
                    </Th>
                    <Th>Active Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {adCampaignList.map((campaign) => {
                    return (
                      <Tr data-campaign-id={campaign.id} key={campaign.id}>
                        <Td>{campaign.id}</Td>
                        <Td>{campaign.name}</Td>
                        <Td>{campaign.flight}</Td>
                        <Td>
                          <Checkbox
                            onChange={activateAdCampaign}
                            colorScheme="brand"
                            defaultChecked={campaign.isActive ? true : false}
                          />
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </ModalBody>

            <ModalFooter ml={'auto'} mr={'auto'}>
              <Button
                _hover={{
                  opacity: '.8',
                }}
                border="1px solid #ece9e9"
                backgroundColor="#dadada"
                mr={3}
                onClick={onClose}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  // pass in db prop
                  saveModalSettings(dbRecord);
                  // close modal after saving
                  onClose();
                }}
                _hover={{
                  opacity: '.8',
                }}
                backgroundColor="#635bff"
                color="#fff"
                variant="ghost"
              >
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};
