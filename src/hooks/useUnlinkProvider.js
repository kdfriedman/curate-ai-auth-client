import { useAuth } from '../contexts/AuthContext';
import firestoreHandlers from '../services/firebase/data/firestore';

export const useUnlinkProvider = (setProviderType) => {
  const { addRecordToFirestore } = firestoreHandlers;
  const { unlinkProvider, currentUser } = useAuth();
  const handleUnlinkProvider = async (providerType, isMounted) => {
    // if linked provider error occurs, unlink provider first before handling error further
    try {
      // filter provider object by providerType param
      const providerObj = currentUser.providerData.filter(
        (providerObj) => providerObj?.providerId === providerType
      );
      if (!providerObj || providerObj.length === 0) {
        // save errors in firestore db
        await addRecordToFirestore(
          currentUser.user.uid,
          ['clients', 'logs'],
          ['errors'],
          {
            error: {
              errMsg: 'provider cannot be unlinked because it does not exist',
              errVar: providerObj,
            },
            timeErrorOccurred: new Date().toISOString(),
          },
          'clientErrors'
        );
        console.error({
          errMsg: 'provider cannot be unlinked because it does not exist',
          errVar: providerObj,
        });
        return 'provider does not exist';
      }
      // unlink provider by providerId
      await unlinkProvider(currentUser, providerObj[0]?.providerId);

      if (isMounted) setProviderType(null);
      return 'provider unlinked';
    } catch (err) {
      if (isMounted) setProviderType(null);
      // save errors in firestore db
      await addRecordToFirestore(
        currentUser.user.uid,
        ['clients', 'logs'],
        ['errors'],
        {
          error: { errMsg: 'unlinkedProvider has err', err },
          timeErrorOccurred: new Date().toISOString(),
        },
        'clientErrors'
      );
      console.error({ errMsg: 'unlinkedProvider has err', err });
    }
  };
  return { handleUnlinkProvider };
};
