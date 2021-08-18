import React, { useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase/firebase';

const AuthContext = React.createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  const linkToProviderWithPopup = (provider) => {
    return auth.currentUser.linkWithPopup(provider);
  };

  const linkToProvider = (provider) => {
    return auth.currentUser.linkWithRedirect(provider);
  };

  const getRedirectResult = () => {
    return auth.getRedirectResult();
  };

  const unlinkProvider = (user, providerId) => {
    return user.unlink(providerId);
  };

  const login = (email, password) => {
    return auth.signInWithEmailAndPassword(email, password);
  };

  const logout = () => {
    return auth.signOut();
  };

  const resetPassword = (email) => {
    return auth.sendPasswordResetEmail(email);
  };

  const verifyPasswordResetRequest = (code) => {
    return auth.verifyPasswordResetCode(code);
  };

  const confirmPasswordResetRequest = (code, newPassword) => {
    return auth.confirmPasswordReset(code, newPassword);
  };

  useEffect(() => {
    // listen for auth changes
    // returns function which can be used to unsubscribe to auth changes on component unmount
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    resetPassword,
    linkToProvider,
    linkToProviderWithPopup,
    getRedirectResult,
    unlinkProvider,
    verifyPasswordResetRequest,
    confirmPasswordResetRequest,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
