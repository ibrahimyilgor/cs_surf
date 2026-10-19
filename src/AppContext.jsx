import React, { useContext, useEffect, useState } from "react";
import { profileInfo } from "./constants";

const AppContext = React.createContext(null);

export default AppContext;

export const AppContextProvider = ({ children }) => {
  const [profilesData, setProfilesData] = useState({});
  const [selectedProfiles, setSelectedProfiles] = useState(() =>
    Object.entries(profileInfo)
      .filter(([, profile]) => profile.status === "active")
      .reduce((selected, [name, profile]) => {
        selected[name] = profile;
        return selected;
      }, {}),
  );

  useEffect(() => {
    let active = true;
    let timer;
    let controller;

    async function loadProfiles() {
      controller = new AbortController();
      const results = await Promise.all(
        Object.entries(profileInfo).map(async ([name, profile]) => {
          try {
            const response = await fetch(
              `/api/accounts/profileGeneral/${profile.id}`,
              { signal: controller.signal },
            );
            if (!response.ok) {
              throw new Error(`Profil isteği başarısız (${response.status})`);
            }
            const data = await response.json();
            return { name, data };
          } catch (error) {
            if (error.name === "AbortError") return null;
            return { name, error: error.message || "Profil bilgisi alınamadı." };
          }
        }),
      );

      if (active) {
        setProfilesData(
          results.reduce((profiles, result) => {
            if (result) profiles[result.name] = result;
            return profiles;
          }, {}),
        );
        timer = setTimeout(loadProfiles, 60000);
      }
    }

    loadProfiles();
    return () => {
      active = false;
      clearTimeout(timer);
      controller?.abort();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{ selectedProfiles, setSelectedProfiles, profilesData }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
