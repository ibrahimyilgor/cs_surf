import { Box, LinearProgress, Typography } from "@mui/material";
import { useAppContext } from "./AppContext";

const RankProgress = ({ rank, total, name, otherRanks = [] }) => {
  const { selectedProfiles } = useAppContext();

  const progressValue = rank ? ((total - rank) * 100) / total : 0;

  const otherProgressValues = otherRanks.map((profile) => ({
    name:
      profile.key.substring(0, 1).toUpperCase() +
      profile.key.substring(1).toLowerCase(),
    value: ((total - profile.position) * 100) / total,
    position: profile.position,
  }));

  if (!rank)
    return (
      <Typography
        variant="body2"
        align="center"
        sx={{ marginTop: 1.5, fontWeight: "bold" }}
      >
        / {total}
      </Typography>
    );

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
            backgroundColor: selectedProfiles[name]?.color || "black",
          },
        }}
      />

      {/* Images */}
      <Box
        sx={{
          position: "absolute",
          top: -25,
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
            src={`avatar/${name}.jpg`}
            alt={name}
            style={{ width: 20, height: 20, borderRadius: "50%" }}
          />
        </Box>

        {/* Other Players' Ranks */}
        {otherProgressValues
          .filter((prof) => prof.position > 0)
          .map((profile, index) => (
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

        {/* Best (First Place) */}
        <Box
          sx={{
            position: "absolute",
            left: "97%",
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

      {/* Rank Description */}
      <Typography
        variant="body2"
        align="center"
        sx={{ marginTop: 1.5, fontWeight: "bold" }}
      >
        {rank} / {total} ({((rank / total || 0) * 100).toFixed(2)}%)
      </Typography>

      {/* Rank Differences */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          // marginTop: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            marginLeft: 5,
            alignItems: "start",
          }}
        >
          {/* Other Ranks Differences */}
          {otherProgressValues
            .filter((prof) => prof.position > 0)
            .map((profile, index) => {
              const rankDiff = rank - profile.position;
              return (
                <b
                  key={index}
                  style={{ color: rankDiff > 0 ? "green" : "red" }}
                >
                  {rankDiff > 0 ? "-" : "+"}
                  {Math.abs(rankDiff)} ({profile.name})
                </b>
              );
            })}
        </Box>
      </Box>
    </Box>
  );
};

export default RankProgress;
