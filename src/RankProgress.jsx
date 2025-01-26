import { Box, LinearProgress, Typography } from "@mui/material";

const RankProgress = ({ rank, total, rankImage, name }) => {
  const progressValue = rank ? ((total - rank) * 100) / total : 0;

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      {/* Linear Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={progressValue}
        sx={{
          height: 10,
          borderRadius: 5,
          backgroundColor: "lightgray",
          "& .MuiLinearProgress-bar": {
            backgroundColor: name === "Kaan" ? "#EB5A3C" : "#155E95",
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
        <Box
          sx={{
            position: "absolute",
            left: `${progressValue}%`,
            transform: "translateX(-50%)",
            textAlign: "center",
          }}
        >
          <img
            src={rankImage}
            alt="Your Rank"
            style={{ width: 20, height: 20, borderRadius: "50%" }}
          />
        </Box>

        {/* Best */}
        <Box
          sx={{
            position: "absolute",
            right: -10,
            textAlign: "center",
          }}
        >
          <img
            src={"images/trophy.png"}
            alt="Best"
            style={{ width: 20, height: 20, borderRadius: "50%" }}
          />
        </Box>
      </Box>

      {/* Descriptive Text */}
      <Typography
        variant="body2"
        align="center"
        sx={{ marginTop: 2, fontWeight: "bold" }}
      >
        {rank} / {total} ({((rank / total || 0) * 100).toFixed(2)}%)
      </Typography>
    </Box>
  );
};

export default RankProgress;
