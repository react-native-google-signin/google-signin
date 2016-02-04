
const React = require('react-native');

const {
  View,
  PropTypes,
  DeviceEventEmitter,
  NativeModules: { GoogleSignin },
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

module.exports = {GoogleSignin, GoogleSigninButton};
