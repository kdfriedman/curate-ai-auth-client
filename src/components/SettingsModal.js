import { useState, useMemo } from 'react';
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

  // default campaign statuses
  const campaignStatuses = useMemo(
    () => adCampaignList.map((campaign) => ({ isActive: campaign.isActive, id: campaign.id })),
    [adCampaignList]
  );

  // filter out unique actions
  const actions = useMemo(
    () =>
      adCampaignList
        .map((campaign) => campaign.actions)
        .flat()
        .filter((action, i, campaignActions) => campaignActions.indexOf(action) === i),
    [adCampaignList]
  );

  // look for active campaign to use for active objective type
  const hasActiveCampaign = useMemo(() => adCampaignList.find((campaign) => campaign.isActive), [adCampaignList]);

  // set active campaign
  const [campaignStatus, setCampaignStatus] = useState(() => campaignStatuses);
  // set active insight
  const [activeAction, setActiveAction] = useState(null);

  const filteredCampaignListByAction = useMemo(
    () => adCampaignList.filter((campaign) => campaign.actions.some((action) => action === activeAction)),
    [activeAction, adCampaignList]
  );

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

  const disableCampaignsWithStaleObjectives = (activeAction, adCampaignList) => {
    return adCampaignList.map((campaign) => {
      if (campaign.actions.some((action) => action !== activeAction)) {
        return { ...campaign, isActive: false };
      }
      return campaign;
    });
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

  const saveModalSettings = async (dbRecord, activeAction) => {
    const updatedAdCampaignList = generateUpdatedCampaignData(dbRecord);
    // find diff between prev changes and new ones
    const diffOfAdCampaignList = hasUpdatedCampaignDiff(updatedAdCampaignList);
    // if prev selected campaigns exist that do not share active objective, disable campaigns
    const updatedAdCampaignListWithActiveAction = disableCampaignsWithStaleObjectives(
      activeAction,
      updatedAdCampaignList
    );
    //update db record with updated campaign list
    if (diffOfAdCampaignList.length > 0) {
      dbRecord.adCampaignList = updatedAdCampaignListWithActiveAction;
      await updateFirestoreWithCampaignDiffs(dbRecord);
    }
  };

  const onSaveModal = async () => {
    setLoading(true);
    // pass in db prop
    await saveModalSettings(dbRecord, activeAction);
    // close modal after saving
    setLoading(false);
    onCloseModal();
  };

  const onCloseModal = (isOnSave) => {
    // reset campaign checkbox state
    // setCampaignStatus((prev) => [...prev]);
    // reset wizard state
    setActiveWizardId(WIZARD_ID_MAP.INSIGHT);
    // reset objective state
    setActiveAction(null);
    onClose();
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
              {businessAcctName} | {adAccountId}
              {hasActiveCampaign && (
                <Flex fontSize="16px" justifyContent="center">
                  Previous selected insight: &nbsp;
                  <Flex color="#6c757d" fontWeight="600">
                    {hasActiveCampaign.objective}
                  </Flex>
                </Flex>
              )}
              {activeAction && (
                <Flex fontSize="16px" justifyContent="center">
                  Current selected insight: &nbsp;
                  <Flex color="#635bff" fontWeight="600">
                    {activeAction}
                  </Flex>
                </Flex>
              )}
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
                  adCampaignList: filteredCampaignListByAction,
                  campaignStatus,
                  setCampaignStatus,
                  actions,
                  activeAction,
                  setActiveAction,
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
                      onClick={onSaveModal}
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
                activeAction={activeAction}
              />
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};
