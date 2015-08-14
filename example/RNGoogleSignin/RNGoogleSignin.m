#import "RNGoogleSignIn.h"
#import "RCTEventDispatcher.h"

@implementation RNGoogleSignin

RCT_EXPORT_MODULE();

@synthesize bridge = _bridge;

RCT_EXPORT_METHOD(configure:(NSString *)clientID withScopes:(NSArray *)scopes)
{
    [GIDSignIn sharedInstance].delegate = self;
    [GIDSignIn sharedInstance].uiDelegate = self;

    [GIDSignIn sharedInstance].clientID = clientID;
    [GIDSignIn sharedInstance].scopes = scopes;

    [[GIDSignIn sharedInstance] signInSilently];
}

RCT_EXPORT_METHOD(signIn)
{
    [[GIDSignIn sharedInstance] signIn];
}

RCT_EXPORT_METHOD(signOut)
{
    [[GIDSignIn sharedInstance] signOut];
}

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}


- (void)signIn:(GIDSignIn *)signIn didSignInForUser:(GIDGoogleUser *)user withError:(NSError *)error {

    if (error != Nil) {
        return [self.bridge.eventDispatcher sendAppEventWithName:@"googleSignInError"
                                                            body:@{@"error": error.description}];
    }

    NSDictionary *body = @{
                           @"name": user.profile.name,
                           @"email": user.profile.email,
                           @"accessToken": user.authentication.accessToken,
                           @"accessTokenExpirationDate": [NSNumber numberWithDouble:user.authentication.accessTokenExpirationDate.timeIntervalSinceNow]
                           };

    return [self.bridge.eventDispatcher sendAppEventWithName:@"googleSignIn" body:body];
}

- (void) signInWillDispatch:(GIDSignIn *)signIn error:(NSError *)error {
    return [self.bridge.eventDispatcher sendAppEventWithName:@"googleSignInWillDispatch"
                                                        body:@{}];
}

- (void)signIn:(GIDSignIn *)signIn didDisconnectWithUser:(GIDGoogleUser *)user withError:(NSError *)error {
    NSLog(@"Disconnect");
}

- (void) signIn:(GIDSignIn *)signIn presentViewController:(UIViewController *)viewController {
    UIViewController *rootViewController = [[[[UIApplication sharedApplication]delegate] window] rootViewController];
    [rootViewController presentViewController:viewController animated:true completion:nil];
}

- (void) signIn:(GIDSignIn *)signIn dismissViewController:(UIViewController *)viewController {
    [viewController dismissViewControllerAnimated:true completion:nil];
}

+ (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {

    return [[GIDSignIn sharedInstance] handleURL:url
                               sourceApplication:sourceApplication
                                      annotation:annotation];
}


@end
