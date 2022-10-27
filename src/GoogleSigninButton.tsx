import React, { PureComponent } from 'react';

import {
  NativeModules,
  Platform,
  DeviceEventEmitter,
  StyleSheet,
  EmitterSubscription,
} from 'react-native';
import { RNGoogleSigninButton } from './RNGoogleSiginButton';
import type { GoogleSigninButtonProps } from './types';

interface RNGoogleSignStaticsType {
  BUTTON_SIZE_STANDARD: 0;
  BUTTON_SIZE_WIDE: 1;
  BUTTON_SIZE_ICON: 2;
  BUTTON_COLOR_DARK: 0;
  BUTTON_COLOR_LIGHT: 1;
}
const RNGoogleSignin: RNGoogleSignStaticsType = NativeModules.RNGoogleSignin;

export class GoogleSigninButton extends PureComponent<GoogleSigninButtonProps> {
  _clickListener?: EmitterSubscription;

  static Size = {
    Icon: RNGoogleSignin.BUTTON_SIZE_ICON,
    Standard: RNGoogleSignin.BUTTON_SIZE_STANDARD,
    Wide: RNGoogleSignin.BUTTON_SIZE_WIDE,
  };

  static Color = {
    Dark: RNGoogleSignin.BUTTON_COLOR_DARK,
    Light: RNGoogleSignin.BUTTON_COLOR_LIGHT,
  };

  static defaultProps = {
    size: RNGoogleSignin.BUTTON_SIZE_STANDARD,
  };

  componentDidMount() {
    if (Platform.OS === 'android') {
      this._clickListener = DeviceEventEmitter.addListener('RNGoogleSigninButtonClicked', () => {
        this.props.onPress && this.props.onPress();
      });
    }
  }

  componentWillUnmount() {
    this._clickListener && this._clickListener.remove();
  }

  getRecommendedSize() {
    switch (this.props.size) {
      case RNGoogleSignin.BUTTON_SIZE_ICON:
        return styles.iconSize;
      case RNGoogleSignin.BUTTON_SIZE_WIDE:
        return styles.wideSize;
      default:
        return styles.standardSize;
    }
  }

  render() {
    const { style, ...props } = this.props;

    // @ts-ignore style prop incompatible
    return <RNGoogleSigninButton {...props} style={[this.getRecommendedSize(), style]} />;
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
