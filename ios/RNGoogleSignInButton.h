#import <GoogleSignIn/GoogleSignIn.h>
#import <React/RCTComponent.h>

@interface RNGoogleSignInButton : GIDSignInButton

@property (nonatomic, copy) RCTBubblingEventBlock onPress;

@end
