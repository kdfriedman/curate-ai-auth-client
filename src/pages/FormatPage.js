import { Grid } from '@chakra-ui/react';

export const FormatPage = ({ children }) => {
  return (
    <>
      <Grid templateColumns="225px 1fr" gap={4} height="100%">
        {children}
      </Grid>
    </>
  );
};
