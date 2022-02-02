export const FACEBOOK_API = {
  GRAPH: {
    HOSTNAME: 'https://graph.facebook.com/',
    VERSION: 'v12.0',
  },
};

export const FACEBOOK_APP = {
  CURATEAI: {
    BUSINESS_ID: '419312452044680',
  },
};

export const ACTION_TYPES = {
  IS_LOADING: 'isLoading',
  HAS_ERRORS: 'hasErrors',
  IS_BUTTON_CLICKED: 'isBtnClicked',
  USER_BUSINESS_LIST: 'userBusinessList',
  HAS_USER_BUSINESS_LIST: 'hasUserBusinessList',
  HAS_USER_BUSINESS_ID: 'hasUserBusinessId',
  USER_BUSINESS_ID: 'userBusinessId',
  SYSTEM_USER_ACCESS_TOKEN: 'sysUserAccessToken',
  BUSINESS_AD_ACCOUNT_LIST: 'businessAdAcctList',
  BUSINESS_SYSTEM_USER_ID: 'businessSystemUserId',
  BUSINESS_ASSET_ID: 'businessAssetId',
};

export const FACEBOOK_ERROR = {
  MARKETING_API: {
    MUST_HAVE_VALID_BUSINESS_ACCOUNT:
      'User must be logged into facebook with an account that has one or more associated facebook business accounts. Log into facebook.com to select a different account.',
    USER_BUSINESS_LIST_IS_EMPTY: 'userBusinessList is an empty array',
    MUST_HAVE_VALID_AD_ACCOUNT:
      'User must be logged into facebook with an account that has one or more associated facebook ad accounts. Log into facebook.com to select a different account.',
    AD_ASSET_LIST_IS_EMPTY: 'adAcctAssetList is an empty array',
  },
};
