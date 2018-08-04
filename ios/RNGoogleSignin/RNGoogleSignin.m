#import "RNGoogleSignin.h"
#import "PromiseWrapper.h"

@interface RNGoogleSignin ()

@property (nonatomic) PromiseWrapper *promiseWrapper;


@end

@implementation RNGoogleSignin

RCT_EXPORT_MODULE();

static NSString *const ASYNC_OP_IN_PROGRESS = @"ASYNC_OP_IN_PROGRESS";

- (NSDictionary *)constantsToExport
{
  return @{
           @"BUTTON_SIZE_ICON": @(kGIDSignInButtonStyleIconOnly),
           @"BUTTON_SIZE_STANDARD": @(kGIDSignInButtonStyleStandard),
           @"BUTTON_SIZE_WIDE": @(kGIDSignInButtonStyleWide),
           @"BUTTON_COLOR_LIGHT": @(kGIDSignInButtonColorSchemeLight),
           @"BUTTON_COLOR_DARK": @(kGIDSignInButtonColorSchemeDark),
           @"SIGN_IN_CANCELLED": [@(kGIDSignInErrorCodeCanceled) stringValue],
           @"IN_PROGRESS": ASYNC_OP_IN_PROGRESS
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

- (instancetype)init {
  self = [super init];
  if (self != nil) {
    self.promiseWrapper = [[PromiseWrapper alloc] init];
  }
  return self;
}

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

RCT_REMAP_METHOD(signInSilently,
                 currentUserAsyncResolve:(RCTPromiseResolveBlock)resolve
                currentUserAsyncReject:(RCTPromiseRejectBlock)reject)
{
  BOOL wasPromiseSet = [self.promiseWrapper setPromiseWithInProgressCheck:resolve rejecter:reject];
  if (!wasPromiseSet) {
    [self rejectWithAsyncOperationStillInProgress: reject];
    return;
  }
  [[GIDSignIn sharedInstance] signInSilently];
}

RCT_REMAP_METHOD(signIn,
                 signInResolve:(RCTPromiseResolveBlock)resolve
                 signInReject:(RCTPromiseRejectBlock)reject)
{
  BOOL wasPromiseSet = [self.promiseWrapper setPromiseWithInProgressCheck:resolve rejecter:reject];
  if (!wasPromiseSet) {
    [self rejectWithAsyncOperationStillInProgress: reject];
    return;
  }
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
  BOOL wasPromiseSet = [self.promiseWrapper setPromiseWithInProgressCheck:resolve rejecter:reject];
  if (!wasPromiseSet) {
    [self rejectWithAsyncOperationStillInProgress: reject];
    return;
  }
  [[GIDSignIn sharedInstance] disconnect];
}

- (void)signIn:(GIDSignIn *)signIn didSignInForUser:(GIDGoogleUser *)user withError:(NSError *)error {
    if (error) {
        [self rejectWithSigninError: error];
    } else {
        [self resolveWithUserDetails: user];
    }
}

- (void)resolveWithUserDetails: (GIDGoogleUser *) user {
    NSURL *imageURL = user.profile.hasImage ? [user.profile imageURLWithDimension:120] : nil;
    
    NSDictionary *userInfo = @{
                               @"id": user.userID,
                               @"name": user.profile.name,
                               @"givenName": user.profile.givenName,
                               @"familyName": user.profile.familyName,
                               @"photo": imageURL ? imageURL.absoluteString : [NSNull null],
                               @"email": user.profile.email
                               };
    
    NSDictionary *params = @{
                             @"user": userInfo,
                             @"idToken": user.authentication.idToken,
                             @"serverAuthCode": user.serverAuthCode ? user.serverAuthCode : [NSNull null],
                             @"accessToken": user.authentication.accessToken,
                             @"accessTokenExpirationDate": [NSNumber numberWithDouble:user.authentication.accessTokenExpirationDate.timeIntervalSinceNow]
                             };
    
    [self.promiseWrapper resolve:params];
}

- (void)rejectWithSigninError: (NSError *) error {
    NSString * errorMessage = @"Unknown error and error code when signing in.";
    switch (error.code) {
        case kGIDSignInErrorCodeUnknown:
            errorMessage = @"Unknown error when signing in.";
            break;
        case kGIDSignInErrorCodeKeychain:
            errorMessage = @"A problem reading or writing to the application keychain.";
            break;
        case kGIDSignInErrorCodeNoSignInHandlersInstalled:
            errorMessage = @"No appropriate applications are installed on the device which can handle sign-in. Both webview and switching to browser have both been disabled.";
            break;
        case kGIDSignInErrorCodeHasNoAuthInKeychain:
            errorMessage = @"The user has never signed in before with the given scopes, or they have since signed out.";
            break;
        case kGIDSignInErrorCodeCanceled:
            errorMessage = @"The user canceled the sign in request.";
            break;
    }
    [self.promiseWrapper reject:errorMessage withError:error];
}

- (void)signIn:(GIDSignIn *)signIn didDisconnectWithUser:(GIDGoogleUser *)user withError:(NSError *)error {
    if (error) {
        [self.promiseWrapper reject:@"Error when revoking access." withError:error];
        return;
    }

  [self.promiseWrapper resolve:(@YES)];
}

- (void)signIn:(GIDSignIn *)signIn presentViewController:(UIViewController *)viewController {
    [RCTPresentedViewController() presentViewController:viewController animated:true completion:nil];
}

- (void)signIn:(GIDSignIn *)signIn dismissViewController:(UIViewController *)viewController {
    [viewController dismissViewControllerAnimated:true completion:nil];
}

- (void)rejectWithAsyncOperationStillInProgress: (RCTPromiseRejectBlock)reject {
    reject(ASYNC_OP_IN_PROGRESS, @"cannot set promise - some async operation is still in progress", nil);
}

+ (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {

    return [[GIDSignIn sharedInstance] handleURL:url
                               sourceApplication:sourceApplication
                                      annotation:annotation];
}

@end
