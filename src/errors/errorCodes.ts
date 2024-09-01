import { NativeModule } from '../spec/NativeGoogleSignin';

const {
  SIGN_IN_CANCELLED,
  IN_PROGRESS,
  PLAY_SERVICES_NOT_AVAILABLE,
  SIGN_IN_REQUIRED,
  SCOPES_ALREADY_GRANTED,
} = NativeModule.getConstants();

export const SIGN_IN_REQUIRED_CODE = SIGN_IN_REQUIRED;
export const SIGN_IN_CANCELLED_CODE = SIGN_IN_CANCELLED;
export const ios_only_SCOPES_ALREADY_GRANTED = SCOPES_ALREADY_GRANTED;

/**
 * @group Constants
 * */
export const statusCodes = Object.freeze({
  SIGN_IN_CANCELLED,
  IN_PROGRESS,
  PLAY_SERVICES_NOT_AVAILABLE,
  SIGN_IN_REQUIRED,
});
