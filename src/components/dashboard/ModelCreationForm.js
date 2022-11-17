import React, { useState } from 'react';
import { useRunModel } from '../../hooks/useRunModel';
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
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';

export const ModelCreationForm = ({
  onClose,
  integrationsStore,
  integrationsPayloadName,
  formSingleLabel,
  formSelectLabel,
  formSubmitBtn,
}) => {
  const [hasModelCreationErr, setModelCreationErr] = useState(null);
  const [isModelCreationLoading, setModelCreationLoading] = useState(false);
  const { getAuthToken, getAppToken, currentUser } = useAuth();
  const { handleRunModel } = useRunModel();

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
  const handleSubmit = async (values) => {
    const integrationPayload = integrationsStore[integrationsPayloadName].find(
      (integration) => integration.adAccountId === values.adAccountSelect
    );

    if (!integrationPayload) {
      return setModelCreationErr('You must have at least (1) matching integration id to run a model');
    }

    const { token: appCheckToken } = (await getAppToken(currentUser)) ?? {};
    const authToken = await getAuthToken(currentUser);
    const activeCampaigns = integrationPayload.adCampaignList.filter((adCampaign) => adCampaign.isActive);

    if (activeCampaigns.length === 0) {
      return setModelCreationErr('You must select at least (1) campaign to run a model.');
    }

    const activeCampaignIds = activeCampaigns.map((activeCampaign) => activeCampaign.id);
    setModelCreationLoading(true);

    const [completedModel, modelState] = await handleRunModel(
      {
        FIREBASE_ID_TOKEN: authToken,
        UID: integrationPayload.uid,
        AD_ACCOUNT_ID: integrationPayload.adAccountId,
        FB_CAMPAIGN_IDS: activeCampaignIds,
        SYSTEM_USER_ACCESS_TOKEN: integrationPayload.sysUserAccessToken,
        MODEL_NAME: values.name,
      },
      appCheckToken
    );

    console.log(modelState);
    console.log(completedModel);

    setModelCreationLoading(false);
    onClose();
  };

  return (
    <>
      <Flex flexDirection="column">
        {hasModelCreationErr && (
          <Alert margin="1rem 0" status="error">
            <AlertIcon />
            {hasModelCreationErr}
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
                mt="2rem"
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
