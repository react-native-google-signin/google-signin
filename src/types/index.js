// @flow
export type ConfigureParams = {
  iosClientId?: string,
  offlineAccess?: boolean,
  webClientId?: string,
  scopes?: string[],
  hostedDomain?: string,
  forceConsentPrompt?: boolean,
  accountName?: string
};

export type HasPlayServicesParams = {|
  showPlayServicesUpdateDialog: boolean
|};

export type User = {
  idToken: string,
  accessToken: string | null,
  accessTokenExpirationDate: number | null, // DEPRECATED, on iOS it's a time interval since now in seconds, on Android it's always null
  serverAuthCode: string,
  scopes: string[], // on iOS this is empty array if no additional scopes are defined
  user: {
    email: string,
    id: string,
    givenName: string,
    familyName: string,
    photo: string, // url
    name: string // full name
  }
};
