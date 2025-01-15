import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Chip, Divider } from "@mui/material";

export default function BasicTable({ data }) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Map Name</TableCell>
            <TableCell align="right" sx={{ fontWeight: "bold" }}>
              İbrahim Time
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: "bold" }}>
              İbrahim Rank
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: "bold" }}>
              Kaan Time
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: "bold" }}>
              Kaan Rank
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: "bold" }}>
              Who is better?
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={row?.map?.name || ""}
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
                backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#ffffff", // Alternate row colors
              }}
            >
              <TableCell component="th" scope="row">
                {index + 1}
              </TableCell>
              <TableCell component="th" scope="row">
                {row?.map?.name}
              </TableCell>
              <TableCell align="right">{row?.ibo?.time || "-"}</TableCell>
              <TableCell align="right">{row?.ibo?.position || "-"}</TableCell>
              <TableCell align="right">{row?.kaan?.time || "-"}</TableCell>
              <TableCell align="right">{row?.kaan?.position || "-"}</TableCell>
              <TableCell align="right">
                {(row?.ibo?.position || Infinity) ===
                (row?.kaan?.position || Infinity) ? (
                  "-"
                ) : (row?.ibo?.position || Infinity) <
                  (row?.kaan?.position || Infinity) ? (
                  <Chip
                    label="İbrahim"
                    sx={{ backgroundColor: "#155E95", color: "white" }}
                  />
                ) : (
                  <Chip
                    label="Kaan"
                    sx={{ backgroundColor: "#EB5A3C", color: "white" }}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
