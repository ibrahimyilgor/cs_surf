import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import BasicTable from "./Table";
import { MenuItem, FormControl, Chip, Box } from "@mui/material";
import { TextField } from "@mui/material";
import NameFilter from "./NameFilter";
import { useAppContext } from "./AppContext";
import { NestedMenuItem } from "mui-nested-menu";
import { Menu } from "@mui/material";

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

  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const buttonMap = useMemo(() => {
    const profileKeys = Object.keys(selectedProfiles);

    let buttons = [
      {
        id: 0,
        level: 0,
        name: "ALL",
        onClick: (res) => {
          return res;
        },
      },
      {
        id: 1,
        level: 0,
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
        level: 0,
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
    profileKeys &&
      profileKeys.forEach((key, index) => {
        const baseId = index * 4 + 3; // Start from ID 3 for dynamic buttons to avoid overlap

        buttons.push({
          id: baseId,
          level: 1,
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
          level: 1,
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
          id: baseId + 2,
          level: 1,
          name: `${key.toUpperCase()} UNFINISHED`,
          onClick: (res) => {
            return res.filter((item) => {
              return !item[key]?.position && !item[key]?.time;
            });
          },
        });

        buttons.push({
          id: baseId + 3,
          level: 1,
          name: `${key.toUpperCase()} IS BETTER`,
          onClick: (res) => {
            return res.filter((item) => {
              return Object.keys(selectedProfiles).every((profile) => {
                return (
                  item[key]?.position <= (item[profile]?.position ?? Infinity)
                );
              });
            });
          },
        });
      });

    return buttons;
  }, [selectedProfiles]);

  useEffect(() => {
    setSelected(0);
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

    const fetchData = async () => {
      setLoading(true); // Start loading
      await Promise.all([fetchMaps()]);
      setLoading(false); // Stop loading
    };

    fetchData();
  }, []);

  useEffect(() => {
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
      await Promise.all([fetchProfiles()]);
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
        ?.find?.((button) => button.id === selected)
        ?.onClick(tempRes);
    }
    setRow(tempRes);
  }, [selected, search, buttonMap, res]);

  return (
    <div style={{ maxWidth: "100%", height: "100vh", overflow: "hidden" }}>
      {" "}
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
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <TextField
            id="outlined-basic"
            placeholder="Map Name"
            variant="outlined"
            color="primary"
            value={search}
            size="small"
            sx={{
              marginRight: { xs: 0, sm: 1 },
              width: { xs: "100%", sm: "auto" },
              borderRadius: 25, // Make it rounded like a chip
              backgroundColor: "#f1f1f1", // Chip-like background color
              "& .MuiOutlinedInput-root": {
                borderRadius: 25, // Ensure the text field input is rounded
                "& fieldset": {
                  borderColor: "#f1f1f1", // Keep border color as light gray
                },
                "&:hover fieldset": {
                  borderColor: "#f1f1f1", // Keep border color the same when hovering
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#f1f1f1", // Prevent border color from turning blue when focused
                },
                "& input": {
                  textAlign: "center", // Center the text inside the input field
                },
              },
              "& .MuiInputLabel-root": {
                position: "absolute",
                top: "-10px", // Adjust label position to appear above the field
                left: "10px",
                fontSize: "12px", // Smaller font for label to match chip-like design
                color: "#212121",
              },
            }}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Box>

        <FormControl
          sx={{
            width: { xs: "100%", sm: "250px" },
            marginTop: { xs: 1, sm: 0 },
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Chip
              label={buttonMap[selected].name}
              onClick={handleMenuOpen}
              sx={{
                backgroundColor: "#493628" || "gray",
                color: "white",
                fontWeight: "bold",
                marginBottom: { xs: 1, sm: 0 },
              }}
            />
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
            >
              {/* Top-level menu items (fixed ones) */}
              {buttonMap.slice(0, 3).map((button) => (
                <MenuItem
                  key={button.id}
                  onClick={() => {
                    setSelected(button.id);
                    handleMenuClose();
                  }}
                >
                  {button.name.toUpperCase()}
                </MenuItem>
              ))}

              {/* Group dynamic buttons based on profile name */}
              {Object.entries(
                buttonMap.slice(3).reduce((acc, button) => {
                  const words = button.name.split(" ");
                  const profileName = words[0] === "ONLY" ? words[1] : words[0]; // Extract the correct profile

                  if (!acc[profileName]) acc[profileName] = [];
                  acc[profileName].push(button);
                  return acc;
                }, {})
              ).map(([profile, buttons]) => (
                <NestedMenuItem
                  key={profile}
                  label={profile.toUpperCase()}
                  parentMenuOpen={Boolean(menuAnchor)}
                >
                  {buttons.map((button) => (
                    <MenuItem
                      key={button.id}
                      onClick={() => {
                        setSelected(button.id);
                        handleMenuClose();
                      }}
                    >
                      {button.name.toUpperCase()}
                    </MenuItem>
                  ))}
                </NestedMenuItem>
              ))}
            </Menu>
          </Box>
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
          topMargin={topRef.current?.offsetHeight || 0}
        />
      </div>
    </div>
  );
}

export default App;
