'use strict';

var React = require('react-native');
var { NativeAppEventEmitter } = require('react-native');
var { DeviceEventEmitter } = require('react-native');

import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin';

var {
  AppRegistry,
  StyleSheet,
  PropTypes,
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  DeviceEventEmitter
} = React;



class RNGoogleSiginExample extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: null
    };
  }

  componentDidMount() {
    this._configureOauth();
  }

  render() {

    if (!this.state.user) {
      return (
        <View style={styles.container}>
          <GoogleSigninButton style={{width: 120, height: 44}} color={GoogleSignin.BUTTON_COLOR_LIGHT} size={GoogleSignin.BUTTON_ICON} onPress={() => { this._signIn(); }}/>
        </View>
      );
    }

    if (this.state.user) {
      return (
        <View style={styles.container}>
          <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 20}}>Welcome {this.state.user.name}</Text>
          <Text>Your email is: {this.state.user.email}</Text>

          <TouchableOpacity onPress={() => {this._signOut(); }}>
            <View style={{marginTop: 50}}>
              <Text>Log out</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }
  }

  _configureOauth(clientId, scopes=[]) {
    GoogleSignin.configure(
      '867788377702-gmfcntqtkrmdh3bh1dat6dac9nfiiku1.apps.googleusercontent.com',
      ['https://www.googleapis.com/auth/calendar'], // additional scopes (email is the default)
    );

    DeviceEventEmitter.addListener('googleSignInError', (error) => {
      console.log('ERROR signin in', error);
    });

    DeviceEventEmitter.addListener('googleSignIn', (user) => {
      console.log(user);
      this.setState({user: user});
    });

    return true;
  }

  _signIn() {
    GoogleSignin.signIn();
  }

  _signOut() {
    GoogleSignin.signOut();
    this.setState({user: null});
  }
};

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  }
});

AppRegistry.registerComponent('RNGoogleSiginExample', () => RNGoogleSiginExample);
