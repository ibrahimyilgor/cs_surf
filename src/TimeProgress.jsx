import { Box, LinearProgress } from "@mui/material";
import { floatToTime } from "./utils";

const TimeProgress = ({ colTime = 0, otherTime = 0, wr, otherName }) => {
  const maxValue = Math.max(colTime, otherTime) || wr;
  const minValue = wr;

  const colValue = colTime
    ? ((colTime - minValue) * 100) / (maxValue - minValue)
    : 0;
  const otherValue = otherTime
    ? ((otherTime - minValue) * 100) / (maxValue - minValue)
    : 0;

  if (!colTime) {
    return null;
  }

  return (
    <Box sx={{ position: "relative", width: "100%", marginTop: 1 }}>
      {/* Linear Progress Bar */}

      <LinearProgress
        variant="determinate"
        value={colValue}
        sx={{
          height: 10,
          borderRadius: 5,
          backgroundColor: "lightgray",
          "& .MuiLinearProgress-bar": {
            backgroundColor: otherName === "Kaan" ? "#155E95" : "#EB5A3C",
          },
        }}
      />
      {/* Images */}
      <Box
        sx={{
          position: "absolute",
          top: -25, // Adjust to position images above the bar
          width: "100%",
        }}
      >
        {/* Your Rank */}
        {colTime ? (
          <Box
            sx={{
              position: "absolute",
              left: `${colValue}%`,
              transform: "translateX(-50%)",
              textAlign: "center",
            }}
          >
            <img
              src={`avatar/${otherName === "Kaan" ? "ibrahim" : "kaan"}.jpg`}
              alt="Your Rank"
              style={{ width: 20, height: 20, borderRadius: "50%" }}
            />
          </Box>
        ) : null}

        {otherTime ? (
          <Box
            sx={{
              position: "absolute",
              left: `${otherValue}%`,
              transform: "translateX(-50%)",
              textAlign: "center",
            }}
          >
            <img
              src={`avatar/${otherName === "İbrahim" ? "ibrahim" : "kaan"}.jpg`}
              alt="Your Rank"
              style={{ width: 20, height: 20, borderRadius: "50%" }}
            />
          </Box>
        ) : null}

        {/* Best */}
        <Box
          sx={{
            position: "absolute",
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
      {colTime ? (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          <b>{colTime ? floatToTime(colTime) : ""} </b>
          {/* colTime - otherTime diff */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 5,
              alignItems: "start",
            }}
          >
            {otherTime ? (
              <b style={{ color: colTime > otherTime ? "green" : "red" }}>
                {colTime > otherTime ? "-" : "+"}
                {floatToTime(
                  Math.abs(parseFloat(colTime) - parseFloat(otherTime))
                )}
                {` (${otherName})`}
              </b>
            ) : (
              ""
            )}

            {/* colTime - wr diff */}
            {wr ? (
              <b style={{ color: colTime > wr ? "green" : "red" }}>
                {colTime > wr ? "-" : "+"}
                {floatToTime(Math.abs(parseFloat(colTime) - parseFloat(wr)))}
                {` (WR)`}
              </b>
            ) : (
              ""
            )}
          </div>
        </div>
      ) : (
        ""
      )}
    </Box>
  );
};

export default TimeProgress;
