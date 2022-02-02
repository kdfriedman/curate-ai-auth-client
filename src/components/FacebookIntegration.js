import { useEffect, useReducer } from 'react';
import fetchData from '../services/fetch/fetch';
import AcctSelector from './AcctSelector';
import firestoreHandlers from '../services/firebase/data/firestore';
import { Progress, Text, Link, useMediaQuery } from '@chakra-ui/react';
import { v4 as uuidv4 } from 'uuid';
import { FACEBOOK_API, FACEBOOK_APP, ACTION_TYPES, FACEBOOK_ERROR } from '../services/facebook/constants';
import { HTTP_METHODS } from '../services/fetch/constants';
import { catchErrors } from '../util/error.js';
import { useFacebookAuth } from '../contexts/FacebookContext';
import { ERROR } from '../constants/error';
import { useFetchFacebookBusinessAccounts } from '../hooks/useFetchFacebookBusinessAccounts';
import { useFetchFacebookSystemUserToken } from '../hooks/useFetchFacebookSystemUserToken';

const FacebookAppIntegration = ({ setIntegrationRecord }) => {
  const isEqualToOrLessThan450 = useMediaQuery('(max-width: 450px)');

  // facebook auth context
  const { facebookAuthChange } = useFacebookAuth();

  // firestore db functions
  const { addRecordToFirestore, readCurateAIRecordFromFirestore, readUserRecordFromFirestore } = firestoreHandlers;

  // http methods
  const { GET, POST } = HTTP_METHODS;

  // setup useReducer callback function
  const reducer = (state, action) => {
    const { type, payload } = action;
    return { ...state, [type]: payload };
  };

  // reducer action types
  const { IS_LOADING, HAS_USER_BUSINESS_ID, USER_BUSINESS_ID, BUSINESS_SYSTEM_USER_ID, BUSINESS_ASSET_ID } =
    ACTION_TYPES;

  // setup initial field object for reducer function
  const initialState = {
    isLoading: false,
    hasErrors: null,
    isFacebookLoginAction: false,
    isBtnClicked: false,
    userBusinessList: null,
    hasUserBusinessList: false,
    hasUserBusinessId: false,
    userBusinessId: null,
    sysUserAccessToken: null,
    businessAdAcctList: null,
    businessSystemUserId: null,
    businessAssetId: null,
  };

  // setup reducer hook
  const [state, dispatch] = useReducer(reducer, initialState);

  // destructure state object into individual state properties
  const {
    isLoading,
    hasErrors,
    userBusinessList,
    hasUserBusinessList,
    hasUserBusinessId,
    userBusinessId,
    sysUserAccessToken,
    businessAdAcctList,
    businessSystemUserId,
    businessAssetId,
  } = state;

  // custom hooks for fetching fb business lists
  const { handleFetchFacebookBusinessAccounts } = useFetchFacebookBusinessAccounts();
  const { handleFetchFacebookSystemUserToken } = useFetchFacebookSystemUserToken();

  // fetch user business accts list
  useEffect(() => {
    if (!facebookAuthChange?.authResponse) return null;
    handleFetchFacebookBusinessAccounts(dispatch, catchErrors).catch((err) => console.error(err));
  }, [handleFetchFacebookBusinessAccounts, facebookAuthChange]);

  // connect partner business with client business, create sys user in client business, fetch client ad account list
  useEffect(() => {
    if (!hasUserBusinessId) return null;
    handleFetchFacebookSystemUserToken(dispatch, catchErrors, userBusinessId).catch((err) => console.error(err));
  }, [handleFetchFacebookSystemUserToken, hasUserBusinessId, userBusinessId]);

  /******* 
  3rd useEffect hook - add assets to sys user within client's business acct 
  *******/
  useEffect(() => {
    // async wrapper function to allow multiple requests
    const fetchSystemUserAssetData = async () => {
      // assign assets to system user on behalf of client business manager acct
      const [, sysUserAssetAssignmentDataError] = await fetchData({
        method: POST,
        url: `${FACEBOOK_API.GRAPH.HOSTNAME}${FACEBOOK_API.GRAPH.VERSION}/${businessAssetId}/assigned_users?user=${businessSystemUserId}&tasks=MANAGE&access_token=${facebookAuthChange?.authResponse?.accessToken}`,
      });
      if (sysUserAssetAssignmentDataError) {
        // set isLoading to true to render progress
        dispatch({
          type: IS_LOADING,
          payload: false,
        });
        return catchErrors(sysUserAssetAssignmentDataError);
      }

      // fetch list of ad campaigns to provide user for selection
      const [adCampaignListResult, adCampaignListError] = await fetchData({
        method: GET,
        url: `${FACEBOOK_API.GRAPH.HOSTNAME}${FACEBOOK_API.GRAPH.VERSION}/${businessAssetId}/campaigns?fields=name,start_time,stop_time&access_token=${facebookAuthChange?.authResponse?.accessToken}`,
      });

      if (adCampaignListError) {
        // set isLoading to true to render progress
        dispatch({
          type: IS_LOADING,
          payload: false,
        });
        return catchErrors(adCampaignListError);
      }

      // filter facebook business acct name from user business list chosen user selected id
      const fbBusinessAcctName = userBusinessList.filter((businessObject) => {
        return businessObject.id === userBusinessId;
      });

      const adCampaignList = adCampaignListResult?.data?.data.map((campaign) => {
        let startDate;
        let stopDate;

        try {
          if (campaign.start_time && campaign.stop_time) {
            const startFormattedDate = new Date(campaign.start_time).toISOString().slice(0, 10);
            const stopFormattedDate = new Date(campaign.stop_time).toISOString().slice(0, 10);
            const startFormattedDateList = startFormattedDate.split('-');
            const stopFormattedDateList = stopFormattedDate.split('-');
            const startFormattedDateLastItem = startFormattedDateList.shift();
            const stopFormattedDateLastItem = stopFormattedDateList.shift();
            startFormattedDateList.push(startFormattedDateLastItem);
            stopFormattedDateList.push(stopFormattedDateLastItem);
            startDate = startFormattedDateList.join('-');
            stopDate = stopFormattedDateList.join('-');
          }
        } catch (err) {
          console.error(err);
        }
        return {
          id: campaign.id,
          name: campaign.name,
          flight: startDate && stopDate ? `${startDate} - ${stopDate}` : 'N/A',
          isActive: false,
        };
      });

      // create payload object for facebook integration
      const facebookFirebasePayload = {
        uid: facebookAuthChange?.user?.uid, // TODO: replace with currentUser from AuthContext
        email: facebookAuthChange?.user?.email, // TODO: replace with currentUser from AuthContext
        sysUserAccessToken,
        businessAcctName: fbBusinessAcctName[0]?.name,
        businessAcctId: userBusinessId,
        adAccountId: businessAssetId,
        adCampaignList: adCampaignList,
        userAccessToken: facebookAuthChange?.authResponse?.accessToken,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };

      // update firestore with system user access token, auth uid, and email
      const addedFirestoreRecord = await addRecordToFirestore(
        facebookAuthChange.user.uid, // TODO: replace with currentUser from AuthContext
        ['clients', 'integrations'],
        ['facebook'],
        facebookFirebasePayload,
        'facebookBusinessAccts'
      );
      // read facebook record from firestore to validate if integration exists
      const [record, error] = await readUserRecordFromFirestore(
        // user id
        facebookAuthChange.user.uid, // TODO: replace with currentUser from AuthContext
        // collections
        ['clients', 'integrations'],
        // docs
        ['facebook']
      );

      if (addedFirestoreRecord?.warnMsg ?? error) {
        // reset business asset it to prevent 3rd useEffect from firing
        dispatch({
          type: BUSINESS_ASSET_ID,
          payload: null,
        });

        dispatch({
          type: BUSINESS_SYSTEM_USER_ID,
          payload: null,
        });

        // set isLoading to true to render progress
        dispatch({
          type: IS_LOADING,
          payload: false,
        });
        return catchErrors({
          errMsg: addedFirestoreRecord?.adAcctInUse ?? error,
          errUserMsg: addedFirestoreRecord?.warnMsg ?? error,
          isCustom: true,
        });
      }

      if (record?.exists) {
        const { facebookBusinessAccts } = record?.data();
        // update parent component with firestore new record data
        setIntegrationRecord({
          facebookBusinessAccts,
        });

        // reset business asset it to prevent 3rd useEffect from firing
        dispatch({
          type: BUSINESS_ASSET_ID,
          payload: null,
        });

        dispatch({
          type: BUSINESS_SYSTEM_USER_ID,
          payload: null,
        });

        // set isLoading to true to render progress
        dispatch({
          type: IS_LOADING,
          payload: false,
        });
      }
    };
    if (businessAssetId) {
      fetchSystemUserAssetData();
    }
  }, [
    businessAssetId,
    facebookAuthChange,
    businessSystemUserId,
    sysUserAccessToken,
    addRecordToFirestore,
    setIntegrationRecord,
    userBusinessId,
    userBusinessList,
    readUserRecordFromFirestore,
    GET,
    POST,
    BUSINESS_ASSET_ID,
    BUSINESS_SYSTEM_USER_ID,
    IS_LOADING,
  ]);

  // handle user business list select element event
  const handleSelectUserBusinessList = (e) => {
    // get select element value and update user business id state with chosen value
    if (e.target?.value) {
      dispatch({
        type: USER_BUSINESS_ID,
        payload: e.target?.value,
      });

      // update user business id trigger state to re-render component and call useEffect
      dispatch({
        type: HAS_USER_BUSINESS_ID,
        payload: true,
      });

      // set isLoading to true to render spinner
      dispatch({
        type: IS_LOADING,
        payload: true,
      });
    }
  };

  // handle business ad account select element event
  const handleSelectBusinessAdAcct = (e) => {
    // get select element value and update user business id state with chosen value
    if (e.target?.value) {
      dispatch({
        type: BUSINESS_ASSET_ID,
        payload: e.target?.value,
      });

      // set isLoading to true to render spinner
      dispatch({
        type: IS_LOADING,
        payload: true,
      });
    }
  };

  return (
    <>
      {/* setup spinner for fetching external data */}
      {isLoading && (
        <Progress
          colorScheme="brand"
          size="xs"
          className="loading__progress"
          margin={isEqualToOrLessThan450 ? '1.5rem 1rem 1rem 2rem' : '1rem 0 2rem 2rem'}
          width="16rem"
          isIndeterminate
        />
      )}

      {/* setup user business account selector */}
      {!isLoading && hasUserBusinessList && (
        <AcctSelector
          acctList={userBusinessList}
          onChangeHandler={handleSelectUserBusinessList}
          labelText="Choose your facebook business account:"
        />
      )}

      {/* setup business ad account selector */}
      {!isLoading && businessAdAcctList && businessAdAcctList.length > 0 && businessSystemUserId && (
        <AcctSelector
          acctList={businessAdAcctList}
          onChangeHandler={handleSelectBusinessAdAcct}
          labelText="Choose your facebook business ad account:"
        />
      )}

      {hasErrors && !isLoading && (
        <>
          <Text margin="1rem 2rem 0 2rem" color="#c5221f">
            Oops, we've encountered an error. Please contact our{' '}
            <Link
              href={`mailto:ryanwelling@gmail.com?cc=kev.d.friedman@gmail.com&subject=CurateApp.AI%20Integration%20Error&body=Error: ${hasErrors?.errUserMsg}`}
            >
              <span style={{ textDecoration: 'underline' }}>tech team for assistance.</span>
            </Link>
          </Text>
          <Text margin="1rem 2rem 0 2rem" color="#c5221f">
            {hasErrors?.errUserMsg}
          </Text>
        </>
      )}
    </>
  );
};

export default FacebookAppIntegration;
