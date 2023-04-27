import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FormatPage } from './FormatPage';

export const PrivateRoute = ({ component: Component, ...rest }) => {
  const { currentUser } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        return currentUser ? (
          <FormatPage>
            <Component {...props} />
          </FormatPage>
        ) : (
          <Redirect to="/login" />
        );
      }}
    ></Route>
  );
};
