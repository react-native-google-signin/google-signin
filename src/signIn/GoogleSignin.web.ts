import type {
  AddScopesParams,
  ConfigureParams,
  GetTokensResponse,
  HasPlayServicesParams,
  SignInParams,
  User,
} from '../types';
import { statusCodes } from '../errors/errorCodes.web';
const errorMessage =
  'RNGoogleSignIn: you are calling a not-implemented method on web platform. Web support is only available to sponsors. \n' +
  'If you are a sponsor, please follow the installation instructions carefully to obtain the implementation.';

const logNotImplementedError = () => {
  console.warn(errorMessage);
};

function throwNotImplementedError(): never {
  const e = new Error(errorMessage);
  // the docs say that the errors produced by the module should have a code property
  Object.assign(e, { code: statusCodes.PLAY_SERVICES_NOT_AVAILABLE });
  throw e;
}

async function signIn(_options: SignInParams = {}): Promise<User> {
  throwNotImplementedError();
}

async function hasPlayServices(
  _options: HasPlayServicesParams = { showPlayServicesUpdateDialog: true },
): Promise<boolean> {
  logNotImplementedError();
  return false;
}

function configure(_options: ConfigureParams): void {
  logNotImplementedError();
}

async function addScopes(_options: AddScopesParams): Promise<User | null> {
  logNotImplementedError();
  return null;
}

async function signInSilently(): Promise<User> {
  throwNotImplementedError();
}

async function signOut(): Promise<null> {
  logNotImplementedError();
  return null;
}

async function revokeAccess(): Promise<null> {
  logNotImplementedError();
  return null;
}

function hasPreviousSignIn(): boolean {
  logNotImplementedError();
  return false;
}

function getCurrentUser(): User | null {
  logNotImplementedError();
  return null;
}

async function clearCachedAccessToken(_tokenString: string): Promise<null> {
  logNotImplementedError();
  return null;
}

async function getTokens(): Promise<GetTokensResponse> {
  throwNotImplementedError();
}

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
