#import <React/RCTBridgeModule.h>
#import <React/RCTComponent.h>

@interface RNGoogleSignin : NSObject<RCTBridgeModule>

+ (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options;

@end
