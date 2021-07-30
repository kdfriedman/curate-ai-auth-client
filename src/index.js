import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import AppRouter from './routes/AppRouter';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

//Extend the theme to include custom colors, fonts, etc
const theme = extendTheme({
  colors: {
    brand: {
      500: '#635bff',
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <AppRouter />
    </ChakraProvider>
  </React.StrictMode>,

  document.getElementById('root')
);
