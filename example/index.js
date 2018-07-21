import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';

import { GoogleSignin, GoogleSigninButton, isSigninCancellation } from 'react-native-google-signin';
import config from './config';

const configPerPlatform = {
  ...Platform.select({
    ios: {
      iosClientId: config.iosClientId,
    },
    android: {
      autoResolveGooglePlayError: true,
    },
  }),
};

const configObject = {
  ...configPerPlatform,
  webClientId: config.webClientId,
  offlineAccess: false,
};

class GoogleSigninSampleApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      error: null,
    };
  }

  async componentDidMount() {
    await this._getCurrentUser();
  }

  async _getCurrentUser() {
    try {
      const user = await GoogleSignin.getCurrentUser(configObject);
      this.setState({ user, error: null });
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
            Welcome {user.user.name}
          </Text>
          <Text>Your email is: {user.user.email}</Text>

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
      const user = await GoogleSignin.signIn(configObject);
      this.setState({ user, error: null });
    } catch (error) {
      if (!isSigninCancellation(error)) {
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
      this.setState({ user: null });
    } catch (error) {
      this.setState({
        error,
      });
    }
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
