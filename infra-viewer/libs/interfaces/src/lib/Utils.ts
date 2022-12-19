export const getMB = (bytes: number) => {
  const kilobyte = 1024;
  const megabyte = kilobyte * 1024;
  return Math.round(bytes / megabyte);
};
