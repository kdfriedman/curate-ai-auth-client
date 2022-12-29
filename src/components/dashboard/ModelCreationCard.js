import { Flex, Tooltip, Button, Heading, useMediaQuery } from '@chakra-ui/react';

export const ModelCreationCard = ({
  hasNoIntegrations,
  isModelCreationLimit,
  onOpen,
  modelCardHeading,
  modelCardDesc,
  createModelBtnTxt,
  modelState,
}) => {
  const renderDisabledModelCreationJSX = (hasNointegrations, isModelCreationLimit) => {
    if (hasNointegrations) {
      return (
        <Tooltip
          label="You currently do not have any integrations. To generate a model, you must have at least one integration."
          fontSize="sm"
        >
          <Button
            disabled={hasNoIntegrations}
            _hover={{
              textDecoration: 'none',
            }}
            colorScheme="brand"
            margin={isEqualToOrLessThan800[0] ? '.5rem 0' : '1rem 0'}
            width="20rem"
          >
            {createModelBtnTxt}
          </Button>
        </Tooltip>
      );
    }
    if (isModelCreationLimit) {
      return (
        <Tooltip
          label="You have exceeded your model creation limit. If you'd like to create more models, please reach out to the CurateAI team for assitance."
          fontSize="sm"
        >
          <Button
            disabled={isModelCreationLimit}
            _hover={{
              textDecoration: 'none',
            }}
            colorScheme="brand"
            margin={isEqualToOrLessThan800[0] ? '.5rem 0' : '1rem 0'}
            width="20rem"
          >
            {createModelBtnTxt}
          </Button>
        </Tooltip>
      );
    }
  };
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');
  return (
    <Flex flexFlow="column" justifyContent={isEqualToOrLessThan800[0] ? 'center' : 'start'}>
      <Heading as="h4" size="md">
        {modelCardHeading}
      </Heading>
      <Flex fontSize="14px" fontWeight="600" marginTop="1rem">
        {modelCardDesc}
      </Flex>

      {hasNoIntegrations || isModelCreationLimit ? (
        renderDisabledModelCreationJSX(hasNoIntegrations, isModelCreationLimit)
      ) : (
        <Tooltip
          label="You cannot create new models while you have a model currently loading. Please wait until your model has finished processing."
          fontSize="sm"
          isDisabled={modelState ? !modelState.isModelLoading : true}
        >
          <Button
            disabled={modelState ? modelState.isModelLoading : false}
            onClick={onOpen}
            _hover={{
              opacity: '.8',
              textDecoration: 'none',
            }}
            colorScheme="brand"
            margin={isEqualToOrLessThan800[0] ? '.5rem 0' : '1rem 0'}
            width="20rem"
          >
            {createModelBtnTxt}
          </Button>
        </Tooltip>
      )}
    </Flex>
  );
};
