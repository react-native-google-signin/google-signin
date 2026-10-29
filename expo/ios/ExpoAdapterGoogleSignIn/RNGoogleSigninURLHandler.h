#import <Foundation/Foundation.h>

// Defined in RNGoogleSignin (ios/RNGoogleSignin.mm), which links GoogleSignIn.
// Used instead of GIDSignIn when GoogleSignIn comes from SPM; see ExpoAdapterGoogleSignIn.podspec.
FOUNDATION_EXPORT BOOL RNGoogleSigninHandleURL(NSURL *_Nonnull url);
