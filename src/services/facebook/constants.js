export const FACEBOOK_API = {
  GRAPH: {
    HOSTNAME: 'https://graph.facebook.com/',
    VERSION: 'v14.0',
    DEBUG_TOKEN: 'debug_token',
  },
};

export const FACEBOOK_APP = {
  CURATEAI: {
    BUSINESS_ID: '419312452044680',
  },
};

export const ACTION_TYPES = {
  IS_FETCH_FACEBOOK_BUSINESS_ACCOUNTS: 'isFetchFacebookBusinessAccounts',
  IS_FETCH_FACEBOOK_SYSTEM_USER_TOKEN: 'isFetchFacebookSystemUserToken',
  IS_FETCH_FACEBOOK_AD_ASSET_ASSIGNMENT: 'isFetchFacebookAdAssetAssignment',
  IS_LOADING: 'isLoading',
  HAS_ERRORS: 'hasErrors',
  IS_BUTTON_CLICKED: 'isBtnClicked',
  USER_BUSINESS_LIST: 'userBusinessList',
  USER_BUSINESS_ID: 'userBusinessId',
  SYSTEM_USER_ACCESS_TOKEN: 'sysUserAccessToken',
  BUSINESS_AD_ACCOUNT_LIST: 'businessAdAcctList',
  BUSINESS_SYSTEM_USER_ID: 'businessSystemUserId',
  BUSINESS_ASSET_ID: 'businessAssetId',
};

export const OBJECTIVES = [
  { type: 'APP_PROMOTION', id: 1 },
  { type: 'AWARENESS', id: 2 },
  { type: 'ENGAGEMENT', id: 3 },
  { type: 'LEADS', id: 4 },
  { type: 'SALES', id: 5 },
  { type: 'TRAFFIC', id: 6 },
  { type: 'APP_INSTALLS', id: 7 },
  { type: 'BRAND_AWARENESS', id: 8 },
  { type: 'CONVERSIONS', id: 9 },
  { type: 'EVENT_RESPONSES', id: 10 },
  { type: 'LEAD_GENERATION', id: 11 },
  { type: 'LINK_CLICKS', id: 12 },
  { type: 'LOCAL_AWARENESS', id: 13 },
  { type: 'MESSAGES', id: 14 },
  { type: 'OFFER_CLAIMS', id: 15 },
  { type: 'PAGE_LIKES', id: 16 },
  { type: 'POST_ENGAGEMENT', id: 17 },
  { type: 'PRODUCT_CATALOG_SALES', id: 18 },
  { type: 'REACH', id: 19 },
  { type: 'STORE_VISITS', id: 20 },
  { type: 'VIDEO_VIEWS', id: 21 },
];

export const FACEBOOK_ERROR = {
  MARKETING_API: {
    MUST_HAVE_VALID_BUSINESS_ACCOUNT:
      'User must be logged into facebook with an account that has one or more associated facebook business accounts. Log into facebook.com to select a different account.',
    USER_BUSINESS_LIST_IS_EMPTY: 'userBusinessList is an empty array',
    MUST_HAVE_VALID_AD_ACCOUNT:
      'User must be logged into facebook with an account that has one or more associated facebook ad accounts. Log into facebook.com to select a different account.',
    AD_ASSET_LIST_IS_EMPTY: 'adAcctAssetList is an empty array',
    FAILED_TO_REMOVE_SYSTEM_USER_TOKEN: 'Failed to delete system access user token',
    ERROR_VALIDATING_TOKEN: 'Error validating access token',
  },
};
