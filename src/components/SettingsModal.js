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
  const campaignStatuses = adCampaignList.map((campaign) => ({ isActive: campaign.isActive, id: campaign.id }));

  // filter out unique insights
  const insights = useMemo(
    () =>
      adCampaignList
        .map((campaign) => campaign.insights)
        .flat()
        .filter((insight, i, campaignInsights) => campaignInsights.indexOf(insight) === i),
    [adCampaignList]
  );

  // set active campaign
  const [campaignStatus, setCampaignStatus] = useState(() => campaignStatuses);
  // set active insight
  const [activeInsight, setActiveInsight] = useState(null);

  // filter campaigns by insights that are available on a given campaign
  const filteredAdCampaignListBySelectedInsight = useMemo(
    () => adCampaignList.filter((campaign) => campaign.insights.some((insight) => insight === activeInsight)),
    [adCampaignList, activeInsight]
  );

  const generateUpdatedCampaignData = (dbRecord) => {
    // create deep clone to prevent unintentional isActive getting set on array of objects orignal state
    const deepCloneAdCampaignList = JSON.parse(JSON.stringify(dbRecord.adCampaignList));
    const updatedAdCampaignList = deepCloneAdCampaignList.map((campaign) => {
      // check if campaign status has changed for each campaign
      const hasUpdatedCampaign = campaignStatus.find((campaignObj) => campaignObj.id === campaign.id);
      // if campaign has associated change stored in state, update record with new state
      if (hasUpdatedCampaign) {
        const hasUpdatedInsight = campaign.activeInsight !== activeInsight;
        campaign.isActive = hasUpdatedCampaign.isActive;
        campaign.activeInsight = hasUpdatedInsight ? activeInsight : campaign.activeInsight;
      }
      return campaign;
    });
    return updatedAdCampaignList;
  };

  const hasUpdatedCampaignDiff = (updatedAdCampaignList) => {
    // diffing function to only update db if changes exist between adCampaignLists
    // TODO: check ternary to see why not working
    const diffOfAdCampaignList = dbRecord.adCampaignList.filter((campaign, i) => {
      // loop through both arrays and compare the isActive and activeInsight (if not null) property as type strings
      if (updatedAdCampaignList[i].activeInsight && campaign.activeInsight) {
        return (
          updatedAdCampaignList[i].isActive.toString() !== campaign.isActive.toString() ||
          updatedAdCampaignList[i].activeInsight.toString() !== campaign.activeInsight.toString()
        );
      }
      return updatedAdCampaignList[i].isActive.toString() !== campaign.isActive.toString();
    });
    return diffOfAdCampaignList;
  };

  const disableCampaignsWithStaleObjectives = (activeInsight, adCampaignList) => {
    return adCampaignList.map((campaign) => {
      if (campaign.insights.some((insight) => insight === activeInsight)) {
        return campaign;
      }
      return { ...campaign, isActive: false, activeInsight: null };
    });
  };

  const addActiveInsightToCampaigns = (activeInsight, adCampaignList) => {
    return adCampaignList.map((campaign) => {
      if (campaign.isActive) {
        return { ...campaign, activeInsight };
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

  const saveModalSettings = async (dbRecord, activeInsight) => {
    const updatedAdCampaignList = generateUpdatedCampaignData(dbRecord);
    // find diff between prev changes and new ones
    const diffOfAdCampaignList = hasUpdatedCampaignDiff(updatedAdCampaignList);
    // if prev selected campaigns exist that do not share active insight, disable campaigns
    const disabledCampaignsWithStaleInsights = disableCampaignsWithStaleObjectives(
      activeInsight,
      updatedAdCampaignList
    );
    // update active insight on all active campaigns
    const updatedCampaignsWithActiveInsights = addActiveInsightToCampaigns(
      activeInsight,
      disabledCampaignsWithStaleInsights
    );
    //update db record with updated campaign list
    if (diffOfAdCampaignList.length > 0) {
      dbRecord.adCampaignList = updatedCampaignsWithActiveInsights;
      await updateFirestoreWithCampaignDiffs(dbRecord);
    }
  };

  const onSaveModal = async () => {
    setLoading(true);
    // pass in db prop
    await saveModalSettings(dbRecord, activeInsight);
    // close modal after saving
    setLoading(false);
    onCloseModal();
  };

  const onCloseModal = () => {
    // reset campaign checkbox state
    // reset wizard state
    setActiveWizardId(WIZARD_ID_MAP.INSIGHT);
    // reset objective state
    setActiveInsight(null);
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
              {activeInsight && (
                <Flex fontSize="16px" justifyContent="center">
                  Current selected insight: &nbsp;
                  <Flex color="#635bff" fontWeight="600">
                    {activeInsight}
                  </Flex>
                </Flex>
              )}
              <Flex justifyContent="center" mb="2rem" fontSize="17px" fontWeight="400">
                Please select one campaign insight from the list below:
              </Flex>
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
                  adCampaignList: filteredAdCampaignListBySelectedInsight,
                  campaignStatus,
                  setCampaignStatus,
                  insights,
                  activeInsight,
                  setActiveInsight,
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
                activeInsight={activeInsight}
              />
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};
