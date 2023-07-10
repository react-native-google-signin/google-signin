import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

export interface User {
  user: {
    id: string;
    name: string | null;
    email: string;
    photo: string | null;
    familyName: string | null;
    givenName: string | null;
  };
  scopes: string[];
  idToken: string | null;
  /**
   * Not null only if a valid webClientId and offlineAccess: true was
   * specified in configure().
   */
  serverAuthCode: string | null;
}

export interface NativeModuleError extends Error {
  code: string;
}

export interface GoogleSigninButtonProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  size?: number;
  color?: number;
  disabled?: boolean;
  onPress?(): void;
}
