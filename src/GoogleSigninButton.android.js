import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  View,
  DeviceEventEmitter,
  NativeModules,
  requireNativeComponent,
  ViewPropTypes,
} from 'react-native';

const { RNGoogleSignin } = NativeModules;

const RNGoogleSigninButton = requireNativeComponent('RNGoogleSigninButton', null);

export class GoogleSigninButton extends Component {
  static propTypes = {
    ...ViewPropTypes,
    size: PropTypes.number,
    color: PropTypes.number,
    disabled: PropTypes.bool,
  };

  componentDidMount() {
    this._clickListener = DeviceEventEmitter.addListener('RNGoogleSigninButtonClicked', () => {
      this.props.onPress && this.props.onPress();
    });
  }

  componentWillUnmount() {
    this._clickListener && this._clickListener.remove();
  }

  render() {
    const { style, ...props } = this.props;

    return <RNGoogleSigninButton style={[{ backgroundColor: 'transparent' }, style]} {...props} />;
  }
}

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
