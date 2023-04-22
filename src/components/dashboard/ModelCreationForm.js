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
  useToast,
} from '@chakra-ui/react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { errorMap } from '../ErrorMap';
import { Loader } from '../../components/Loader';
import { MODEL_FORM, MODEL_INDUSTRIES } from '../../constants/model';
import { FACEBOOK_METRICS } from '../../services/facebook/constants';

export const ModelCreationForm = ({ onClose, integrationsStore, integrationsPayloadName, formSubmitBtn }) => {
  const [hasModelCreationErr, setModelCreationErr] = useState(null);
  const [isModelCreationLoading, setModelCreationLoading] = useState(false);
  const [activeInsight, setActiveInsight] = useState(null);
  const { getAuthToken, getAppToken, currentUser } = useAuth();
  const { handleRunModel } = useRunModel();
  const toast = useToast();

  // form validation schema
  const LoginSchema = Yup.object().shape({
    company: Yup.string()
      .min(2)
      .max(60)
      .matches(
        /^[^@$%^&*()[\]~`"';:+<>=?,.]+$/,
        'Please use only letters, numbers, dashes, or underscores in your company.'
      )
      .required('Providing a company is required.'),
    industry: Yup.string().required('Selecting an industry is required.'),
    adAccountSelect: Yup.string().required('Selecting an ad account is required.'),
  });

  const handleCloseBtnClick = () => setModelCreationErr(null);
  const showToastMessage = (modelResponse) => {
    if (!modelResponse) {
      return toast({
        title: 'Model Creation Error',
        description: errorMap.get('failed to create model'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    toast({
      title: 'Model Creation Success',
      description: "Your model was successfully initiated. We will email you when it's ready for viewing",
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };
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
    const activeInsight = activeCampaigns.find((activeCampaign) => activeCampaign.activeInsight)?.activeInsight;
    setModelCreationLoading(true);
    const dateAsISOString = new Date().toISOString();
    const dateAndTime = dateAsISOString.slice(0, dateAsISOString.length - 5);
    // initaite model creation
    const runModelResponse = await handleRunModel(
      {
        FIREBASE_ID_TOKEN: authToken,
        UID: integrationPayload.uid,
        AD_ACCOUNT_ID: integrationPayload.adAccountId,
        FB_CAMPAIGN_IDS: activeCampaignIds,
        FB_CAMPAIGNS: activeCampaigns,
        FB_CAMPAIGN_INSIGHT: activeInsight,
        SYSTEM_USER_ACCESS_TOKEN: integrationPayload.sysUserAccessToken,
        COMPANY: values.company,
        INDUSTRY: values.industry,
        MODEL_NAME: `${values.company}_${activeInsight}_${integrationPayload.adAccountId}_${dateAndTime}`,
      },
      appCheckToken
    );
    setModelCreationLoading(false);
    // close modal form
    onClose();
    // show success or err toast depending on model creation response
    showToastMessage(runModelResponse);
  };

  return (
    <>
      <Flex flexDirection="column">
        <Loader isLoading={isModelCreationLoading} loadingMessage="Loading..." minHeight="28vh" />
        {hasModelCreationErr && (
          <Alert margin="1rem 0" status="error">
            <AlertIcon />
            {hasModelCreationErr}
            <CloseButton onClick={handleCloseBtnClick} position="absolute" right="8px" top="8px" />
          </Alert>
        )}
        {!isModelCreationLoading && (
          <Formik
            initialValues={{
              company: '',
              industry: '',
              adAccountSelect: '',
            }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form width="330px">
                <FormControl className="form-floating" isInvalid={errors.company && touched.company}>
                  <FormLabel fontSize="16px" marginTop="10px" htmlFor="company">
                    {MODEL_FORM.COMPANY}
                  </FormLabel>
                  <Field
                    style={{ height: 'calc(2.5rem + 2px' }}
                    className="form-control"
                    name="company"
                    type="text"
                    placeholder="Company"
                  />
                  <FormErrorMessage>{errors.company}</FormErrorMessage>
                </FormControl>

                <Field>
                  {({ field }) => (
                    <>
                      <FormControl
                        className="form-floating"
                        isInvalid={errors.industry && touched.industry}
                        name="industry"
                        id="industry"
                      >
                        <FormLabel fontSize="16px" marginTop="10px" htmlFor="industry">
                          {MODEL_FORM.INDUSTRY}
                        </FormLabel>
                        <Select margin="0" onChange={field.onChange} name="industry" placeholder="Select an industry">
                          {Object.values(MODEL_INDUSTRIES).map((industry, i) => (
                            <option key={i} value={industry}>
                              {industry}
                            </option>
                          ))}
                        </Select>
                        <FormErrorMessage>{errors.industry}</FormErrorMessage>
                      </FormControl>

                      <FormControl
                        className="form-floating"
                        isInvalid={errors.adAccountSelect && touched.adAccountSelect}
                        name="adAccountSelect"
                        id="adAccountSelect"
                      >
                        <FormLabel fontSize="16px" marginTop="10px" htmlFor="account">
                          {MODEL_FORM.ACCOUNT}
                        </FormLabel>
                        <Select
                          margin="0"
                          onChange={(e) => {
                            field.onChange(e);
                            const selectedAccount = e.target.value;
                            const selectedAccountIntegration = integrationsStore?.[integrationsPayloadName]?.find(
                              (integration) => integration.adAccountId === selectedAccount
                            );
                            if (!selectedAccountIntegration) setActiveInsight(null);
                            if (
                              selectedAccountIntegration &&
                              Array.isArray(selectedAccountIntegration.adCampaignList) &&
                              selectedAccountIntegration.adCampaignList.length > 0
                            ) {
                              const insight = selectedAccountIntegration.adCampaignList.find(
                                (campaign) => campaign.activeInsight
                              ).activeInsight;
                              if (!insight) return;
                              setActiveInsight(FACEBOOK_METRICS[insight]);
                            }
                          }}
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
                    </>
                  )}
                </Field>

                <FormControl className="form-floating">
                  <FormLabel fontSize="16px" marginTop="10px" htmlFor="industry">
                    <Flex flexDir="column">
                      {MODEL_FORM.KPI}
                      <span style={{ fontSize: '13px' }}>
                        Your KPI will appear here after you select an ad account.
                      </span>
                    </Flex>
                  </FormLabel>
                  <Field
                    style={{
                      height: 'calc(2.5rem + 2px',
                      color: '#635bff',
                      backgroundColor: '#eee',
                      cursor: 'not-allowed',
                    }}
                    className="form-control"
                    name="KPI"
                    type="text"
                    placeholder="e.g. Clicks"
                    value={activeInsight || ''}
                    disabled
                  />
                </FormControl>

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
        )}
      </Flex>
    </>
  );
};
