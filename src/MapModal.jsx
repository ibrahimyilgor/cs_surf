// import Paper from "@mui/material/Paper";
import { Box, Modal, Grid2, Chip } from "@mui/material";
import { useMemo } from "react";
import MapRankTable from "./MapRankTable";

export default function MapModal({ open, handleClose, map }) {
  const mapRanks = useMemo(() => {
    return map?.mapData;
  }, [map]);

  // const Item = styled(Paper)(({ theme }) => ({
  //   backgroundColor: "#fff",
  //   ...theme.typography.body2,
  //   paddingTop: theme.spacing(1),
  //   paddingBottom: theme.spacing(1),
  //   textAlign: "center",
  //   color: theme.palette.text.secondary,
  //   ...theme.applyStyles("dark", {
  //     backgroundColor: "#1A2027",
  //   }),
  //   overflow: "hidden",
  //   width: "60%",
  //   borderBottomRightRadius: 0,
  //   borderBottomLeftRadius: 0,
  //   boxShadow: "rgba(0, 0, 0, 0.2) 1px 1px 1px 2px",
  // }));

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          height: "70%",
          width: "70%",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflowY: "auto",
          borderRadius: 4,
        }}
      >
        <Grid2
          container
          spacing={2}
          columns={1}
          marginBottom={2}
          sx={{ width: "100%" }}
        >
          <Grid2
            size={1}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              alignContent: "center",
              height: "fit-content",
            }}
          >
            <Chip
              label={map?.name}
              sx={{
                backgroundColor: "#155E95",
                color: "white",
                fontWeight: "bold",
                margin: 0.5,
                width: "60%",
                cursor: "pointer",
              }}
            />
            <img
              src={`https://cdn.xplay.cloud/img/site/common/maps/${map?.name}.jpg`}
              style={{
                height: "50%",
                width: "60%",
                topMargin: 4,
                boxShadow: "rgba(0, 0, 0, 0.25) 1px 1px 1px 2px",
                borderRadius: 10,
              }}
              alt={map?.name}
            />
          </Grid2>
        </Grid2>

        <MapRankTable name={map?.name} count={mapRanks?.length || 0} />
      </Box>
    </Modal>
  );
}
