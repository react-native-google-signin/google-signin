import React, { Component } from 'react';

import {
  View,
  NativeAppEventEmitter,
  NativeModules,
  requireNativeComponent,
  ViewPropTypes,
  Platform,
} from 'react-native';

const { RNGoogleSignin } = NativeModules;

const IS_IOS = Platform.OS === 'ios';
const IS_ANDROID = Platform.OS === 'android';

class GoogleSignin {
  // TODO vonovak kill state in this module
  _user = null;
  signinIsInProcess = false;

  hasPlayServices(params = { autoResolve: true }) {
    if (IS_IOS) {
      return Promise.resolve(true);
    } else {
      return RNGoogleSignin.playServicesAvailable(params.autoResolve);
    }
  }

  async configure(params = {}) {
    if (IS_IOS && !params.iosClientId) {
      return Promise.reject(new Error('RNGoogleSignin: Missing iOS app ClientID'));
    }

    if (params.offlineAccess && !params.webClientId) {
      return Promise.reject(new Error('RNGoogleSignin: offline use requires server web ClientID'));
    }

    return RNGoogleSignin.configure(params);
  }

  async currentUserAsync() {
    try {
      const user = await RNGoogleSignin.currentUserAsync();
      this._user = { ...user };
      return user;
    } catch (error) {
      this.signinIsInProcess = false;

      return Promise.resolve(null);
    }
  }

  currentUser() {
    if (this._user) {
      return { ...this._user };
    }
    return null;
  }

  async signIn() {
    if (this.signinIsInProcess) {
      return Promise.reject(new Error('RNGoogleSignin: Previous sign in still in progress.'));
    }

    this.signinIsInProcess = true;
    try {
      const user = await RNGoogleSignin.signIn();
      this._user = { ...user };
      return user;
    } catch (error) {
      // TODO figure out a nice api that communicates this to the user
      // I'd go for expo's way: https://docs.expo.io/versions/latest/sdk/google
      if ((IS_IOS && error.code === '-5') || (IS_ANDROID && error.code === '12501')) {
        error.code = 'CANCELED';
      }
      return Promise.reject(error);
    } finally {
      this.signinIsInProcess = false;
    }
  }

  async signOut() {
    const result = await RNGoogleSignin.signOut();
    this._user = null;
    return result;
  }

  async revokeAccess() {
    const result = await RNGoogleSignin.revokeAccess();
    this._user = null;
    return result;
  }
}

export const GoogleSigninSingleton = new GoogleSignin();
