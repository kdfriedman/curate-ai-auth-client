import { Flex, FormControl, FormLabel, Heading, Switch, Grid, useMediaQuery } from '@chakra-ui/react';
import React from 'react';

export const SettingsModalSelect = ({ objectives, setActiveObjective, activeObjective }) => {
  const handleSettingObjective = (e) => {
    const isSwitchedOn = e.target.checked;
    const labelElement = e.target?.closest('[data-objective-id]');
    const objective = labelElement?.dataset?.objectiveId;
    if (!objective) return;
    setActiveObjective(isSwitchedOn ? objective : null);
  };

  return (
    <Flex flexDir="column" alignItems="center">
      <Flex mb="2rem" fontSize="17px" fontWeight="400">
        Please select one campaign objective from the list below:
      </Flex>
      <FormControl
        as={Grid}
        templateColumns="15rem 3rem 15rem 3rem"
        ml="auto"
        mr="auto"
        columnGap="1.5rem"
        width="inherit"
      >
        {objectives.map((objective) => {
          return (
            <React.Fragment key={objective.id}>
              <FormLabel htmlFor={objective.type}>{objective.type}:</FormLabel>
              <Switch
                data-objective-id={objective.type}
                onChange={handleSettingObjective}
                isDisabled={activeObjective !== objective.type && activeObjective !== null}
                isChecked={activeObjective === objective.type}
              />
            </React.Fragment>
          );
        })}
      </FormControl>
    </Flex>
  );
};
