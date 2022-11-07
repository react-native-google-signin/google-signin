import React, { useEffect } from 'react';

import { NativeModules, Platform, DeviceEventEmitter, StyleSheet } from 'react-native';
import { RNGoogleSigninButton } from './RNGoogleSiginButton';
import type { GoogleSigninButtonProps } from './types';

interface RNGoogleSignStaticsType {
  BUTTON_SIZE_STANDARD: number;
  BUTTON_SIZE_WIDE: number;
  BUTTON_SIZE_ICON: number;
  BUTTON_COLOR_DARK: number;
  BUTTON_COLOR_LIGHT: number;
}
const RNGoogleSignin: RNGoogleSignStaticsType = NativeModules.RNGoogleSignin;

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
      case RNGoogleSignin.BUTTON_SIZE_ICON:
        return styles.iconSize;
      case RNGoogleSignin.BUTTON_SIZE_WIDE:
        return styles.wideSize;
      default:
        return styles.standardSize;
    }
  })();

  // @ts-ignore style prop incompatible
  return <RNGoogleSigninButton {...rest} onPress={onPress} style={[recommendedSize, style]} />;
};

GoogleSigninButton.Size = {
  Icon: RNGoogleSignin.BUTTON_SIZE_ICON,
  Standard: RNGoogleSignin.BUTTON_SIZE_STANDARD,
  Wide: RNGoogleSignin.BUTTON_SIZE_WIDE,
};

GoogleSigninButton.Color = {
  Dark: RNGoogleSignin.BUTTON_COLOR_DARK,
  Light: RNGoogleSignin.BUTTON_COLOR_LIGHT,
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
