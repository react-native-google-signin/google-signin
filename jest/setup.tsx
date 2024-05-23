import React from 'react';
import { Pressable, Text } from 'react-native';
import {
  GoogleSigninButton,
  GoogleSigninButtonProps,
  User,
  GoogleSignin,
} from '../src';
import type { statusCodes } from '../src';
import { isErrorWithCode } from '../src/types';

export const mockUserInfo: User = {
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
};

const MockGoogleSigninButton = (props: GoogleSigninButtonProps) => {
  return (
    <Pressable {...props}>
      <Text>Mock Sign in with Google</Text>
    </Pressable>
  );
};
MockGoogleSigninButton.Size = { Standard: 0, Wide: 1, Icon: 2 };
MockGoogleSigninButton.Color = { Dark: 'dark', Light: 'light' } as const;

const MockGoogleSigninButtonTyped: typeof GoogleSigninButton =
  MockGoogleSigninButton;

const mockStatusCodesRaw: typeof statusCodes = {
  SIGN_IN_CANCELLED: 'mock_SIGN_IN_CANCELLED',
  IN_PROGRESS: 'mock_IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'mock_PLAY_SERVICES_NOT_AVAILABLE',
  SIGN_IN_REQUIRED: 'mock_SIGN_IN_REQUIRED',
};

const mockStatusCodes = Object.freeze(mockStatusCodesRaw);

const mockGoogleSignin: typeof GoogleSignin = {
  configure: jest.fn(),
  hasPlayServices: jest.fn().mockResolvedValue(true),
  getTokens: jest.fn().mockResolvedValue({
    accessToken: 'mockAccessToken',
    idToken: 'mockIdToken',
  }),
  signIn: jest.fn().mockResolvedValue(mockUserInfo),
  signInSilently: jest.fn().mockResolvedValue(mockUserInfo),
  revokeAccess: jest.fn().mockResolvedValue(null),
  signOut: jest.fn().mockResolvedValue(null),
  hasPreviousSignIn: jest.fn().mockReturnValue(true),
  addScopes: jest.fn().mockResolvedValue(mockUserInfo),
  getCurrentUser: jest.fn().mockReturnValue(mockUserInfo),
  clearCachedAccessToken: jest.fn().mockResolvedValue(null),
};

type ExportedModuleType = typeof import('../src/index');

// TODO @vonovak mock closer to native level?
const mockModule: ExportedModuleType = Object.freeze({
  statusCodes: mockStatusCodes,
  GoogleSignin: mockGoogleSignin,
  GoogleSigninButton: MockGoogleSigninButtonTyped,
  isErrorWithCode,
});

jest.mock('@react-native-google-signin/google-signin', () => {
  return mockModule;
});
