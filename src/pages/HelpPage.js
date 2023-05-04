import { useState, useEffect } from 'react';
import { Flex, Box, useMediaQuery, Button, FormControl, FormLabel, FormErrorMessage, Textarea } from '@chakra-ui/react';
import { Formik, Form, Field } from 'formik';
import fetchData from '../services/fetch/fetch';
import * as Yup from 'yup';
import { Loader } from '../components/Loader';
import { HTTP_METHODS } from '../services/fetch/constants';
import { useAuth } from '../contexts/AuthContext';
const { POST } = HTTP_METHODS;

export const HelpPage = () => {
  const { currentUser, getAuthToken, getAppToken } = useAuth();
  const [isLoading, setLoading] = useState(false);
  const [formSubmissionLoading, setFormSubmissionLoading] = useState(false);
  const [formSubmitted, setIsFormSubmitted] = useState(false);
  const isEqualToOrLessThan450 = useMediaQuery('(max-width: 450px)');
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');

  // form validation schema
  const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Providing an email is required.'),
    name: Yup.string().min(2).max(120).required('Providing a description is required.'),
    subject: Yup.string().min(2).max(40).required('Providing a subject is required.'),
    description: Yup.string().min(2).max(120).required('Providing a description is required.'),
  });

  const handleFormSubmit = async (values) => {
    if (!values || typeof values !== 'object') return;
    const { token: appCheckToken } = (await getAppToken(currentUser)) ?? {};
    const authToken = await getAuthToken(currentUser);

    // form loading state enabled
    setFormSubmissionLoading(true);
    const [submittedForm, submittedFormErr] = await fetchData({
      method: POST,
      url:
        process.env.NODE_ENV === 'development'
          ? `${process.env.REACT_APP_MODELS_CREATE_HOST_DEV}${process.env.REACT_APP_SUPPORT_CONTACT}`
          : `${process.env.REACT_APP_MODELS_CREATE_HOST_PROD}${process.env.REACT_APP_SUPPORT_CONTACT}`,
      data: { FIREBASE_ID_TOKEN: authToken, FORM_SUBMISSION_VALUES: Object.values(values) },
      headers: { [process.env.REACT_APP_FIREBASE_APP_CHECK_CUSTOM_HEADER]: appCheckToken },
    });
    if (submittedFormErr) {
      setFormSubmissionLoading(false);
      return console.error(submittedFormErr);
    }
    // keep track of forms that have been submitted
    setIsFormSubmitted(submittedForm.data.message);
    setFormSubmissionLoading(false);
  };

  return (
    <>
      {isLoading ? (
        <Loader isLoading={isLoading} loadingMessage="Loading..." />
      ) : (
        <>
          <section>
            <Box gridColumn="1 / 5" gridRow="1" className="help__dashboard" minHeight="20rem" paddingBottom="2rem">
              <Flex
                padding="2rem"
                fontSize="18px"
                color="rgb(26, 32, 44)"
                fontWeight="800"
                textTransform="uppercase"
                letterSpacing=".2em"
                className="help__dashboard-header"
                justifyContent={isEqualToOrLessThan800[0] ? 'center' : ''}
              >
                Help & Support
              </Flex>
              <Flex flexDirection="column" className="help__dashboard-body">
                {!formSubmitted && (
                  <Flex
                    padding={isEqualToOrLessThan800[0] ? '1rem 1rem 0 1rem' : '2rem 0 0 2rem'}
                    fontWeight="600"
                    fontSize="14px"
                    maxWidth="50rem"
                  >
                    Please fill out the contact form below and we'll get back to you as soon as possible. Whether you
                    need technical support, information about our products or services, or simply have a general
                    question, our team is ready to help.
                  </Flex>
                )}

                {!formSubmitted ? (
                  <>
                    {!formSubmissionLoading ? (
                      <Flex
                        maxWidth={isEqualToOrLessThan450[0] ? '20rem' : '750px'}
                        className="help__dashboard-card-container"
                        margin="1rem 2rem"
                        borderRadius="10px"
                        border="1px solid #f0f0f0"
                        alignItems="center"
                        justifyContent={isEqualToOrLessThan800[0] ? 'center' : 'space-between'}
                      >
                        <Box
                          className="help__dashboard-card"
                          fontWeight="800"
                          fontSize="14px"
                          color="rgb(26, 32, 44)"
                          minWidth={isEqualToOrLessThan450[0] ? 0 : '25rem'}
                          padding="1rem 2rem"
                          width="100%"
                          maxWidth="50rem"
                        >
                          <Formik
                            initialValues={{
                              email: '',
                              name: '',
                              subject: '',
                              description: '',
                            }}
                            validationSchema={LoginSchema}
                            onSubmit={handleFormSubmit}
                          >
                            {({ errors, touched }) => (
                              <Form width="330px">
                                <FormControl className="form-floating" isInvalid={errors.email && touched.email}>
                                  <FormLabel fontSize="16px" marginTop="10px" htmlFor="email">
                                    Email
                                  </FormLabel>
                                  <Field
                                    style={{ height: 'calc(2.5rem + 2px' }}
                                    className="form-control"
                                    name="email"
                                    type="text"
                                    placeholder="Email"
                                  />
                                  <FormErrorMessage fontWeight="400">{errors.email}</FormErrorMessage>
                                </FormControl>
                                <FormControl className="form-floating" isInvalid={errors.name && touched.name}>
                                  <FormLabel fontSize="16px" marginTop="10px" htmlFor="name">
                                    Name
                                  </FormLabel>
                                  <Field
                                    style={{ height: 'calc(2.5rem + 2px' }}
                                    className="form-control"
                                    name="name"
                                    type="text"
                                    placeholder="Full Name"
                                  />
                                  <FormErrorMessage fontWeight="400">{errors.name}</FormErrorMessage>
                                </FormControl>
                                <FormControl className="form-floating" isInvalid={errors.subject && touched.subject}>
                                  <FormLabel fontSize="16px" marginTop="10px" htmlFor="subject">
                                    Subject
                                  </FormLabel>
                                  <Field
                                    style={{ height: 'calc(2.5rem + 2px' }}
                                    className="form-control"
                                    name="subject"
                                    type="text"
                                    placeholder="Subject"
                                  />
                                  <FormErrorMessage fontWeight="400">{errors.subject}</FormErrorMessage>
                                </FormControl>

                                <FormControl
                                  className="form-floating"
                                  isInvalid={errors.description && touched.description}
                                >
                                  <FormLabel
                                    id="helpDescriptionLabel"
                                    fontSize="16px"
                                    marginTop="10px"
                                    htmlFor="description"
                                  >
                                    Description
                                  </FormLabel>
                                  <Field
                                    id="helpDescription"
                                    as={Textarea}
                                    style={{ height: '8rem' }}
                                    className="form-control"
                                    name="description"
                                    placeholder="Description"
                                    resize="none"
                                  />
                                  <FormErrorMessage fontWeight="400">{errors.description}</FormErrorMessage>
                                </FormControl>
                                <Button
                                  _hover={{
                                    opacity: '.8',
                                  }}
                                  _focus={{
                                    outline: 0,
                                    boxShadow: 'none',
                                  }}
                                  mt="2rem"
                                  color="#fff"
                                  backgroundColor="#635bff"
                                  type="submit"
                                  fontSize="16px"
                                >
                                  Submit
                                </Button>
                              </Form>
                            )}
                          </Formik>
                        </Box>
                      </Flex>
                    ) : (
                      <Flex marginRight="8rem" justifyContent="center">
                        <Loader isLoading={formSubmissionLoading} loadingMessage="Loading..." />
                      </Flex>
                    )}
                  </>
                ) : (
                  <Flex margin="3rem 0 0 2rem" fontSize="1.25rem" maxWidth="50rem">
                    {formSubmitted}
                  </Flex>
                )}
              </Flex>
            </Box>
          </section>
        </>
      )}
    </>
  );
};
