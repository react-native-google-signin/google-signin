![React Native Google Sign In](img/header.png)

<p align="center">
  <a href="https://www.npmjs.com/package/@react-native-google-signin/google-signin"><img src="https://badge.fury.io/js/@react-native-google-signin%2Fgoogle-signin.svg" alt="NPM Version"></a>
</p>

### 🚧🚧 Maintenance notice 🚧🚧

See this [issue](https://github.com/react-native-google-signin/google-signin/issues/942)

## Features

- Support all 3 types of authentication methods (standard, with server-side validation or with offline access (aka server side access))
- Promise-based API consistent between Android and iOS
- Typings for TypeScript and Flow
- Native sign in buttons

## Requirements

- RN >= 0.60

## Project setup and initialization

`yarn add @react-native-google-signin/google-signin`

Then follow the [Android guide](docs/android-guide.md) and [iOS guide](docs/ios-guide.md)

## Expo installation

> This package cannot be used in the "Expo Go" app because [it requires custom native code](https://docs.expo.io/workflow/customizing/). _However, you can add custom native code to expo by following the guide below._

- First install the package with yarn, npm, or [`expo install`](https://docs.expo.io/workflow/expo-cli/#expo-install).

```sh
expo install @react-native-google-signin/google-signin
```

After installing this npm package, add the [config plugin](https://docs.expo.io/guides/config-plugins/) to the [`plugins`](https://docs.expo.io/versions/latest/config/app/#plugins) array of your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "plugins": ["@react-native-google-signin/google-signin"]
  }
}
```

Next, rebuild your app as described in the ["Adding custom native code"](https://docs.expo.io/workflow/customizing/) guide.

## Public API

### 1. GoogleSignin

```js
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
```

#### `configure(options)`

It is mandatory to call this method before attempting to call `signIn()` and `signInSilently()`. This method is sync meaning you can call `signIn` / `signInSilently` right after it. In typical scenarios, `configure` needs to be called only once, after your app starts. In the native layer, this is a synchronous call. All parameters are optional.

Example usage with default options: you get user email and basic profile info.

```js
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure();
```

An example with all options enumerated:

```js
GoogleSignin.configure({
  scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
  webClientId: '<FROM DEVELOPER CONSOLE>', // client ID of type WEB for your server (needed to verify user ID and offline access)
  offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  hostedDomain: '', // specifies a hosted domain restriction
  forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
  accountName: '', // [Android] specifies an account name on the device that should be used
  iosClientId: '<FROM DEVELOPER CONSOLE>', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
  googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. GoogleService-Info-Staging
  openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
  profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
});
```

\* [forceCodeForRefreshToken docs](https://developers.google.com/android/reference/com/google/android/gms/auth/api/signin/GoogleSignInOptions.Builder#public-googlesigninoptions.builder-requestserverauthcode-string-serverclientid,-boolean-forcecodeforrefreshtoken)

#### `signIn(options: { loginHint?: string })`

Prompts a modal to let the user sign in into your application. Resolved promise returns an [`userInfo` object](#3-userinfo). Rejects with error otherwise.

Options: an object which contains a single key:

`loginHint`: [iOS-only] The user's ID, or email address, to be prefilled in the authentication UI if possible. [See docs here](<https://developers.google.com/identity/sign-in/ios/reference/Classes/GIDSignIn#/c:objc(cs)GIDSignIn(im)signInWithConfiguration:presentingViewController:hint:callback:>)

```js
// import statusCodes along with GoogleSignin
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// Somewhere in your code
signIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    this.setState({ userInfo });
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      // user cancelled the login flow
    } else if (error.code === statusCodes.IN_PROGRESS) {
      // operation (e.g. sign in) is in progress already
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      // play services not available or outdated
    } else {
      // some other error happened
    }
  }
};
```

#### `addScopes(options: { scopes: Array<string> })`

This is an iOS-only method (calls `getCurrentUser()` on Android) that resolves with `null` or `userInfo` object.

As of version 8 of this package, you may not need this call: you can supply required scopes to the `configure` call.

If you want access to more scopes later, use this call.

Example:

```js
const user = await GoogleSignin.addScopes({
  scopes: ['https://www.googleapis.com/auth/user.gender.read'],
});
```

#### `signInSilently()`

May be called eg. in the `componentDidMount` of your main component. This method returns the [current user](#3-userinfo) and rejects with an error otherwise.

To see how to handle errors read [`signIn()` method](#signin)

```js
getCurrentUserInfo = async () => {
  try {
    const userInfo = await GoogleSignin.signInSilently();
    this.setState({ userInfo });
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_REQUIRED) {
      // user has not signed in yet
    } else {
      // some other error
    }
  }
};
```

#### `isSignedIn()`

This method may be used to find out whether some user is currently signed in. It returns a promise which resolves with a boolean value (it never rejects). In the native layer, this is a synchronous call. This means that it will resolve even when the device is offline. Note that it may happen that `isSignedIn()` resolves to true and calling `signInSilently()` rejects with an error (eg. due to a network issue).

```js
isSignedIn = async () => {
  const isSignedIn = await GoogleSignin.isSignedIn();
  this.setState({ isLoginScreenPresented: !isSignedIn });
};
```

#### `getCurrentUser()`

This method resolves with `null` or `userInfo` object. The call never rejects and in the native layer, this is a synchronous call. Note that on Android, `accessToken` is always `null` in the response.

```js
getCurrentUser = async () => {
  const currentUser = await GoogleSignin.getCurrentUser();
  this.setState({ currentUser });
};
```

#### `clearCachedAccessToken(accessTokenString)`

This method only has an effect on Android. You may run into a 401 Unauthorized error when a token is invalid. Call this method to remove the token from local cache and then call `getTokens()` to get fresh tokens. Calling this method on iOS does nothing and always resolves. This is because on iOS, `getTokens()` always returns valid tokens, refreshing them first if they have expired or are about to expire (see [docs](https://developers.google.com/identity/sign-in/ios/reference/Classes/GIDAuthentication#-dowithfreshtokens:)).

#### `getTokens()`

Resolves with an object containing `{ idToken: string, accessToken: string, }` or rejects with an error. Note that using `accessToken` for identity assertion on your backend server is [discouraged](https://developers.google.com/identity/sign-in/android/migration-guide).

#### `signOut()`

Signs out the current user.

```js
signOut = async () => {
  try {
    await GoogleSignin.signOut();
    this.setState({ user: null }); // Remember to remove the user from your app's state as well
  } catch (error) {
    console.error(error);
  }
};
```

#### `revokeAccess()`

Removes your application from the user authorized applications. Read more about it [here](https://developers.google.com/identity/sign-in/ios/disconnect#objective-c) and [here](<https://developers.google.com/android/reference/com/google/android/gms/auth/api/signin/GoogleSignInClient#revokeAccess()>).

```js
revokeAccess = async () => {
  try {
    await GoogleSignin.revokeAccess();
    // Google Account disconnected from your app.
    // Perform clean-up actions, such as deleting data associated with the disconnected account.
  } catch (error) {
    console.error(error);
  }
};
```

#### `hasPlayServices(options)`

Checks if device has Google Play Services installed. Always resolves to true on iOS.

Presence of up-to-date Google Play Services is required to show the sign in modal, but it is _not_ required to perform calls to `configure` and `signInSilently`. Therefore, we recommend to call `hasPlayServices` directly before `signIn`.

```js
try {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  // google services are available
} catch (err) {
  console.error('play services are not available');
}
```

`hasPlayServices` accepts one parameter, an object which contains a single key: `showPlayServicesUpdateDialog` (defaults to `true`). When `showPlayServicesUpdateDialog` is set to true the library will prompt the user to take action to solve the issue, as seen in the figure below.

You may also use this call at any time to find out if Google Play Services are available and react to the result as necessary.

[![prompt install](img/prompt-install.png)](#prompt-install)

#### `statusCodes`

These are useful when determining which kind of error has occured during sign in process. Import `statusCodes` along with `GoogleSignIn`. Under the hood these constants are derived from native GoogleSignIn error codes and are platform specific. Always prefer to compare `error.code` to `statusCodes.SIGN_IN_CANCELLED` or `statusCodes.IN_PROGRESS` and not relying on raw value of the `error.code`.

| Name                          | Description                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SIGN_IN_CANCELLED`           | When user cancels the sign in flow                                                                                                                                                                                                                                                                                                                                        |
| `IN_PROGRESS`                 | Trying to invoke another operation (eg. `signInSilently`) when previous one has not yet finished. If you call eg. `signInSilently` twice, 2 calls to `signInSilently` in the native module will be done. The promise from the first call to `signInSilently` will be rejected with this error, and the second will resolve / reject with the result of the native module. |
| `SIGN_IN_REQUIRED`            | Useful for use with `signInSilently()` - no user has signed in yet                                                                                                                                                                                                                                                                                                        |
| `PLAY_SERVICES_NOT_AVAILABLE` | Play services are not available or outdated, this can only happen on Android                                                                                                                                                                                                                                                                                              |

