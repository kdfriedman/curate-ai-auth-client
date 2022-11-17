import React, { useContext, useState, useEffect } from 'react';
import { auth, appCheck } from '../services/firebase/firebase';
import { handleService } from '../services/fetch/util';
import {
  signOut,
  verifyPasswordResetCode,
  confirmPasswordReset,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  getIdToken,
} from 'firebase/auth';
const { getToken } = require('firebase/app-check');

const AuthContext = React.createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  const getAuthToken = async (user) => {
    return await handleService(getIdToken, [user, true]);
  };

  const getAppToken = async () => {
    return await handleService(getToken, [appCheck, true]);
  };

  const login = async (email, password) => {
    return await handleService(signInWithEmailAndPassword, [auth, email, password]);
  };

  const logout = async () => {
    return await handleService(signOut, [auth]);
  };

  const resetPassword = async (email) => {
    return await handleService(sendPasswordResetEmail, [auth, email]);
  };

  const verifyPasswordResetRequest = async (code) => {
    return await handleService(verifyPasswordResetCode, [auth, code]);
  };

  const confirmPasswordResetRequest = async (code, newPassword) => {
    return await handleService(confirmPasswordReset, [auth, code, newPassword]);
  };

  useEffect(() => {
    // listen for auth changes
    // returns function which can be used to unsubscribe to auth changes on component unmount
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
    verifyPasswordResetRequest,
    confirmPasswordResetRequest,
    getAuthToken,
    getAppToken,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
