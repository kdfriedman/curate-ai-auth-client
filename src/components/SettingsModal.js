import { useState } from 'react';
import firestoreHandlers from '../services/firebase/data/firestore';
import { useAuth } from '../contexts/AuthContext';
import { FIREBASE } from '../services/firebase/constants';
import {
  Flex,
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
  Tooltip,
  Heading,
  useMediaQuery,
} from '@chakra-ui/react';
import { MdInfo } from 'react-icons/md';
import { useRefreshFacebookCampaignData } from '../hooks/useRefreshFacebookCampaignData';

export const SettingsModal = ({ isOpen, onClose, dbRecord, id, setIntegrationRecord, Loading }) => {
  const { handleRefreshFacebookCampaignData } = useRefreshFacebookCampaignData();
  const isEqualToOrGreaterThan870 = useMediaQuery('(min-width: 870px)');
  const isEqualToOrLessThan500 = useMediaQuery('(max-width: 500px)');
  const isEqualToOrLessThan400 = useMediaQuery('(max-width: 400px)');

  // upack firestore handlers
  const { addListOfRecordsToFirestore, removeRecordFromFirestore } = firestoreHandlers;
  // unpack auth context handlers
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const { adAccountId, adCampaignList, businessAcctId, businessAcctName } = dbRecord;
  const campaignStatuses = adCampaignList.map((campaign) => ({ isActive: campaign.isActive, id: campaign.id }));
  // set campaign status state (isActive checkbox)
  const [campaignStatus, setCampaignStatus] = useState(campaignStatuses);
  const allChecked = campaignStatus.every((campaignStatus) => campaignStatus.isActive);
  const isIndeterminate = campaignStatus.some((campaignStatus) => campaignStatus.isActive) && !allChecked;

  const generateUpdatedCampaignData = (dbRecord) => {
    // create deep clone to prevent unintentional isActive getting set on array of objects orignal state
    const deepCloneAdCampaignList = JSON.parse(JSON.stringify(dbRecord.adCampaignList));
    const updatedAdCampaignList = deepCloneAdCampaignList.map((campaign) => {
      // check if campaign status has changed for each campaign
      const hasUpdatedCampaign = campaignStatus.find((campaignObj) => campaignObj.id === campaign.id);
      // if campaign has associated change stored in state, update record with new state
      if (hasUpdatedCampaign) {
        campaign.isActive = hasUpdatedCampaign.isActive;
      }
      return campaign;
    });
    return updatedAdCampaignList;
  };

  const hasUpdatedCampaignDiff = (updatedAdCampaignList) => {
    // diffing function to only update db if changes exist between adCampaignLists
    const diffOfAdCampaignList = dbRecord.adCampaignList.filter((campaign, i) => {
      // loop through both arrays and compare the isActive property as type strings
      return updatedAdCampaignList[i].isActive.toString() !== campaign.isActive.toString();
    });
    return diffOfAdCampaignList;
  };

  const updateFirestoreWithCampaignDiffs = async (dbRecord) => {
    // update db with new updated db record
    const [, removedRecordError] = await removeRecordFromFirestore(
      [
        FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS[0],
        currentUser.uid,
        FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS[1],
        FIREBASE.FIRESTORE.FACEBOOK.DOCS[0],
      ],
      FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME,
      dbRecord.businessAcctId,
      FIREBASE.FIRESTORE.FACEBOOK.KEY_TO_USE_FOR_REMOVAL
    );
    if (removedRecordError) throw removedRecordError;

    const [, addedRecordError] = await addListOfRecordsToFirestore(
      [
        FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS[0],
        currentUser.uid,
        FIREBASE.FIRESTORE.FACEBOOK.COLLECTIONS[1],
        FIREBASE.FIRESTORE.FACEBOOK.DOCS[0],
      ],
      dbRecord,
      FIREBASE.FIRESTORE.FACEBOOK.PAYLOAD_NAME
    );
    if (addedRecordError) throw addedRecordError;
  };

  const saveModalSettings = async (dbRecord) => {
    const updatedAdCampaignList = generateUpdatedCampaignData(dbRecord);
    const diffOfAdCampaignList = hasUpdatedCampaignDiff(updatedAdCampaignList);

    //update db record with updated campaign list
    if (diffOfAdCampaignList.length > 0) {
      dbRecord.adCampaignList = updatedAdCampaignList;
    }
    await updateFirestoreWithCampaignDiffs(dbRecord);
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
    setCampaignStatus(updatedCampaignStatuses);
  };

  const onCloseModal = () => {
    setCampaignStatus(campaignStatuses);
    onClose();
  };

  return (
    <>
      {id === businessAcctId && (
        <Modal scrollBehavior={'inside'} size={'xl'} isOpen={isOpen} onClose={onCloseModal}>
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
              {loading && (
                <Loading
                  className="loading__spinner"
                  minHeight="18rem"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  isIndeterminate
                  color="#635bff"
                />
              )}
              {!loading && (
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
                      <Th minWidth={isEqualToOrGreaterThan870[0] ? false : '10rem'}>Campaign Flight</Th>
                      <Th>Active Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {adCampaignList.map((campaign) => {
                      return (
                        <Tr data-campaign-id={campaign.id} key={campaign.id}>
                          <Td>
                            <Checkbox
                              isChecked={
                                campaignStatus.find((campaignStatus) => campaignStatus.id === campaign.id).isActive
                              }
                              onChange={activateAdCampaign}
                              colorScheme="brand"
                              defaultChecked={campaign.isActive ? true : false}
                            />
                          </Td>
                          <Td>{campaign.id}</Td>
                          <Td>{campaign.name}</Td>
                          <Td>{campaign.flight}</Td>
                          <Td>{campaign.isActive ? 'ON' : 'OFF'}</Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              )}
            </ModalBody>

            <ModalFooter
              flexDir={isEqualToOrLessThan500[0] ? 'column' : 'row'}
              className="settings-modal__footer"
              justifyContent="space-evenly"
            >
              <Flex marginBottom="1rem" className="settings-modal__btn-wrapper">
                <Button
                  onClick={async () => {
                    setLoading(true);
                    // pass in db prop
                    await saveModalSettings(dbRecord);
                    // close modal after saving
                    setLoading(false);
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
                <Button
                  _hover={{
                    opacity: '.8',
                  }}
                  border="1px solid #ece9e9"
                  backgroundColor="#dadada"
                  ml={3}
                  onClick={onCloseModal}
                >
                  Close
                </Button>
              </Flex>
              <Flex marginBottom="1rem" className="settings-modal__btn-wrapper" alignItems="center">
                {/* Tooltip - sync data information*/}
                <Tooltip
                  label="When selected, the 'Refresh Data' feature will connect with Facebook and retrieve the latest campaign data in your Facebook advertising account. Select this option only if you know that your Facebook campaign data needs to be refreshed."
                  fontSize="sm"
                >
                  <span className="settings-modal__tooltip-wrapper">
                    <MdInfo />
                  </span>
                </Tooltip>
                <Button
                  className="settings-modal__refresh-btn"
                  onClick={async () => {
                    // update fb campaign data here
                    await handleRefreshFacebookCampaignData(dbRecord, setIntegrationRecord, setLoading);
                  }}
                  _hover={{
                    opacity: '.8',
                  }}
                  backgroundColor="#635bff"
                  color="#fff"
                  variant="ghost"
                  marginLeft="12px"
                >
                  Refresh Data
                </Button>
              </Flex>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};
