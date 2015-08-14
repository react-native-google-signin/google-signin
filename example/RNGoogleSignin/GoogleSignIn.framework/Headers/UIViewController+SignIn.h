/*
 * UIViewController+SignIn.h
 * Google Sign-In iOS SDK
 *
 * Copyright 2015 Google Inc.
 *
 * Use of this SDK is subject to the Google APIs Terms of Service:
 * https://developers.google.com/terms/
 */

#import <UIKit/UIKit.h>

// This |UIViewController| category adds the ability to launch a potentially interactive sign in
// flow from a |UIViewController|. This sign-in method may present the user with a prompt to
// download the Google iOS app if sign-in with the browser and with web view have both been
// disabled. If the user chooses to install the Google app via the displayed dialog, and re-enters
// your application, the prompt will automatically continue the sign-in flow using the Google app.
@interface UIViewController (GIDSignIn)

// Performs a sign-in (possibly with an interstitial prompt to download the Google app for iOS if
// sign-in with the browser and with web view have both been disabled.)
- (void)gid_signInWithGoogle;

@end
