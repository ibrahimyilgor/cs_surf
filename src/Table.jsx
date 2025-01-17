import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Avatar, Box, Chip, CircularProgress, Modal } from "@mui/material";
import { floatToTime } from "./utils";

export default function BasicTable({ data, loading, setSort, sort }) {
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
    <TableContainer component={Paper}>
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
            <TableCell
              onClick={() => {
                if (sort === "ibrahimTimeAsc") {
                  setSort("ibrahimTimeDesc");
                } else if (sort === "ibrahimTimeDesc") {
                  setSort("finishedCount");
                } else {
                  setSort("ibrahimTimeAsc");
                }
              }}
              align="center"
              sx={{ fontWeight: "bold", cursor: "pointer" }}
            >
              İbrahim Time{" "}
              {sort === "ibrahimTimeAsc"
                ? "▲"
                : sort === "ibrahimTimeDesc"
                ? "▼"
                : ""}
            </TableCell>
            <TableCell
              onClick={() => {
                if (sort === "ibrahimRankAsc") {
                  setSort("ibrahimRankDesc");
                } else if (sort === "ibrahimRankDesc") {
                  setSort("finishedCount");
                } else {
                  setSort("ibrahimRankAsc");
                }
              }}
              align="center"
              sx={{ fontWeight: "bold", cursor: "pointer" }}
            >
              İbrahim Rank{" "}
              {sort === "ibrahimRankAsc"
                ? "▲"
                : sort === "ibrahimRankDesc"
                ? "▼"
                : ""}
            </TableCell>
            <TableCell
              onClick={() => {
                if (sort === "kaanTimeAsc") {
                  setSort("kaanTimeDesc");
                } else if (sort === "kaanTimeDesc") {
                  setSort("finishedCount");
                } else {
                  setSort("kaanTimeAsc");
                }
              }}
              align="center"
              sx={{ fontWeight: "bold", cursor: "pointer" }}
            >
              Kaan Time{" "}
              {sort === "kaanTimeAsc"
                ? "▲"
                : sort === "kaanTimeDesc"
                ? "▼"
                : ""}
            </TableCell>
            <TableCell
              onClick={() => {
                if (sort === "kaanRankAsc") {
                  setSort("kaanRankDesc");
                } else if (sort === "kaanRankDesc") {
                  setSort("finishedCount");
                } else {
                  setSort("kaanRankAsc");
                }
              }}
              align="center"
              sx={{ fontWeight: "bold", cursor: "pointer" }}
            >
              Kaan Rank{" "}
              {sort === "kaanRankAsc"
                ? "▲"
                : sort === "kaanRankDesc"
                ? "▼"
                : ""}
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold" }}>
              Who is better?
            </TableCell>
          </TableRow>
        </TableHead>
        {loading ? (
          <TableRow>
            <TableCell colSpan={8} align="center" sx={{ height: "100%" }}>
              <CircularProgress />
            </TableCell>
          </TableRow>
        ) : (
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={row?.map?.name || ""}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#ffffff", // Alternate row colors
                }}
              >
                <TableCell component="th" scope="row" align="center">
                  {index + 1}
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
                      style={{ marginBottom: "8px", cursor: "pointer" }}
                      onClick={() => handleOpen(row?.map?.name)}
                    />
                    <span>{row?.map?.name}</span>
                  </div>
                </TableCell>

                <TableCell component="th" scope="row" align="center">
                  {floatToTime(row?.map?.wr)}
                </TableCell>
                <TableCell align="center">
                  <TimeColumn
                    colTime={row?.ibo?.time}
                    otherTime={row?.kaan?.time}
                    wr={row?.map?.wr}
                    otherName={"Kaan"}
                  />
                </TableCell>
                <TableCell align="center">
                  {(row?.ibo?.position || "-") +
                    " / " +
                    row?.map?.finishedCount}
                </TableCell>
                <TableCell align="center">
                  <TimeColumn
                    colTime={row?.kaan?.time}
                    otherTime={row?.ibo?.time}
                    wr={row?.map?.wr}
                    otherName={"İbrahim"}
                  />
                </TableCell>
                <TableCell align="center">
                  {(row?.kaan?.position || "-") +
                    " / " +
                    row?.map?.finishedCount}
                </TableCell>
                <TableCell align="center">
                  {(row?.ibo?.position || Infinity) ===
                  (row?.kaan?.position || Infinity) ? (
                    "-"
                  ) : (row?.ibo?.position || Infinity) <
                    (row?.kaan?.position || Infinity) ? (
                    <Chip
                      avatar={
                        <Avatar alt="İbrahim" src="/avatar/ibrahim.jpg" />
                      }
                      label="İbrahim"
                      sx={{ backgroundColor: "#155E95", color: "white" }}
                    />
                  ) : (
                    <Chip
                      avatar={<Avatar alt="İbrahim" src="/avatar/kaan.jpg" />}
                      label="Kaan"
                      sx={{ backgroundColor: "#EB5A3C", color: "white" }}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
      <Modal open={openImage} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img
            src={`https://cdn.xplay.cloud/img/site/common/maps/${map}.jpg`}
            alt={map}
            style={{ maxWidth: "100%", maxHeight: "80vh" }}
          />
          <span
            style={{
              marginTop: "16px",
              fontSize: "1.2rem",
            }}
          >
            {map}
          </span>
        </Box>
      </Modal>
    </TableContainer>
  );
}

const TimeColumn = ({
  colTime = Infinity,
  otherTime = Infinity,
  wr = Infinity,
  otherName,
}) => {
  return colTime !== Infinity ? (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      {colTime ? floatToTime(colTime) : ""} {/* colTime */}
      {/* colTime - otherTime diff */}
      <div style={{ display: "flex", flexDirection: "column", marginLeft: 5 }}>
        {otherTime !== Infinity ? (
          <span style={{ color: colTime > otherTime ? "red" : "green" }}>
            {colTime > otherTime ? "+" : "-"}
            {floatToTime(Math.abs(parseFloat(colTime) - parseFloat(otherTime)))}
            {` (${otherName})`}
          </span>
        ) : (
          ""
        )}

        {/* colTime - wr diff */}
        {wr !== Infinity ? (
          <span style={{ color: colTime > wr ? "red" : "green" }}>
            {colTime > wr ? "+" : "-"}
            {floatToTime(Math.abs(parseFloat(colTime) - parseFloat(wr)))}
            {` (WR)`}
          </span>
        ) : (
          ""
        )}
      </div>
    </div>
  ) : (
    //empty if no colTime
    <></>
  );
};
