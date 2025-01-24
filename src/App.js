import { useEffect, useMemo, useState } from "react";
import "./App.css";
import BasicTable from "./Table";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { TextField } from "@mui/material";
// import SortBySelect from "./Sort";

function App() {
  const [ibo, setIbo] = useState([]);
  const [kaan, setKaan] = useState([]);
  const [maps, setMaps] = useState([]);

  const [res, setRes] = useState([]);
  const [row, setRow] = useState([]);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(0);
  const [sort, setSort] = useState("finishedCount");

  const [loading, setLoading] = useState(false);

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

    const fetchData = async () => {
      setLoading(true); // Start loading
      await Promise.all([fetchMaps(), fetchProfiles()]);
      setLoading(false); // Stop loading
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (ibo && kaan && maps) {
      let tempRes = [];
      maps.forEach((map) => {
        const iboMap = ibo?.filter((i) => i.map === map.name);
        const kaanMap = kaan?.filter((i) => i.map === map.name);
        tempRes.push({ ibo: iboMap?.[0], kaan: kaanMap?.[0], map: map });
      });

      if (sort === "nameAsc") {
        setRes(
          tempRes.sort((a, b) => a?.map?.name?.localeCompare(b?.map?.name))
        );
      } else if (sort === "nameDesc") {
        setRes(
          tempRes.sort((a, b) => b?.map?.name?.localeCompare(a?.map?.name))
        );
      } else if (sort === "ibrahimTimeAsc") {
        setRes(
          tempRes.sort(
            (a, b) =>
              parseFloat(a?.ibo?.time || Infinity) -
              parseFloat(b?.ibo?.time || Infinity)
          )
        );
      } else if (sort === "ibrahimTimeDesc") {
        setRes(
          tempRes.sort(
            (a, b) =>
              parseFloat(b?.ibo?.time || Infinity) -
              parseFloat(a?.ibo?.time || Infinity)
          )
        );
      } else if (sort === "ibrahimTimeWrDiffAsc") {
        setRes(
          tempRes.sort(
            (a, b) =>
              parseFloat((a?.ibo?.time || Infinity) - a?.map.wr) -
              parseFloat((b?.ibo?.time || Infinity) - b?.map.wr)
          )
        );
      } else if (sort === "ibrahimTimeWrDiffDesc") {
        setRes(
          tempRes.sort(
            (a, b) =>
              parseFloat((b?.ibo?.time || Infinity) - b?.map.wr) -
              parseFloat((a?.ibo?.time || Infinity) - a?.map.wr)
          )
        );
      } else if (sort === "ibrahimRankAsc") {
        setRes(
          tempRes.sort(
            (a, b) =>
              parseFloat(a?.ibo?.position || Infinity) -
              parseFloat(b?.ibo?.position || Infinity)
          )
        );
      } else if (sort === "ibrahimRankDesc") {
        setRes(
          tempRes.sort(
            (a, b) =>
              parseFloat(b?.ibo?.position || Infinity) -
              parseFloat(a?.ibo?.position || Infinity)
          )
        );
      } else if (sort === "kaanTimeAsc") {
        setRes(
          tempRes.sort(
            (a, b) =>
              parseFloat(a?.kaan?.time || Infinity) -
              parseFloat(b?.kaan?.time || Infinity)
          )
        );
      } else if (sort === "kaanTimeDesc") {
        setRes(
          tempRes.sort(
            (a, b) =>
              parseFloat(b?.kaan?.time || Infinity) -
              parseFloat(a?.kaan?.time || Infinity)
          )
        );
      } else if (sort === "kaanTimeWrDiffAsc") {
        setRes(
          tempRes.sort(
            (a, b) =>
              parseFloat((a?.kaan?.time || Infinity) - a?.map.wr) -
              parseFloat((b?.kaan?.time || Infinity) - b?.map.wr)
          )
        );
      } else if (sort === "kaanTimeWrDiffDesc") {
        setRes(
          tempRes.sort(
            (a, b) =>
              parseFloat((b?.kaan?.time || Infinity) - b?.map.wr) -
              parseFloat((a?.kaan?.time || Infinity) - a?.map.wr)
          )
        );
      } else if (sort === "kaanRankAsc") {
        setRes(
          tempRes.sort(
            (a, b) =>
              parseFloat(a?.kaan?.position || Infinity) -
              parseFloat(b?.kaan?.position || Infinity)
          )
        );
      } else if (sort === "kaanRankDesc") {
        setRes(
          tempRes.sort(
            (a, b) =>
              parseFloat(b?.kaan?.position || Infinity) -
              parseFloat(a?.kaan?.position || Infinity)
          )
        );
      } else if (sort === "finishedCount") {
        setRes(
          tempRes.sort((a, b) => b?.map?.finishedCount - a?.map?.finishedCount)
        );
      } else if (sort === "worldRecordAsc") {
        setRes(
          tempRes.sort(
            (a, b) => parseFloat(a?.map?.wr) - parseFloat(b?.map?.wr)
          )
        );
      } else if (sort === "worldRecordDesc") {
        setRes(
          tempRes.sort(
            (a, b) => parseFloat(b?.map?.wr) - parseFloat(a?.map?.wr)
          )
        );
      } else {
        setRes(tempRes);
      }

      // setRow(tempRes);
    }
  }, [ibo, kaan, maps, sort]);

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
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          margin: 10,
          flexWrap: "wrap", // Allow wrapping on smaller screens
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
        {/* <SortBySelect sort={sort} setSort={setSort} /> */}
      </div>
      <BasicTable data={row} loading={loading} sort={sort} setSort={setSort} />
    </div>
  );
}

export default App;
