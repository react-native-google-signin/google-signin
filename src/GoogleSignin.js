import React, { Component } from 'react';

import { NativeModules, Platform } from 'react-native';

const { RNGoogleSignin } = NativeModules;

const IS_IOS = Platform.OS === 'ios';

const NativeModuleLoaded = RNGoogleSignin !== undefined;

function ensureNativeNoduleLoaded() {
  if (!NativeModuleLoaded) {
    throw new Error(
      'RN GoogleSignin native module is not correctly linked. Please read the readme, setup and troubleshooting instructions carefully or try manual linking.'
    );
  }
}

class GoogleSignin {
  configPromise;

  async signIn() {
    ensureNativeModuleLoaded();
    await this.configPromise;
    return await RNGoogleSignin.signIn();
  }

  async hasPlayServices(options = { showPlayServicesUpdateDialog: true }) {
    ensureNativeModuleLoaded();

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
    ensureNativeModuleLoaded();

    if (options.offlineAccess && !options.webClientId) {
      throw new Error('RNGoogleSignin: offline use requires server web ClientID');
    }

    this.configPromise = RNGoogleSignin.configure(options);
  }

  async signInSilently() {
    ensureNativeModuleLoaded();

    await this.configPromise;
    return RNGoogleSignin.signInSilently();
  }

  async signOut() {
    ensureNativeModuleLoaded();

    return RNGoogleSignin.signOut();
  }

  async revokeAccess() {
    ensureNativeModuleLoaded();

    return RNGoogleSignin.revokeAccess();
  }

  async isSignedIn() {
    ensureNativeModuleLoaded();
    
    return RNGoogleSignin.isSignedIn();
  }
}

export const GoogleSigninSingleton = new GoogleSignin();

export const statusCodes = NativeModuleLoaded ? {
  SIGN_IN_CANCELLED: RNGoogleSignin.SIGN_IN_CANCELLED,
  IN_PROGRESS: RNGoogleSignin.IN_PROGRESS,
  PLAY_SERVICES_NOT_AVAILABLE: RNGoogleSignin.PLAY_SERVICES_NOT_AVAILABLE,
  SIGN_IN_REQUIRED: RNGoogleSignin.SIGN_IN_REQUIRED,
};
