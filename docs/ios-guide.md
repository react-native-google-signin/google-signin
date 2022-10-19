## iOS Guide

### 1. Installation

#### Link the native module

- run `pod install` in `ios/` directory to install the module

#### Install Google Sign In SDK

Again, we offer two ways to do this: with and without Cocoapods. Note that we require Google Sign In SDK version >= 6.0.0!

##### With Cocoapods

The [podspec](https://github.com/react-native-google-signin/google-signin/blob/master/RNGoogleSignin.podspec) will install a compatible version of the [GoogleSignIn pod](https://github.com/react-native-google-signin/google-signin/blob/master/RNGoogleSignin.podspec). All you need to do is run `pod install` and then recompile the iOS project.

First time using cocoapods? [check this out](./how-cocoapods.md)

At the end, the dependencis should be linked like in this picture (this is _with_ pods, for RN >= 0.60).

[![link config](../img/pods-rn60.png)](../img/buildPhasesWithPods.png?raw=true)

#### Without Cocoapods

> Please note that since RN 0.60 pods are standard part of the development process and we do not recommend avoiding pods. The following paragraph and screenshot may not be up-to-date.

1. download the GoogleSignIn SDK from [here](https://developers.google.com/identity/sign-in/ios/sdk/) and unzip it. Drag and drop the unzipped `.framework` files into the `Frameworks` group in Xcode and copy `GoogleSignIn.bundle` to your project. During copying, check `copy items if needed`.
2. make sure `GoogleSignIn.bundle` is added in your Xcode project's Copy Bundle Resources build phase.

**NOTE** according to [google sign in docs](https://developers.google.com/identity/sign-in/ios/sdk/) you may also need to do this: In <your target> -> Build Phases -> `Link binary with libraries` step, add `libRNGoogleSignin.a`, `AddressBook.framework`, `SafariServices.framework`, `SystemConfiguration.framework` and `libz.tbd`. We have found it not to be necessary for a successful build, but we recommend to follow Google's installation instructions!

At the end, the dependencis should be linked like in this picture (this is _without_ pods).

[![link config](../img/buildPhasesWithoutPods.png)](../img/buildPhasesWithoutPods.png?raw=true)

### 2. Google project configuration

- Follow [this](./get-config-file.md) guide to get the configuration file.

- Download the `GoogleService-Info.plist` file at the end of the process

### 3. Xcode configuration

- Configure URL types in the `Info` panel (see screenshot)
  - add a URL with scheme set to your `REVERSED_CLIENT_ID` (found inside `GoogleService-Info.plist`)
- If you need to support Mac Catalyst, you will need to enable the Keychain Sharing capability on each build target. No keychain groups need to be added.

[![link config](../img/urlTypes.png)](../img/urlTypes.png?raw=true)

### Optional: modify your app to respond to the URL scheme

This is only required if you have multiple listeners for `openURL` - for instance if you have both Google and Facebook OAuth (as seen in the code snippet below).

Because only one `openURL` method can be defined, if you have multiple listeners for `openURL`, you must combine them into a single function in your `AppDelegate.m` like so:

- Open `AppDelegate.m`
- Add an import: `#import <RNGoogleSignin/RNGoogleSignin.h>` (if this one will not work try `#import "RNGoogleSignin.h"`). If this file cannot be found, you need to modify your header search paths so Xcode can find headers of `react-native-google-signin`. For example, when using the non-cocoapods installation, make sure that `$(SRCROOT)/../node_modules/@react-native-google-signin/google-signin/ios` is included in your target's header search paths.
- Add a method to respond to the URL scheme. This is just an example of a method that you can add at the bottom of your file if you're using both `FBSDKApplicationDelegate` and `RNGoogleSignin` :

```objc
// AppDelegate.m
- (BOOL)application:(UIApplication *)application openURL:(nonnull NSURL *)url options:(nonnull NSDictionary<NSString *,id> *)options {
  return [[FBSDKApplicationDelegate sharedInstance] application:application openURL:url options:options] || [RNGoogleSignin application:application openURL:url options:options];
}
```

## FAQ / Troubleshooting

#### I'm getting an error and I'm not able to fix it

Configuring google sign in can sometimes be tricky. If you're hitting a wall, you can get in touch with a maintainer ([@vonovak](https://github.com/vonovak)) via his [personal site](https://react-native-training.eu/). Please note that this is a paid service.

#### On iOS the app crashes when tapping Sign In button

You're most likely missing `Url Schemes` configuration. How to do it: ![configure URL schemes](/img/add-url-scheme-ios.png)
