#import "RNGoogleSignin.h"

@interface RNGoogleSignin ()

@property (nonatomic, strong) RCTPromiseResolveBlock promiseResolve;
@property (nonatomic, strong) RCTPromiseRejectBlock promiseReject;

@end

@implementation RNGoogleSignin

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(configure:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  [GIDSignIn sharedInstance].delegate = self;
  [GIDSignIn sharedInstance].uiDelegate = self;
  [GIDSignIn sharedInstance].scopes = options[@"scopes"];
  [GIDSignIn sharedInstance].shouldFetchBasicProfile = YES; // email, profile
  [GIDSignIn sharedInstance].clientID = options[@"iosClientId"];
  
  if (options[@"hostedDomain"]) {
    [GIDSignIn sharedInstance].hostedDomain = options[@"hostedDomain"];
  }
  if (options[@"webClientId"]) {
    [GIDSignIn sharedInstance].serverClientID = options[@"webClientId"];
  }

  resolve(@YES);
}

RCT_REMAP_METHOD(currentUserAsync,
                 currentUserAsyncResolve:(RCTPromiseResolveBlock)resolve
                currentUserAsyncReject:(RCTPromiseRejectBlock)reject)
{
  self.promiseResolve = resolve;
  self.promiseReject = reject;
  [[GIDSignIn sharedInstance] signInSilently];
}

RCT_REMAP_METHOD(signIn,
                 signInResolve:(RCTPromiseResolveBlock)resolve
                 signInReject:(RCTPromiseRejectBlock)reject)
{
  self.promiseResolve = resolve;
  self.promiseReject = reject;
  [[GIDSignIn sharedInstance] signIn];
}

RCT_REMAP_METHOD(signOut,
                 signOutResolve:(RCTPromiseResolveBlock)resolve
                 signOutReject:(RCTPromiseRejectBlock)reject)
{
  [[GIDSignIn sharedInstance] signOut];
  resolve(@YES);
}

RCT_REMAP_METHOD(revokeAccess,
                 revokeAccessResolve:(RCTPromiseResolveBlock)resolve
                 revokeAccessReject:(RCTPromiseRejectBlock)reject)
{
  self.promiseResolve = resolve;
  self.promiseReject = reject;
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

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

- (void)reject:(NSString *)message withError:(NSError *)error
{
    NSString* errorCode = [NSString stringWithFormat:@"%ld", error.code];
    NSString* errorMessage = [NSString stringWithFormat:@"RNGoogleSignInError: %@, %@", message, error.description];
    
    self.promiseReject(errorCode, errorMessage, error);
}

- (void)signIn:(GIDSignIn *)signIn didSignInForUser:(GIDGoogleUser *)user withError:(NSError *)error {
    if (error != Nil) {
      switch (error.code) {
        case kGIDSignInErrorCodeUnknown:
          [self reject:@"Unknown error when signing in." withError:error];
          break;
        case kGIDSignInErrorCodeKeychain:
          [self reject:@"A problem reading or writing to the application keychain." withError:error];
          break;
        case kGIDSignInErrorCodeNoSignInHandlersInstalled:
          [self reject:@"No appropriate applications are installed on the device which can handle sign-in. Both webview and switching to browser have both been disabled." withError:error];
          break;
        case kGIDSignInErrorCodeHasNoAuthInKeychain:
          [self reject:@"The user has never signed in before with the given scopes, or they have since signed out." withError:error];
          break;
        case kGIDSignInErrorCodeCanceled:
          [self reject:@"The user canceled the sign in request." withError:error];
          break;
        default:
          // RCTLogError(@"%s: %@ (%d)", __func__, error, error.code);
          [self reject:@"Unknown error and error code when signing in." withError:error];
          break;
        }
      return;
    }

    NSURL *imageURL;

    if (user.profile.hasImage)
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

    self.promiseResolve(body);
}

- (void)signIn:(GIDSignIn *)signIn didDisconnectWithUser:(GIDGoogleUser *)user withError:(NSError *)error {
  if (error != Nil) {
      return [self reject:@"Error when revoking access." withError:error];
  }

  return self.promiseResolve(@YES);
}

- (void)signIn:(GIDSignIn *)signIn presentViewController:(UIViewController *)viewController {
    [RCTPresentedViewController() presentViewController:viewController animated:true completion:nil];
}

- (void)signIn:(GIDSignIn *)signIn dismissViewController:(UIViewController *)viewController {
    [viewController dismissViewControllerAnimated:true completion:nil];
}

+ (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {

    return [[GIDSignIn sharedInstance] handleURL:url
                               sourceApplication:sourceApplication
                                      annotation:annotation];
}

@end
