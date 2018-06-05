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

class GoogleSigninButton extends Component {
  static propTypes = {
    ...ViewPropTypes,
    size: PropTypes.number,
    color: PropTypes.number,
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


class GoogleSigninError extends Error {
  constructor(error, code) {
    super(error);
    this.name = 'GoogleSigninError';
    this.code = code;
  }
}

class GoogleSignin {
  _user = null;
  signinIsInProcess = false;

  hasPlayServices(params = { autoResolve: true }) {
    return Promise.resolve(true);
  }

  configure(params = {}) {
    params = [
      params.scopes || [],
      params.webClientId || null,
      params.offlineAccess || false,
      params.forceConsentPrompt || false,
      params.accountName || null,
      params.hostedDomain || null,
    ];

    return RNGoogleSignin.configure(...params);
  }

  currentUserAsync() {
    return RNGoogleSignin.currentUserAsync()
      .then(user => {
        this._user = { ...user };
        return user;
      })
      .catch(error => {
        // The user has never signed in before with the given scopes, or they have since signed out.
        if (error.code === '-4') {
          this._user = null;
          this.signinIsInProcess = false;
          return null;
        }

        this.signinIsInProcess = false;
        throw error;
      });
  }

  currentUser() {
    if (this._user) {
      return { ...this._user };
    }

    return null;
  }

  signIn() {
    if (this.signinIsInProcess) {
      return Promise.reject(new Error('RNGoogleSignin: Previous sign in still in progress.'));
    }

    this.signinIsInProcess = true;

    return RNGoogleSignin.signIn()
      .then(user => {
        this._user = { ...user };
        this.signinIsInProcess = false;
        return user;
      })
      .catch(error => {
        this.signinIsInProcess = false;
        throw error;
      });
  }

  signOut() {
    return RNGoogleSignin.signOut().then(() => {
      this._user = null;
    });
  }

  revokeAccess() {
    return RNGoogleSignin.revokeAccess().then(() => {
      this._user = null;
    });
  }
}

const GoogleSigninSingleton = new GoogleSignin();

module.exports = { GoogleSignin: GoogleSigninSingleton, GoogleSigninButton };
