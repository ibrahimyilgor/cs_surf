import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export default function SortBySelect({ sort, setSort }) {
  const handleChange = (event) => {
    setSort(event.target.value);
  };
  return (
    <Box
      sx={{
        marginLeft: 1,
        minWidth: 120,
        marginRight: 1,
        width: { xs: "100%", sm: "auto" },
        marginTop: { xs: 1, sm: 0 }, // Add space on small screens
      }}
    >
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Sort by</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={sort}
          label="Sort by"
          onChange={handleChange}
        >
          <MenuItem value={"name"}>Name</MenuItem>
          <MenuItem value={"ibrahimTime"}>Ibrahim Time</MenuItem>
          <MenuItem value={"ibrahimRank"}>İbrahim Rank</MenuItem>
          <MenuItem value={"kaanTime"}>Kaan Time</MenuItem>
          <MenuItem value={"kaanRank"}>Kaan Rank</MenuItem>
          <MenuItem value={"finishedCount"}>Finished Count</MenuItem>
          <MenuItem value={"worldRecord"}>World Record</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
