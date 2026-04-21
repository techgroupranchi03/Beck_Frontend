import React, { createContext, useContext, useState, useCallback } from "react";

const TopBarContext = createContext(null);

export const TopBarProvider = ({ children }) => {
  const [actions, setActions] = useState(null);

  const registerActions = useCallback((config) => {
    setActions(config);
  }, []);

  const clearActions = useCallback(() => {
    setActions(null);
  }, []);

  return (
    <TopBarContext.Provider value={{ actions, registerActions, clearActions }}>
      {children}
    </TopBarContext.Provider>
  );
};

export const useTopBar = () => {
  const context = useContext(TopBarContext);
  if (!context) {
    throw new Error("useTopBar must be used within a TopBarProvider");
  }
  return context;
};
