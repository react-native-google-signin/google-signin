## Android Guide

### Android SDK Requirements

Install the following packages from the Android SDK Manager (run ``` android ``` from console) :
- Local Maven repository for Support Libraries or Android support repository
- Google repository
- Google play services
- Android support library


### Google project configuration

- Open https://developers.google.com/identity/sign-in/android/start-integrating

- Scroll down and click ```Get a configuration file``` button

- Place the generated configuration file (```google-services.json```) into ```<YOUR_PROJECT_ROOT>/android/app```

### Setup

* In `android/settings.gradle`

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
        classpath 'com.google.gms:google-services:2.1.0' // <--- add this
    }
```

Note: for up-to-date version of this plugin check https://jcenter.bintray.com/com/android/tools/build/gradle/

* In `android/app/build.gradle`

```gradle
...
dependencies {
    compile fileTree(dir: "libs", include: ["*.jar"])
    compile "com.android.support:appcompat-v7:23.0.1"
    compile "com.facebook.react:react-native:0.18.+"
    compile project(":react-native-google-signin") // <--- add this
}

apply plugin: 'com.google.gms.google-services' // <--- this should be the last line
```

* Register Module (in MainActivity.java)

```java
import co.apptailor.googlesignin.RNGoogleSigninPackage;  // <--- import

public class MainActivity extends Activity implements DefaultHardwareBackBtnHandler {
  ......

  @Override
    protected List<ReactPackage> getPackages() {
        return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
            new RNGoogleSigninPackage(this)); // <-- add this
    }

  ......

}
```

* In `android/gradle/wrapper/gradle-wrapper.properties`

replace 
```
distributionUrl=https\://services.gradle.org/distributions/gradle-2.4-all.zip
```

with
```
distributionUrl=https\://services.gradle.org/distributions/gradle-2.13-all.zip
```


### Running on simulator

Make sure you have a simulator with Google Play installed.

Also to help with performances, install ```HAXM``` from the Android SDK Manager.

### Running on device

Nothing special here, as long as you run your app on a Google Android device (again with play store installed !)


