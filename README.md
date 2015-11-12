# react-native-google-sign
Let your users sign in with their Google account.
Includes Google Sign-In SDK v2.4.0

[![xcode config](https://github.com/apptailor/react-native-google-signin/raw/master/img/demo-app.gif)](#demo)

## Google project configuration

- Open https://developers.google.com/identity/sign-in/ios/sdk/

- Scroll down and click ```Get a configuration file``` button

- Download the ```GoogleService-Info.plist``` file at the end of the process

## XCode configuration

- Add ```RNGoogleSignin``` folder to your XCode project (make sure 'copy items if needed' is ticked)

- Link your project with the following frameworks: ```AddressBook.framework``` ```StoreKit.framework``` ```SystemConfiguration.framework```

Add the end of this step, your Xcode config should look like this:

[![xcode config](https://github.com/apptailor/react-native-google-signin/raw/master/img/lib-config.png)](#config)

- Configure URL types in the ```Info``` panel
  - add a URL with scheme set to your ```REVERSED_CLIENT_ID``` (found inside the plist)
  - add a URL with scheme set to your ```bundle id```

Add the end of this step, your Xcode config should look like this:

[![xcode config](https://github.com/apptailor/react-native-google-signin/raw/master/img/url-config.png)](#config)

## Usage

Inside AppDelegate.m
```
// add this line before @implementation AppDelegate
#import "RNGoogleSignin.h"

// add this method before @end
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {

  return [RNGoogleSignin application:application openURL:url sourceApplication:sourceApplication annotation:annotation];
}

````

From your JS files
```
var { NativeAppEventEmitter } = require('react-native');
var GoogleSignin = require('react-native-google-signin');

// configure API keys and access right
GoogleSignin.configure(
  CLIENT_ID, // from .plist file
  SCOPES // array of authorization names: eg ['https://www.googleapis.com/auth/calendar'] for requesting access to user calendar
);

// called on signin error
NativeAppEventEmitter.addListener('googleSignInError', (error) => {
  ....
});

// called on signin success, you get user data (email) and access token
NativeAppEventEmitter.addListener('googleSignIn', (user) => {
  console.log('Access toekn', user.accessToken)
});

// call this method when user clicks the 'Signin with google' button
GoogleSignin.signIn();

// remove user credentials. next time user starts the application, a signin promp will be displayed
GoogleSignin.signOut();
```
