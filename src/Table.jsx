import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { CircularProgress } from "@mui/material";
import { floatToTime } from "./utils";
import MapModal from "./MapModal";
import RankProgress from "./RankProgress";
import TimeProgress from "./TimeProgress";
import RankWinnerCell from "./RankWinnerCell";
import { useAppContext } from "./AppContext";

export default function BasicTable({
  data,
  loading,
  setSort,
  sort,
  topMargin,
}) {
  const { selectedProfiles } = useAppContext();

  const [openImage, setOpenImage] = React.useState(false);
  const [map, setMap] = React.useState();

  const handleOpen = (selectedMap) => {
    setOpenImage(true);
    setMap(selectedMap);
  };
  const handleClose = () => {
    setOpenImage(false);
    setMap();
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxHeight: `calc(100vh - ${topMargin}px)`,
        overflowY: "auto",
      }}
    >
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }} align="center">{`No (Count:${
              data?.length || 0
            })`}</TableCell>
            <TableCell
              onClick={() => {
                if (sort === "nameAsc") {
                  setSort("nameDesc");
                } else if (sort === "nameDesc") {
                  setSort("finishedCount");
                } else {
                  setSort("nameAsc");
                }
              }}
              sx={{ fontWeight: "bold", cursor: "pointer" }}
              align="center"
            >
              Map {sort === "nameAsc" ? "▲" : sort === "nameDesc" ? "▼" : ""}
            </TableCell>
            <TableCell
              onClick={() => {
                if (sort === "worldRecordAsc") {
                  setSort("worldRecordDesc");
                } else if (sort === "worldRecordDesc") {
                  setSort("finishedCount");
                } else {
                  setSort("worldRecordAsc");
                }
              }}
              sx={{ fontWeight: "bold", cursor: "pointer" }}
              align="center"
            >
              World Record{" "}
              {sort === "worldRecordAsc"
                ? "▲"
                : sort === "worldRecordDesc"
                ? "▼"
                : ""}
            </TableCell>
            {Object.keys(selectedProfiles).map((profile, index) => (
              <React.Fragment key={profile + "" + index}>
                <TableCell
                  key={`${profile}-time-${index}`}
                  onClick={() => {
                    if (sort === `${profile}TimeAsc`) {
                      setSort(`${profile}TimeDesc`);
                    } else if (sort === `${profile}TimeDesc`) {
                      setSort(`${profile}TimeWrDiffAsc`);
                    } else if (sort === `${profile}TimeWrDiffAsc`) {
                      setSort(`${profile}TimeWrDiffDesc`);
                    } else if (sort === `${profile}TimeWrDiffDesc`) {
                      setSort("finishedCount");
                    } else {
                      setSort(`${profile}TimeAsc`);
                    }
                  }}
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    cursor: "pointer",
                    minWidth: 300,
                    minHeight: 200,
                  }}
                >
                  {`${profile.charAt(0).toUpperCase() + profile.slice(1)} Time`}{" "}
                  {sort === `${profile}TimeAsc`
                    ? "▲ (Time Asc)"
                    : sort === `${profile}TimeDesc`
                    ? "▼ (Time Desc)"
                    : sort === `${profile}TimeWrDiffAsc`
                    ? "▲ (WR Diff Asc)"
                    : sort === `${profile}TimeWrDiffDesc`
                    ? "▼ (WR Diff Desc)"
                    : ""}
                </TableCell>
                <TableCell
                  key={`${profile}-rank-${index}`}
                  onClick={() => {
                    if (sort === `${profile}RankAsc`) {
                      setSort(`${profile}RankDesc`);
                    } else if (sort === `${profile}RankDesc`) {
                      setSort("finishedCount");
                    } else {
                      setSort(`${profile}RankAsc`);
                    }
                  }}
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    cursor: "pointer",
                    minWidth: 250,
                    minHeight: 200,
                  }}
                >
                  {`${profile.charAt(0).toUpperCase() + profile.slice(1)} Rank`}{" "}
                  {sort === `${profile}RankAsc`
                    ? "▲"
                    : sort === `${profile}RankDesc`
                    ? "▼"
                    : ""}
                </TableCell>
              </React.Fragment>
            ))}
            <TableCell align="center" sx={{ fontWeight: "bold" }}>
              Who is better?
            </TableCell>
          </TableRow>
        </TableHead>

        {/* Move the loading spinner into TableBody */}
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ height: "100%" }}>
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : (
            data?.map((row, index) => (
              <TableRow
                key={row?.map?.name || ""}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#ffffff",
                }}
              >
                <TableCell component="th" scope="row" align="center">
                  <b>{index + 1} </b>
                </TableCell>
                <TableCell component="th" scope="row" align="center">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={`https://cdn.xplay.cloud/img/site/common/maps/${row?.map?.name}.jpg`}
                      height="60"
                      width="60"
                      alt={row?.map?.name}
                      style={{
                        marginBottom: "8px",
                        cursor: "pointer",
                        borderRadius: 10,
                        borderWidth: 1,
                        borderStyle: "solid",
                      }}
                      onClick={() => handleOpen(row?.map)}
                    />
                    <b>{row?.map?.name}</b>
                  </div>
                </TableCell>

                <TableCell component="th" scope="row" align="center">
                  <b>{floatToTime(row?.map?.wr)} </b>
                </TableCell>
                {Object.keys(selectedProfiles).map((profile, index) => (
                  <React.Fragment key={profile + index}>
                    <TableCell align="center" sx={{ height: 150 }}>
                      <TimeColumn
                        colTime={row?.[profile]?.time}
                        name={profile}
                        otherTime={Object.entries(row)
                          .filter(([key]) => key !== profile && key !== "map")
                          .map(([key2, value]) => {
                            return { key: key2, time: value?.time };
                          })}
                        wr={row?.map?.wr}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <RankProgress
                        rank={row?.[profile]?.position}
                        total={row?.map?.finishedCount}
                        name={profile}
                        otherRanks={Object.entries(row)
                          .filter(([key]) => key !== profile && key !== "map")
                          .map(([key2, value]) => {
                            return { key: key2, position: value?.position };
                          })}
                      />
                    </TableCell>
                  </React.Fragment>
                ))}
                <TableCell align="center">
                  <RankWinnerCell row={row} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <MapModal open={openImage} handleClose={handleClose} map={map} />
    </TableContainer>
  );
}

const TimeColumn = ({ colTime, name, otherTime, wr }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      {/* Rank Progress at the top */}

      <div style={{ width: "100%", marginBottom: 10 }}>
        <TimeProgress
          colTime={colTime}
          otherTime={otherTime}
          name={name}
          wr={wr}
        />
      </div>
    </div>
  );
};
