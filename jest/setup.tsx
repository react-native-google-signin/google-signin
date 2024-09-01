import type { Spec as GoogleSignInSpec } from '../src/spec/NativeGoogleSignin';

import type {
  AddScopesParams,
  GetTokensResponse,
  SignInResponse,
  User,
} from '../src';

export const mockUserInfo = Object.freeze({
  idToken: 'mockIdToken',
  serverAuthCode: 'mockServerAuthCode',
  scopes: [],
  user: {
    email: 'mockEmail',
    id: 'mockId',
    givenName: 'mockGivenName',
    familyName: 'mockFamilyName',
    photo: null,
    name: 'mockFullName',
  },
}) satisfies User;

export const mockGoogleSignInResponse: SignInResponse = Object.freeze({
  type: 'success',
  data: mockUserInfo,
} satisfies SignInResponse);

// mock very close to native module to be able to test JS logic too
jest.mock('../src/spec/NativeGoogleSignin', () => {
  const mockNativeModule: GoogleSignInSpec = Object.freeze({
    configure: jest.fn(),
    playServicesAvailable: jest.fn().mockReturnValue(true),
    getTokens: jest
      .fn<Promise<GetTokensResponse>, Object[]>()
      .mockResolvedValue({
        accessToken: 'mockAccessToken',
        idToken: 'mockIdToken',
      }),
    signIn: jest.fn<Promise<User>, Object[]>().mockResolvedValue(mockUserInfo),
    signInSilently: jest
      .fn<Promise<User>, Object[]>()
      .mockResolvedValue(mockUserInfo),
    revokeAccess: jest.fn().mockResolvedValue(null),
    signOut: jest.fn().mockResolvedValue(null),
    // enableAppCheck: jest.fn().mockResolvedValue(null),
    hasPreviousSignIn: jest.fn().mockReturnValue(true),
    addScopes: jest
      .fn<Promise<User | null>, AddScopesParams[]>()
      .mockImplementation(({ scopes }) => {
        const userWithScopes: User = {
          ...mockUserInfo,
          scopes,
        };
        return Promise.resolve(userWithScopes);
      }),
    getCurrentUser: jest
      .fn<User | null, void[]>()
      .mockReturnValue(mockUserInfo),
    clearCachedAccessToken: jest.fn().mockResolvedValue(null),
    getConstants: jest
      .fn<ReturnType<GoogleSignInSpec['getConstants']>, void[]>()
      .mockReturnValue({
        SIGN_IN_CANCELLED: 'mock_SIGN_IN_CANCELLED',
        IN_PROGRESS: 'mock_IN_PROGRESS',
        PLAY_SERVICES_NOT_AVAILABLE: 'mock_PLAY_SERVICES_NOT_AVAILABLE',
        SIGN_IN_REQUIRED: 'mock_SIGN_IN_REQUIRED',
        SCOPES_ALREADY_GRANTED: 'mock_SCOPES_ALREADY_GRANTED',
        NO_SAVED_CREDENTIAL_FOUND: 'mock_NO_SAVED_CREDENTIAL_FOUND',
        BUTTON_SIZE_ICON: 2,
        BUTTON_SIZE_WIDE: 1,
        BUTTON_SIZE_STANDARD: 0,
        // one-tap specific constants
        ONE_TAP_START_FAILED: 'mock_ONE_TAP_START_FAILED',
      }),
  });
  return {
    NativeModule: mockNativeModule,
  };
});