[Example how to use `statusCodes`](#signin).

### 2. GoogleSigninButton

![signin button](img/signin-button.png)

```js
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';

<GoogleSigninButton
  style={{ width: 192, height: 48 }}
  size={GoogleSigninButton.Size.Wide}
  color={GoogleSigninButton.Color.Dark}
  onPress={this._signIn}
  disabled={this.state.isSigninInProgress}
/>;
```

#### Props

##### `size`

Possible values:

- Size.Icon: display only Google icon. Recommended size of 48 x 48.
- Size.Standard: icon with 'Sign in'. Recommended size of 230 x 48.
- Size.Wide: icon with 'Sign in with Google'. Recommended size of 312 x 48.

Default: `Size.Standard`. Given the `size` prop you pass, we'll automatically apply the recommended size, but you can override it by passing the style prop as in `style={{ width, height }}`.

##### `color`

Possible values:

- Color.Dark: apply a blue background
- Color.Light: apply a light gray background

##### `disabled`

Boolean. If true, all interactions for the button are disabled.

##### `onPress`

Handler to be called when the user taps the button

##### [Inherited `View` props...](https://facebook.github.io/react-native/docs/view#props)

### 3. `userInfo`

Example `userInfo` which is returned after successful sign in.

```
{
  idToken: string,
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

## Want to contribute?

Check out the [contributor guide](docs/CONTRIBUTING.md)!

## Notes

Calling the methods exposed by this package may involve remote network calls and you should thus take into account that such calls may take a long time to complete (eg. in case of poor network connection).

**idToken Note**: idToken is not null only if you specify a valid `webClientId`. `webClientId` corresponds to your server clientID on the developers console. It **HAS TO BE** of type **WEB**

Read [iOS documentation](https://developers.google.com/identity/sign-in/ios/backend-auth) and [Android documentation](https://developers.google.com/identity/sign-in/android/backend-auth) for more information

**serverAuthCode Note**: serverAuthCode is not null only if you specify a valid `webClientId` and set `offlineAccess` to true. once you get the auth code, you can send it to your backend server and exchange the code for an access token. Only with this freshly acquired token can you access user data.

Read [iOS documentation](https://developers.google.com/identity/sign-in/ios/offline-access) and [Android documentation](https://developers.google.com/identity/sign-in/android/offline-access) for more information.

## Additional scopes

The default requested scopes are `email` and `profile`.

If you want to manage other data from your application (for example access user agenda or upload a file to drive) you need to request additional permissions. This can be accomplished by adding the necessary scopes when configuring the GoogleSignin instance.

Please visit https://developers.google.com/identity/protocols/googlescopes or https://developers.google.com/oauthplayground/ for a list of available scopes.

## Troubleshooting

Please see the troubleshooting section in the [Android guide](docs/android-guide.md) and [iOS guide](docs/ios-guide.md).

## Licence

(MIT)
