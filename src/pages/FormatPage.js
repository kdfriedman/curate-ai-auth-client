import { useEffect } from 'react';
import { Grid, GridItem, useMediaQuery } from '@chakra-ui/react';
import { Header } from '../components/Header';

export const FormatPage = ({ children }) => {
  const isEqualToOrGreaterThan800 = useMediaQuery('(min-width: 801px)');
  const isEqualToOrLessThan450 = useMediaQuery('(max-width: 450px)');

  useEffect(() => {
    // hide onLoad spinner icon
    const onLoadSpinner = document.querySelector('[data-on-load-spinner="true"]');
    onLoadSpinner.style.display = 'none';
  }, []);

  return (
    <>
      <Grid
        templateColumns={isEqualToOrGreaterThan800[0] ? '225px 1fr' : '1fr'}
        templateRows={isEqualToOrGreaterThan800[0] ? '1fr' : '1fr 1fr'}
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
