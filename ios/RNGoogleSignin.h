#import <React/RCTComponent.h>

#ifdef RCT_NEW_ARCH_ENABLED
  #import <RNGoogleSignInCGen/RNGoogleSignInCGen.h>
#else
  #import <React/RCTBridgeModule.h>
#endif

@interface RNGoogleSignin : NSObject <
#ifdef RCT_NEW_ARCH_ENABLED
NativeGoogleSigninSpec
#else
RCTBridgeModule
#endif
>

@end
