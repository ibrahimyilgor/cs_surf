import { Box, LinearProgress } from "@mui/material";
import { floatToTime } from "./utils";
import { useAppContext } from "./AppContext";

const TimeProgress = ({ colTime = 0, otherTime = [], wr, name }) => {
  const { selectedProfiles } = useAppContext();

  const validOtherTimes = otherTime.filter((ot) => ot.time && ot.time > 0);

  const maxValue = Math.max(
    ...validOtherTimes.map((ot) => ot.time),
    colTime,
    wr || 0
  );
  const minValue = wr || 0;
  const safeDenominator = maxValue - minValue || 1; // Prevent division by zero.

  const colValue = colTime ? ((colTime - minValue) * 100) / safeDenominator : 0;
  const otherValues = validOtherTimes.map((profile) => ({
    name:
      profile.key.substring(0, 1).toUpperCase() +
      profile.key.substring(1).toLowerCase(),
    value: ((profile.time - minValue) * 100) / safeDenominator,
    time: profile.time,
  }));

  if (!colTime) return null;

  return (
    <Box sx={{ position: "relative", width: "100%", marginTop: 1 }}>
      {/* Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={colValue}
        sx={{
          height: 10,
          borderRadius: 5,
          backgroundColor: "lightgray",
          "& .MuiLinearProgress-bar": {
            backgroundColor: selectedProfiles[name]?.color || "black",
          },
        }}
      />

      {/* Avatars */}
      <Box
        sx={{
          position: "absolute",
          top: -25,
          width: "100%",
        }}
      >
        {/* ColTime Avatar */}
        <Box
          sx={{
            position: "absolute",
            left: `${colValue}%`,
            transform: "translateX(-50%)",
            textAlign: "center",
          }}
        >
          <img
            src={`avatar/${name}.jpg`}
            alt={name}
            style={{ width: 20, height: 20, borderRadius: "50%" }}
          />
        </Box>

        {/* OtherTime Avatars */}
        {otherValues.map((profile, index) => (
          <Box
            key={index}
            sx={{
              position: "absolute",
              left: `${profile.value}%`,
              transform: "translateX(-50%)",
              textAlign: "center",
            }}
          >
            <img
              src={`avatar/${profile.name}.jpg`}
              alt={profile.name}
              style={{ width: 20, height: 20, borderRadius: "50%" }}
            />
          </Box>
        ))}

        {/* WR (Best) Avatar */}
        <Box
          sx={{
            position: "absolute",
            left: `-3%`,
            textAlign: "center",
          }}
        >
          <img
            src={"images/trophy.png"}
            alt="Best"
            style={{ width: 20, height: 20 }}
          />
        </Box>
      </Box>

      {/* Time Difference Display */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 10,
        }}
      >
        <b>{colTime ? floatToTime(colTime) : ""}</b>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: 5,
            alignItems: "start",
          }}
        >
          {/* OtherTime Differences */}
          {otherValues.map((profile, index) => (
            <b
              key={index}
              style={{ color: colTime > profile.time ? "green" : "red" }}
            >
              {colTime > profile.time ? "-" : "+"}
              {floatToTime(Math.abs(colTime - profile.time))} ({profile.name})
            </b>
          ))}

          {/* WR Difference */}
          {wr ? (
            <b style={{ color: colTime > wr ? "green" : "red" }}>
              {colTime > wr ? "-" : "+"}
              {floatToTime(Math.abs(colTime - wr))} (WR)
            </b>
          ) : null}
        </div>
      </div>
    </Box>
  );
};

export default TimeProgress;
