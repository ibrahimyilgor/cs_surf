import React, { useContext, useState } from "react";
import { profileInfo } from "./constants";

const AppContext = React.createContext({});

export default AppContext;

export const AppContextProvider = ({ children }) => {
  const [selectedProfiles, setSelectedProfiles] = useState(
    Object.entries(profileInfo)
      .filter(([_, { status }]) => status === "active") // Filter active profiles
      .reduce((acc, [name, profile]) => {
        acc[name] = profile;
        return acc;
      }, {})
  );

  return (
    <AppContext.Provider
      value={{
        selectedProfiles,
        setSelectedProfiles,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
