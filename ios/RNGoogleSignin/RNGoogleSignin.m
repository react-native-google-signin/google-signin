#import "RNGoogleSignin.h"
#import <React/RCTEventDispatcher.h>
#import <React/RCTLog.h>

@interface RNGoogleSignin ()

@property (nonatomic, strong) RCTPromiseResolveBlock currentUserAsyncResolve;
@property (nonatomic, strong) RCTPromiseRejectBlock currentUserAsyncReject;
@property (nonatomic, strong) RCTPromiseResolveBlock signInResolve;
@property (nonatomic, strong) RCTPromiseRejectBlock signInReject;
@property (nonatomic, strong) RCTPromiseResolveBlock revokeAccessResolve;
@property (nonatomic, strong) RCTPromiseRejectBlock revokeAccessReject;

@property (nonatomic, assign) BOOL isSigningInSilently;

@end

@implementation RNGoogleSignin

RCT_EXPORT_MODULE();

@synthesize bridge = _bridge;

RCT_EXPORT_METHOD(configure:(NSArray*)scopes
                  iosClientId:(NSString*)iosClientId
                  webClientId:(NSString*)webClientId
                  hostedDomain:(NSString*)hostedDomain
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  [GIDSignIn sharedInstance].delegate = self;
  [GIDSignIn sharedInstance].uiDelegate = self;

  [GIDSignIn sharedInstance].scopes = scopes;
  [GIDSignIn sharedInstance].clientID = iosClientId;
  
  if (hostedDomain != nil) {
    [GIDSignIn sharedInstance].hostedDomain = hostedDomain;
  }
  if ([webClientId length] != 0) {
    [GIDSignIn sharedInstance].serverClientID = webClientId;
  }

  resolve(nil);
}

RCT_REMAP_METHOD(currentUserAsync,
                 currentUserAsyncResolve:(RCTPromiseResolveBlock)resolve
                currentUserAsyncReject:(RCTPromiseRejectBlock)reject)
{
  self.currentUserAsyncResolve = resolve;
  self.currentUserAsyncReject = reject;
  self.isSigningInSilently = YES;
  [[GIDSignIn sharedInstance] signInSilently];
}

RCT_REMAP_METHOD(signIn,
                 signInResolve:(RCTPromiseResolveBlock)resolve
                 signInReject:(RCTPromiseRejectBlock)reject)
{
  self.signInResolve = resolve;
  self.signInReject = reject;
  self.isSigningInSilently = NO;
  [[GIDSignIn sharedInstance] signIn];
}

RCT_REMAP_METHOD(signOut,
                 signOutResolve:(RCTPromiseResolveBlock)resolve
                 signOutReject:(RCTPromiseRejectBlock)reject)
{
  [[GIDSignIn sharedInstance] signOut];
  resolve(nil);
}

// TODO: Finish revokeAccess method
RCT_REMAP_METHOD(revokeAccess,
                 revokeAccessResolve:(RCTPromiseResolveBlock)resolve
                 revokeAccessReject:(RCTPromiseRejectBlock)reject)
{
  self.revokeAccessResolve = resolve;
  self.revokeAccessReject = reject;
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

static void RNGoogleSigninRejectWithError(NSString *message, NSError *error, RCTPromiseRejectBlock reject)
{
  NSString* errorCode = [NSString stringWithFormat:@"%ld", error.code];
  NSString* errorMessage = [NSString stringWithFormat:@"RNGoogleSignInError: %@, %@", message, error.description];

  reject(errorCode, errorMessage, error);
}

- (void)signIn:(GIDSignIn *)signIn didSignInForUser:(GIDGoogleUser *)user withError:(NSError *)error {
    RCTPromiseResolveBlock resolve = self.isSigningInSilently == YES ? self.currentUserAsyncResolve : self.signInResolve;
    RCTPromiseRejectBlock reject = self.isSigningInSilently == YES ? self.currentUserAsyncReject : self.signInReject;

    if (error != Nil) {
      if (error.code == -1) {
        RNGoogleSigninRejectWithError(@"Unknown error when signing in.", error, reject);
      } else if (error.code == -2) {
        RNGoogleSigninRejectWithError(@"A problem reading or writing to the application keychain.", error, reject);
      } else if (error.code == -3) {
        RNGoogleSigninRejectWithError(@"No appropriate applications are installed on the device which can handle sign-in. Both webview and switching to browser have both been disabled.", error, reject);
      } else if (error.code == -4) {
        RNGoogleSigninRejectWithError(@"The user has never signed in before with the given scopes, or they have since signed out.", error, reject);
      } else if (error.code == -5) {
        RNGoogleSigninRejectWithError(@"The user has canceled the sign in request.", error, reject);
      } else {
        // RCTLogError(@"%s: %@ (%d)", __func__, error, error.code);
        RNGoogleSigninRejectWithError(@"Unknown error and error code when signing in.", error, reject);
      }

      self.currentUserAsyncResolve = nil;
      self.currentUserAsyncReject = nil;
      self.signInResolve = nil;
      self.signInReject = nil;
      self.revokeAccessResolve = nil;
      self.revokeAccessReject = nil;
      self.isSigningInSilently = NO;
      return;
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

    resolve(body);

    self.currentUserAsyncResolve = nil;
    self.currentUserAsyncReject = nil;
    self.signInResolve = nil;
    self.signInReject = nil;
    self.revokeAccessResolve = nil;
    self.revokeAccessReject = nil;
    self.isSigningInSilently = NO;
    return;
}

- (void)signIn:(GIDSignIn *)signIn didDisconnectWithUser:(GIDGoogleUser *)user withError:(NSError *)error {
  if (error != Nil) {
    return RNGoogleSigninRejectWithError(@"Error when revoking access", error, self.revokeAccessReject);
  }

  return self.revokeAccessResolve(nil);
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
