import { useCallback } from 'react';

export const useDeleteFacebookSystemUser = () => {
  const handleDeleteFacebookSystemUser = useCallback(async () => {
    try {
    } catch (err) {
      console.error({ errMsg: 'unlinkedProvider has err', err });
    }
  }, []);
  return { handleDeleteFacebookSystemUser };
};
