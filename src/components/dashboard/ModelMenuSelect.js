import React from 'react';
import {
  Flex,
  Button,
  useMediaQuery,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

export const ModelMenuSelect = ({
  consolidatedTableData,
  modelId,
  setModelId,
  modelsStore,
  integrationsStore,
  integrationsStorePayload,
  setIntegrationId,
  openMenuBtnTxt,
  closeMenuBtnTxt,
}) => {
  const isEqualToOrLessThan450 = useMediaQuery('(max-width: 450px)');
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');

  const setMenuListStyles = () => {
    const menuItemList = document.querySelector('[data-id="modelListItems"]');
    const menuItems = [...menuItemList.children];
    menuItems.forEach((menuItemGroup) => {
      const models = menuItemGroup.querySelectorAll('[data-model-id]');
      [...models].forEach((model) => {
        if (model.dataset.modelId === modelId) {
          return (model.style.backgroundColor = '#EDF2F7');
        }
        model.style.backgroundColor = '#FFF';
      });
    });
  };
  return (
    <>
      <Flex justifyContent={isEqualToOrLessThan450[0] ? 'center' : 'start'}>
        Please select a model from the dropdown to view your data.
      </Flex>

      <Flex
        flexDir={isEqualToOrLessThan800[0] ? 'column' : 'row'}
        columnGap="1rem"
        justifyContent={isEqualToOrLessThan800[0] ? 'center' : ''}
      >
        <Menu onOpen={setMenuListStyles}>
          <MenuButton
            _hover={{
              opacity: '.8',
              textDecoration: 'none',
            }}
            colorScheme="brand"
            margin={isEqualToOrLessThan800[0] ? '.5rem 0' : '1rem 0'}
            minWidth={isEqualToOrLessThan800[0] ? '0' : '20rem'}
            as={Button}
            rightIcon={<ChevronDownIcon />}
          >
            {openMenuBtnTxt}
          </MenuButton>
          <MenuList minWidth="240px" data-id="modelListItems">
            {integrationsStore?.[integrationsStorePayload]?.map((integration, i) => {
              return (
                <MenuOptionGroup key={integration.adAccountId} title={integration.businessAcctName}>
                  {modelsStore?.output?.map((model) => {
                    return (
                      <React.Fragment key={model.id}>
                        {model.ad_account_id === integration.adAccountId && (
                          <MenuItemOption
                            _hover={{
                              backgroundColor: '#EDF2F7 !important',
                            }}
                            onClick={() => {
                              setModelId(model.id);
                              setIntegrationId(integration.adAccountId);
                            }}
                            key={model.id}
                            data-model-id={model.id}
                          >
                            {model.name}
                          </MenuItemOption>
                        )}
                      </React.Fragment>
                    );
                  })}
                </MenuOptionGroup>
              );
            })}
          </MenuList>
        </Menu>
        {consolidatedTableData && (
          <Button
            onClick={() => setModelId(null)}
            _hover={{
              opacity: '.8',
            }}
            minWidth={isEqualToOrLessThan800[0] ? '0' : '11rem'}
            border="1px solid #ece9e9"
            backgroundColor="#dadada"
            margin={isEqualToOrLessThan800[0] ? '.5rem 0' : '1rem 0'}
          >
            {closeMenuBtnTxt}
          </Button>
        )}
      </Flex>
    </>
  );
};
