// @flow
// no-unused-vars
import * as React from 'react';
// no-unused-vars
import { ViewPropTypes } from 'react-native';

declare module 'react-native-google-signin' {

  declare type ConfigureParams = {|
    iosClientId?: string,
    offlineAccess?: boolean,
    webClientId?: string,
    scopes?: string[],
    hostedDomain?: string,
    forceConsentPrompt?: boolean,
    accountName?: string,
  |};


  declare type GoogleSigninButtonProps = {|
    size: number;
    color: string;
    disabled: boolean;
    onPress: () => any;
  |} & ViewPropTypes;


  declare class GoogleSigninButton extends React.Component<GoogleSigninButtonProps>{}

  declare type HasPlayServicesParams = {|
    showPlayServicesUpdateDialog: boolean,
  |};

  declare type User = {|
    idToken: string,
    accessToken: string | null,
    accessTokenExpirationDate: number | null, // DEPRECATED, on iOS it's a time interval since now in seconds, on Android it's always null
    serverAuthCode: string,
    scopes: string[], // on iOS this is empty array if no additional scopes are defined
    user: {|
      email: string,
      id: string,
      givenName: ?string,
      familyName: ?string,
      photo: ?string, // url
      name: string, // full name
    |},
  |};

  // Android Status codes: https://developers.google.com/android/reference/com/google/android/gms/auth/api/signin/GoogleSignInStatusCodes
  declare type StatusCodes = {
    SIGN_IN_CANCELLED: string,
    IN_PROGRESS: string,
    PLAY_SERVICES_NOT_AVAILABLE: string,
  };

  declare type GoogleSignin = {
    +hasPlayServices: (params?: HasPlayServicesParams) => Promise<boolean>,
    +configure: (params?: ConfigureParams) => void,
    +signInSilently: () => Promise<User>,
    +signIn: () => Promise<User>,
    +signOut: () => Promise<void>,
    +revokeAccess: () => Promise<void>,
    +isSignedIn: () => Promise<boolean>,
  };
}
