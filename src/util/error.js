export const catchErrors = (action, dispatch) => {
  const { type, payload } = action;
  // fb vendor specific errors
  dispatch(type, payload);
  return console.error({ type, payload });
};
