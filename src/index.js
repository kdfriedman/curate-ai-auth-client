import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import AppRouter from './routes/AppRouter';
import initFirebaseService from './services/firebase/firebase';

// initalize firebase library with config object
const firebase = initFirebaseService();

ReactDOM.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
  document.getElementById('root')
);
