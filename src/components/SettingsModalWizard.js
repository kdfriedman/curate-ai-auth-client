import { useState } from 'react';
import { Flex } from '@chakra-ui/react';

export const SettingsModalWizard = ({
  setActiveWizardId,
  activeWizardId,
  wizardIdMap: WIZARD_ID_MAP,
  activeInsight,
}) => {
  const [hasError, setError] = useState(null);

  const handleSettingWizardScreenState = (e) => {
    setActiveWizardId(parseInt(e.target.dataset.id));
  };

  const handleDisablingWizardScreen = (e) => {
    setError(true);
  };

  return (
    <Flex mt="1rem" className="settings-modal-wizard" alignSelf="stretch" alignItems="center" justifyContent="center">
      <Flex className="settings-modal-wizard__step-wrapper" flexDir="row" columnGap="1rem">
        <Flex flexDir="column" rowGap="5px" alignItems="center">
          <Flex
            data-id={WIZARD_ID_MAP.INSIGHT}
            justifyContent="center"
            borderRadius="50%"
            backgroundColor={activeWizardId === WIZARD_ID_MAP.INSIGHT ? '#635bff' : '#dadada'}
            color="#fff"
            width="3rem"
            height="3rem"
            alignItems="center"
            fontWeight="700"
            cursor={activeWizardId === WIZARD_ID_MAP.INSIGHT ? 'default' : 'pointer'}
            onClick={handleSettingWizardScreenState}
          >
            1
          </Flex>
          <Flex
            opacity={activeWizardId === WIZARD_ID_MAP.INSIGHT ? 1 : 0.5}
            color="#4A5568"
            fontSize="12px"
            fontWeight="700"
            lineHeight="16px"
          >
            Select an insight
          </Flex>
        </Flex>
        <Flex
          className="settings-modal-wizard__step-separator"
          width="30rem"
          height="1px"
          backgroundColor="#1A202C"
          alignSelf="center"
        ></Flex>
        <Flex flexDir="column" rowGap="5px" alignItems="center">
          <Flex
            data-id={WIZARD_ID_MAP.CAMPAIGN}
            justifyContent="center"
            borderRadius="50%"
            color="#fff"
            backgroundColor={activeWizardId === WIZARD_ID_MAP.CAMPAIGN ? '#635bff' : '#dadada'}
            width="3rem"
            height="3rem"
            alignItems="center"
            fontWeight="700"
            cursor={activeWizardId === WIZARD_ID_MAP.CAMPAIGN ? 'default' : activeInsight ? 'pointer' : 'not-allowed'}
            onClick={activeInsight ? handleSettingWizardScreenState : handleDisablingWizardScreen}
          >
            2
          </Flex>
          <Flex
            opacity={activeWizardId === WIZARD_ID_MAP.CAMPAIGN ? 1 : 0.5}
            color="#4A5568"
            fontSize="12px"
            fontWeight="700"
            lineHeight="16px"
          >
            Select a campaign
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
