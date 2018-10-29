## iOS Guide

Includes Google Sign-In SDK v4.0.0

### 1. Installation

#### Automatic

- link the lib with `react-native link react-native-google-signin`

NOTE `react-native-link` may add the `RNGoogleSignin` podspec to your Podfile. If your Podfile looks roughly like the one described [here](http://facebook.github.io/react-native/docs/integration-with-existing-apps#configuring-cocoapods-dependencies) then this is what you want, but otherwise you may get stuck with build errors. If your Podfile does not refer to the `React` podspec, then you probably do not want to use the `RNGoogleSignin` podspec and we recommend that you rename or delete the `RNGoogleSignin.podspec` file from `node_modules/react-native-google-signin` and only then run `react-native link react-native-google-signin`. This is a one-time operation that you won't need to repeat later. We do hope to improve this behavior later on - PRs are welcome.

- install the Google Signin SDK with [CocoaPods](https://cocoapods.org/) (add `pod 'GoogleSignIn'` in your Podfile and run `pod install`).
  First time using cocoapods ? [check this out](./how-cocoapods.md)

#### Manual

If you did `react-native link react-native-google-signin`, the first two steps may have been done for you.

- add `ios/RNGoogleSignin.xcodeproj` to your xcode project
- In your project build phase -> `Link binary with libraries` step, add `libRNGoogleSignin.a`, `AddressBook.framework`, `SafariServices.framework`, `SystemConfiguration.framework` and `libz.tbd`
- Drag and drop all files from `<root_project_dir>/node_modules/react-native-google-signin/ios/GoogleSdk` directory that end with `.framework` into the Frameworks group of application (Make sure `Copy items if needed` **IS** ticked)
- Go to `Build Settings` and add to `Framework Search Paths` path to GoogleSdk: by default `$(PROJECT_DIR)/../node_modules/react-native-google-signin/ios/GoogleSdk`

### 2. Google project configuration

- Follow [this](./get-config-file.md) guide to get the configuration file.

- Download the `GoogleService-Info.plist` file at the end of the process

### 3. XCode configuration

- Make sure all dependencies are correctly linked to your project:

[![link config](https://github.com/apptailor/react-native-google-signin/raw/master/img/link-config.png)](#config)

- Configure URL types in the `Info` panel
  - add a URL with scheme set to your `REVERSED_CLIENT_ID` (found inside the plist)
  - add a URL with scheme set to your `bundle id`

Add the end of this step, your Xcode config should look like this:

[![xcode config](https://github.com/apptailor/react-native-google-signin/raw/master/img/url-config.png)](#config)

### Modify your app to respond to the URL scheme

- Open `AppDelegate.m`
- Add an import: `#import <RNGoogleSignin/RNGoogleSignin.h>` (if this one will not work try `#import "RNGoogleSignin.h"`)
- Add a method to respond to the URL scheme:

If you're targeting iOS 9 or newer, you'll want to use the [application:openURL:options: method](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623112-application?language=objc) as shown in the following snippet:

```objC
- (BOOL)application:(UIApplication *)application openURL:(nonnull NSURL *)url options:(nonnull NSDictionary<NSString *,id> *)options {
  return [RNGoogleSignin application:application
                             openURL:url
                   sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey]
                          annotation:options[UIApplicationOpenURLOptionsAnnotationKey]];
}
```

You may also use the deprecated [application:openURL:sourceApplication:annotation: method](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623073-application?language=objc):

```objc
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {

  return [RNGoogleSignin application:application
                             openURL:url
                   sourceApplication:sourceApplication
                          annotation:annotation
          ];
}
```

Because only one `openURL` method can be defined, if you have multiple listeners which should be defined (for instance if you have both Google and Facebook OAuth), you must combine them into a single function like so:

```objc
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [[FBSDKApplicationDelegate sharedInstance] application:application openURL:url sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey] annotation:options[UIApplicationOpenURLOptionsAnnotationKey]]
         || [RNGoogleSignin application:application openURL:url sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey] annotation:options[UIApplicationOpenURLOptionsAnnotationKey]];
}
```
