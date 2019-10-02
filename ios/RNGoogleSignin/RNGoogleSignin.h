#ifndef RN_GoogleSigning_h
#define RN_GoogleSigning_h

#import <React/RCTBridgeModule.h>
#import <React/RCTConvert.h>
#import <React/RCTComponent.h>

#import <GoogleSignIn/GoogleSignIn.h>


@interface RNGoogleSignin : NSObject<RCTBridgeModule, GIDSignInDelegate>

+ (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options;

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
