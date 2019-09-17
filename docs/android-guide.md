## Android Guide

Please see the **FAQ** at bottom before opening new issues

### 1. Android SDK Requirements

You need the following packages

[![link config](../img/android-req.png)](#config)

### 2. Google project configuration

- Follow [this](./get-config-file.md) guide to get the configuration file.

- Place the generated configuration file (`google-services.json`) into `<YOUR_PROJECT_ROOT>/android/app`

### 3. Installation

Please note that this package requires android gradle plugin of version >= 3, which in turn requires at least gradle 4.1. Android studio should be able to do the upgrade for you.

1 . link the native module

in RN >= 0.60 you should not need to do anything thanks to [autolinking](https://github.com/react-native-community/cli/blob/master/docs/autolinking.md)

in RN < 0.60 run `react-native link react-native-google-signin`

2 . Update `android/build.gradle` with

```gradle
buildscript {
    ext {
        buildToolsVersion = "27.0.3"
        minSdkVersion = 16
        compileSdkVersion = 27
        targetSdkVersion = 26
        supportLibVersion = "27.1.1"
        googlePlayServicesAuthVersion = "16.0.1" // <--- use this version or newer
    }
...
    dependencies {
        classpath 'com.android.tools.build:gradle:3.1.2' // <--- use this version or newer
        classpath 'com.google.gms:google-services:4.1.0' // <--- use this version or newer
    }
...
allprojects {
    repositories {
        mavenLocal()
        google() // <--- make sure this is included
        jcenter()
        maven {
            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
            url "$rootDir/../node_modules/react-native/android"
        }
    }
}
```

3 . Update `android/app/build.gradle` with

```gradle
...
dependencies {
    implementation fileTree(dir: "libs", include: ["*.jar"])
    implementation "com.android.support:appcompat-v7:23.0.1"
    implementation "com.facebook.react:react-native:+"
    implementation(project(":react-native-google-signin"))
}

apply plugin: 'com.google.gms.google-services' // <--- this should be the last line
```

4. Check that `react-native link` linked the native module, **only if you used** `react-native link`!

- in `android/settings.gradle` you should have

```gradle
...
include ':react-native-google-signin', ':app'
project(':react-native-google-signin').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-google-signin/android')
```

- in `MainApplication.java` you should have

```java
import co.apptailor.googlesignin.RNGoogleSigninPackage;  // <--- import

public class MainApplication extends Application implements ReactApplication {

  ......

  @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
          new RNGoogleSigninPackage() // <-- this needs to be in the list
      );
    }
  ......

}
```

#### Choose Dependency versions (optional)

The library depends on `com.android.support:appcompat-v7` and `com.google.android.gms:play-services-auth`, as seen in [build.gradle](https://github.com/react-native-community/react-native-google-signin/blob/master/android/build.gradle). If needed, you may control their versions by the `ext` closure, as seen in [build.gradle](https://github.com/react-native-community/react-native-google-signin/blob/master/example/android/build.gradle) of the example app.

### 4. Running on simulator

Make sure you have a simulator with Google Play Services installed.

Also to help with performances, install `HAXM` from the Android SDK Manager.

### Running on device

Nothing special here, as long as you run your app on a Google Android device (again with Google Play Services installed !)

## FAQ / Troubleshooting

#### I'm getting "A non-recoverable sign in failure occurred"

See https://github.com/react-native-community/react-native-google-signin/issues/659#issuecomment-513555464

#### Getting `DEVELOPER_ERROR` error message on Android when trying to login.

This is configuration mismatch. Make sure that your `android/app/google-services.json` is correct.

You may need to add your SHA certificate fingerprint to your Firebase config. Find your SHA1 fingerprint by following the instructions on this post: https://stackoverflow.com/questions/15727912/sha-1-fingerprint-of-keystore-certificate/33479550#33479550. Then, go to https://console.firebase.google.com/, select your app, and add the SHA1 value under Project Settings (gear icon in the upper left) -> Your Apps -> SHA certificate fingerprints

If you're passing `webClientId` in configuration object to `GoogleSignin.configure()` make sure it's correct. You can get your `webClientId` from [Google Developer Console](https://console.developers.google.com/apis/credentials). They're listed under "OAuth 2.0 client IDs".

If you're running your app in debug mode and not using `webClientId` or you're sure it's correct the problem might be signature (SHA-1 or SHA-256) mismatch. You need to add the following to `android/app/build.gradle`:

```diff
signingConfigs {
+    debug {
+        storeFile file(MYAPP_RELEASE_STORE_FILE)
+        storePassword MYAPP_RELEASE_STORE_PASSWORD
+        keyAlias MYAPP_RELEASE_KEY_ALIAS
+        keyPassword MYAPP_RELEASE_KEY_PASSWORD
+    }
    release {
        ...
    }
 }
```

#### Google Login does NOT work when downloading my app from the play store.

Check if "Google Play App Signing" is enabled for your app.
If it is enabled, you will need to add the "App signing certificate" `SHA-1` to your firebase console.

You can find it at: App -> Release Management (in left sidebar) -> App signing. In there, copy `SHA-1 certificate fingerprint` into firebase console for the Android app.

#### My project includes other react-native plugins which have different google play services versions. What to do?

See ["Choose Dependency versions"](#choose-dependency-versions-optional) above.

#### My project includes an older version of react-native-google-signin. How to upgrade?

first install the latest version
`npm install --save react-native-google-signin`

You need to follow this guide again to make sure everything fit together (gradle version, google-services gradle version, etc...). Check out the example project for reference.

clean everything to be sure

```
cd android
./gradlew clean
```

now `react-native run-android`

#### After upgrading and thoroughly following the guide the build fail with `Missing api_key/current_key object`. What to do?

open `android/app/google-services.json` and replace `"api_key":[]` with `"api_key":[{ "current_key": "" }]`

#### After the sign-in completes I get the following error `error code 12501`. What to do?

This is a permission error. Make sure the `certificate_hash` in `android/app/google-services.json` matches your certificate.

To get your sha1-hash

```
keytool -exportcert -keystore ~/.android/debug.keystore -list -v
```

Also make sure the application id matches the one you enter on the cloud console.

#### I did everything and I still have problems to compile my project.

Read this [medium article](https://medium.com/@suchydan/how-to-solve-google-play-services-version-collision-in-gradle-dependencies-ef086ae5c75f). Basically, if you have other play services libraries installed, you have to exclude some dependencies.
