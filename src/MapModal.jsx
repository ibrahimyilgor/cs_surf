import Paper from "@mui/material/Paper";
import { Box, Modal, Grid2, styled } from "@mui/material";
import { floatToTime } from "./utils";
import { useEffect, useMemo, useState } from "react";
import { profileInfo } from "./constants";

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
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
    ...theme.applyStyles("dark", {
      backgroundColor: "#1A2027",
    }),
    overflow: "hidden",
    width: "60%",
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    boxShadow: "rgba(0, 0, 0, 0.2) 1px 1px 1px 2px",
  }));

  const ItemBottom = styled(Paper)(({ theme }) => ({
    backgroundColor: "#fff",
    ...theme.typography.body2,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
    ...theme.applyStyles("dark", {
      backgroundColor: "#1A2027",
    }),
    overflow: "hidden",
    width: "60%",
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    boxShadow: "rgba(0, 0, 0, 0.2) 1px 1px 1px 2px",
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
            <Item>
              <b>{map?.name}</b>
            </Item>
            <img
              src={`https://cdn.xplay.cloud/img/site/common/maps/${map?.name}.jpg`}
              style={{
                height: "50%",
                width: "60%",
                topMargin: 4,
                boxShadow: "rgba(0, 0, 0, 0.25) 1px 1px 1px 2px",
              }}
              alt={map?.name}
            />
            <ItemBottom>
              <b
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setShowRanks((x) => !x);
                }}
              >
                Show Ranks
              </b>
            </ItemBottom>
          </Grid2>
        </Grid2>

        {showRanks && (
          <Grid2 container spacing={1} columns={7}>
            <Grid2 size={2} sx={{ justifyContent: "center", display: "flex" }}>
              <Item>
                <b>Position</b>
              </Item>
            </Grid2>
            <Grid2 size={3} sx={{ justifyContent: "center", display: "flex" }}>
              <Item>
                <b>Time Complete</b>
              </Item>
            </Grid2>
            <Grid2 size={2} sx={{ justifyContent: "center", display: "flex" }}>
              <Item>
                <b>Player</b>
              </Item>
            </Grid2>
            {mapRanks?.map((record, index) => (
              <Grid2
                item
                xs={6}
                sx={{
                  width: "100%",
                }}
                key={index}
              >
                <Grid2 container spacing={2} columns={7}>
                  <Grid2
                    size={2}
                    sx={{ justifyContent: "center", display: "flex" }}
                  >
                    <Item
                      sx={{
                        borderWidth: Object.values(profileInfo)
                          .map((profile) => profile.id)
                          .includes(record?.accountID.toString())
                          ? 3
                          : 0,
                        borderStyle: Object.values(profileInfo)
                          .map((profile) => profile.id)
                          .includes(record?.accountID.toString())
                          ? "solid"
                          : "none",
                        borderColor: Object.values(profileInfo)
                          .map((profile) => profile.id)
                          .includes(record?.accountID.toString())
                          ? Object.values(profileInfo).find(
                              (profile) =>
                                profile.id === record.accountID.toString()
                            )?.color
                          : "none",
                      }}
                    >
                      {index + 1}
                    </Item>
                  </Grid2>
                  <Grid2
                    size={3}
                    sx={{ justifyContent: "center", display: "flex" }}
                  >
                    <Item
                      sx={{
                        borderWidth: Object.values(profileInfo)
                          .map((profile) => profile.id)
                          .includes(record?.accountID.toString())
                          ? 3
                          : 0,
                        borderStyle: Object.values(profileInfo)
                          .map((profile) => profile.id)
                          .includes(record?.accountID.toString())
                          ? "solid"
                          : "none",
                        borderColor: Object.values(profileInfo)
                          .map((profile) => profile.id)
                          .includes(record?.accountID.toString())
                          ? Object.values(profileInfo).find(
                              (profile) =>
                                profile.id === record.accountID.toString()
                            )?.color
                          : "none",
                      }}
                    >
                      {floatToTime(record.time)}
                    </Item>
                  </Grid2>
                  <Grid2
                    size={2}
                    sx={{ justifyContent: "center", display: "flex" }}
                  >
                    <Item
                      sx={{
                        borderWidth: Object.values(profileInfo)
                          .map((profile) => profile.id)
                          .includes(record?.accountID.toString())
                          ? 3
                          : 0,
                        borderStyle: Object.values(profileInfo)
                          .map((profile) => profile.id)
                          .includes(record?.accountID.toString())
                          ? "solid"
                          : "none",
                        borderColor: Object.values(profileInfo)
                          .map((profile) => profile.id)
                          .includes(record?.accountID.toString())
                          ? Object.values(profileInfo).find(
                              (profile) =>
                                profile.id === record.accountID.toString()
                            )?.color
                          : "none",
                      }}
                    >
                      {record.name}
                    </Item>
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
