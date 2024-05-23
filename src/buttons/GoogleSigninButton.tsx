import React, { useCallback } from 'react';

import { StyleSheet, useColorScheme, ViewProps } from 'react-native';
import RNGoogleSigninButton from '../spec/SignInButtonNativeComponent';
import { NativeModule } from '../spec/NativeGoogleSignin';
import { Color } from './statics';

const { BUTTON_SIZE_WIDE, BUTTON_SIZE_ICON, BUTTON_SIZE_STANDARD } =
  NativeModule.getConstants();

/**
 * @group React Components
 * */
export type GoogleSigninButtonProps = ViewProps & {
  size?: number;
  color?: 'dark' | 'light';
  disabled?: boolean;
  onPress?: () => void;
};

/**
 * @group React Components
 * */
export const GoogleSigninButton = ({
  onPress,
  style,
  color,
  size = BUTTON_SIZE_STANDARD,
  ...rest
}: GoogleSigninButtonProps) => {
  const activeColorScheme = useColorScheme();
  const usedColor = color ?? activeColorScheme ?? 'light';

  const recommendedSize = getSizeStyle(size);

  const stripOnPressParams = useCallback(() => {
    // this is to make sure that the onPress callback prop is called with no params
    // as the RNGoogleSigninButton onPress does pass some in here
    onPress?.();
  }, [onPress]);

  return (
    <RNGoogleSigninButton
      {...rest}
      size={size}
      onPress={stripOnPressParams}
      color={usedColor}
      style={StyleSheet.compose(recommendedSize, style)}
    />
  );
};

const nativeSizes = {
  Icon: BUTTON_SIZE_ICON,
  Standard: BUTTON_SIZE_STANDARD,
  Wide: BUTTON_SIZE_WIDE,
};

GoogleSigninButton.Size = nativeSizes;
GoogleSigninButton.Color = Color;

function getSizeStyle(size: GoogleSigninButtonProps['size']) {
  switch (size) {
    case BUTTON_SIZE_ICON:
      return styles.iconSize;
    case BUTTON_SIZE_WIDE:
      return styles.wideSize;
    default:
      return styles.standardSize;
  }
}

// sizes according to https://developers.google.com/identity/sign-in/ios/reference/Classes/GIDSignInButton
const styles = StyleSheet.create({
  iconSize: {
    width: 48,
    height: 48,
  },
  standardSize: { width: 230, height: 48 },
  wideSize: { width: 312, height: 48 },
});
