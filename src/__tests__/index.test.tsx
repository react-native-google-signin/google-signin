import '../../jest/setup';
import {
  GoogleSignin,
  statusCodes,
  GoogleSigninButton,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin';
import { mockGoogleSignInResponse, mockUserInfo } from '../../jest/setup';

describe('GoogleSignin', () => {
  describe('sanity checks for exported mocks', () => {
    it('status codes', () => {
      expect(statusCodes).toStrictEqual({
        IN_PROGRESS: 'mock_IN_PROGRESS',
        PLAY_SERVICES_NOT_AVAILABLE: 'mock_PLAY_SERVICES_NOT_AVAILABLE',
        SIGN_IN_CANCELLED: 'mock_SIGN_IN_CANCELLED',
        SIGN_IN_REQUIRED: 'mock_SIGN_IN_REQUIRED',
      });
    });

    it('original sign in', async () => {
      expect(GoogleSignin.hasPreviousSignIn()).toBe(true);
      expect(await GoogleSignin.signIn()).toStrictEqual(
        mockGoogleSignInResponse,
      );
      expect(await GoogleSignin.signInSilently()).toStrictEqual(
        mockGoogleSignInResponse,
      );
      expect(GoogleSignin.getCurrentUser()).toStrictEqual(mockUserInfo);
      expect(await GoogleSignin.signOut()).toBeNull();
      expect(GoogleSigninButton).toBeInstanceOf(Function);
    });
  });

  test.each([
    {
      getError: () => {
        const err = new Error('some error');
        // @ts-expect-error
        err.code = 2;
        return err;
      },
      expected: true,
    },
    { getError: () => new Error('some error'), expected: false },
    { getError: () => null, expected: false },
  ])(
    'isErrorWithCode returns true iff the error has code property',
    ({ getError, expected }) => {
      const err = getError();
      expect(isErrorWithCode(err)).toBe(expected);
    },
  );
});
