import { Platform } from 'react-native';
import {
  AddScopesParams,
  CancelledResponse,
  ConfigureParams,
  GetTokensResponse,
  HasPlayServicesParams,
  NoSavedCredentialFound,
  SignInParams,
  User,
} from '../types';
import { NativeModule } from '../spec/NativeGoogleSignin';
import {
  ios_only_SCOPES_ALREADY_GRANTED,
  SIGN_IN_REQUIRED_CODE,
} from '../errors/errorCodes';
import { noSavedCredentialFoundResult } from '../constants';
import { translateCancellationError } from '../translateNativeRejection';
import { isErrorWithCode } from '../functions';

let configPromise = Promise.resolve();

function configure(options: ConfigureParams = {}): void {
  if (options.offlineAccess && !options.webClientId) {
    throw new Error('RNGoogleSignin: offline use requires server web ClientID');
  }
  if ('androidClientId' in options) {
    console.error(
      'RNGoogleSignIn: `androidClientId` is not a valid configuration parameter, please remove it.',
    );
  }

  configPromise = NativeModule.configure(options);
}

/**
 * The response object when the user signs in successfully.
 *
 * @group Original Google sign in
 * */
export type SignInSuccessResponse = {
  type: 'success';
  /**
   * The user details.
   * */
  data: User;
};

/**
 * @group Original Google sign in
 * */
export type SignInResponse = SignInSuccessResponse | CancelledResponse;

async function signIn(options: SignInParams = {}): Promise<SignInResponse> {
  await configPromise;
  try {
    const user = (await NativeModule.signIn(options)) as User;
    return createSuccessResponse(user);
  } catch (err) {
    return translateCancellationError(err);
  }
}

async function hasPlayServices(
  options?: HasPlayServicesParams,
): Promise<boolean> {
  if (Platform.OS === 'ios') {
    return true;
  } else {
    if (process.env.NODE_ENV !== 'production') {
      if (options && options.showPlayServicesUpdateDialog === undefined) {
        throw new Error(
          'RNGoogleSignin: Missing property `showPlayServicesUpdateDialog` in options object for `hasPlayServices`',
        );
      }
    }
    return NativeModule.playServicesAvailable(
      options?.showPlayServicesUpdateDialog !== false,
    );
  }
}

async function addScopes(
  options: AddScopesParams,
): Promise<SignInResponse | null> {
  if (Platform.OS === 'ios') {
    try {
      const user = (await NativeModule.addScopes(options)) as User | null;
      if (!user) {
        return null;
      }
      return createSuccessResponse(user);
    } catch (err) {
      if (
        isErrorWithCode(err) &&
        err.code === ios_only_SCOPES_ALREADY_GRANTED
      ) {
        // return the scopes that are already granted
        const user = GoogleSignin.getCurrentUser();
        if (!user) {
          return null;
        }
        return createSuccessResponse(user);
      }
      return translateCancellationError(err);
    }
  } else {
    // false if no user is signed in
    const hasUser = await NativeModule.addScopes(options);
    if (!hasUser) {
      return null;
    }
    // on Android, the user returned in onActivityResult() will contain only the scopes added, not the ones present previously
    // we work around it by calling signInSilently() which returns the user object with all scopes
    // @ts-expect-error `noSavedCredentialFound` is not possible here, because we just added scopes
    return signInSilently();
  }
}

/**
 * The response object for calling `signInSilently`. Either the user details are available (without user interaction) or there was no saved credential found.
 * @group Original Google sign in
 * */
export type SignInSilentlyResponse =
  | SignInSuccessResponse
  | NoSavedCredentialFound;

async function signInSilently(): Promise<SignInSilentlyResponse> {
  try {
    await configPromise;
    const user = (await NativeModule.signInSilently()) as User;
    return createSuccessResponse(user);
  } catch (err) {
    if (isErrorWithCode(err) && err.code === SIGN_IN_REQUIRED_CODE) {
      return noSavedCredentialFoundResult;
    }
    throw err;
  }
}

async function signOut(): Promise<null> {
  return NativeModule.signOut();
}

async function revokeAccess(): Promise<null> {
  return NativeModule.revokeAccess();
}

function hasPreviousSignIn(): boolean {
  return NativeModule.hasPreviousSignIn();
}

function getCurrentUser(): User | null {
  return NativeModule.getCurrentUser() as User | null;
}

async function clearCachedAccessToken(tokenString: string): Promise<null> {
  if (!tokenString || typeof tokenString !== 'string') {
    return Promise.reject(
      'GoogleSignIn: clearCachedAccessToken() expects a string token.',
    );
  }
  return Platform.OS === 'ios'
    ? null
    : NativeModule.clearCachedAccessToken(tokenString);
}

async function getTokens(): Promise<GetTokensResponse> {
  if (Platform.OS === 'ios') {
    return NativeModule.getTokens();
  } else {
    const userObject = await NativeModule.getTokens();
    return {
      idToken: userObject.idToken,
      accessToken: userObject.accessToken,
    };
  }
}

const createSuccessResponse = (data: User): SignInSuccessResponse => ({
  type: 'success',
  data,
});

/**
 * The entry point of the Google Sign In API, exposed as `GoogleSignin`.
 * @group Original Google sign in
 * */
export const GoogleSignin = {
  hasPlayServices,
  configure,
  signIn,
  addScopes,
  signInSilently,
  signOut,
  revokeAccess,
  hasPreviousSignIn,
  getCurrentUser,
  clearCachedAccessToken,
  getTokens,
};
