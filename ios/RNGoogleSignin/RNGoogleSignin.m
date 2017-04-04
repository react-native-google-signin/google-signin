#import "RNGoogleSignIn.h"
#import "RCTEventDispatcher.h"


@implementation RNGoogleSignin

RCT_EXPORT_MODULE();

@synthesize bridge = _bridge;


RCT_EXPORT_METHOD(configure:(NSArray*)scopes iosClientId:(NSString*)iosClientId webClientId:(NSString*)webClientId hostedDomain:(NSString*)hostedDomain)
{
  [GIDSignIn sharedInstance].hostedDomain = hostedDomain;
  [GIDSignIn sharedInstance].delegate = self;
  [GIDSignIn sharedInstance].uiDelegate = self;

  [GIDSignIn sharedInstance].scopes = scopes;
  [GIDSignIn sharedInstance].clientID = iosClientId;

  if ([webClientId length] != 0) {
    [GIDSignIn sharedInstance].serverClientID = webClientId;
  }
}

RCT_EXPORT_METHOD(currentUserAsync)
{
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

RCT_EXPORT_METHOD(revokeAccess)
{
  [[GIDSignIn sharedInstance] disconnect];
}

- (NSDictionary *)constantsToExport
{
  return @{
    @"BUTTON_SIZE_ICON" : @(kGIDSignInButtonStyleIconOnly),
    @"BUTTON_SIZE_STANDARD" : @(kGIDSignInButtonStyleStandard),
    @"BUTTON_SIZE_WIDE" : @(kGIDSignInButtonStyleWide),
    @"BUTTON_COLOR_LIGHT" : @(kGIDSignInButtonColorSchemeLight),
    @"BUTTON_COLOR_DARK" : @(kGIDSignInButtonColorSchemeDark)
  };
}

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

- (void)signIn:(GIDSignIn *)signIn didSignInForUser:(GIDGoogleUser *)user withError:(NSError *)error {

    if (error != Nil) {
        return [self.bridge.eventDispatcher sendAppEventWithName:@"RNGoogleSignInError"
                                                            body:@{
                                                                   @"message": error.description,
                                                                   @"code": [NSNumber numberWithInteger: error.code]
                                                                  }];
    }

    NSURL *imageURL;

    if ([GIDSignIn sharedInstance].currentUser.profile.hasImage)
    {
      imageURL = [user.profile imageURLWithDimension:120];
    }

    NSDictionary *body = @{
                           @"name": user.profile.name,
                           @"givenName": user.profile.givenName,
                           @"familyName": user.profile.familyName,
                           @"id": user.userID,
                           @"photo": imageURL ? imageURL.absoluteString : [NSNull null],
                           @"email": user.profile.email,
                           @"idToken": user.authentication.idToken,
                           @"accessToken": user.authentication.accessToken,
                           @"serverAuthCode": user.serverAuthCode ? user.serverAuthCode : [NSNull null],
                           @"accessTokenExpirationDate": [NSNumber numberWithDouble:user.authentication.accessTokenExpirationDate.timeIntervalSinceNow]
                           };

    return [self.bridge.eventDispatcher sendAppEventWithName:@"RNGoogleSignInSuccess" body:body];
}

- (void) signInWillDispatch:(GIDSignIn *)signIn error:(NSError *)error {
    return [self.bridge.eventDispatcher sendAppEventWithName:@"RNGoogleSignInWillDispatch"
                                                        body:@{}];
}

- (void)signIn:(GIDSignIn *)signIn didDisconnectWithUser:(GIDGoogleUser *)user withError:(NSError *)error {
  if (error != Nil) {
    return [self.bridge.eventDispatcher sendAppEventWithName:@"RNGoogleRevokeError"
                                                        body:@{
                                                               @"message": error.description,
                                                               @"code": [NSNumber numberWithInteger: error.code]
                                                               }];
  }

  return [self.bridge.eventDispatcher sendAppEventWithName:@"RNGoogleRevokeSuccess" body:@{}];
}

- (void) signIn:(GIDSignIn *)signIn presentViewController:(UIViewController *)viewController {
    UIViewController *parent = [self topMostViewController];
    [parent presentViewController:viewController animated:true completion:nil];
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

#pragma mark - Internal Methods

- (UIViewController *)topMostViewController {
    UIViewController *topController = [UIApplication sharedApplication].keyWindow.rootViewController;
    while (topController.presentedViewController) {
        topController = topController.presentedViewController;
    }
    return topController;
}

@end
