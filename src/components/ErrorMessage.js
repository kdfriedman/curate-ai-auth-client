import { Text, useMediaQuery } from '@chakra-ui/react';

export const ErrorMessage = ({ errorMessage, errorUIMessage = null, errorLogMessage = null }) => {
  const isEqualToOrLessThan450 = useMediaQuery('(max-width: 450px)');
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');
  if (errorLogMessage) console.error(errorLogMessage);
  return (
    <Text
      color="#c5221f"
      fontWeight="500"
      className="error"
      padding={
        isEqualToOrLessThan450 ? '1rem 1rem 0rem 2rem' : isEqualToOrLessThan800[0] ? '1rem 0 0 0' : '1rem 2rem 0 2rem'
      }
    >
      {errorUIMessage || errorMessage}
    </Text>
  );
};
