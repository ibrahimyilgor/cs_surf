export function floatToTime(floatTime) {
  if (typeof floatTime !== "number") {
    return "-";
  }
  const totalSeconds = Math.floor(floatTime);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format the time with leading zeros if necessary
  const formattedTime = [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");

  return formattedTime;
}
