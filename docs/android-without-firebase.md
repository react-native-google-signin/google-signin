## Android Guide (without Firebase and google services)

Please see the **FAQ** at bottom before opening new issues

### 1. Google project configuration

Create a project in [Google Developer Console](https://console.developers.google.com/apis/credentials) and set up OAuth 2.0 cleint ids with type ANDROID and WEB.
Please see more details here https://support.google.com/cloud/answer/6158849#installedapplications&android
It very important that OAuth 2.0 andoid id has finger print set correspondingly to the fingerprint of cerificate which is used to signed apk and package name should be the same as apk package name.

Update android/app/src/main/res/values/strings.xml with 

```
<resources>
   ...
   <string name="server_client_id"><ANDROID_OAUTH_2.0_CLIENT_ID></string>
   ...
</resources>
```

### 2. Installation

Please note that this package requires android gradle plugin of version >= 3, which in turn requires at least gradle 4.1. Android studio should be able to do the upgrade for you.

1 . link the native module

in RN >= 0.60 you should not need to do anything thanks to [autolinking](https://github.com/react-native-community/cli/blob/master/docs/autolinking.md)

in RN < 0.60 run `react-native link react-native-google-signin`

2 . Update `android/app/build.gradle` with

```gradle
...
dependencies {
    implementation fileTree(dir: "libs", include: ["*.jar"])
    implementation "com.android.support:appcompat-v7:23.0.1"
    implementation "com.facebook.react:react-native:+"
    implementation 'com.google.android.gms:play-services-auth:18.1.0'

}

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

### Get tokens
By default if webClientId is not set in GoogleSignin.configure Google SignIn returns ok for login but does not provide idToken.
If you need idToken please set webClientId:<WEB_OAUTH_2.0_CLIENT_ID> in GoogleSignin.configure parameters.

## FAQ / Troubleshooting

#### I'm getting an error and I'm not able to fix it

Configuring google sign in can sometimes be tricky. If you're hitting a wall, you can get in touch with a maintainer ([@vonovak](https://github.com/vonovak)) via his [personal site](https://react-native-training.eu/). Please note that this is a paid service.

#### I'm getting "A non-recoverable sign in failure occurred"

See [this comment](https://github.com/react-native-community/google-signin/issues/659#issuecomment-513555464). Or [this SO question](https://stackoverflow.com/questions/53816227/google-signin-sdk-is-failing-by-throwing-error-a-non-recoverable-sign-in-failur).

#### Getting `DEVELOPER_ERROR` or `code: 10` error message on Android when trying to login.

This is configuration mismatch. 
Make sure that your SHA certificate fingerprint and package name you entered in [Google Developer Console](https://console.developers.google.com/apis/credentials)  -> OAuth 2.0 Client IDs are correspond to the package name of app and its sign cerificate.
Make sure server_client_id set in android/app/src/main/res/values/strings.xml refers to the exactly Android type OAuth 2.0 Client ID for exactly this package name and signed exactly by the cert with fingerprint set in Android type OAuth 2.0 Client ID.

To add the SHA1:

1. Sign in to Firebase and open your project.
2. Click the Settings icon and select Project settings.
3. In the Your apps card, select the package name of the app you need a to add SHA1 to.
4. Click "Add fingerprint".

If you're passing `webClientId` in configuration object to `GoogleSignin.configure()` make sure it's correct and that it is of type web (NOT Android!). You can get your `webClientId` from [Google Developer Console](https://console.developers.google.com/apis/credentials). They're listed under "OAuth 2.0 client IDs".

If you're running your app in debug mode and not using `webClientId` or you're sure it's correct the problem might be signature (SHA-1 or SHA-256) mismatch. 
Usually debug is signed by default android cerificate located at ~/.android/debug.keystore with password "android".
So if you would like debug mode workin you have to create two set of ids(release for relase apk and debug for debug apk signed by default ~/.android/debug.keystore) or sign debug apk with you release certificate. For this you need to add the following to `android/app/build.gradle`:

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

#### I did everything and I still have problems to compile my project.

Read this [medium article](https://medium.com/@suchydan/how-to-solve-google-play-services-version-collision-in-gradle-dependencies-ef086ae5c75f). Basically, if you have other play services libraries installed, you have to exclude some dependencies.
