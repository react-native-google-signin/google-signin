import React, { useEffect } from 'react';

import { Platform, DeviceEventEmitter, StyleSheet } from 'react-native';
import type { GoogleSigninButtonProps } from './types';
import { RNGoogleSigninButton } from './spec/SignInButtonNativeComponent';
import { NativeModule } from './spec/NativeGoogleSignin';

const {
  BUTTON_SIZE_WIDE,
  BUTTON_SIZE_ICON,
  BUTTON_SIZE_STANDARD,
  BUTTON_COLOR_DARK,
  BUTTON_COLOR_LIGHT,
} = NativeModule.getConstants();

export const GoogleSigninButton = ({ onPress, style, ...rest }: GoogleSigninButtonProps) => {
  useEffect(() => {
    if (Platform.OS === 'ios') {
      return;
    }
    const clickListener = DeviceEventEmitter.addListener('RNGoogleSigninButtonClicked', () => {
      onPress?.();
    });
    return () => {
      clickListener.remove();
    };
  }, [onPress]);

  const recommendedSize = (() => {
    switch (rest.size) {
      case BUTTON_SIZE_ICON:
        return styles.iconSize;
      case BUTTON_SIZE_WIDE:
        return styles.wideSize;
      default:
        return styles.standardSize;
    }
  })();

  return (
    <RNGoogleSigninButton
      {...rest}
      onPress={onPress}
      style={StyleSheet.compose(recommendedSize, style)}
    />
  );
};

GoogleSigninButton.Size = {
  Icon: BUTTON_SIZE_ICON,
  Standard: BUTTON_SIZE_STANDARD,
  Wide: BUTTON_SIZE_WIDE,
};

GoogleSigninButton.Color = {
  Dark: BUTTON_COLOR_DARK,
  Light: BUTTON_COLOR_LIGHT,
};

// sizes according to https://developers.google.com/identity/sign-in/ios/reference/Classes/GIDSignInButton
const styles = StyleSheet.create({
  iconSize: {
    width: 48,
    height: 48,
  },
  standardSize: { width: 230, height: 48 },
  wideSize: { width: 312, height: 48 },
});
