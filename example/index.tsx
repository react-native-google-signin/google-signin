// @flow
import React, { useEffect, useState } from 'react';
import { AppRegistry, StyleSheet, Text, View, Alert, Button } from 'react-native';
import {
  GoogleSignin,
  statusCodes,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
import type { User } from '@react-native-google-signin/google-signin';
import config from './config'; // see docs/CONTRIBUTING.md for details
import { TokenClearingView } from './TokenClearingView';

type ErrorWithCode = Error & { code?: string };

type State = {
  error: ErrorWithCode | null;
  userInfo: User | null;
};

const GoogleSigninSampleApp = () => {
  const [state, setState] = useState<State>({
    userInfo: null,
    error: null,
  });
  const { userInfo } = state;

  function _configureGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: config.webClientId,
      offlineAccess: false,
    });
  }

  async function _getCurrentUser() {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      setState({ userInfo, error: null });
    } catch (error) {
      const errorMessage =
        error.code === statusCodes.SIGN_IN_REQUIRED ? 'Please sign in :)' : error.message;
      setState((prev) => {
        return {
          ...prev,
          error: new Error(errorMessage),
        };
      });
    }
  }

  async function _signIn() {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      setState({ userInfo, error: null });
    } catch (error) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          // sign in was cancelled
          Alert.alert('cancelled');
          break;
        case statusCodes.IN_PROGRESS:
          // operation (eg. sign in) already in progress
          Alert.alert('in progress');
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          // android only
          Alert.alert('play services not available or outdated');
          break;
        default:
          Alert.alert('Something went wrong', error.toString());
          setState((prev) => ({
            ...prev,
            error,
          }));
      }
    }
  }

  async function _signOut() {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();

      setState({ userInfo: null, error: null });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error,
      }));
    }
  }

  function renderSignInButton() {
    return (
      <View style={styles.container}>
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Standard}
          color={GoogleSigninButton.Color.Auto}
          onPress={this._signIn}
        />
        {renderError()}
      </View>
    );
  }

  function renderIsSignedIn() {
    return (
      <Button
        onPress={async () => {
          const isSignedIn = await GoogleSignin.isSignedIn();
          Alert.alert(String(isSignedIn));
        }}
        title="is user signed in?"
      />
    );
  }

  function renderGetCurrentUser() {
    return (
      <Button
        onPress={async () => {
          const userInfo = await GoogleSignin.getCurrentUser();
          Alert.alert('current user', userInfo ? JSON.stringify(userInfo.user) : 'null');
        }}
        title="get current user"
      />
    );
  }

  function renderGetTokens() {
    return (
      <Button
        onPress={async () => {
          const isSignedIn = await GoogleSignin.getTokens();
          Alert.alert('tokens', JSON.stringify(isSignedIn));
        }}
        title="get tokens"
      />
    );
  }

  function renderUserInfo(userInfo: User | null) {
    return (
      <View style={styles.container}>
        <Text style={styles.userInfo}>Welcome {userInfo?.user.name || ''}</Text>
        <Text>Your user info: {JSON.stringify(userInfo?.user || {})}</Text>
        <TokenClearingView />

        <Button onPress={_signOut} title="Log out" />
        {renderError()}
      </View>
    );
  }

  function renderError() {
    const error = state.error || { code: '0' };
    const text = `${error.toString()} ${error.code ? error.code : ''}`;
    return <Text>{text}</Text>;
  }

  useEffect(() => {
    async function init() {
      _configureGoogleSignIn();
      await _getCurrentUser();
    }
    init();
  }, []);

  return (
    <View style={[styles.container, styles.pageContainer]}>
      {renderIsSignedIn()}
      {renderGetCurrentUser()}
      {renderGetTokens()}
      {userInfo ? renderUserInfo(userInfo) : renderSignInButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  userInfo: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  pageContainer: { flex: 1 },
});

AppRegistry.registerComponent('GoogleSigninSampleApp', () => GoogleSigninSampleApp);
