import React, { useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase/firebase';
import {
  signOut,
  verifyPasswordResetCode,
  confirmPasswordReset,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';

const AuthContext = React.createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const verifyPasswordResetRequest = (code) => {
    return verifyPasswordResetCode(auth, code);
  };

  const confirmPasswordResetRequest = (code, newPassword) => {
    return confirmPasswordReset(auth, code, newPassword);
  };

  useEffect(() => {
    // listen for auth changes
    // returns function which can be used to unsubscribe to auth changes on component unmount
    const unsubscribe = onAuthStateChanged(auth, (user) => {
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
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
