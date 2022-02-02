export const catchErrors = (action, dispatch, isReset = false) => {
  const { type, payload } = action;
  // fb vendor specific errors
  dispatch(type, payload);
  if (isReset) return;
  return console.error({ type, payload });
};
