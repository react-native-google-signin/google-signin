## Android Guide

Please see the **FAQ** at bottom before opening new issues 

### 1. Android SDK Requirements

You need the following packages

[![link config](https://github.com/apptailor/react-native-google-signin/raw/master/img/android-req.png)](#config)


### 2. Google project configuration

- Open [https://developers.google.com/identity/sign-in/android/start-integrating](https://developers.google.com/identity/sign-in/android/start-integrating)

- Scroll down and click ```Get a configuration file``` button

- Place the generated configuration file (```google-services.json```) into ```<YOUR_PROJECT_ROOT>/android/app```

### 3. Installation

* run `rnpm link react-native-google-signin`

* In `android/settings.gradle` you should have

```gradle
...
include ':react-native-google-signin', ':app'
project(':react-native-google-signin').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-google-signin/android')
```

        
* Update `android/build.gradle` with

```gradle
...
dependencies {
    classpath 'com.android.tools.build:gradle:2.1.2' // <--- update this
    classpath 'com.google.gms:google-services:3.0.0' // <--- add this
}
```

* Update `android/app/build.gradle` with

```gradle
...
dependencies {
    compile fileTree(dir: "libs", include: ["*.jar"])
    compile "com.android.support:appcompat-v7:23.0.1"
    compile "com.facebook.react:react-native:+"
    compile(project(":react-native-google-signin")){         
        exclude group: "com.google.android.gms" // very important
    }
    compile 'com.google.android.gms:play-services-auth:9.2.1' // should be at least 9.0.0
}

apply plugin: 'com.google.gms.google-services' // <--- this should be the last line
```

* Register Module (in MainApplication.java)

```java
import co.apptailor.googlesignin.RNGoogleSigninPackage;  // <--- import

public class MainApplication extends Application implements ReactApplication {

  ......

  @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
          new RNGoogleSigninPackage() // <-- add this
      );
    }
  ......

}
```

* Update gradle wrapper in `android/gradle/wrapper/gradle-wrapper.properties`

replace 
```
distributionUrl=https\://services.gradle.org/distributions/gradle-2.4-all.zip
```

with
```
distributionUrl=https\://services.gradle.org/distributions/gradle-2.14-all.zip
```


### 4. Running on simulator

Make sure you have a simulator with Google Play installed.

Also to help with performances, install ```HAXM``` from the Android SDK Manager.

### Running on device

Nothing special here, as long as you run your app on a Google Android device (again with play store installed !)


## FAQ

#### A. My project includes other react-native plugins which have different google play services versions. What to do ??

in `android/app/build.gradle` exclude google play services from the plugins you use. Like this:

```
compile(project(":PLUGIN_NAME")){         
        exclude group: "com.google.android.gms"
}
```

Then include play services version you need (at least 9.0.0 for this plugin (!))

#### B. My project includes an older version of react-native-google-signin. How to upgrade ?

first install the latest version
`npm install --save react-native-google-signin` 

You need to follow this guide again to make sure everything fit together (gradle version, google-services gradle version, etc...)

clean everything to be sure

```
cd android
./gradlew clean
```

now `react-native run-android`

#### C. After upgrading and thoroughly following the guide the build fail with `Missing api_key/current_key object`. what to do ?

open `android/app/google-services.json` and replace `"api_key":[]` with `"api_key":[{ "current_key": "" }]`

#### D. After the sign-in completes I get the following error `error code 12501`. what to do ?

This is a permission error. Make sure the `certificate_hash` in `android/app/google-services.json` matches your certificate. 

To get your sha1-hash
```
keytool -exportcert -keystore ~/.android/debug.keystore -list -v
```

Also make sure the application id matches the one you enter on the cloud console.
