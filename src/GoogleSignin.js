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

class GoogleSignin {
  // TODO vonovak kill state in this module
  _user = null;
  signinIsInProcess = false;

  hasPlayServices(params = { autoResolve: true }) {
    if (Platform.OS === 'ios') {
      return Promise.resolve(true);
    } else {
      return RNGoogleSignin.playServicesAvailable(params.autoResolve);
    }
  }

  async configure(params = {}) {
    if (Platform.OS === 'ios' && !params.iosClientId) {
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

      // The user has never signed in before with the given scopes, or they have since signed out.
      // if (error.code === '-4') {
      //   this._user = null;
      //   return null;
      // }

      return Promise.reject(error);
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
