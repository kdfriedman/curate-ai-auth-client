export const ERROR = {
  DASHBOARD: {
    MAIN: "Oops, there's been an error, please reach out to the CurateAI team for assistance.",
  },
  FUNCTION: {
    INVALID_ARGS: 'Function arguments contain one or more invalid types',
  },
  AUTH: {
    INVALID_EMAIL: 'Invalid email, please try again',
    INVALID_PASSWORD: 'Invalid password, please try again',
  },
  MODEL: {
    FAILED_TO_CREATE_MODEL: 'Failed to create model. Please reach out to the CurateAI team for assistance',
  },
  ERROR_MAP: {
    GET: {
      FAILED_TO_READ_FIRESTORE: 'failed to read record from firestore',
      AUTH_EMAIL_ALREADY_IN_USE: 'auth/email-already-in-use',
      AUTH_USER_NOT_FOUND: 'auth/user-not-found',
      AUTH_WRONG_PWD: 'auth/wrong-password',
      FAILED_TO_CREATE_MODEL: 'failed to create model',
    },
  },
};
