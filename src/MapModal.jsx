import Paper from "@mui/material/Paper";
import { Box, Modal, Grid2, styled, Button } from "@mui/material";
import { floatToTime } from "./utils";
import { useEffect, useMemo, useState } from "react";

export default function MapModal({ open, handleClose, map }) {
  const mapRanks = useMemo(() => {
    return map?.mapData;
  }, [map]);

  const [showRanks, setShowRanks] = useState(false);

  useEffect(() => {
    if (!open) {
      setShowRanks(false);
    }
  }, [open]);

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
    ...theme.applyStyles("dark", {
      backgroundColor: "#1A2027",
    }),
    overflow: "hidden",
    marginBottom: 2,
  }));

  const ItemButton = styled(Button)(({ theme }) => ({
    backgroundColor: "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    overflow: "hidden",
    marginBottom: theme.spacing(2),
  }));

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
        }}
      >
        <Grid2
          container
          spacing={2}
          columns={1}
          marginBottom={2}
          sx={{ width: "100%", height: "60%" }}
        >
          <Grid2
            size={1}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              alignContent: "center",
            }}
          >
            <Item>
              <b>{map?.name}</b>
            </Item>
            <img
              src={`https://cdn.xplay.cloud/img/site/common/maps/${map?.name}.jpg`}
              style={{
                height: "50%",
                width: "60%",
                borderRadius: 10,
                topMargin: 4,
              }}
              alt={map?.name}
            />

            <ItemButton
              onClick={() => {
                setShowRanks((x) => !x);
              }}
            >
              Show Ranks
            </ItemButton>
          </Grid2>
        </Grid2>

        {showRanks && (
          <Grid2 container spacing={2} columns={7}>
            <Grid2 size={2}>
              <Item>
                <b>Position</b>
              </Item>
            </Grid2>
            <Grid2 size={3}>
              <Item>
                <b>Time Complete</b>
              </Item>
            </Grid2>
            <Grid2 size={2}>
              <Item>
                <b>Player</b>
              </Item>
            </Grid2>
            {mapRanks?.map((record, index) => (
              <Grid2 item xs={6} sx={{ width: "100%" }} key={index}>
                <Grid2 container spacing={2} columns={7}>
                  <Grid2 size={2}>
                    <Item>{index + 1}</Item>
                  </Grid2>
                  <Grid2 size={3}>
                    <Item>{floatToTime(record.time)}</Item>
                  </Grid2>
                  <Grid2 size={2}>
                    <Item>{record.name}</Item>
                  </Grid2>
                </Grid2>
              </Grid2>
            ))}
          </Grid2>
        )}
      </Box>
    </Modal>
  );
}
