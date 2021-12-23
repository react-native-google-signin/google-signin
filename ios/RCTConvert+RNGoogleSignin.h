#import <React/RCTConvert.h>
#import <GoogleSignIn/GoogleSignIn.h>

@interface RCTConvert(RNGoogleSignin)

+ (GIDSignInButtonStyle)GIDSignInButtonStyle:(id)json;
+ (GIDSignInButtonColorScheme)GIDSignInButtonColorScheme:(id)json;

@end
