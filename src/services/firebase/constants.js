export const FIREBASE = {
  FIRESTORE: {
    CURATEAI: {
      UID: 'oixaOBWftYMd2kZjD2Yx',
      COLLECTION: 'curateai',
    },
    FACEBOOK: {
      COLLECTIONS: ['clients', 'integrations'],
      DOCS: ['facebook'],
      PAYLOAD_NAME: 'facebookBusinessAccts',
    },
    MODELS: {
      COLLECTIONS: ['clients', 'models'],
      DOCS: ['image-and-video', 'modelState'],
      PAYLOAD_NAME: 'output',
      CREATION_LIMIT: 'modelCreationLimit',
      IS_MODEL_LOADING: 'isModelLoading',
    },
    EMAILS: {
      COLLECTION: 'emails',
    },
    GENERIC: {
      UNION_ADDED: 'New union has been added to firestore',
      RECORD_CREATED: 'New firestore record has been created',
      RECORD_UPDATED: 'Firestore record has been updated',
    },
  },
};

export const FIREBASE_ERROR = {
  FIRESTORE: {
    CURATEAI: {
      SYSTEM_USER_ACCESS_TOKEN_CANNOT_BE_FETCHED: 'CurateAI system user token not fetchable',
    },
    GENERIC: {
      FAILED_READING_DATA: 'There was an err reading data from firestore',
      FAILED_REMOVING_DATA: 'There was an err removing data from firestore',
      DUPLICATE_RECORD: 'This record cannot be added because it already exists in firestore',
      FAILED_TO_UNION_TO_ARRAY: 'Failed to union data to preexisting firestore array',
      FAILED_TO_CREATE_NEW_RECORD: 'Failed to create new record',
    },
  },
};
