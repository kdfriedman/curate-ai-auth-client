import { useState, useEffect } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Flex,
  Heading,
  Button,
  Link,
  Text,
  Box,
  Alert,
  AlertIcon,
  CloseButton,
  Checkbox,
} from '@chakra-ui/react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

export const LoginPage = () => {
  const [inputType, setInputType] = useState('password');
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const [values, setValues] = useState();
  const [actions, setActions] = useState();

  // form validation schema
  const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().required('Required'),
  });

  // error map to render dynamic errors
  const errorMap = new Map();
  errorMap.set('auth/user-not-found', 'Oops, your email was not found');
  errorMap.set('auth/wrong-password', 'Invalid password, please try again');

  useEffect(() => {
    // set mounted state
    let isMounted = true;

    const handleAsyncLogin = async () => {
      const { email, password } = values;
      const { resetForm } = actions;

      try {
        // reset errors
        setError(null);
        // set loading state
        setLoading(true);

        // login user
        await login(email, password);

        // redirect to dashboard page only if component is mounted
        if (isMounted) {
          history.push('/');
        }
      } catch (error) {
        // Handle Errors here
        const errorCode = error.code;
        console.log(errorCode);
        setError(errorCode);

        // reset form
        resetForm();
      }
      // update loading state back to false
      setLoading(false);
    };
    if (
      values &&
      actions &&
      Object.keys(values).length > 0 &&
      Object.keys(actions).length > 0
    ) {
      handleAsyncLogin();
    }
    return () => {
      isMounted = false;
    };
  }, [values, actions, history, login]);

  // password show/hide
  const handleInputTypeChange = () => {
    if (inputType === 'text') setInputType('password');
    if (inputType === 'password') setInputType('text');
  };

  const handleSubmit = async (values, actions) => {
    // update state with form submit values (email + password)
    setValues(values);
    // update state with Formik object, which contains several helper functions
    setActions(actions);
  };

  // handle close error click
  const handleCloseBtnClick = () => {
    setError(null);
  };

  return (
    <>
      <Flex
        padding="1rem"
        margin="1rem"
        flexDir="column"
        alignItems="center"
        className="login__container"
      >
        <Flex>
          <svg
            style={{ width: '15rem', height: 'auto' }}
            width="320"
            height="185.34639618779255"
            viewBox="0 0 320 185.34639618779255"
            className="login__logo"
          >
            <g
              featurekey="symbolFeature-0"
              transform="matrix(1.352824017039201,0,0,1.352824017039201,98.95449227155036,-7.0441556475610225)"
              fill="#635bff"
            >
              <g xmlns="http://www.w3.org/2000/svg">
                <path
                  fill="#635bff"
                  d="M5.208,40.713h7.601c2.153-15.792,15.685-27.964,32.068-27.964c17.881,0,32.375,14.495,32.375,32.375   S62.758,77.499,44.877,77.499c-16.383,0-29.915-12.171-32.068-27.963H5.208C7.405,69.504,24.323,85.04,44.876,85.04   c22.045,0,39.917-17.871,39.917-39.916c0-22.046-17.871-39.917-39.917-39.917C24.323,5.207,7.405,20.744,5.208,40.713z"
                ></path>
              </g>
            </g>
            <g
              featurekey="nameFeature-0"
              transform="matrix(1.9771828704087806,0,0,1.9771828704087806,-3.396800985936527,105.48655386824714)"
              fill="#635bff"
            >
              <path d="M16.152 40.39063 c-8.3008 0 -14.434 -5.6445 -14.434 -14.512 s6.1328 -14.492 14.434 -14.492 c6.2891 0 11.328 3.2227 13.34 8.5742 l-5.4688 1.9922 c-1.25 -3.2813 -4.2383 -5.1758 -7.8711 -5.1758 c-4.8633 0 -8.5938 3.3984 -8.5938 9.1016 s3.7305 9.1211 8.5938 9.1211 c3.6328 0 6.6211 -1.9141 7.8711 -5.1953 l5.4688 1.9922 c-2.0117 5.3516 -7.0508 8.5938 -13.34 8.5938 z M45.947328125 19.922 l5.625 0 l0 20.078 l-5.332 0 l-0.13672 -2.4219 c-1.4063 1.7773 -3.6328 2.8125 -6.3867 2.8125 c-4.8242 0 -7.4805 -2.5195 -7.4805 -6.9531 l0 -13.516 l5.6445 0 l0 12.305 c0 2.6563 1.6602 3.6328 3.6133 3.6328 c2.3242 0 4.4336 -1.1719 4.4531 -4.8633 l0 -11.074 z M61.87501875 23.105 c1.0156 -1.7773 3.6523 -3.418 6.5625 -3.418 l0 5.0195 c-4.2578 0 -6.2891 1.25 -6.2891 5.5078 l0 9.7852 l-5.6641 0 l0 -20.078 l5.3906 0 l0 3.1836 z M87.294921875 34.5508 c0 2.4609 0.23438 4.0234 0.48828 4.9023 l0 0.54688 l-5.2539 0 l-0.44922 -2.1875 c-1.5039 1.8164 -4.1016 2.5781 -6.4453 2.5781 c-3.1641 0 -6.25 -1.4063 -6.25 -5.5859 c0 -4.1602 3.1055 -5.5664 7.3047 -6.4844 l3.3008 -0.74219 c1.4258 -0.33203 1.9336 -0.82031 1.9336 -1.6406 c0 -1.9727 -1.7969 -2.5195 -3.3789 -2.5195 c-2.0313 0 -3.5742 0.80078 -3.9258 3.0664 l-4.9805 -0.89844 c0.83984 -4.1602 3.8867 -6.0547 9.2188 -6.0547 c4.0234 0 8.4375 1.1914 8.4375 7.2461 l0 7.7734 z M77.392621875 36.582 c2.6758 0 4.8242 -1.7773 4.8242 -5.7617 l-4.7656 1.3477 c-1.5625 0.37109 -2.6953 0.91797 -2.6953 2.2656 c0 1.4453 1.1914 2.1484 2.6367 2.1484 z M99.3363125 40 c-3.9063 0 -6.1328 -2.2656 -6.1328 -6.2695 l0 -9.4922 l-3.9453 0 l0 -4.3164 l1.2695 0 c2.1289 0 3.3008 -0.82031 3.3008 -3.8281 l0 -2.6563 l5.0781 0 l0 6.4844 l4.1406 0 l0 4.3164 l-4.1406 0 l0 8.8867 c0 1.7969 0.87891 2.5977 2.3242 2.5977 l1.8164 0 l0 4.2773 l-3.7109 0 z M125.380984375 29.668 l-0.058594 1.3477 l-14.883 0 c0.23438 3.3398 2.4609 4.9414 5.1367 4.9414 c2.0117 0 3.5742 -0.9375 4.3359 -2.7148 l5.1563 0.76172 c-1.3281 4.0625 -4.9414 6.3867 -9.4531 6.3867 c-6.4844 0 -10.723 -3.8281 -10.723 -10.43 s4.3555 -10.469 10.547 -10.469 c5.6836 0 9.9219 3.1445 9.9414 10.176 z M115.478984375 23.477 c-2.5586 0 -4.3359 1.1914 -4.8828 3.8672 l9.2188 0 c-0.29297 -2.5586 -2.0313 -3.8672 -4.3359 -3.8672 z M148.37884375 40 l-2.0508 -5.8203 l-11.855 0 l-2.0508 5.8203 l-5.9961 0 l10.391 -28.223 l7.168 0 l10.391 28.223 l-5.9961 0 z M136.19184375 29.277 l8.418 0 l-4.1992 -11.973 z M157.705034375 40 l0 -28.223 l5.8594 0 l0 28.223 l-5.8594 0 z"></path>
            </g>
          </svg>
        </Flex>
        <Heading fontWeight="400" margin="1rem 0" as="h3" size="lg">
          Please sign in
        </Heading>
        <Flex flexDirection="column" className="login__form-container">
          {error && (
            <Alert margin="1rem 0" status="error">
              <AlertIcon />
              {errorMap.get(error)}
              <CloseButton
                onClick={handleCloseBtnClick}
                position="absolute"
                right="8px"
                top="8px"
              />
            </Alert>
          )}
          <Formik
            initialValues={{
              email: '',
              password: '',
            }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className="login__form" width="330px">
                <FormControl
                  className="form-floating"
                  isInvalid={errors.email && touched.email}
                >
                  <FormLabel fontSize="16px" htmlFor="email">
                    Email
                  </FormLabel>
                  <Field
                    className="form-control"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>
                <FormControl
                  className="form-floating"
                  isInvalid={errors.password && touched.password}
                >
                  <FormLabel
                    fontSize="16px"
                    marginTop="10px"
                    htmlFor="password"
                  >
                    Password
                  </FormLabel>
                  <Field
                    className="form-control"
                    name="password"
                    type={inputType}
                    placeholder="Password"
                  />
                  <Checkbox
                    onChange={handleInputTypeChange}
                    colorScheme="brand"
                    className="login__show-password"
                    fontSize="14px"
                    margin="10px 0 1rem 0"
                  >
                    Show password
                  </Checkbox>
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>
                <Button
                  disabled={loading}
                  _hover={{
                    opacity: '.8',
                  }}
                  _focus={{
                    outline: 0,
                    boxShadow: 'none',
                  }}
                  mt={4}
                  color="#fff"
                  backgroundColor="#635bff"
                  type="submit"
                  fontSize="16px"
                >
                  Sign In
                </Button>
                <Flex
                  className="login__password-reset"
                  margin=".5rem 0"
                  color="#635bff"
                  fontSize="14px"
                >
                  <Link as={NavLink} to="/">
                    Forgot password?
                  </Link>
                </Flex>
                <Box
                  backgroundColor="#d9d9d9"
                  height="1px"
                  margin="2rem 0"
                  width="100%"
                ></Box>
              </Form>
            )}
          </Formik>
        </Flex>

        <Flex>
          <Box className="login__contact-sales">
            <Text fontSize="14px" whiteSpace="nowrap">
              Interested in using CurateAI?{' '}
              <Link
                color="#635bff"
                href="mailto:
                ryanwelling@gmail.com?cc=kev.d.friedman@gmail.com&subject=CurateAI%20Contact%20Sales"
              >
                Contact our team.
              </Link>
            </Text>
          </Box>
        </Flex>
        <Flex
          margin="1.5rem"
          className="login__copy-right"
          color="#6c757d"
          fontWeight="500"
        >
          © CurateAI {new Date().getFullYear()}
        </Flex>
      </Flex>
    </>
  );
};
