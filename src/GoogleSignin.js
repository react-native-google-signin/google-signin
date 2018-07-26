import React, { Component } from 'react';

import { NativeModules, Platform } from 'react-native';

const { RNGoogleSignin } = NativeModules;

const IS_IOS = Platform.OS === 'ios';
const IS_ANDROID = Platform.OS === 'android';

const isSigninCancellationError = error => {
  return (IS_IOS && error.code === '-5') || (IS_ANDROID && error.code === '13');
};

const isSigninInProgressError = error => {
  return error.code === 'ASYNC_OP_IN_PROGRESS';
};

export const doesErrorNeedToBeHandled = error => {
  return !isSigninCancellationError(error) && !isSigninInProgressError(error);
};

class GoogleSignin {
  configPromise;

  async signIn() {
    await this.hasPlayServices();

    try {
      await this.configPromise;
      const user = await RNGoogleSignin.signIn();
      return user;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async hasPlayServices(params = { showPlayServicesUpdateDialog: true }) {
    if (IS_IOS) {
      return true;
    } else {
      return RNGoogleSignin.playServicesAvailable(params.showPlayServicesUpdateDialog);
    }
  }

  configure(params = {}) {
    if (IS_IOS && !params.iosClientId) {
      return new Error('RNGoogleSignin: Missing iOS app ClientID');
    }

    if (params.offlineAccess && !params.webClientId) {
      return new Error('RNGoogleSignin: offline use requires server web ClientID');
    }

    this.configPromise = RNGoogleSignin.configure(params);
  }

  async signInSilently() {
    try {
      await this.hasPlayServices();

      await this.configPromise;
      const user = await RNGoogleSignin.signInSilently();
      return user;
    } catch (error) {
      return Promise.resolve(null);
    }
  }

  async signOut() {
    return RNGoogleSignin.signOut();
  }

  async revokeAccess() {
    return RNGoogleSignin.revokeAccess();
  }
}

export const GoogleSigninSingleton = new GoogleSignin();
