import { useEffect } from 'react';
import { Grid, GridItem, useMediaQuery } from '@chakra-ui/react';
import { Header } from '../components/Header';

export const FormatPage = ({ children }) => {
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');
  const isEqualToOrLessThan450 = useMediaQuery('(max-width: 450px)');

  useEffect(() => {
    // hide onLoad spinner icon
    const onLoadSpinner = document.querySelector('[data-on-load-spinner="true"]');
    onLoadSpinner.style.display = 'none';
  }, []);

  return (
    <>
      <Grid
        templateColumns={isEqualToOrLessThan800[0] ? '1fr' : '225px 1fr'}
        templateRows={isEqualToOrLessThan800[0] ? '1fr 1fr' : '1fr'}
        gap={4}
        height="100%"
      >
        <GridItem>
          <Header />
        </GridItem>
        <GridItem>{children}</GridItem>
      </Grid>
    </>
  );
};
