// @flow
import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View, Alert, Button } from 'react-native';
import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin';
import type { User } from 'react-native-google-signin';
import config from './config';

type ErrorWithCode = Error & { code?: string };

type State = {
  error: ?ErrorWithCode,
  userInfo: ?User,
};

class GoogleSigninSampleApp extends Component<{}, State> {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: null,
      error: null,
    };
  }

  async componentDidMount() {
    this._configureGoogleSignIn();
    await this._getCurrentUser();
  }

  _configureGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: config.webClientId,
      offlineAccess: false,
    });
  }

  async _getCurrentUser() {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      this.setState({ userInfo, error: null });
    } catch (error) {
      const errorMessage =
        error.code === statusCodes.SIGN_IN_REQUIRED ? 'Please sign in :)' : error.message;
      this.setState({
        error: new Error(errorMessage),
      });
    }
  }

  render() {
    const { userInfo } = this.state;

    const body = userInfo ? this.renderUserInfo(userInfo) : this.renderSignInButton();
    return (
      <View style={[styles.container, { flex: 1 }]}>
        {this.renderIsSignedIn()}
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

  renderUserInfo(userInfo) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
          Welcome {userInfo.user.name}
        </Text>
        <Text>Your user info: {JSON.stringify(userInfo.user)}</Text>

        <Button onPress={this._signOut} title="Log out" />
        {this.renderError()}
      </View>
    );
  }

  renderSignInButton() {
    return (
      <View style={styles.container}>
        <GoogleSigninButton
          style={{ width: 212, height: 48 }}
          size={GoogleSigninButton.Size.Standard}
          color={GoogleSigninButton.Color.Auto}
          onPress={this._signIn}
        />
        {this.renderError()}
      </View>
    );
  }

  renderError() {
    const { error } = this.state;
    if (!error) {
      return null;
    }
    const text = `${error.toString()} ${error.code ? error.code : ''}`;
    return <Text>{text}</Text>;
  }

  _signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      this.setState({ userInfo, error: null });
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // sign in was cancelled
        Alert.alert('cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation in progress already
        Alert.alert('in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('play services not available or outdated');
      } else {
        Alert.alert('Something went wrong', error.toString());
        this.setState({
          error,
        });
      }
    }
  };

  _signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();

      this.setState({ userInfo: null, error: null });
    } catch (error) {
      this.setState({
        error,
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
});

AppRegistry.registerComponent('GoogleSigninSampleApp', () => GoogleSigninSampleApp);
