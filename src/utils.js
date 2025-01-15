export function floatToTime(floatTime) {
  if (typeof floatTime !== "number") {
    return "-";
  }
  const totalSeconds = Math.floor(floatTime);
  const milliseconds = Math.floor((floatTime - totalSeconds) * 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format the time with leading zeros if necessary
  const formattedTime = [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");

  const formattedMilliseconds = milliseconds.toString().padStart(3, "0");

  return `${formattedTime}.${formattedMilliseconds}`;
}
