#import "RNGoogleSignIn.h"
#import "RCTEventDispatcher.h"

@implementation RNGoogleSignin

RCT_EXPORT_MODULE();

@synthesize bridge = _bridge;

RCT_EXPORT_METHOD(configure:(NSString *)clientID  withScopes:(NSArray *)scopes)
{
  [self _configure:clientID serverClientID:nil withScopes:scopes];
}

RCT_EXPORT_METHOD(configureWithServerClientId:(NSString *)clientID  serverClientID:(NSString *)serverClientID withScopes:(NSArray *)scopes)
{
  [self _configure:clientID serverClientID:serverClientID withScopes:scopes];
}

- (void) _configure:(NSString *)clientID  serverClientID:(NSString *)serverClientID withScopes:(NSArray *)scopes {
  [GIDSignIn sharedInstance].delegate = self;
  [GIDSignIn sharedInstance].uiDelegate = self;
  
  [GIDSignIn sharedInstance].clientID = clientID;
  [GIDSignIn sharedInstance].serverClientID = serverClientID;
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
        NSDictionary *body = @{
                               @"message": error.description,
                               @"code": [NSNumber numberWithInteger: error.code]
                               };
        return [self.bridge.eventDispatcher sendAppEventWithName:@"googleSignInError"
                                                            body:body];
    }

    NSDictionary *body = @{
                           @"name": user.profile.name,
                           @"email": user.profile.email,
                           @"idToken": user.authentication.idToken,
                           @"serverAuthToken": user.serverAuthCode ? user.serverAuthCode : [NSNull null],
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
