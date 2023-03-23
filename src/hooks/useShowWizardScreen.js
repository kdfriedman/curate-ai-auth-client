import { useState } from 'react';
import { SettingsModalTable } from '../components/SettingsModalTable';
import { SettingsModalSelect } from '../components/SettingsModalSelect';
import { ERROR } from '../constants/error';

export const useShowWizardScreen = () => {
  const WIZARD_ID_MAP = {
    INSIGHT: 1,
    CAMPAIGN: 2,
  };
  const [activeWizardId, setActiveWizardId] = useState(1);

  const renderWizardScreen = ({
    adCampaignList,
    campaignStatus,
    setCampaignStatus,
    actions,
    activeAction,
    setActiveAction,
  }) => {
    switch (activeWizardId) {
      case WIZARD_ID_MAP.INSIGHT: {
        return <SettingsModalSelect actions={actions} activeAction={activeAction} setActiveAction={setActiveAction} />;
      }
      case WIZARD_ID_MAP.CAMPAIGN: {
        return (
          <SettingsModalTable
            adCampaignList={adCampaignList}
            setCampaignStatus={setCampaignStatus}
            campaignStatus={campaignStatus}
            activeAction={activeAction}
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
