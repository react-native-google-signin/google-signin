## Android Guide

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

GoogleSignin.configure(
  clientID, // your client ID
  [], // additional scopes (email is the default)
); // somewhere in a componentDidMount.

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
