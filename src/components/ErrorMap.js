import { ErrorMessage } from '../components/ErrorMessage';
import { ERROR } from '../constants/error';

// setup error map object to handle specific errors
// return function when errorMap object matches query via .get() method
const errorMap = new Map();
const ErrorHandler = () => {
  return <ErrorMessage errorMessage={ERROR.DASHBOARD.MAIN} />;
};
errorMap.set(ERROR.ERROR_MAP.GET.FAILED_TO_READ_FIRESTORE, ErrorHandler);
errorMap.set(ERROR.ERROR_MAP.GET.AUTH_EMAIL_ALREADY_IN_USE, ErrorHandler);
errorMap.set(ERROR.ERROR_MAP.GET.AUTH_USER_NOT_FOUND, ERROR.AUTH.INVALID_EMAIL);
errorMap.set(ERROR.ERROR_MAP.GET.AUTH_WRONG_PWD, ERROR.AUTH.INVALID_PASSWORD);
errorMap.set(ERROR.ERROR_MAP.GET.FAILED_TO_CREATE_MODEL, ERROR.MODEL.FAILED_TO_CREATE_MODEL);

export { errorMap };
