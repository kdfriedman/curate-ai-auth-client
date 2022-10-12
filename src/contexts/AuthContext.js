import React, { useContext, useState, useEffect } from 'react';
import { auth, Firebase } from '../services/firebase/firebase';

const AuthContext = React.createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

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
    setTimeout(() => {
      Firebase.auth()
        .currentUser.getIdToken(true)
        .then((idToken) => {
          console.log(idToken);
        })
        .catch((err) => console.error(err));
    }, 4000);
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
    verifyPasswordResetRequest,
    confirmPasswordResetRequest,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
