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
  Tooltip,
  Heading,
  useMediaQuery,
} from '@chakra-ui/react';
import { SettingsModalWizard } from './SettingsModalWizard';
import { useShowWizardScreen } from '../hooks/useShowWizardScreen';
import { MdInfo } from 'react-icons/md';
import { useRefreshFacebookCampaignData } from '../hooks/useRefreshFacebookCampaignData';

export const SettingsModal = ({ isOpen, onClose, dbRecord, id, setIntegrationRecord, Loading }) => {
  const { handleRefreshFacebookCampaignData } = useRefreshFacebookCampaignData();
  const isEqualToOrGreaterThan870 = useMediaQuery('(min-width: 870px)');
  const isEqualToOrLessThan500 = useMediaQuery('(max-width: 500px)');
  const isEqualToOrLessThan400 = useMediaQuery('(max-width: 400px)');
  const { renderWizardScreen, setActiveWizardId, activeWizardId, WIZARD_ID_MAP } = useShowWizardScreen();
  // upack firestore handlers
  const { addListOfRecordsToFirestore, removeRecordFromFirestore } = firestoreHandlers;
  // unpack auth context handlers
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  // integration record data
  const { adAccountId, adCampaignList, businessAcctId, businessAcctName } = dbRecord;
  const campaignStatuses = adCampaignList.map((campaign) => ({ isActive: campaign.isActive, id: campaign.id }));
  // filter out unique objectives
  const objectives = adCampaignList
    .map((campaign) => ({ id: campaign.id, type: campaign.objective }))
    .filter((objective, i, arr) => arr.findIndex((obj) => obj.type === objective.type) === i);

  // set active campaign
  const [campaignStatus, setCampaignStatus] = useState(campaignStatuses);
  // set active objective
  const [activeObjective, setActiveObjective] = useState(null);

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
      await updateFirestoreWithCampaignDiffs(dbRecord);
    }
  };

  const onCloseModal = () => {
    // reset campaign checkbox state
    setCampaignStatus(campaignStatuses);
    // reset wizard state
    setActiveWizardId(WIZARD_ID_MAP.OBJECTIVE);
    // reset objective state
    setActiveObjective(null);
    onClose();
  };

  const resetWizardScreenState = () => {
    setCampaignStatus(campaignStatuses);
    setActiveObjective(null);
  };

  return (
    <>
      {id === businessAcctId && (
        <Modal scrollBehavior={'inside'} size={'xl'} isOpen={isOpen} onClose={onCloseModal}>
          <ModalOverlay />
          <ModalContent
            minWidth={isEqualToOrGreaterThan870[0] ? '56rem' : null}
            maxWidth={isEqualToOrLessThan400[0] ? '21rem' : isEqualToOrGreaterThan870[0] ? null : '36rem'}
            width="100%"
            maxHeight="33rem"
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
              {!loading &&
                renderWizardScreen({
                  adCampaignList,
                  campaignStatus,
                  setCampaignStatus,
                  objectives,
                  activeObjective,
                  setActiveObjective,
                })}
            </ModalBody>
            <ModalFooter flexDir="column" className="settings-modal__footer">
              {activeWizardId === WIZARD_ID_MAP.CAMPAIGN && (
                <Flex
                  flexDir={isEqualToOrLessThan500[0] ? 'column' : 'row'}
                  className="settings-modal__btn-group-wrapper"
                  columnGap="1rem"
                >
                  <Flex className="settings-modal__btn-wrapper">
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
                  </Flex>
                  <Flex className="settings-modal__btn-wrapper" alignItems="center">
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
                      border="1px solid #ece9e9"
                      backgroundColor="#dadada"
                      marginLeft="6px"
                    >
                      Refresh Data
                    </Button>
                  </Flex>
                </Flex>
              )}
              <SettingsModalWizard
                setActiveWizardId={setActiveWizardId}
                activeWizardId={activeWizardId}
                wizardIdMap={WIZARD_ID_MAP}
                resetWizardScreenState={resetWizardScreenState}
              />
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};
