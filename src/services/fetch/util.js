export const handleService = (service, config) => {
  try {
    return service(...config);
  } catch (err) {
    console.error(err);
    return null;
  }
};
