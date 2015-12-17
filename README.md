# react-native-google-sign
Let your users sign in with their Google account.
Includes Google Sign-In SDK v2.4.0

[![xcode config](https://github.com/apptailor/react-native-google-signin/raw/master/img/demo-app.gif)](#demo)

## Installation

```bash
npm install react-native-google-signin --save
```

## iOS

### Google project configuration

- Open https://developers.google.com/identity/sign-in/ios/sdk/

- Scroll down and click ```Get a configuration file``` button

- Download the ```GoogleService-Info.plist``` file at the end of the process

### XCode configuration

- Add ```RNGoogleSignin``` folder to your XCode project (click on 'Options' button and make sure 'copy items if needed' is ticked and 'create groups' is selected)

[![xcode dialog](https://github.com/apptailor/react-native-google-signin/raw/master/img/lib-dialog.png)]

- Link your project with the following frameworks: ```AddressBook.framework``` ```StoreKit.framework``` ```SystemConfiguration.framework```

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

// called on signin success, you get user data (email) and access token
NativeAppEventEmitter.addListener('googleSignIn', (user) => {
  console.log('Access token', user.accessToken)
});

// call this method when user clicks the 'Signin with google' button
GoogleSignin.signIn();

// remove user credentials. next time user starts the application, a signin promp will be displayed
GoogleSignin.signOut();
```

## Android

### Google project configuration

- Open https://developers.google.com/identity/sign-in/android/start-integrating

- Scroll down and click ```Get a configuration file``` button

- Place the generated configuration file (```google-services.json```) into ```<YOUR_PROJECT_ROOT>/android/app```

### Setup

* In `android/setting.gradle`

```gradle
...
include ':react-native-google-signin', ':app'
project(':react-native-google-signin').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-google-signin/android')
```

* In `android/build.gradle`

```gradle
...
dependencies {
        classpath 'com.android.tools.build:gradle:1.3.1'
        classpath 'com.google.gms:google-services:1.5.0' // <--- add this
    }
```

* In `android/app/build.gradle`

```gradle
apply plugin: "com.android.application"
apply plugin: 'com.google.gms.google-services' // <--- add this at the TOP
...
dependencies {
    compile fileTree(dir: "libs", include: ["*.jar"])
    compile "com.android.support:appcompat-v7:23.0.1"
    compile "com.facebook.react:react-native:0.14.+"
    compile project(":react-native-google-signin") // <--- add this
}
```

* Register Module (in MainActivity.java)

```java
import co.apptailor.googlesignin.RNGoogleSigninModule; // <--- import
import co.apptailor.googlesignin.RNGoogleSigninPackage;  // <--- import

public class MainActivity extends Activity implements DefaultHardwareBackBtnHandler {
  ......

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    mReactRootView = new ReactRootView(this);

    mReactInstanceManager = ReactInstanceManager.builder()
      .setApplication(getApplication())
      .setBundleAssetName("index.android.bundle")
      .setJSMainModuleName("index.android")
      .addPackage(new MainReactPackage())
      .addPackage(new RNGoogleSigninPackage(this)) // <------ add this line to yout MainActivity class
      .setUseDeveloperSupport(BuildConfig.DEBUG)
      .setInitialLifecycleState(LifecycleState.RESUMED)
      .build();

    mReactRootView.startReactApplication(mReactInstanceManager, "AndroidRNSample", null);

    setContentView(mReactRootView);
  }

  // add this method inside your activity class
  @Override
  protected void onActivityResult(int requestCode, int resultCode, android.content.Intent data) {
      if (requestCode == RNGoogleSigninModule.RC_SIGN_IN) {
          RNGoogleSigninModule.onActivityResult(data);
      }
      super.onActivityResult(requestCode, resultCode, data);
  }

  ......

}
```

### Usage
```js
var GoogleSignin = require('react-native-google-signin');
var { DeviceEventEmitter } = require('react-native');

GoogleSignin.init(); // somewhere in a componentDidMount.

// Callback on sign-in errors
DeviceEventEmitter.addListener('googleSignInError', (error) => {
  console.log('ERROR signin in', error);
});

// callback on sign-in success
DeviceEventEmitter.addListener('googleSignIn', (user) => {
  console.log(user);
  this.setState({user: user});
});

// To sign in
GoogleSignin.signIn();

// To sign out
GoogleSignin.signOut();

```
