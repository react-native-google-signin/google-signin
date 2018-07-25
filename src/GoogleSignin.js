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
const PREVIOUS_SIGNIN_IN_PROGRESS = 'RNGoogleSignin: Previous sign in still in progress.';

const isSigninCancellation = error => {
  return (IS_IOS && error.code === '-5') || (IS_ANDROID && error.code === '13');
};

const isSigninInProgressError = error => {
  return error.message === PREVIOUS_SIGNIN_IN_PROGRESS;
};

export const doesErrorNeedToBeHandled = error => {
  return !isSigninCancellation(error) && !isSigninInProgressError(error);
};

class GoogleSignin {
  isSigninInProgress = false;
  isSilentSigninInProgress = false;
  configPromise;

  async signIn() {
    if (this.isSigninInProgress) {
      return Promise.reject(new Error(PREVIOUS_SIGNIN_IN_PROGRESS));
    }
    this.isSigninInProgress = true;

    await this.hasPlayServices();

    try {
      await this.configPromise;
      const user = await RNGoogleSignin.signIn();
      return user;
    } catch (error) {
      return Promise.reject(error);
    } finally {
      this.isSigninInProgress = false;
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
    if (this.isSilentSigninInProgress) {
      return Promise.reject(new Error(PREVIOUS_SIGNIN_IN_PROGRESS));
    }
    this.isSilentSigninInProgress = true;
    try {
      await this.hasPlayServices();

      await this.configPromise;
      const user = await RNGoogleSignin.signInSilently();
      return user;
    } catch (error) {
      return Promise.resolve(null);
    } finally {
      this.isSilentSigninInProgress = false;
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
