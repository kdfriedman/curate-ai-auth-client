import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import AppRouter from './routes/AppRouter';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import 'focus-visible/dist/focus-visible';
import { Global, css } from '@emotion/react';

//Extend the theme to include custom colors, fonts, etc
const theme = extendTheme({
  colors: {
    brand: {
      500: '#635bff',
    },
  },
});

const GlobalStyles = css`
  /*
    This will hide the focus indicator if the element receives focus via the mouse,
    but it will still show up on keyboard focus.
  */
  .js-focus-visible :focus:not([data-focus-visible-added]) {
    outline: none;
    box-shadow: none;
  }
`;

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Global styles={GlobalStyles} />
      <AppRouter />
    </ChakraProvider>
  </React.StrictMode>,

  document.getElementById('root')
);
