import React, { Component } from 'react';

import { NativeModules, Platform } from 'react-native';

const { RNGoogleSignin } = NativeModules;

const IS_IOS = Platform.OS === 'ios';

class GoogleSignin {
  configPromise;

  constructor() {
    if (__DEV__ && !RNGoogleSignin) {
      console.error(
        'RN GoogleSignin native module is not correctly linked. Please read the readme, setup and troubleshooting instructions carefully or try manual linking.'
      );
    }
  }

  async signIn() {
    await this.configPromise;
    return await RNGoogleSignin.signIn();
  }

  async hasPlayServices(options = { showPlayServicesUpdateDialog: true }) {
    if (IS_IOS) {
      return true;
    } else {
      if (options && options.showPlayServicesUpdateDialog === undefined) {
        throw new Error(
          'RNGoogleSignin: Missing property `showPlayServicesUpdateDialog` in options object for `hasPlayServices`'
        );
      }
      return RNGoogleSignin.playServicesAvailable(options.showPlayServicesUpdateDialog);
    }
  }

  configure(options = {}) {
    if (options.offlineAccess && !options.webClientId) {
      throw new Error('RNGoogleSignin: offline use requires server web ClientID');
    }

    this.configPromise = RNGoogleSignin.configure(options);
  }

  async signInSilently() {
    await this.configPromise;
    return RNGoogleSignin.signInSilently();
  }

  async signOut() {
    return RNGoogleSignin.signOut();
  }

  async revokeAccess() {
    return RNGoogleSignin.revokeAccess();
  }

  async isSignedIn() {
    return RNGoogleSignin.isSignedIn();
  }
}

export const GoogleSigninSingleton = new GoogleSignin();

export const statusCodes = {
  SIGN_IN_CANCELLED: RNGoogleSignin.SIGN_IN_CANCELLED,
  IN_PROGRESS: RNGoogleSignin.IN_PROGRESS,
  PLAY_SERVICES_NOT_AVAILABLE: RNGoogleSignin.PLAY_SERVICES_NOT_AVAILABLE,
  SIGN_IN_REQUIRED: RNGoogleSignin.SIGN_IN_REQUIRED,
};
