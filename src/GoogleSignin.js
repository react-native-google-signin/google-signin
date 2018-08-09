import React, { Component } from 'react';

import { NativeModules, Platform } from 'react-native';

const { RNGoogleSignin } = NativeModules;

const IS_IOS = Platform.OS === 'ios';

export const statusCodes = {
  SIGN_IN_CANCELLED: RNGoogleSignin.SIGN_IN_CANCELLED,
  IN_PROGRESS: RNGoogleSignin.IN_PROGRESS,
};

class GoogleSignin {
  configPromise;

  async signIn() {
    await this.configPromise;
    return await RNGoogleSignin.signIn();
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
      await this.configPromise;
      const userInfo = await RNGoogleSignin.signInSilently();
      return userInfo;
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
