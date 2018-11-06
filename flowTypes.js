// @flow
import * as React from 'react';

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
    size?: number,
    color?: string,
    disabled?: boolean,
    style: any,
    onPress?: () => any,
  |};

  declare export class GoogleSigninButton extends React$Component<GoogleSigninButtonProps> {
    static Size: {
      Icon: number,
      Standard: number,
      Wide: number,
    };

    static Color: {
      Auto: string,
      Light: string,
      Dark: string,
    };
  }

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
    SIGN_IN_REQUIRED: string,
  };

  declare export var statusCodes: StatusCodes;

  declare export class GoogleSignin {
    static hasPlayServices: (params?: HasPlayServicesParams) => Promise<boolean>;
    static configure: (params?: ConfigureParams) => void;
    static signInSilently: () => Promise<User>;
    static signIn: () => Promise<User>;
    static signOut: () => Promise<void>;
    static revokeAccess: () => Promise<void>;
    static isSignedIn: () => Promise<boolean>;
  }
}
