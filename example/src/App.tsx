import React, { Component } from 'react';
import { StyleSheet, Text, View, Alert, Button, Image } from 'react-native';
import { GoogleSignin, GoogleSigninButton, NativeModuleError, statusCodes } from 'rn-google-signin';
import type { User } from 'rn-google-signin';
// @ts-ignore see docs/CONTRIBUTING.md for details
import config from './config';
import { TokenClearingView } from './TokenClearingView';

type ErrorWithCode = Error & { code?: string };

type State = {
  error?: ErrorWithCode;
  userInfo?: User;
};

const prettyJson = (value: any) => {
  return JSON.stringify(value, null, 2);
};
const PROFILE_IMAGE_SIZE = 150;

export default class GoogleSigninSampleApp extends Component<{}, State> {
  state = {
    userInfo: undefined,
    error: undefined,
  };

  async componentDidMount() {
    this._configureGoogleSignIn();
    await this._getCurrentUser();
  }

  _configureGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: config.webClientId,
      offlineAccess: false,
      profileImageSize: PROFILE_IMAGE_SIZE,
    });
  }

  async _getCurrentUser() {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      this.setState({ userInfo, error: undefined });
    } catch (error) {
      const typedError = error as NativeModuleError;
      const errorMessage =
        typedError.code === statusCodes.SIGN_IN_REQUIRED
          ? 'User not signed it yet, please sign in :)'
          : typedError.message;
      this.setState({
        error: new Error(errorMessage),
      });
    }
  }

  render() {
    const { userInfo } = this.state;

    // @ts-ignore
    const body = userInfo ? this.renderUserInfo(userInfo) : this.renderSignInButton();
    return (
      <View style={[styles.container, styles.pageContainer]}>
        {this.renderIsSignedIn()}
        {this.renderAddScopes()}
        {this.renderGetCurrentUser()}
        {this.renderGetTokens()}
        {body}
      </View>
    );
  }

  renderIsSignedIn() {
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

  renderGetCurrentUser() {
    return (
      <Button
        onPress={async () => {
          const userInfo = await GoogleSignin.getCurrentUser();
          Alert.alert('current user', userInfo ? prettyJson(userInfo.user) : 'null');
        }}
        title="get current user"
      />
    );
  }

  renderAddScopes() {
    return (
      <Button
        onPress={async () => {
          const user = await GoogleSignin.addScopes({
            scopes: ['https://www.googleapis.com/auth/user.gender.read'],
          });
          Alert.alert('user', prettyJson(user));
        }}
        title="request more scopes [ios]"
      />
    );
  }

  renderGetTokens() {
    return (
      <Button
        onPress={async () => {
          const isSignedIn = await GoogleSignin.getTokens();
          Alert.alert('tokens', prettyJson(isSignedIn));
        }}
        title="get tokens"
      />
    );
  }

  renderUserInfo(userInfo: User) {
    return (
      <View style={styles.container}>
        <Text style={styles.userInfo}>Welcome {userInfo.user.name}</Text>
        <Text>Your user info: {prettyJson(userInfo.user)}</Text>
        {userInfo.user.photo && (
          <Image
            style={{ width: PROFILE_IMAGE_SIZE, height: PROFILE_IMAGE_SIZE }}
            source={{ uri: userInfo.user.photo }}
          />
        )}
        <TokenClearingView />

        <Button onPress={this._signOut} title="Log out" />
        {this.renderError()}
      </View>
    );
  }

  renderSignInButton() {
    return (
      <View style={styles.container}>
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Standard}
          color={GoogleSigninButton.Color.Dark}
          onPress={this._signIn}
        />
        {this.renderError()}
      </View>
    );
  }

  renderError() {
    const { error } = this.state;
    if (error !== undefined) {
      // @ts-ignore
      const text = `${error.toString()} ${error.code ? error.code : ''}`;
      return <Text>{text}</Text>;
    }
    return null;
  }

  _signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      this.setState({ userInfo, error: undefined });
    } catch (error) {
      const typedError = error as NativeModuleError;

      switch (typedError.code) {
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
          Alert.alert('Something went wrong', typedError.toString());
          this.setState({
            error: typedError,
          });
      }
    }
  };

  _signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();

      this.setState({ userInfo: undefined, error: undefined });
    } catch (error) {
      const typedError = error as NativeModuleError;

      this.setState({
        error: typedError,
      });
    }
  };
}

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
