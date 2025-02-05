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
    const fetchOnlineFriends = async () => {
      try {
        let tempFriends = [];
        const onlineFriendsPromises = Object.entries(profileInfo).map(
          async ([name, info]) => {
            const response = await fetch(
              `https://xplay.gg/api/accounts/profileGeneral/${info?.id}`
            );
            const data = await response.json();
            return { data };
          }
        );

        tempFriends = [
          ...new Map(
            (await Promise.all(onlineFriendsPromises))
              .map((profile) => profile?.data?.friends || [])
              .flat()
              .filter(
                (friend) =>
                  Object.values(profileInfo)
                    .map((pr) => pr.id)
                    .includes(friend.friendId.toString()) // Filter based on friendId
              )
              .filter((friend2) => !!friend2?.serverData)
              .map((friend) => [friend.friendId, friend]) // Map to [friendId, friend] after filtering
          ).values(),
        ];

        setOnlineFriendsData(tempFriends);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    };

    // Call the function immediately when the component mounts
    fetchOnlineFriends();

    // Set interval to call fetchOnlineFriends every 10 seconds (10000ms)
    const intervalId = setInterval(fetchOnlineFriends, 10000);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [profileInfo]); // Dependency array ensures this effect is called whenever profileInfo changes

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
