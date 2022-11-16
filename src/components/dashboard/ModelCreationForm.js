import React, { useState, useEffect } from 'react';
import {
  Flex,
  Select,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Alert,
  AlertIcon,
  CloseButton,
} from '@chakra-ui/react';
import { errorMap } from '../ErrorMap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

export const ModelCreationForm = ({
  onClose,
  integrationsStore,
  integrationsPayloadName,
  formSingleLabel,
  formSelectLabel,
  formSubmitBtn,
}) => {
  const [hasModelCreationErr, setModelCreationErr] = useState(false);
  const [isModelCreationLoading, setModelCreationLoading] = useState(false);
  const [values, setValues] = useState();

  useEffect(() => {
    if (values?.name) {
      console.log(values);
      // TODO: create real createModel api call here
      // createModel()
      //   .then((response) => {
      //     // make state updates with response data
      //     onClose();
      //   })
      //   .catch((err) => {
      //     console.error(err);
      //     setModelCreationErr('failed to create model');
      //   });
      onClose();
    }
  }, [values, onClose]);

  // form validation schema
  const LoginSchema = Yup.object().shape({
    name: Yup.string()
      .min(2)
      .max(60)
      .matches(
        /^[^@$%^&*()[\]~`"';:+<>=?,.]+$/,
        'Please use only letters, numbers, dashes, or underscores in your model name.'
      )
      .required('Providing a name is required.'),
    adAccountSelect: Yup.string().required('Selecting an ad account is required.'),
  });

  const handleCloseBtnClick = () => setModelCreationErr(null);
  const handleSubmit = async (values) => setValues(values);

  return (
    <>
      <Flex flexDirection="column">
        {hasModelCreationErr && (
          <Alert margin="1rem 0" status="error">
            <AlertIcon />
            {errorMap.get(hasModelCreationErr)}
            <CloseButton onClick={handleCloseBtnClick} position="absolute" right="8px" top="8px" />
          </Alert>
        )}
        <Formik
          initialValues={{
            name: '',
            adAccountSelect: '',
          }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form width="330px">
              <FormControl className="form-floating" isInvalid={errors.name && touched.name}>
                <FormLabel fontSize="16px" marginTop="10px" htmlFor="name">
                  {formSingleLabel}
                </FormLabel>
                <Field
                  style={{ height: 'calc(2.5rem + 2px' }}
                  className="form-control"
                  name="name"
                  type="text"
                  placeholder="Name"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <Field>
                {({ field, form }) => (
                  <FormControl
                    className="form-floating"
                    isInvalid={errors.adAccountSelect && touched.adAccountSelect}
                    name="adAccountSelect"
                    id="adAccountSelect"
                  >
                    <FormLabel fontSize="16px" marginTop="10px" htmlFor="name">
                      {formSelectLabel}
                    </FormLabel>
                    <Select
                      margin="0"
                      onChange={field.onChange}
                      name="adAccountSelect"
                      placeholder="Select an ad account"
                    >
                      {integrationsStore?.[integrationsPayloadName]?.map((integration, i) => (
                        <option key={integration.id} value={integration.adAccountId}>
                          {integration.adAccountId + ' | ' + integration.businessAcctName}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.adAccountSelect}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              <Button
                disabled={isModelCreationLoading}
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
                {formSubmitBtn}
              </Button>
            </Form>
          )}
        </Formik>
      </Flex>
    </>
  );
};
