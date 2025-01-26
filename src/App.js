import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import BasicTable from "./Table";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { TextField } from "@mui/material";
import { profileInfo } from "./constants";
// import SortBySelect from "./Sort";

function App() {
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
    return [
      {
        id: 0,
        name: "ALL",
        onClick: (res) => {
          return res;
        },
      },
      {
        id: 1,
        name: "KAAN IS BETTER",
        onClick: (res) => {
          return res.filter(
            (item) =>
              item?.kaan?.position < (item?.ibrahim?.position ?? Infinity)
          );
        },
      },
      {
        id: 2,
        name: "IBRAHIM IS BETTER",
        onClick: (res) => {
          return res.filter(
            (item) =>
              item?.ibrahim?.position < (item?.kaan?.position ?? Infinity)
          );
        },
      },
      {
        id: 3,
        name: "BOTH FINISHED",
        onClick: (res) => {
          return res.filter((item) => item?.ibrahim && item.kaan);
        },
      },
      {
        id: 4,
        name: "ONLY KAAN FINISHED",
        onClick: (res) => {
          return res.filter((item) => item.kaan && !item?.ibrahim);
        },
      },
      {
        id: 5,
        name: "ONLY IBRAHIM FINISHED",
        onClick: (res) => {
          return res.filter((item) => item?.ibrahim && !item.kaan);
        },
      },
      {
        id: 6,
        name: "NOONE FINISHED",
        onClick: (res) => {
          return res.filter((item) => !item?.ibrahim && !item.kaan);
        },
      },
    ];
  }, []);

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
        const profilePromises = Object.entries(profileInfo).map(
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
  }, []);

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
      Object.keys(profileInfo).forEach((key) => {
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
  }, [profiles, maps, sort]);

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
          sx={{ marginRight: 1, width: { xs: "100%", sm: "auto" } }} // 100% width on mobile, auto on larger screens
          onChange={(e) => setSearch(e.target.value)}
        />
        <ButtonGroup
          variant="outlined"
          aria-label="Basic button group"
          sx={{
            borderRadius: 2,
            ".MuiButtonGroup-grouped": {
              borderColor: "#212121",
            },
            display: "flex",
            flexWrap: "wrap", // Allow button wrapping on small screens
            justifyContent: "center",
            marginTop: { xs: 1, sm: 0 }, // Add space on small screens
            width: { xs: "100%", sm: "auto" }, // Button group takes full width on mobile
          }}
        >
          {buttonMap.map((button) => {
            return (
              <Button
                key={button.id} // Add a key prop
                onClick={() => {
                  setSelected(button.id);
                }}
                sx={{
                  backgroundColor:
                    selected === button.id ? "#212121" : "transparent",
                  color: selected === button.id ? "white" : "inherit",
                  "&:hover": {
                    backgroundColor:
                      selected === button.id ? "#212121" : "lightgray",
                  },
                  width: { xs: "100%", sm: "auto" }, // Buttons take full width on mobile
                  marginBottom: 0, // Add some margin at the bottom
                }}
              >
                {button.name}
              </Button>
            );
          })}
        </ButtonGroup>
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
