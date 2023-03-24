import { Flex, FormControl, FormLabel, Switch, Grid } from '@chakra-ui/react';
import React from 'react';

export const SettingsModalSelect = ({ actions, setActiveAction, activeAction }) => {
  const handleSettingObjective = (e) => {
    const isSwitchedOn = e.target.checked;
    const labelElement = e.target?.closest('[data-action-id]');
    const action = labelElement?.dataset?.actionId;
    if (!action) return;
    setActiveAction(isSwitchedOn ? action : null);
  };

  return (
    <Flex flexDir="column" alignItems="center">
      <Flex mb="2rem" fontSize="17px" fontWeight="400">
        Please select one campaign insight from the list below:
      </Flex>
      <FormControl
        as={Grid}
        templateColumns="15rem 3rem 15rem 3rem"
        ml="auto"
        mr="auto"
        columnGap="1.5rem"
        width="inherit"
      >
        {actions.sort().map((action, i) => {
          // remove underscore and captialize first letters of each word
          const formattedAction = action
            .replace(/[_.]+/g, ' ')
            .split(' ')
            .map((word) => {
              // captialize Facebook abbreviation
              if (/(fb)/.test(word)) {
                return word.toUpperCase();
              }
              return word[0].toUpperCase() + word.slice(1, word.length);
            })
            .join(' ');
          return (
            <React.Fragment key={i}>
              <FormLabel htmlFor={action}>{formattedAction}</FormLabel>
              <Switch
                data-action-id={action}
                onChange={handleSettingObjective}
                isDisabled={activeAction !== action && activeAction !== null}
                isChecked={activeAction === action}
              />
            </React.Fragment>
          );
        })}
      </FormControl>
    </Flex>
  );
};
