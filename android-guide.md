## Android Guide

### Android SDK Requirements
Need install 2 extra packages.

Go in the Android SDK Manager running : ``` android ```
Install this packages: 
- Local Maven repository for Support Libraries
- Google repository

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
        classpath 'com.google.gms:google-services:1.5.0' // <--- add this
    }
```

Note: for up-to-date version of this plugin check https://jcenter.bintray.com/com/android/tools/build/gradle/

* In `android/app/build.gradle`

```gradle
apply plugin: "com.android.application"
apply plugin: 'com.google.gms.google-services' // <--- add this at the TOP
...
dependencies {
    compile fileTree(dir: "libs", include: ["*.jar"])
    compile "com.android.support:appcompat-v7:23.0.1"
    compile "com.facebook.react:react-native:0.18.+"
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
  protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
      new RNGoogleSigninPackage(this), // <------ add this line to yout MainActivity class
      new MainReactPackage());
  }

  // add this method inside your activity class
  @Override
  public void onActivityResult(int requestCode, int resultCode, android.content.Intent data) {
    if (requestCode == RNGoogleSigninModule.RC_SIGN_IN) {
        RNGoogleSigninModule.onActivityResult(data);
    }
    super.onActivityResult(requestCode, resultCode, data);
  }

  ......

}
```
