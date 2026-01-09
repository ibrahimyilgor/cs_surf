import React, { useContext, useEffect, useState } from "react";
import { profileInfo } from "./constants";

const AppContext = React.createContext({});

export default AppContext;

export const AppContextProvider = ({ children }) => {
  const [onlineFriendsData, setOnlineFriendsData] = useState([]);
  const [selectedProfiles, setSelectedProfiles] = useState(
    Object.entries(profileInfo)
      .filter(([_, { status }]) => status === "active") // Filter active profiles
      .reduce((acc, [name, profile]) => {
        acc[name] = profile;
        return acc;
      }, {})
  );
  useEffect(() => {
    // AbortController for cleanup
    let abortController = new AbortController();
    
    const fetchOnlineFriends = async () => {
      try {
        // Only fetch for active profiles to reduce API calls
        const activeProfiles = Object.entries(profileInfo).filter(
          ([_, { status }]) => status === "active"
        );
        
        if (activeProfiles.length === 0) {
          setOnlineFriendsData([]);
          return;
        }

        // Fetch profiles in parallel with abort signal
        const onlineFriendsPromises = activeProfiles.map(
          async ([name, info]) => {
            const response = await fetch(
              `https://xplay.gg/api/accounts/profileGeneral/${info?.id}`,
              { signal: abortController.signal }
            );
            const data = await response.json();
            return { data };
          }
        );

        const results = await Promise.all(onlineFriendsPromises);
        
        // Pre-compute profileInfo IDs for faster lookup
        const profileIds = new Set(Object.values(profileInfo).map((pr) => pr.id));
        
        const tempFriends = [
          ...new Map(
            results
              .map((profile) => profile?.data?.friends || [])
              .flat()
              .filter(
                (friend) =>
                  profileIds.has(friend.friendId.toString()) &&
                  !!friend?.serverData
              )
              .map((friend) => [friend.friendId, friend])
          ).values(),
        ];

        setOnlineFriendsData(tempFriends);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Error fetching profiles:", error);
        }
      }
    };

    // Call the function immediately when the component mounts
    fetchOnlineFriends();

    // Set interval to call fetchOnlineFriends every 30 seconds (reduced from 10s)
    const intervalId = setInterval(fetchOnlineFriends, 30000);

    // Cleanup function to clear the interval and abort pending requests
    return () => {
      clearInterval(intervalId);
      abortController.abort();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        selectedProfiles,
        setSelectedProfiles,
        onlineFriendsData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
