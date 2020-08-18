## Android Guide

Please see the **FAQ** at bottom before opening new issues

### 1. Google project configuration

#### 1.a - if you're using Firebase

- Follow [this](./get-config-file.md) guide to get the configuration file.

- Place the generated configuration file (`google-services.json`) into project according to [this guide](https://developers.google.com/android/guides/google-services-plugin#adding_the_json_file).

#### 1.b - if you're NOT using Firebase

- Follow the instructions to [Configure a Google API Project](https://developers.google.com/identity/sign-in/android/start#configure-a-google-api-project) from the official docs.

Please see more details here https://support.google.com/cloud/answer/6158849#installedapplications&android if needed.
It's important that OAuth 2.0 android id has fingerprint set correspondingly to the fingerprint of cerificate which is used to sign the apk. Also, package name should be the same as apk package name.

### 2. Installation

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
    implementation 'androidx.swiperefreshlayout:swiperefreshlayout:1.0.0' // <-- add this; newer versions should work too
}

apply plugin: 'com.google.gms.google-services' // <--- this should be the last line
```

4. Check that `react-native link` linked the native module, **only if you used** `react-native link`!

- in `android/settings.gradle` you should have

```gradle
...
include ':react-native-google-signin', ':app'
project(':react-native-google-signin').projectDir = new File(rootProject.projectDir, '../node_modules/@react-native-community/google-signin/android')
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

in `android/app/build.gradle` you should have

```gradle
...
dependencies {
    ...
    implementation(project(":react-native-google-signin"))
}
...
```

#### Choose Dependency versions (optional)

The library depends on `com.google.android.gms:play-services-auth`, as seen in [build.gradle](https://github.com/react-native-community/google-signin/blob/master/android/build.gradle). If needed, you may control their versions by the `ext` closure, as seen in [build.gradle](https://github.com/react-native-community/google-signin/blob/master/example/android/build.gradle) of the example app.

### 3. Running on simulator

Make sure you have a simulator with Google Play Services installed.

To ensure best performance, you should use x86 emulator and have [HW acceleration](https://developer.android.com/studio/run/emulator-acceleration#accel-vm) working.

### Running on device

Nothing special here, as long as you run your app on an Android device with Google Play Services installed.

## FAQ / Troubleshooting

[See troubleshooting for non-firebase users below](#troubleshooting-for-non-firebase-users)

#### I'm getting an error and I'm not able to fix it

Configuring google sign in can sometimes be tricky. If you're hitting a wall, you can get in touch with a maintainer ([@vonovak](https://github.com/vonovak)) via his [personal site](https://react-native-training.eu/). Please note that this is a paid service.

#### I'm getting "A non-recoverable sign in failure occurred"

See [this comment](https://github.com/react-native-community/google-signin/issues/659#issuecomment-513555464). Or [this SO question](https://stackoverflow.com/questions/53816227/google-signin-sdk-is-failing-by-throwing-error-a-non-recoverable-sign-in-failur).

#### Getting `DEVELOPER_ERROR` or `code: 10` error message on Android when trying to login.

This is configuration mismatch. Make sure that your SHA certificate fingerprint and package name you entered in Firebase are correct.

To add the SHA1:

1. Sign in to Firebase and open your project.
2. Click the Settings icon and select Project settings.
3. In the Your apps card, select the package name of the app you need a to add SHA1 to.
4. Click "Add fingerprint".

![Firebase, add Android keystore's SHA1 to your project](/img/android-fingerprint-firebase.png)

Then re-download the `google-services.json` file, put it into your project (usually, the path is `android/app/google-services.json`) and rebuild your project.

You may need to add your SHA certificate fingerprint to your Firebase config. Find your SHA1 fingerprint by following the instructions at [stackoverflow](https://stackoverflow.com/questions/15727912/sha-1-fingerprint-of-keystore-certificate/33479550#33479550). Then, go to https://console.firebase.google.com/, select your app, and add the SHA1 value under Project Settings (gear icon in the upper left) -> Your Apps -> SHA certificate fingerprints

If you're passing `webClientId` in configuration object to `GoogleSignin.configure()` make sure it's correct and that it is of type web (NOT Android!). You can get your `webClientId` from [Google Developer Console](https://console.developers.google.com/apis/credentials). They're listed under "OAuth 2.0 client IDs".

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

#### Google Login does NOT work when using Internal App Sharing.

If you get a DEVELOPER_ERROR when using Internal App Sharing, it is because Google resigns your application with it's own key. In the Google Play Console go to Development Tools-> Internal App Sharing->App Certificate and there is another SHA-1 fingerprint to add to firebase.

This is separate from the release app signing certificate explained below.

Also see [here](https://stackoverflow.com/questions/57780620/how-to-get-android-internal-app-sharing-key-sha1-to-enable-google-apis).

#### Google Login does NOT work when downloading my app from the play store.

Check if "Google Play App Signing" is enabled for your app.
If it is enabled, you will need to add the "App signing certificate" `SHA-1` to your firebase console.

You can find it at: App -> Release Management (in left sidebar) -> App signing. In there, copy `SHA-1 certificate fingerprint` into firebase console for the Android app.

If you are not using firebase, and your app is enabled for "Google Play App Signing":
Go to "https://console.developers.google.com/" -> click "Credential" in the right panel -> Find "Client ID" for type "Android" under "OAuth 2.0 Client IDs" section -> Edit -> replace "SHA-1 certificate fingerprint" with the one from App -> Release Management (in left sidebar) -> App signing.

#### My project includes other react-native plugins which have different google play services versions. What to do?

See ["Choose Dependency versions"](#choose-dependency-versions-optional) above.

#### My project includes an older version of react-native-google-signin. How to upgrade?

first install the latest version
`yarn add @react-native-community/google-signin@latest`

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

### Troubleshooting for non-firebase users

If you are not using firebase you can ignore all docs related to google services. You don't need a `google-services.json` or any `build.gradle` changes from this docs. Simply follow the instructions from the [the official docs](https://developers.google.com/identity/sign-in/android/start-integrating). However, be aware of following common issues which can lead to a `DEVELOPER ERROR` or an `A non-recoverable sign in failure occurred` error.

#### Try different SHA1 keys

Depending on your config you may need to add multiple SHA1 keys. Go to your android folder and run `./gradlew signingReport`. You should see different SHA1 keys for debug and release. Add them to the [google developer console](https://console.developers.google.com/apis/credentials) under the oauth section. Select Android as client type. You may also need your SHA1 key from the [play console](https://play.google.com). Find it in the app signature area and add it as well.

#### Package name !== application id

When adding a new oauth client, google asks you to add your package name. In some cases your package name is not equal to your application id. Check if your package name in the `AndroidManifest.xml` is the same as your application/bundle id. Find your application id in the play console or `android/app/build.gradle`. The format looks like `com.yourapp.id`.
