import { Text, Link, useMediaQuery } from '@chakra-ui/react';

// setup error map object to handle specific errors
// return function when errorMap object matches query via .get() method
const errorMap = new Map();
const ErrorHandler = () => {
  const isEqualToOrLessThan450 = useMediaQuery('(max-width: 450px)');
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');
  return (
    <Text
      color="#c5221f"
      fontWeight="500"
      className="error__provider-already-linked"
      padding={
        isEqualToOrLessThan450[0]
          ? '1rem 1rem 0rem 2rem'
          : isEqualToOrLessThan800[0]
          ? '1rem 0 0 0'
          : '1rem 2rem 0 2rem'
      }
    >
      Error: Oops there's been an error. Please reach out to{' '}
      <Link
        textDecoration="underline"
        href="mailto:ryanwelling@gmail.com?cc=kev.d.friedman@gmail.com&amp;subject=CurateAI%20Technical%20Support"
      >
        our tech team
      </Link>{' '}
      for assistance.
    </Text>
  );
};
errorMap.set('auth/popup-closed-by-user', ErrorHandler);
errorMap.set('auth/provider-already-linked', ErrorHandler);
errorMap.set('failed to read record from firestore', ErrorHandler);
errorMap.set('auth/email-already-in-use', ErrorHandler);
errorMap.set('auth/user-not-found', 'Invalid email, please try again');
errorMap.set('auth/wrong-password', 'Invalid password, please try again');

export { errorMap };
