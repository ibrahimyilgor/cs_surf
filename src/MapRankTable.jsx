import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { floatToTime } from "./utils";
import { profileInfo } from "./constants";

const columns = [
  {
    id: "position",
    label: "Position",
    minWidth: 170,
    align: "center",
    format: (value) => value,
  },
  {
    id: "time",
    label: "Time Complete",
    minWidth: 170,
    align: "center",
    format: (value) => floatToTime(value),
  },
  {
    id: "name",
    label: "Player",
    minWidth: 170,
    align: "center",
    format: (value) => value,
  },
];

export default function MapRankTable({ name, count }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const mapDataResponse = await fetch(
          `https://surf.xplay.gg/api/leaderboard/data?mapName=${
            name || ""
          }&page=${page + 1}&limit=${rowsPerPage}`
        );
        const mapData = await mapDataResponse.json();
        setRows(mapData?.data?.records || []);
        console.log("Fetched data:", mapData);
      } catch (error) {
        console.error("Error fetching map data:", error);
      }
    };

    fetchData();
  }, [page, rowsPerPage, name]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width: "100%" }}>
      <TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100, count > 100 ? count : null].filter(
            Boolean
          )}
          component="div"
          count={count}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ top: 57, minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={"mapRank_" + index}
                hover
                role="checkbox"
                tabIndex={-1}
                sx={{
                  borderWidth: Object.values(profileInfo)
                    .map((profile) => profile.id)
                    .includes(row?.accountID.toString())
                    ? 3
                    : 0,
                  borderStyle: Object.values(profileInfo)
                    .map((profile) => profile.id)
                    .includes(row?.accountID.toString())
                    ? "solid"
                    : "none",
                  borderColor: Object.values(profileInfo)
                    .map((profile) => profile.id)
                    .includes(row?.accountID.toString())
                    ? Object.values(profileInfo).find(
                        (profile) => profile.id === row.accountID.toString()
                      )?.color
                    : "none",
                }}
              >
                {columns.map((column) => {
                  const value = row[column.id];
                  return (
                    <TableCell key={column.id} align={column.align}>
                      {column.format && typeof value === "number"
                        ? column.format(value)
                        : value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
