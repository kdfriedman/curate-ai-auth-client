import { Flex, FormControl, FormLabel, Switch, Grid, useMediaQuery } from '@chakra-ui/react';
import React from 'react';

export const SettingsModalSelect = ({ objectives, setActiveObjective, activeObjective }) => {
  const isEqualToOrGreaterThan870 = useMediaQuery('(min-width: 870px)');
  const isEqualToOrLessThan500 = useMediaQuery('(max-width: 500px)');
  const isEqualToOrLessThan400 = useMediaQuery('(max-width: 400px)');

  const handleSettingObjective = (e) => {
    const isSwitchedOn = e.target.checked;
    const labelElement = e.target?.closest('[data-objective-id]');
    const objective = labelElement?.dataset?.objectiveId;
    if (!objective) return;
    setActiveObjective(isSwitchedOn ? objective : null);
  };

  console.log('activeObjective', activeObjective);

  return (
    <Flex>
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
              />
            </React.Fragment>
          );
        })}
      </FormControl>
    </Flex>
  );
};
