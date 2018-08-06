![React Native Google Sign In](img/header.png)

<p align="center">
  <a href="https://www.npmjs.com/package/react-native-google-signin"><img src="https://badge.fury.io/js/react-native-google-signin.svg" alt="NPM Version"></a>
</p>

## Important!

> A new RC is available: [see release notes](https://github.com/react-native-community/react-native-google-signin/releases/tag/1.0.0-rc1). Install it with `yarn add react-native-google-signin@next`.

> On May 15, the repo was moved to react-native-community, and we're looking for contributors to help get the project back up to speed [see related issue](https://github.com/react-native-community/react-native-google-signin/issues/386).

## Features

- Support all 3 types of authentication methods (standard, with server-side validation or with offline access (aka server side access))
- Native signin button
- Consistent API between Android and iOS
- Promise-based JS API

## Installation

```bash
npm install react-native-google-signin --save
react-native link react-native-google-signin
```

### Note

If you use React Native < `v0.40` stick with `v0.8.1` (`npm install react-native-google-signin@0.8 --save`).

If you use React Native < `v0.47` stick with `v0.10.0` (`npm install react-native-google-signin@0.10 --save`).

## Project setup and initialization

See [Android guide](android-guide.md) and [iOS guide](ios-guide.md)

## Public API

### 1. GoogleSigninButton

![signin button](img/signin-button.png)

```js
import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';

render() {
  <GoogleSigninButton
    style={{ width: 48, height: 48 }}
    size={GoogleSigninButton.Size.Icon}
    color={GoogleSigninButton.Color.Dark}
    onPress={this._signIn}/>
}
```

Possible values for `size` are:

- Size.Icon: display only Google icon. recommended size of 48 x 48
- Size.Standard: icon with 'Sign in'. recommended size of 230 x 48
- Size.Wide: icon with 'Sign in with Google'. recommended size of 312 x 48

Possible values for `color` are:

- Color.Dark: apply a blue background
- Color.Light: apply a light gray background

### 2. GoogleSignin

```js
import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';
```

#### - hasPlayServices

Check if device has google play services installed. Always returns true on iOS.

```js
GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
  .then(() => {
    // play services are available. can now configure library
  })
  .catch(err => {
    console.log('Play services error', err.code, err.message);
  });
```

When `showPlayServicesUpdateDialog` is set to true the library will prompt the user to take action to solve the issue. If no configuration is provided for `hasPlayServices` `showPlayServicesUpdateDialog` defaults to true.

For example if the play services are not installed it will prompt:
[![prompt install](img/prompt-install.png)](#prompt-install)

#### - `configure(configuration)`

It is mandatory to call this method before `signIn()` and `signInSilently()`. This method is sync meaning you can call `singIn` right after it. In typical situations this needs to be called only once.

Example for default configuration: you get user email and basic profile info.

```js
import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';

GoogleSignin.configure({
  iosClientId: '<FROM DEVELOPER CONSOLE>', // only for iOS
})
```

Example to access Google Drive both from the mobile application and from the backend server

```js
GoogleSignin.configure({
  scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
  iosClientId: '<FROM DEVELOPER CONSOLE>', // only for iOS
  webClientId: '<FROM DEVELOPER CONSOLE>', // client ID of type WEB for your server (needed to verify user ID and offline access)
  offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  hostedDomain: '', // specifies a hosted domain restriction
  forceConsentPrompt: true, // [Android] if you want to show the authorization prompt at each login
  accountName: '', // [Android] specifies an account name on the device that should be used
})
```

**iOS Note**: your app ClientID (`iosClientId`) is always required

#### - `signIn()`

Prompts a modal to let the user sign in into your application. Resolved promise returns an [`userInfo` object](#3-userinfo).

```js
// import statusCodes along with GoogleSignin 
import { GoogleSignin, statusCodes } from 'react-native-google-signin';

// Somewhere in your code
signIn = async () => {
  try {
    const userInfo = await GoogleSignin.signIn();
    this.setState({ userInfo });
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      // user cancelled the login flow
    } else if (error.code === statusCodes.IN_PROGRESS) {
      // operation (f.e. sign in) is in progress already
    } else {
      // some other error happened
    }
  }
};
```

#### - `signInSilently()`

May be called eg. in the `componentDidMount` of your main component. This method returns the [current user](#3-userinfo) if they already signed in and `null` otherwise.

To see how to handle errors read [`signIn()` method](#--signin)

```js
getCurrentUser = async () => {
  try {
    const userInfo = await GoogleSignin.signInSilently();
    this.setState({ userInfo });
  } catch (error) {
    console.error(error);
  }
};
```

#### - `signOut()`

Remove user session from the device.

```js
signOut = async () => {
  try {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
    this.setState({ user: null }); // Remember to remove the user from your app's state as well
  } catch (error) {
    console.error(error)
  }
};
```

#### - `revokeAccess()`

Remove your application from the user authorized applications.

```js
GoogleSignin.revokeAccess()
  .then(() => {
    console.log('deleted');
  })
  .catch(error => {
    console.error(error);
  });
```

#### - `statusCodes`

These are useful when determining which kind of error has occured during sign in process. Import `statusCodes` along with `GoogleSignIn`. Under the hood these constants are derived from native GoogleSignIn error codes and are platform specific. Always prefer to compare `error.code` to `statusCodes.SIGN_IN_CANCELLED` or `statusCodes.IN_PROGRESS` and not relying on raw value of the `error.code`.

Name | Description 
--- | ---
`SIGN_IN_CANCELLED` | When user cancels the sign in flow
`IN_PROGRESS` | Trying to invoke another sign in flow when previous one has not yet finished

[Example how to use `statusCodes`](#--signin).


### 3. `userInfo`

Example `userInfo` which is returned after successful sign in.

```
{
  idToken: string,
  accessToken: string | null,
  accessTokenExpirationDate: number | null, // DEPRECATED, on iOS it's a time interval since now in seconds, on Android it's always null
  serverAuthCode: string,
  scopes: Array<string>, // on iOS this is empty array if no additional scopes are defined
  user: {
    email: string,
    id: string,
    givenName: string,
    familyName: string,
    photo: string, // url
    name: string // full name
  }
}
```

**idToken Note**: idToken is not null only if you specify a valid `webClientId`. `webClientId` corresponds to your server clientID on the developers console. It **HAS TO BE** of type **WEB**

Read [iOS documentation](https://developers.google.com/identity/sign-in/ios/backend-auth) and [Android documentation](https://developers.google.com/identity/sign-in/android/backend-auth) for more information

**serverAuthCode Note**: serverAuthCode is not null only if you specify a valid `webClientId` and set `offlineAccess` to true. once you get the auth code, you can send it to your backend server and exchange the code for an access token. Only with this freshly acquired token can you access user data.

Read [iOS documentation](https://developers.google.com/identity/sign-in/ios/offline-access) and [Android documentation](https://developers.google.com/identity/sign-in/android/offline-access) for more information

## Additional scopes

The default requested scopes are `email` and `profile`.

If you want to manage other data from your application (for example access user agenda or upload a file to drive) you need to request additional permissions. This can be accomplished by adding the necessary scopes when configuring the GoogleSignin instance.

Please visit https://developers.google.com/oauthplayground/ for a list of available scopes.

## Licence

(MIT)
