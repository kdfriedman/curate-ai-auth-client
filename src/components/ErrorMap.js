import { ErrorMessage } from '../components/ErrorMessage';
import { ERROR } from '../constants/error';

// setup error map object to handle specific errors
// return function when errorMap object matches query via .get() method
const errorMap = new Map();
const ErrorHandler = () => {
  return <ErrorMessage errorMessage={ERROR.DASHBOARD.MAIN} />;
};
errorMap.set('failed to read record from firestore', ErrorHandler);
errorMap.set('auth/email-already-in-use', ErrorHandler);
errorMap.set('auth/user-not-found', ERROR.AUTH.INVALID_EMAIL);
errorMap.set('auth/wrong-password', ERROR.AUTH.INVALID_PASSWORD);

export { errorMap };
