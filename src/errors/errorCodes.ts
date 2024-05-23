import { NativeModule } from '../spec/NativeGoogleSignin';

const {
  SIGN_IN_CANCELLED,
  IN_PROGRESS,
  PLAY_SERVICES_NOT_AVAILABLE,
  SIGN_IN_REQUIRED,
} = NativeModule.getConstants();

/**
 * @group Constants
 * */
export const statusCodes = Object.freeze({
  SIGN_IN_CANCELLED,
  IN_PROGRESS,
  PLAY_SERVICES_NOT_AVAILABLE,
  SIGN_IN_REQUIRED,
});
