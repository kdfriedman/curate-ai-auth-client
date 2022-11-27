import React, { useContext, useState } from 'react';

const FirestoreContext = React.createContext();

export const useFirestoreStore = () => {
  return useContext(FirestoreContext);
};

export const FirestoreProvider = ({ children }) => {
  const [modelsStore, setModelsStore] = useState(null);
  const [integrationsStore, setIntegrationsStore] = useState(null);
  const [modelState, setModelState] = useState(null);

  const value = {
    setModelsStore,
    modelsStore,
    setIntegrationsStore,
    integrationsStore,
    modelState,
    setModelState,
  };

  return <FirestoreContext.Provider value={value}>{children}</FirestoreContext.Provider>;
};
