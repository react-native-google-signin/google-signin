import '../../jest/setup';
import { GoogleSignin, statusCodes, GoogleSigninButton } from 'rn-google-signin';
import { mockUserInfo } from '../../jest/setup';

it('sanity check for exported mock methods', async () => {
  expect(await GoogleSignin.isSignedIn()).toBe(true);
  expect(await GoogleSignin.signIn()).toStrictEqual(mockUserInfo);
  expect(await GoogleSignin.signOut()).toBeNull();
  expect(GoogleSigninButton).toBeInstanceOf(Function);
  expect(statusCodes).toStrictEqual({
    IN_PROGRESS: 'mock_IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'mock_PLAY_SERVICES_NOT_AVAILABLE',
    SIGN_IN_CANCELLED: 'mock_SIGN_IN_CANCELLED',
    SIGN_IN_REQUIRED: 'mock_SIGN_IN_REQUIRED',
  });
});
