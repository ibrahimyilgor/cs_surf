import { useEffect, useState } from "react";
import "./App.css";
import BasicTable from "./Table";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";

function App() {
  const [ibo, setIbo] = useState([]);
  const [kaan, setKaan] = useState([]);
  const [res, setRes] = useState([]);
  const [row, setRow] = useState([]);
  const [maps, setMaps] = useState([]);
  const [selected, setSelected] = useState(0);

  const buttonMap = [
    {
      id: 0,
      name: "ALL",
      onClick: () => {
        setRow(res);
      },
    },
    {
      id: 1,
      name: "KAAN IS BETTER",
      onClick: () => {
        console.log("data", res);
        setRow(
          res.filter(
            (item) => item?.kaan?.position < (item?.ibo?.position ?? Infinity)
          )
        );
      },
    },
    {
      id: 2,
      name: "IBRAHIM IS BETTER",
      onClick: () => {
        setRow(
          res.filter(
            (item) => item?.ibo?.position < (item?.kaan?.position ?? Infinity)
          )
        );
      },
    },
    {
      id: 3,
      name: "BOTH FINISHED",
      onClick: () => {
        setRow(res.filter((item) => item?.ibo && item.kaan));
      },
    },
    {
      id: 4,
      name: "ONLY KAAN FINISHED",
      onClick: () => {
        setRow(res.filter((item) => item.kaan && !item?.ibo));
      },
    },
    {
      id: 5,
      name: "ONLY IBRAHIM FINISHED",
      onClick: () => {
        setRow(res.filter((item) => item?.ibo && !item.kaan));
      },
    },
    {
      id: 6,
      name: "NOONE FINISHED",
      onClick: () => {
        setRow(res.filter((item) => !item?.ibo && !item.kaan));
      },
    },
  ];

  useEffect(() => {
    fetch("https://surf.xplay.gg/api/leaderboard/maps")
      .then((response) => response.json())
      .then((data) => {
        setMaps(data?.data?.surf.map((map) => ({ name: map })));
      })
      .catch((error) => console.error("Error:", error));

    fetch("https://surf.xplay.gg/api/leaderboard/profile?accountId=376043163")
      .then((response) => response.json())
      .then((data) => {
        setIbo(data?.data?.records?.surf);
      })
      .catch((error) => console.error("Error:", error));

    fetch("https://surf.xplay.gg/api/leaderboard/profile?accountId=136540238")
      .then((response) => response.json())
      .then((data) => {
        setKaan(data?.data?.records?.surf);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  useEffect(() => {
    if (ibo && kaan && maps) {
      let tempRes = [];
      maps.forEach((map) => {
        const iboMap = ibo?.filter((i) => i.map === map.name);
        const kaanMap = kaan?.filter((i) => i.map === map.name);
        tempRes.push({ ibo: iboMap?.[0], kaan: kaanMap?.[0], map: map });
      });
      setRes(tempRes);
      setRow(tempRes);
    }
  }, [ibo, kaan, maps]);

  return (
    <div style={{ maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "center", margin: 5 }}>
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
                  button.onClick();
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
      <BasicTable data={row} />
    </div>
  );
}

export default App;
