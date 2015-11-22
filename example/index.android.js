
var React = require('react-native');
var { NativeAppEventEmitter } = require('react-native');
var { NativeModules } = require('react-native');
var { DeviceEventEmitter } = require('react-native');

var GoogleSignin = NativeModules.GoogleSignin;

var { Icon } = require('react-native-icons');

var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight
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
          <TouchableHighlight onPress={() => {this._signIn(); }}>
            <View style={{backgroundColor: '#f44336', flexDirection: 'row'}}>
              <View style={{padding: 12, borderWidth: 1/2, borderColor: 'transparent', borderRightColor: 'white'}}>
                <Icon
                  name='ion|social-googleplus'
                  size={24}
                  color='white'
                  style={{width: 24, height: 24}}
                />
              </View>
              <Text style={{color: 'white', padding: 12, marginTop: 2, fontWeight: 'bold'}}>Sign in with Google+</Text>
            </View>
          </TouchableHighlight>
        </View>
      );
    }

    if (this.state.user) {
      return (
        <View style={styles.container}>
          <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 20}}>Welcome {this.state.user.name}</Text>
          <Text>Your email is: {this.state.user.email}</Text>
          <Text>Your token {this.state.user.accessToken}</Text>

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
    GoogleSignin.init();

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
