import React, { Component, PropTypes } from 'react';

import {
  View,
  DeviceEventEmitter,
  NativeModules,
  requireNativeComponent,
} from 'react-native';

const { RNGoogleSignin } = NativeModules;

const RNGoogleSigninButton = requireNativeComponent('RNGoogleSigninButton', {
  name: 'RNGoogleSigninButton',
  propTypes: {
    ...View.propTypes,
    size: PropTypes.number,
    color: PropTypes.number
  }
});

class GoogleSigninButton extends Component {
  componentDidMount() {
    this._clickListener = DeviceEventEmitter.addListener('RNGoogleSigninButtonClicked', () => {
      this.props.onPress && this.props.onPress();
    });
  }

  componentWillUnmount() {
    this._clickListener && this._clickListener.remove();
  }

  render() {
    return (
      <RNGoogleSigninButton {...this.props}/>
    );
  }
}

GoogleSigninButton.Size = {
  Icon: RNGoogleSignin.BUTTON_SIZE_ICON,
  Standard: RNGoogleSignin.BUTTON_SIZE_STANDARD,
  Wide: RNGoogleSignin.BUTTON_SIZE_WIDE
};

GoogleSigninButton.Color = {
  Auto: RNGoogleSignin.BUTTON_COLOR_AUTO,
  Light: RNGoogleSignin.BUTTON_COLOR_LIGHT,
  Dark: RNGoogleSignin.BUTTON_COLOR_DARK
};

class GoogleSigninError extends Error {
  constructor(error, code) {
    super(error);
    this.name = 'GoogleSigninError';
    this.code  = code;
  }
}

class GoogleSignin {

  constructor() {
    this._user = null;
  }

  hasPlayServices(params = {autoResolve: true}) {
    return RNGoogleSignin.playServicesAvailable(params.autoResolve);
  }

  configure(params={}) {
    params = [
      params.scopes || [], params.webClientId || null, params.offlineAccess || false
    ];

    return RNGoogleSignin.configure(...params);
  }

  currentUserAsync() {
    return new Promise((resolve, reject) => {
      const sucessCb = DeviceEventEmitter.addListener('RNGoogleSignInSilentSuccess', (user) => {
        this._user = user;

        RNGoogleSignin.getAccessToken(user).then((token) => {
          this._user.accessToken = token;
          this._removeListeners(sucessCb, errorCb);
          resolve(this._user);
        })
        .catch(err => {
          this._removeListeners(sucessCb, errorCb);
          resolve(this._user);
        });
      });

      const errorCb = DeviceEventEmitter.addListener('RNGoogleSignInSilentError', (err) => {
        this._removeListeners(sucessCb, errorCb);
        resolve(null);
      });

      RNGoogleSignin.currentUserAsync();
    });
  }

  currentUser() {
    return {...this._user};
  }

  signIn() {
    return new Promise((resolve, reject) => {
      const sucessCb = DeviceEventEmitter.addListener('RNGoogleSignInSuccess', (user) => {
        this._user = user;
        RNGoogleSignin.getAccessToken(user).then((token) => {
          this._user.accessToken = token;
          this._removeListeners(sucessCb, errorCb);
          resolve(this._user);
        })
        .catch(err => {
          this._removeListeners(sucessCb, errorCb);
          resolve(this._user);
        });
      });

      const errorCb = DeviceEventEmitter.addListener('RNGoogleSignInError', (err) => {
        this._removeListeners(sucessCb, errorCb);
        reject(new GoogleSigninError(err.error, err.code));
      });

      RNGoogleSignin.signIn();
    });
  }

  signOut() {
    return new Promise((resolve, reject) => {
      const sucessCb = DeviceEventEmitter.addListener('RNGoogleSignOutSuccess', () => {
        this._removeListeners(sucessCb, errorCb);
        resolve();
      });

      const errorCb = DeviceEventEmitter.addListener('RNGoogleSignOutError', (err) => {
        this._removeListeners(sucessCb, errorCb);
        reject(new GoogleSigninError(err.error, err.code));
      });

      this._user = null;
      RNGoogleSignin.signOut();
    });
  }

  revokeAccess() {
    return new Promise((resolve, reject) => {
      const sucessCb = DeviceEventEmitter.addListener('RNGoogleRevokeSuccess', () => {
        this._removeListeners(sucessCb, errorCb);
        resolve();
      });

      const errorCb = DeviceEventEmitter.addListener('RNGoogleRevokeError', (err) => {
        this._removeListeners(sucessCb, errorCb);
        reject(new GoogleSigninError(err.error, err.code));
      });

      RNGoogleSignin.revokeAccess();
    });
  }

  _removeListeners(...listeners) {
    listeners.forEach(lt => lt.remove());
  }
}

module.exports = {GoogleSignin: new GoogleSignin(), GoogleSigninButton};
