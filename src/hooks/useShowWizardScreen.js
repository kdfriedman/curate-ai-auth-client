import { useState } from 'react';
import { SettingsModalTable } from '../components/SettingsModalTable';
import { SettingsModalSelect } from '../components/SettingsModalSelect';
import { ERROR } from '../constants/error';

export const useShowWizardScreen = () => {
  const WIZARD_ID_MAP = {
    OBJECTIVE: 1,
    CAMPAIGN: 2,
  };
  const [activeWizardId, setActiveWizardId] = useState(1);

  const renderWizardScreen = ({
    adCampaignList,
    campaignStatus,
    setCampaignStatus,
    objectives,
    activeObjective,
    setActiveObjective,
  }) => {
    switch (activeWizardId) {
      case WIZARD_ID_MAP.OBJECTIVE: {
        return (
          <SettingsModalSelect
            objectives={objectives}
            activeObjective={activeObjective}
            setActiveObjective={setActiveObjective}
          />
        );
      }
      case WIZARD_ID_MAP.CAMPAIGN: {
        return (
          <SettingsModalTable
            adCampaignList={adCampaignList}
            setCampaignStatus={setCampaignStatus}
            campaignStatus={campaignStatus}
            activeObjective={activeObjective}
          />
        );
      }
      default: {
        return <div>{ERROR.DASHBOARD}</div>;
      }
    }
  };

  return { renderWizardScreen, setActiveWizardId, activeWizardId, WIZARD_ID_MAP };
};
