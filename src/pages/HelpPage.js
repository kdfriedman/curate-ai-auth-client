import { useState } from 'react';
import { Header } from '../components/Header';
import { Flex, Box, useMediaQuery, Button, FormControl, FormLabel, FormErrorMessage, Textarea } from '@chakra-ui/react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Loader } from '../components/Loader';

export const HelpPage = () => {
  const [isLoading, setLoading] = useState(false);
  const isEqualToOrLessThan450 = useMediaQuery('(max-width: 450px)');
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');

  // form validation schema
  const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Providing an email is required.'),
    name: Yup.string()
      .min(2)
      .max(120)
      .matches(/^[a-zA-Z0-9\s]+$/i, 'Invalid characters')
      .required('Providing a description is required.'),
    subject: Yup.string()
      .min(2)
      .max(40)
      .matches(/^[a-zA-Z0-9\s,.()\-_]+$/i, 'Invalid characters')
      .required('Providing a subject is required.'),
    description: Yup.string()
      .min(2)
      .max(120)
      .matches(/^[a-zA-Z0-9\s,.()\-_]+$/i, 'Invalid characters')
      .required('Providing a description is required.'),
  });

  return (
    <>
      <Header />
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
                <Flex
                  padding={isEqualToOrLessThan800[0] ? '1rem 1rem 0 1rem' : '2rem 0 0 2rem'}
                  fontWeight="600"
                  fontSize="14px"
                  maxWidth="50rem"
                >
                  Please fill out the contact form below and we'll get back to you as soon as possible. Whether you need
                  technical support, information about our products or services, or simply have a general question, our
                  team is ready to help.
                </Flex>
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
                      onSubmit={() => console.log('solved')}
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

                          <FormControl className="form-floating" isInvalid={errors.description && touched.description}>
                            <FormLabel id="helpDescriptionLabel" fontSize="16px" marginTop="10px" htmlFor="description">
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
              </Flex>
            </Box>
          </section>
        </>
      )}
    </>
  );
};
