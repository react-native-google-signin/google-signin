
const React = require('react-native');

const {
  View,
  PropTypes,
  DeviceEventEmitter,
  NativeModules: { RNGoogleSignin },
  requireNativeComponent,
} = React;


const RNGoogleSigninButton = requireNativeComponent('RNGoogleSigninButton', {
  name: 'RNGoogleSigninButton',
  propTypes: {
    ...View.propTypes,
    size: PropTypes.number,
    color: PropTypes.number
  }
});

class GoogleSigninButton extends React.Component {
  componentDidMount() {
    this._clickListener = DeviceEventEmitter.addListener('RNGoogleSigninButtonClicked', () => {
      this.props.onPress && this.props.onPress();
    });
  }

  componentWillUnmount() {
    this._clickListener && this._clickListener.remove();
  }

  render() {
    return (
      <RNGoogleSigninButton {...this.props}/>
    );
  }
}

GoogleSigninButton.Size = {
  Icon: RNGoogleSignin.BUTTON_SIZE_ICON,
  Standard: RNGoogleSignin.BUTTON_SIZE_STANDARD,
  Wide: RNGoogleSignin.BUTTON_SIZE_WIDE
};

GoogleSigninButton.Color = {
  Auto: RNGoogleSignin.BUTTON_COLOR_AUTO,
  Light: RNGoogleSignin.BUTTON_COLOR_LIGHT,
  Dark: RNGoogleSignin.BUTTON_COLOR_DARK
};

class GoogleSignin {

  constructor() {
    this._user = null;
  }

  configure(params={}) {
    params = [
      params.scopes || [], params.webClientId || null, params.offlineAccess || false
    ];

    RNGoogleSignin.configure(...params);
  }

  currentUserAsync() {
    return new Promise((resolve, reject) => {
      const sucessCb = DeviceEventEmitter.addListener('RNGoogleSignInSilentSuccess', (user) => {
        this._user = user;
        this._removeListeners(sucessCb, errorCb);
        resolve(user);
      });

      const errorCb = DeviceEventEmitter.addListener('RNGoogleSignInSilentError', () => {
        this._removeListeners(sucessCb, errorCb);
        resolve(null);
      });

      RNGoogleSignin.currentUserAsync();
    });
  }

  currentUser() {
    return {...this._user};
  }

  signIn() {
    return new Promise((resolve, reject) => {
      const sucessCb = DeviceEventEmitter.addListener('RNGoogleSignInSuccess', (user) => {
        this._user = user;
        this._removeListeners(sucessCb, errorCb);
        resolve(user);
      });

      const errorCb = DeviceEventEmitter.addListener('RNGoogleSignInError', (err) => {
        this._removeListeners(sucessCb, errorCb);
        reject(err);
      });

      RNGoogleSignin.signIn();
    });
  }

  signOut() {
    return new Promise((resolve, reject) => {
      const sucessCb = DeviceEventEmitter.addListener('RNGoogleSignOutSuccess', () => {
        this._removeListeners(sucessCb, errorCb);
        resolve();
      });

      const errorCb = DeviceEventEmitter.addListener('RNGoogleSignOutError', (err) => {
        this._removeListeners(sucessCb, errorCb);
        reject(err);
      });

      RNGoogleSignin.signOut();
    });
  }

  _removeListeners(...listeners) {
    listeners.forEach(lt => lt.remove());
  }
}



module.exports = {GoogleSignin: new GoogleSignin(), GoogleSigninButton};
