import { useEffect } from 'react';
import { Grid } from '@chakra-ui/react';

export const FormatPage = ({ children }) => {
  useEffect(() => {
    // hide onLoad spinner icon
    const onLoadSpinner = document.querySelector('[data-on-load-spinner="true"]');
    onLoadSpinner.style.display = 'none';
  }, []);

  return (
    <>
      <Grid templateColumns="225px 1fr" gap={4} height="100%">
        {children}
      </Grid>
    </>
  );
};
