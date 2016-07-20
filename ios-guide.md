## iOS Guide

Includes Google Sign-In SDK v4.0.0

### 1. Installation

#### With RNPM

- make sure you have rnpm version >= 1.9.0
- link the lib with `rnpm link react-native-google-signin`
- Drag and drop the `ios/GoogleSdk` folder to your xcode project. (Make sure `Copy items if needed` **IS** ticked)


#### Manual installation

- add `ios/RNGoogleSignin.xcodeproj` to your xcode project
- In your project build phase -> `Link binary with libraries` step, add `libRNGoogleSignin.a`, `AddressBook.framework`, `SafariServices.framework`, `SystemConfiguration.framework` and `libz.tbd`
- Drag and drop the `ios/GoogleSdk` folder to your xcode project. (Make sure `Copy items if needed` **IS** ticked) 


### 2. Google project configuration

- Open [https://developers.google.com/identity/sign-in/ios/sdk/](https://developers.google.com/identity/sign-in/ios/sdk/)

- Scroll down and click ```Get a configuration file``` button

- Download the ```GoogleService-Info.plist``` file at the end of the process

### 3. XCode configuration

- Make sure all dependencies are correctly linked to your project:

[![link config](https://github.com/apptailor/react-native-google-signin/raw/master/img/link-config.png)](#config)


- Configure URL types in the ```Info``` panel
  - add a URL with scheme set to your ```REVERSED_CLIENT_ID``` (found inside the plist)
  - add a URL with scheme set to your ```bundle id```

Add the end of this step, your Xcode config should look like this:

[![xcode config](https://github.com/apptailor/react-native-google-signin/raw/master/img/url-config.png)](#config)

### Project setup

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
