import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  View,
  NativeAppEventEmitter,
  NativeModules,
  requireNativeComponent,
  ViewPropTypes
} from 'react-native'

const { RNGoogleSignin } = NativeModules
const RNGoogleSigninButton = requireNativeComponent('RNGoogleSigninButton', null)

class GoogleSigninButton extends Component {
  static propTypes = {
    ...ViewPropTypes,
    size: PropTypes.number,
    color: PropTypes.number,
    onPress: PropTypes.func.isRequired
  }

  handleOnPress = () => {
    if (this.props.onPress) {
      this.props.onPress()
      return
    }
  }

  render() {
    const { style, onPress, ...props } = this.props

    return (
      <RNGoogleSigninButton
        style={[{ backgroundColor: 'rgba(0,0,0,0)' }, style]}
        onPress={this.handleOnPress}
        {...props}
      />
    )
  }
}

GoogleSigninButton.Size = {
  Icon: RNGoogleSignin.BUTTON_SIZE_ICON,
  Standard: RNGoogleSignin.BUTTON_SIZE_STANDARD,
  Wide: RNGoogleSignin.BUTTON_SIZE_WIDE
}

GoogleSigninButton.Color = {
  Auto: RNGoogleSignin.BUTTON_COLOR_AUTO,
  Light: RNGoogleSignin.BUTTON_COLOR_LIGHT,
  Dark: RNGoogleSignin.BUTTON_COLOR_DARK
}

class GoogleSignin {
  _user = null
  signinIsInProcess = false

  hasPlayServices(params = { autoResolve: true }) {
    return Promise.resolve(true)
  }

  configure(params = {}) {
    if (!params.iosClientId) {
      return Promise.reject(new Error('RNGoogleSignin: Missing iOS app ClientID'))
    }

    if (params.offlineAccess && !params.webClientId) {
      return Promise.reject(new Error('RNGoogleSignin: offline use requires server web ClientID'))
    }

    const config = [
      params.scopes || [],
      params.iosClientId,
      params.offlineAccess ? params.webClientId : '',
      params.hostedDomain ? params.hostedDomain : null
    ]

    return RNGoogleSignin.configure(...config)
  }

  currentUserAsync() {
    return RNGoogleSignin.currentUserAsync()
      .then(user => {
        this._user = { ...user }
        return user
      })
      .catch(error => {
        // The user has never signed in before with the given scopes, or they have since signed out.
        if (error.code === '-4') {
          this._user = null
          this.signinIsInProcess = false
          return null
        }

        this.signinIsInProcess = false
        throw error
      })
  }

  currentUser() {
    if (this._user) {
      return { ...this._user }
    }

    return null
  }

  signIn() {
    if (this.signinIsInProcess) {
      return Promise.reject(new Error('RNGoogleSignin: Previous sign in still in progress.'))
    }

    this.signinIsInProcess = true

    return RNGoogleSignin.signIn()
      .then(user => {
        this._user = { ...user }
        this.signinIsInProcess = false
        return user
      })
      .catch(error => {
        this.signinIsInProcess = false
        throw error
      })
  }

  signOut() {
    return RNGoogleSignin.signOut().then(() => {
      this._user = null
    })
  }

  revokeAccess() {
    return RNGoogleSignin.revokeAccess().then(() => {
      this._user = null
    })
  }
}

const GoogleSigninSingleton = new GoogleSignin()

module.exports = { GoogleSignin: GoogleSigninSingleton, GoogleSigninButton }
