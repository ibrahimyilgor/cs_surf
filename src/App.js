import { useEffect, useMemo, useState } from "react";
import "./App.css";
import BasicTable from "./Table";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { TextField } from "@mui/material";

function App() {
  const [ibo, setIbo] = useState([]);
  const [kaan, setKaan] = useState([]);
  const [maps, setMaps] = useState([]);

  const [res, setRes] = useState([]);
  const [row, setRow] = useState([]);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(0);

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
            (item) => item?.kaan?.position < (item?.ibo?.position ?? Infinity)
          );
        },
      },
      {
        id: 2,
        name: "IBRAHIM IS BETTER",
        onClick: (res) => {
          return res.filter(
            (item) => item?.ibo?.position < (item?.kaan?.position ?? Infinity)
          );
        },
      },
      {
        id: 3,
        name: "BOTH FINISHED",
        onClick: (res) => {
          return res.filter((item) => item?.ibo && item.kaan);
        },
      },
      {
        id: 4,
        name: "ONLY KAAN FINISHED",
        onClick: (res) => {
          return res.filter((item) => item.kaan && !item?.ibo);
        },
      },
      {
        id: 5,
        name: "ONLY IBRAHIM FINISHED",
        onClick: (res) => {
          return res.filter((item) => item?.ibo && !item.kaan);
        },
      },
      {
        id: 6,
        name: "NOONE FINISHED",
        onClick: (res) => {
          return res.filter((item) => !item?.ibo && !item.kaan);
        },
      },
    ];
  }, [res]);

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
            `https://surf.xplay.gg/api/leaderboard/data?mapName=${map}&page=1&limit=18000`
          );
          const mapData = await mapDataResponse.json();

          return {
            name: map,
            finishedCount: mapData?.data?.records?.length || 0,
            wr: mapData?.data?.records[0]?.time || 0,
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
        // Fetch İbrahim's data
        const iboResponse = await fetch(
          "https://surf.xplay.gg/api/leaderboard/profile?accountId=376043163"
        );
        const iboData = await iboResponse.json();
        setIbo(iboData?.data?.records?.surf);

        // Fetch Kaan's data
        const kaanResponse = await fetch(
          "https://surf.xplay.gg/api/leaderboard/profile?accountId=136540238"
        );
        const kaanData = await kaanResponse.json();
        setKaan(kaanData?.data?.records?.surf);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    };

    // Execute both fetches
    fetchMaps();
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (ibo && kaan && maps) {
      let tempRes = [];
      maps.forEach((map) => {
        const iboMap = ibo?.filter((i) => i.map === map.name);
        const kaanMap = kaan?.filter((i) => i.map === map.name);
        tempRes.push({ ibo: iboMap?.[0], kaan: kaanMap?.[0], map: map });
      });
      setRes(tempRes.sort((a, b) => b.map.finishedCount - a.map.finishedCount));
      // setRow(tempRes);
    }
  }, [ibo, kaan, maps]);

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
      <div style={{ display: "flex", justifyContent: "center", margin: 10 }}>
        <TextField
          id="outlined-basic"
          label="Map Name"
          variant="outlined"
          color="#212121"
          value={search}
          sx={{ marginRight: 1 }}
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
          }}
        >
          {buttonMap.map((button) => {
            return (
              <Button
                onClick={() => {
                  // button.onClick();
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
                }}
              >
                {button.name}
              </Button>
            );
          })}
        </ButtonGroup>
      </div>
      <BasicTable data={row} loading={!ibo || !kaan || !maps} />
    </div>
  );
}

export default App;
