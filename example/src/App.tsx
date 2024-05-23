import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Button,
  Image,
  ScrollView,
  SafeAreaView,
  Clipboard,
} from 'react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  NativeModuleError,
  statusCodes,
  User,
} from '@react-native-google-signin/google-signin';

import { TokenClearingView } from './components/TokenClearingView';
import {
  configureGoogleSignIn,
  prettyJson,
  PROFILE_IMAGE_SIZE,
  RenderError,
  RenderGetCurrentUser,
  RenderHasPreviousSignIn,
} from './components/components';

type State = {
  userInfo: User | undefined;
  error: Error | undefined;
};

export class GoogleSigninSampleApp extends Component<{}, State> {
  state = {
    userInfo: undefined,
    error: undefined,
  };

  async componentDidMount() {
    configureGoogleSignIn();
    await this._getCurrentUser();
  }

  async _getCurrentUser() {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      this.setState({ userInfo, error: undefined });
    } catch (error) {
      const typedError = error as NativeModuleError;
      if (typedError.code === statusCodes.SIGN_IN_REQUIRED) {
        this.setState({
          error: new Error('User not signed it yet, please sign in :)'),
        });
      } else {
        this.setState({ error: typedError });
      }
    }
  }

  render() {
    const { userInfo } = this.state;

    const body = userInfo ? (
      this.renderUserInfo(userInfo)
    ) : (
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Standard}
        color={GoogleSigninButton.Color.Light}
        onPress={this._signIn}
        accessibilityLabel={'sign in'}
      />
    );
    return (
      <SafeAreaView style={[styles.pageContainer]}>
        <ScrollView contentContainerStyle={styles.container}>
          <RenderHasPreviousSignIn />
          {this.renderAddScopes()}
          <RenderGetCurrentUser />
          {this.renderGetTokens()}
          {body}
          <RenderError error={this.state.error} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  renderAddScopes() {
    return (
      <Button
        onPress={async () => {
          const user = await GoogleSignin.addScopes({
            scopes: ['https://www.googleapis.com/auth/user.gender.read'],
          });
          this._getCurrentUser();

          Alert.alert('user', prettyJson(user));
        }}
        title="request more scopes"
      />
    );
  }

  renderGetTokens() {
    return (
      <Button
        onPress={async () => {
          try {
            const tokens = await GoogleSignin.getTokens();
            Alert.alert('tokens', prettyJson(tokens), [
              {
                text: 'copy ID token',
                onPress: () => {
                  Clipboard.setString(tokens.idToken);
                },
              },
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
            ]);
          } catch (error) {
            const typedError = error as NativeModuleError;
            this.setState({
              error: typedError,
            });
            Alert.alert('error', typedError.message);
          }
        }}
        title="get tokens"
      />
    );
  }

  renderUserInfo(userInfo: User) {
    return (
      <View style={styles.container}>
        <Text style={styles.welcomeText}>Welcome, {userInfo.user.name}</Text>
        <Text selectable style={{ color: 'black' }}>
          Your user info:{' '}
          {prettyJson({
            ...userInfo,
            idToken: `${userInfo.idToken?.slice(0, 5)}...`,
          })}
        </Text>
        {userInfo.user.photo && (
          <Image
            style={{ width: PROFILE_IMAGE_SIZE, height: PROFILE_IMAGE_SIZE }}
            source={{ uri: userInfo.user.photo }}
          />
        )}
        <TokenClearingView />

        <Button onPress={this._signOut} title="Log out" />
      </View>
    );
  }

  _signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      this.setState({ userInfo, error: undefined });
    } catch (error) {
      if (isErrorWithCode(error)) {
        console.log('error', error.message);
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            // sign in was cancelled by user
            setTimeout(() => {
              Alert.alert('cancelled');
            }, 500);
            break;
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            Alert.alert(
              'in progress',
              'operation (eg. sign in) already in progress',
            );
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // android only
            Alert.alert('play services not available or outdated');
            break;
          default:
            Alert.alert('Something went wrong: ', error.toString());
        }
        this.setState({
          error,
        });
      } else {
        alert(`an error that's not related to google sign in occurred`);
      }
    }
  };

  _signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();

      this.setState({ userInfo: undefined, error: undefined });
    } catch (error) {
      this.setState({
        error: error as NativeModuleError,
      });
    }
  };
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  pageContainer: { flex: 1, backgroundColor: '#F5FCFF' },
});
