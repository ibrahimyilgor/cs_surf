import { Chip, Avatar } from "@mui/material";
import { profileInfo } from "./constants";
import { useAppContext } from "./AppContext";

const NameFilter = () => {
  const names = Object.keys(profileInfo);
  const { selectedProfiles, setSelectedProfiles } = useAppContext();

  const handleClick = (name) => {
    const newSelection = {
      ...selectedProfiles,
    };

    if (newSelection[name]) {
      delete newSelection[name];
    } else {
      newSelection[name] = profileInfo[name];
    }

    setSelectedProfiles(newSelection);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      {names.map((name) => (
        <Chip
          key={name}
          avatar={<Avatar alt={name} src={`/avatar/${name}.jpg`} />}
          label={name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}
          sx={{
            backgroundColor: selectedProfiles[name]
              ? selectedProfiles[name]?.color
              : "lightgray",
            color: "white",
            fontWeight: "bold",
            margin: 0.5,
            cursor: "pointer",
          }}
          onClick={() => handleClick(name)}
        />
      ))}
    </div>
  );
};

export default NameFilter;
