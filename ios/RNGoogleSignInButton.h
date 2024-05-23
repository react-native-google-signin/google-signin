#import <GoogleSignIn/GoogleSignIn.h>
#import <React/RCTComponent.h>

#ifdef RCT_NEW_ARCH_ENABLED
  #import <React/RCTViewComponentView.h>
#endif // RCT_NEW_ARCH_ENABLED

@interface RNGoogleSignInButton :
#ifdef RCT_NEW_ARCH_ENABLED
  RCTViewComponentView
#else
  GIDSignInButton
#endif // RCT_NEW_ARCH_ENABLED

@property (nonatomic, copy) RCTBubblingEventBlock onPress;

@end
