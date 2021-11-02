import { useAuth } from '../contexts/AuthContext';
import firestoreHandlers from '../services/firebase/data/firestore';

export const useIntegrationError = (setIntegrationError, setProviderType) => {
  const { addRecordToFirestore } = firestoreHandlers;
  const { unlinkProvider, currentUser } = useAuth();
  const handleIntegrationError = async (isMounted, providerType) => {
    // if linked provider error occurs, unlink provider first before handling error further
    try {
      // filter provider object by providerType param
      const providerObj = currentUser.providerData.filter(
        (providerObj) => providerObj?.providerId === providerType
      );
      if (!providerObj ?? providerObj.length === 0) {
        console.error({
          errMsg: 'provider cannot be unlinked because it does not exist',
          errVar: providerObj,
        });
        return 'provider does not exist';
      }
      // unlink provider by providerId
      await unlinkProvider(currentUser, providerObj[0]?.providerId);
      console.log(`${providerType} unlinked`);

      if (isMounted) {
        // reset integration error
        setIntegrationError(null);
        // reset provider type
        setProviderType(null);
      }
    } catch (err) {
      if (isMounted) {
        // reset integration error
        setIntegrationError(null);
        // reset provider type
        setProviderType(null);
      }
      // save errors in firestore db
      await addRecordToFirestore(
        currentUser.user.uid,
        ['clients', 'logs'],
        ['errors'],
        {
          error: err,
          timeErrorOccurred: new Date().toISOString(),
        },
        'clientErrors'
      );
      console.error({ errMsg: 'unlinkedProvider has err', err });
    }
  };
  return { handleIntegrationError };
};
