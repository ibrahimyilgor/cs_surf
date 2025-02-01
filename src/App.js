import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import BasicTable from "./Table";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { TextField } from "@mui/material";
import NameFilter from "./NameFilter";
import { useAppContext } from "./AppContext";

function App() {
  const { selectedProfiles } = useAppContext();
  const [profiles, setProfiles] = useState({});

  const [maps, setMaps] = useState([]);

  const [res, setRes] = useState([]);
  const [row, setRow] = useState([]);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(0);
  const [sort, setSort] = useState("finishedCount");

  const [loading, setLoading] = useState(false);

  const topRef = useRef(null);

  const buttonMap = useMemo(() => {
    const profileKeys = Object.keys(selectedProfiles);

    let buttons = [
      {
        id: 0,
        name: "ALL",
        onClick: (res) => {
          return res;
        },
      },
      {
        id: 1,
        name: "ALL FINISHED",
        onClick: (res) => {
          return res.filter((item) => {
            // Check if all profiles have valid data (e.g., position or time)
            return Object.keys(selectedProfiles).every(
              (profile) => item[profile]?.position || item[profile]?.time
            );
          });
        },
      },
      {
        id: 2,
        name: "NOONE FINISHED",
        onClick: (res) => {
          return res.filter((item) => {
            // Check if none of the profiles have valid data (e.g., position or time)
            return Object.keys(selectedProfiles).every(
              (profile) => !item[profile]?.position && !item[profile]?.time
            );
          });
        },
      },
    ];

    // Generate dynamic buttons for each profile
    profileKeys.forEach((key, index) => {
      const baseId = index * 3 + 3; // Start from ID 3 for dynamic buttons to avoid overlap

      buttons.push({
        id: baseId,
        name: `ONLY ${key.toUpperCase()} FINISHED`,
        onClick: (res) => {
          return res.filter((item) => {
            // Check if only the specified profile has valid data (position or time)
            return (
              (item[key]?.position || item[key]?.time) && // The specified profile has data
              Object.keys(selectedProfiles).every(
                (profile) =>
                  profile === key || // Keep the specified profile
                  !(item[profile]?.position || item[profile]?.time) // Others should not have valid data
              )
            );
          });
        },
      });

      buttons.push({
        id: baseId + 1,
        name: `${key.toUpperCase()} FINISHED`,
        onClick: (res) => {
          return res.filter((item) => {
            // Check if only the specified profile has valid data (position or time)
            return (
              item[key]?.position || item[key]?.time // The specified profile has data
            );
          });
        },
      });

      buttons.push({
        id: baseId + 2, // Increment ID for each button to avoid duplicates
        name: `${key.toUpperCase()} IS BETTER`,
        onClick: (res) => {
          return res.filter((item) => {
            // Compare the position of the specified profile against all other profiles
            return Object.keys(selectedProfiles).every((profile) => {
              // Compare the current profile's position with others, ensuring the specified profile's position is always better
              return (
                item[key]?.position <= (item[profile]?.position ?? Infinity) // Ensure specified profile's position is better
              );
            });
          });
        },
      });
    });

    return buttons;
  }, [selectedProfiles]);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        // Fetch the list of maps
        const mapsResponse = await fetch(
          "https://surf.xplay.gg/api/leaderboard/maps"
        );
        const mapsData = await mapsResponse.json();

        if (!mapsData?.data?.surf) throw new Error("No maps found");

        // Fetch details for each map
        const mapDetailsPromises = mapsData.data.surf.map(async (map) => {
          const mapDataResponse = await fetch(
            `https://surf.xplay.gg/api/leaderboard/data?mapName=${map}&page=1&limit=1000000`
          );
          const mapData = await mapDataResponse.json();

          return {
            name: map,
            finishedCount: mapData?.data?.records?.length || 0,
            wr: mapData?.data?.records[0]?.time || 0,
            mapData: mapData?.data?.records,
          };
        });

        // Wait for all map fetches to complete
        const tempMaps = await Promise.all(mapDetailsPromises);
        setMaps(tempMaps);
      } catch (error) {
        console.error("Error fetching maps:", error);
      }
    };

    const fetchProfiles = async () => {
      try {
        const profilePromises = Object.entries(selectedProfiles).map(
          async ([name, info]) => {
            const response = await fetch(
              `https://surf.xplay.gg/api/leaderboard/profile?accountId=${info?.id}`
            );
            const data = await response.json();
            return { name, records: data?.data?.records?.surf };
          }
        );

        const profilesArray = await Promise.all(profilePromises);

        // Update profiles state dynamically
        const profilesObject = profilesArray.reduce(
          (acc, { name, records }) => ({ ...acc, [name]: records }),
          {}
        );

        setProfiles(profilesObject);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    };

    const fetchData = async () => {
      setLoading(true); // Start loading
      await Promise.all([fetchMaps(), fetchProfiles()]);
      setLoading(false); // Stop loading
    };

    fetchData();
  }, [selectedProfiles]);

  useEffect(() => {
    if (profiles && maps) {
      let tempRes = [];
      maps.forEach((map) => {
        const mapData = Object.entries(profiles).reduce(
          (acc, [name, records]) => {
            const userMap = records?.find((record) => record.map === map.name);
            return { ...acc, [name]: userMap };
          },
          {}
        );
        tempRes.push({ ...mapData, map });
      });

      const sortingFunctions = {
        nameAsc: (a, b) => a?.map?.name?.localeCompare(b?.map?.name),
        nameDesc: (a, b) => b?.map?.name?.localeCompare(a?.map?.name),
        finishedCount: (a, b) => b?.map?.finishedCount - a?.map?.finishedCount,
        worldRecordAsc: (a, b) =>
          parseFloat(a?.map?.wr) - parseFloat(b?.map?.wr),
        worldRecordDesc: (a, b) =>
          parseFloat(b?.map?.wr) - parseFloat(a?.map?.wr),
      };

      // Dynamically add sorting logic for each ID in IDS
      Object.keys(selectedProfiles).forEach((key) => {
        sortingFunctions[`${key}TimeAsc`] = (a, b) =>
          parseFloat(a?.[key]?.time || Infinity) -
          parseFloat(b?.[key]?.time || Infinity);

        sortingFunctions[`${key}TimeDesc`] = (a, b) =>
          parseFloat(b?.[key]?.time || Infinity) -
          parseFloat(a?.[key]?.time || Infinity);

        sortingFunctions[`${key}TimeWrDiffAsc`] = (a, b) =>
          parseFloat((a?.[key]?.time || Infinity) - a?.map?.wr) -
          parseFloat((b?.[key]?.time || Infinity) - b?.map?.wr);

        sortingFunctions[`${key}TimeWrDiffDesc`] = (a, b) =>
          parseFloat((b?.[key]?.time || Infinity) - b?.map?.wr) -
          parseFloat((a?.[key]?.time || Infinity) - a?.map?.wr);

        sortingFunctions[`${key}RankAsc`] = (a, b) =>
          parseFloat(a?.[key]?.position || Infinity) -
          parseFloat(b?.[key]?.position || Infinity);

        sortingFunctions[`${key}RankDesc`] = (a, b) =>
          parseFloat(b?.[key]?.position || Infinity) -
          parseFloat(a?.[key]?.position || Infinity);
      });

      // Sorting handler
      const handleSort = () => {
        const sortFunction = sortingFunctions[sort];
        if (sortFunction) {
          setRes([...tempRes].sort(sortFunction));
        } else {
          setRes(tempRes);
        }
      };

      handleSort();
    }
  }, [profiles, maps, sort, selectedProfiles]);

  useEffect(() => {
    let tempRes = [...res];
    if (search.length > 0) {
      tempRes = tempRes.filter((item) =>
        item.map.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selected >= 0) {
      tempRes = buttonMap
        .find((button) => button.id === selected)
        .onClick(tempRes);
    }
    setRow(tempRes);
  }, [selected, search, buttonMap, res]);

  return (
    <div style={{ maxWidth: "100%" }}>
      {/* Fixed Header */}
      <div
        ref={topRef} // Reference to the header element
        style={{
          position: "fixed", // Fix the header to the top
          top: 0, // Align to the top of the viewport
          left: 0, // Align to the left
          right: 0, // Align to the right
          backgroundColor: "white", // Set background to prevent transparency issues
          zIndex: 1000, // Ensure it stays above other elements
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          padding: 10, // Add padding for visual spacing
          flexWrap: "wrap", // Allow wrapping on smaller screens
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Add shadow for visual separation
        }}
      >
        <TextField
          id="outlined-basic"
          label="Map Name"
          variant="outlined"
          color="#212121"
          value={search}
          sx={{
            marginRight: { xs: 0, sm: 1 },
            width: { xs: "100%", sm: "auto" },
          }} // 100% width on mobile, auto on larger screens
          onChange={(e) => setSearch(e.target.value)}
        />
        <FormControl
          sx={{
            width: { xs: "100%", sm: "250px" },
            marginTop: { xs: 1, sm: 0 },
            justifyContent: "center",
          }}
        >
          <InputLabel id="button-group-label">Filter</InputLabel>
          <Select
            labelId="button-group-label"
            id="button-group"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            label="Select Option"
            sx={{
              borderRadius: 2,
              ".MuiSelect-outlined": {
                borderColor: "#212121",
              },
            }}
          >
            {buttonMap.map((button) => (
              <MenuItem key={button.id} value={button.id}>
                {button.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <NameFilter />
      </div>

      {/* Content below the fixed header */}
      <div style={{ marginTop: topRef.current?.offsetHeight || 0 }}>
        {" "}
        {/* Add top margin equal to the height of the fixed header */}
        <BasicTable
          data={row}
          loading={loading}
          sort={sort}
          setSort={setSort}
        />
      </div>
    </div>
  );
}

export default App;
