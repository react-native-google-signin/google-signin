import React, { PureComponent } from 'react';

import {
  NativeModules,
  Platform,
  DeviceEventEmitter,
  StyleSheet,
  EmitterSubscription,
  ViewProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { RNGoogleSigninButton } from './RNGoogleSiginButton';
import type { RNGoogleSignType } from './types';

const RNGoogleSignin: RNGoogleSignType = NativeModules.RNGoogleSignin;

export interface GoogleSigninButtonProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  size?: 0 | 1 | 2;
  color?: 0 | 1;
  disabled?: boolean;
  onPress?(): void;
}

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
