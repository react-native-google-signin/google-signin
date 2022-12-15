import React from 'react';
import { Pressable, Text } from 'react-native';
import type { User, GoogleSigninButtonProps } from '../src/types';
import type { GoogleSigninSingleton } from '../src/GoogleSignin';
import type { GoogleSigninButton } from '../src';

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
MockGoogleSigninButton.Color = { Dark: 0, Light: 1 };

const MockGoogleSigninButtonTyped: typeof GoogleSigninButton = MockGoogleSigninButton;

const mockStatusCodes = {
  SIGN_IN_CANCELLED: 'mock_SIGN_IN_CANCELLED',
  IN_PROGRESS: 'mock_IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'mock_PLAY_SERVICES_NOT_AVAILABLE',
  SIGN_IN_REQUIRED: 'mock_SIGN_IN_REQUIRED',
};

const mockGoogleSignin: typeof GoogleSigninSingleton = {
  configure: jest.fn(),
  hasPlayServices: jest.fn().mockResolvedValue(true),
  getTokens: jest
    .fn()
    .mockResolvedValue({ accessToken: 'mockAccessToken', idToken: 'mockIdToken' }),
  signIn: jest.fn().mockResolvedValue(mockUserInfo),
  signInSilently: jest.fn().mockResolvedValue(mockUserInfo),
  revokeAccess: jest.fn().mockResolvedValue(null),
  signOut: jest.fn().mockResolvedValue(null),
  isSignedIn: jest.fn().mockResolvedValue(true),
  addScopes: jest.fn().mockResolvedValue(mockUserInfo),
  getCurrentUser: jest.fn().mockResolvedValue(mockUserInfo),
  clearCachedAccessToken: jest.fn().mockResolvedValue(null),
};

jest.mock('rn-google-signin', () => ({
  statusCodes: mockStatusCodes,
  GoogleSignin: mockGoogleSignin,
  GoogleSigninButton: MockGoogleSigninButtonTyped,
}));
