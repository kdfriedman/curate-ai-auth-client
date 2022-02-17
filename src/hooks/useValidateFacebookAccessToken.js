import fetchData from '../services/fetch/fetch';
import { HTTP_METHODS } from '../services/fetch/constants';
import { FACEBOOK_API } from '../services/facebook/constants';
import { FIREBASE } from '../services/firebase/constants';
import firestoreHandlers from '../services/firebase/data/firestore';

const { readCurateAIRecordFromFirestore } = firestoreHandlers;

const fetchCurateAISystemUserAccessToken = async () => {
  // read record from firestore to retrieve curateai sys user token
  const [record, error] = await readCurateAIRecordFromFirestore(
    FIREBASE.FIRESTORE.CURATEAI.UID,
    FIREBASE.FIRESTORE.CURATEAI.COLLECTION
  );
  if (error || !record?.exists) return console.error('Cannot fetch CurateAI access token');
  const { curateAiSysUserAccessToken } = record?.data();
  return curateAiSysUserAccessToken;
};

export const useValidateFacebookAccessToken = () => {
  const { GET } = HTTP_METHODS;
  const handleValidateFacebookAccessToken = async (facebookAccessToken) => {
    const adminToken = await fetchCurateAISystemUserAccessToken();
    try {
      const [validatedAccessToken, validatedAccessTokenError] = await fetchData({
        method: GET,
        url: `${FACEBOOK_API.GRAPH.HOSTNAME}${FACEBOOK_API.GRAPH.DEBUG_TOKEN}?input_token=${facebookAccessToken}&access_token=${adminToken}`,
      });
      if (validatedAccessTokenError) throw validatedAccessTokenError;
      return [validatedAccessToken, null];
    } catch (err) {
      return [null, err];
    }
  };
  return { handleValidateFacebookAccessToken };
};
