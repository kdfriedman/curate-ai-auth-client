import { Flex, Tooltip, Button, Heading, useMediaQuery } from '@chakra-ui/react';

export const ModelCreationCard = ({
  hasNoIntegrations,
  onOpen,
  modelCardHeading,
  modelCardDesc,
  createModelBtnTxt,
}) => {
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');
  return (
    <Flex flexFlow="column" justifyContent={isEqualToOrLessThan800[0] ? 'center' : 'start'}>
      <Heading as="h4" size="md">
        {modelCardHeading}
      </Heading>
      <Flex fontSize="14px" fontWeight="600" marginTop="1rem">
        {modelCardDesc}
      </Flex>

      {hasNoIntegrations ? (
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
      ) : (
        <Button
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
      )}
    </Flex>
  );
};
