import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';

import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';
import config from './config';

class GoogleSigninSampleApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      error: null,
    };
  }

  componentDidMount() {
    this._setupGoogleSignin();
  }

  async _setupGoogleSignin() {
    try {
      await GoogleSignin.hasPlayServices({ autoResolve: true });
      const configPlatform = {
        ...Platform.select({
          ios: {
            iosClientId: config.iosClientId,
          },
          android: {},
        }),
      };

      await GoogleSignin.configure({
        ...configPlatform,
        webClientId: config.webClientId,
        offlineAccess: false,
      });

      const user = await GoogleSignin.currentUserAsync();
      console.log(user);
      this.setState({ user });
    } catch (error) {
      this.setState({
        error,
      });
    }
  }

  render() {
    const { user, error } = this.state;
    if (!user) {
      return (
        <View style={styles.container}>
          <GoogleSigninButton
            style={{ width: 212, height: 48 }}
            size={GoogleSigninButton.Size.Standard}
            color={GoogleSigninButton.Color.Auto}
            onPress={this._signIn}
          />
          {error && (
            <Text>
              {error.toString()} code: {error.code}
            </Text>
          )}
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
            Welcome {user.name}
          </Text>
          <Text>Your email is: {user.email}</Text>

          <TouchableOpacity onPress={this._signOut}>
            <View style={{ marginTop: 50 }}>
              <Text>Log out</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }
  }

  _signIn = async () => {
    try {
      const user = await GoogleSignin.signIn();
      console.log(user);
      this.setState({ user });
    } catch (error) {
      this.setState({
        error,
      });
    }
  };

  _signOut = async () => {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
    this.setState({ user: null });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
