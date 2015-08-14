#ifndef RN_GoogleSigning_h
#define RN_GoogleSigning_h

#import "RCTBridgeModule.h"

#import <GoogleSignIn/GoogleSignIn.h>

@interface RNGoogleSignin : NSObject<RCTBridgeModule, GIDSignInDelegate, GIDSignInUIDelegate>

+ (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation;

@end


#endif
