import { Flex, FormControl, FormLabel, Switch, Grid } from '@chakra-ui/react';
import React from 'react';
import { FACEBOOK_METRICS } from '../services/facebook/constants';

export const SettingsModalSelect = ({ insights, setActiveInsight, activeInsight }) => {
  const handleSettingObjective = (e) => {
    const isSwitchedOn = e.target.checked;
    const labelElement = e.target?.closest('[data-insight-id]');
    const insight = labelElement?.dataset?.insightId;
    if (!insight) return;
    setActiveInsight(isSwitchedOn ? insight : null);
  };

  return (
    <Flex flexDir="column" alignItems="center">
      <FormControl
        as={Grid}
        templateColumns="15rem 3rem 15rem 3rem"
        ml="auto"
        mr="auto"
        columnGap="1.5rem"
        width="inherit"
      >
        {insights.sort().map((insight, i) => {
          return (
            <React.Fragment key={i}>
              <FormLabel htmlFor={insight}>{FACEBOOK_METRICS[insight]}</FormLabel>
              <Switch
                data-insight-id={insight}
                onChange={handleSettingObjective}
                isDisabled={activeInsight !== insight && activeInsight !== null}
                isChecked={activeInsight === insight}
              />
            </React.Fragment>
          );
        })}
      </FormControl>
    </Flex>
  );
};
