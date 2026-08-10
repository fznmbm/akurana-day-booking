"use client";

import { createContext, useContext } from "react";
import { config } from "../config";

const ConfigContext = createContext(config);

export function ConfigProvider({ children }) {
  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within ConfigProvider");
  }
  return context;
}

export function useMealManagementEnabled() {
  const config = useConfig();
  return config.features.enableMealManagement;
}
