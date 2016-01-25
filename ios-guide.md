## iOS Guide

Includes Google Sign-In SDK v2.4.0

### Google project configuration

- Open https://developers.google.com/identity/sign-in/ios/sdk/

- Scroll down and click ```Get a configuration file``` button

- Download the ```GoogleService-Info.plist``` file at the end of the process

### XCode configuration

- Add ```RNGoogleSignin``` folder to your XCode project (click on 'Options' button and make sure 'copy items if needed' is ticked and 'create groups' is selected)

[![xcode dialog](https://github.com/apptailor/react-native-google-signin/raw/master/img/lib-dialog.png)]

- Link your project with the following frameworks: ```AddressBook.framework``` ```StoreKit.framework``` ```SystemConfiguration.framework```

- Disable Bitcode support under ```Build settings```

- If you run into link issues when building your project try to add ```libz.tbd``` library (see [Stackoverflow](http://stackoverflow.com/a/18296731) for more details).


Add the end of this step, your Xcode config should look like this:

[![xcode config](https://github.com/apptailor/react-native-google-signin/raw/master/img/lib-config.png)](#config)

- Configure URL types in the ```Info``` panel
  - add a URL with scheme set to your ```REVERSED_CLIENT_ID``` (found inside the plist)
  - add a URL with scheme set to your ```bundle id```

Add the end of this step, your Xcode config should look like this:

[![xcode config](https://github.com/apptailor/react-native-google-signin/raw/master/img/url-config.png)](#config)

### Usage

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

// called on signin success, you get user data (email), access token and idToken
NativeAppEventEmitter.addListener('googleSignIn', (user) => {
  User: {
    name
    email
    accessToken
    idToken (IOS ONLY)
    accessTokenExpirationDate (IOS ONLY)
  }
});

// call this method when user clicks the 'Signin with google' button
GoogleSignin.signIn();

// remove user credentials. next time user starts the application, a signin promp will be displayed
GoogleSignin.signOut();
```
