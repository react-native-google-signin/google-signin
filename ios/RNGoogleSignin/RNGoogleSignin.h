#ifndef RN_GoogleSigning_h
#define RN_GoogleSigning_h

#import <React/RCTBridgeModule.h>
#import <React/RCTConvert.h>

#import <GoogleSignIn/GoogleSignIn.h>

@interface RNGoogleSignin : NSObject<RCTBridgeModule, GIDSignInDelegate, GIDSignInUIDelegate>

+ (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation;

@end

@implementation RCTConvert(GIDSignInButtonStyle)

RCT_ENUM_CONVERTER(GIDSignInButtonStyle, (@{
                                            @"standard": @(kGIDSignInButtonStyleStandard),
                                            @"wide": @(kGIDSignInButtonStyleWide),
                                            @"icon": @(kGIDSignInButtonStyleIconOnly),
                                            }), kGIDSignInButtonStyleStandard, integerValue)


@end

@implementation RCTConvert(GIDSignInButtonColorScheme)

RCT_ENUM_CONVERTER(GIDSignInButtonColorScheme, (@{
                                                  @"dark": @(kGIDSignInButtonColorSchemeDark),
                                                  @"light": @(kGIDSignInButtonColorSchemeLight),
                                                  }), kGIDSignInButtonColorSchemeDark, integerValue)

@end



#endif
