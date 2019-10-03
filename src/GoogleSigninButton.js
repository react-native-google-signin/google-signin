import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import {
  NativeModules,
  requireNativeComponent,
  ViewPropTypes,
  Platform,
  DeviceEventEmitter,
  StyleSheet,
} from 'react-native';

const { RNGoogleSignin } = NativeModules;
const RNGoogleSigninButton = requireNativeComponent('RNGoogleSigninButton', null);

export class GoogleSigninButton extends PureComponent {
  static propTypes = {
    ...ViewPropTypes,
    size: PropTypes.number,
    color: PropTypes.number,
    disabled: PropTypes.bool,
    onPress: PropTypes.func.isRequired,
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

    return <RNGoogleSigninButton style={[this.getRecommendedSize(), style]} {...props} />;
  }
}

const styles = StyleSheet.create({
  iconSize: {
    width: 48,
    height: 48,
  },
  standardSize: { width: 212, height: 48 },
  wideSize: { width: 312, height: 48 },
});

GoogleSigninButton.Size = {
  Icon: RNGoogleSignin.BUTTON_SIZE_ICON,
  Standard: RNGoogleSignin.BUTTON_SIZE_STANDARD,
  Wide: RNGoogleSignin.BUTTON_SIZE_WIDE,
};

GoogleSigninButton.Color = {
  Auto: RNGoogleSignin.BUTTON_COLOR_AUTO,
  Light: RNGoogleSignin.BUTTON_COLOR_LIGHT,
  Dark: RNGoogleSignin.BUTTON_COLOR_DARK,
};
