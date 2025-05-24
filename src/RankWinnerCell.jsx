import { Chip, Avatar, Typography } from "@mui/material";
import { useAppContext } from "./AppContext";

const RankWinnerCell = ({ row }) => {
  const { selectedProfiles } = useAppContext();

  // Extract positions from row, filter out players without position
  const positions = Object.entries(row)
    .filter(([_, data]) => data?.position !== undefined) // Only include players with position
    .map(([name, data]) => ({ name, position: data.position }));

  // If no player has a position, return nothing
  if (positions.length === 0) {
    return <Typography variant="body2" align="center"></Typography>;
  }

  // Find the best-ranked player (lowest position)
  const winner = positions.reduce((best, current) =>
    current.position < best.position ? current : best
  );

  // If only one profile is selected, show the player's rank
  if (Object.keys(selectedProfiles).length === 1) {
    return (
      <Typography variant="body2" align="center">
        {winner.name.charAt(0).toUpperCase() + winner.name.slice(1)}'s Rank:{" "}
        {winner.position}
      </Typography>
    );
  }

  // If more than one profile is selected, show the winner
  return (
    <Chip
      avatar={<Avatar alt={winner.name} src={`/avatar/${winner.name}.jpg`} />}
      label={
        winner.name.charAt(0).toUpperCase() + winner.name.slice(1).toLowerCase()
      }
      sx={{
        backgroundColor: selectedProfiles[winner.name]?.color || "gray",
        color: "white",
        fontWeight: "bold",
      }}
    />
  );
};

export default RankWinnerCell;
