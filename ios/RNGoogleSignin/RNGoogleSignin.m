#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import "RNGoogleSignin.h"
#import "RNGSPromiseWrapper.h"

@interface RNGoogleSignin ()

@property (nonatomic) RNGSPromiseWrapper *promiseWrapper;


@end

@implementation RNGoogleSignin

RCT_EXPORT_MODULE();

static NSString *const PLAY_SERVICES_NOT_AVAILABLE = @"PLAY_SERVICES_NOT_AVAILABLE";

// The key in `GoogleService-Info.plist` client id.
// For more see https://developers.google.com/identity/sign-in/ios/start
static NSString *const kClientIdKey = @"CLIENT_ID";

- (NSDictionary *)constantsToExport
{
  return @{
           @"BUTTON_SIZE_ICON": @(kGIDSignInButtonStyleIconOnly),
           @"BUTTON_SIZE_STANDARD": @(kGIDSignInButtonStyleStandard),
           @"BUTTON_SIZE_WIDE": @(kGIDSignInButtonStyleWide),
           @"BUTTON_COLOR_LIGHT": @(kGIDSignInButtonColorSchemeLight),
           @"BUTTON_COLOR_DARK": @(kGIDSignInButtonColorSchemeDark),
           @"SIGN_IN_CANCELLED": [@(kGIDSignInErrorCodeCanceled) stringValue],
           @"SIGN_IN_REQUIRED": [@(kGIDSignInErrorCodeHasNoAuthInKeychain) stringValue],
           @"IN_PROGRESS": ASYNC_OP_IN_PROGRESS,
           PLAY_SERVICES_NOT_AVAILABLE: PLAY_SERVICES_NOT_AVAILABLE // this never happens on iOS
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
    self.promiseWrapper = [[RNGSPromiseWrapper alloc] init];
  }
  return self;
}

RCT_EXPORT_METHOD(configure:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString *path = [[NSBundle mainBundle] pathForResource:@"GoogleService-Info" ofType:@"plist"];

  if (!options[@"iosClientId"] && !path) {
    NSString* message = @"RNGoogleSignin: failed to determine clientID - GoogleService-Info.plist was not found and iosClientId was not provided. To fix this error: if you have GoogleService-Info.plist file (usually downloaded from firebase) place it into the project as seen in the iOS guide. Otherwise pass iosClientId option to configure()";
    RCTLogError(@"%@", message);
    reject(@"INTERNAL_MISSING_CONFIG", message, nil);
    return;
  }

  [GIDSignIn sharedInstance].delegate = self;
  [GIDSignIn sharedInstance].scopes = options[@"scopes"];
  [GIDSignIn sharedInstance].shouldFetchBasicProfile = YES; // email, profile
  [GIDSignIn sharedInstance].loginHint = options[@"loginHint"];

  if (options[@"iosClientId"]) {
    [GIDSignIn sharedInstance].clientID = options[@"iosClientId"];
  } else {
    NSDictionary *plist = [[NSDictionary alloc] initWithContentsOfFile:path];
    [GIDSignIn sharedInstance].clientID = plist[kClientIdKey];
  }

  if (options[@"hostedDomain"]) {
    [GIDSignIn sharedInstance].hostedDomain = options[@"hostedDomain"];
  }
  if (options[@"webClientId"]) {
    [GIDSignIn sharedInstance].serverClientID = options[@"webClientId"];
  }

  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(signInSilently:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  [self.promiseWrapper setPromiseWithInProgressCheck:resolve rejecter:reject fromCallSite:@"signInSilently"];
  [[GIDSignIn sharedInstance] restorePreviousSignIn];
}

RCT_EXPORT_METHOD(signIn:(RCTPromiseResolveBlock)resolve
                  signInReject:(RCTPromiseRejectBlock)reject)
{
  [GIDSignIn sharedInstance].presentingViewController = RCTPresentedViewController();
  [self.promiseWrapper setPromiseWithInProgressCheck:resolve rejecter:reject fromCallSite:@"signIn"];
  [[GIDSignIn sharedInstance] signIn];
}

RCT_EXPORT_METHOD(signOut:(RCTPromiseResolveBlock)resolve
                  signOutReject:(RCTPromiseRejectBlock)reject)
{
  [[GIDSignIn sharedInstance] signOut];
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(revokeAccess:(RCTPromiseResolveBlock)resolve
                  revokeAccessReject:(RCTPromiseRejectBlock)reject)
{
  [self.promiseWrapper setPromiseWithInProgressCheck:resolve rejecter:reject fromCallSite:@"revokeAccess"];
  [[GIDSignIn sharedInstance] disconnect];
}

RCT_EXPORT_METHOD(isSignedIn:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  BOOL isSignedIn = [[GIDSignIn sharedInstance] hasPreviousSignIn];
  resolve(@(isSignedIn));
}

- (void)signIn:(GIDSignIn *)signIn didSignInForUser:(GIDGoogleUser *)user withError:(NSError *)error {
  if (error) {
    [self rejectWithSigninError: error];
  } else {
    [self resolveWithUserDetails: user];
  }
}

RCT_EXPORT_METHOD(getCurrentUser:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  GIDGoogleUser *currentUser = [GIDSignIn sharedInstance].currentUser;
  resolve(RCTNullIfNil([self createUserDictionary:currentUser]));
}

RCT_EXPORT_METHOD(getTokens:(RCTPromiseResolveBlock)resolve
                    rejecter:(RCTPromiseRejectBlock)reject)
{
  GIDGoogleUser *currentUser = [GIDSignIn sharedInstance].currentUser;
  if (currentUser == nil) {
    reject(@"getTokens", @"getTokens requires a user to be signed in", nil);
    return;
  }

  GIDAuthenticationHandler handler = ^void(GIDAuthentication *authentication, NSError *error) {
    if (error) {
      reject(@"getTokens", error.localizedDescription, nil);
    } else {
      resolve(@{
                @"idToken" : authentication.idToken,
                @"accessToken" : authentication.accessToken,
                });
    }
  };

  [currentUser.authentication getTokensWithHandler:handler];
}

- (void)resolveWithUserDetails: (GIDGoogleUser *) user {
  [self.promiseWrapper resolve:[self createUserDictionary:user]];
}

- (NSDictionary*)createUserDictionary: (nullable GIDGoogleUser *) user {
  if (!user) {
    return nil;
  }
  NSURL *imageURL = user.profile.hasImage ? [user.profile imageURLWithDimension:120] : nil;

  NSDictionary *userInfo = @{
                             @"id": user.userID,
                             @"name": RCTNullIfNil(user.profile.name),
                             @"givenName": RCTNullIfNil(user.profile.givenName),
                             @"familyName": RCTNullIfNil(user.profile.familyName),
                             @"photo": imageURL ? imageURL.absoluteString : [NSNull null],
                             @"email": user.profile.email,
                             };

  NSDictionary *params = @{
                           @"user": userInfo,
                           @"idToken": user.authentication.idToken,
                           @"serverAuthCode": RCTNullIfNil(user.serverAuthCode),
                           @"scopes": user.grantedScopes,
                           };
  return params;
}

- (void)rejectWithSigninError: (NSError *) error {
  NSString *errorMessage = @"Unknown error when signing in.";
  switch (error.code) {
    case kGIDSignInErrorCodeUnknown:
      errorMessage = @"Unknown error when signing in.";
      break;
    case kGIDSignInErrorCodeKeychain:
      errorMessage = @"A problem reading or writing to the application keychain.";
      break;
    case kGIDSignInErrorCodeHasNoAuthInKeychain:
      errorMessage = @"The user has never signed in before with the given scopes, or they have since signed out.";
      break;
    case kGIDSignInErrorCodeCanceled:
      errorMessage = @"The user canceled the sign in request.";
      break;
    case kGIDSignInErrorCodeEMM:
      errorMessage = @"An Enterprise Mobility Management related error has occurred.";
      break;
  }
  [self.promiseWrapper reject:errorMessage withError:error];
}

- (void)signIn:(GIDSignIn *)signIn didDisconnectWithUser:(GIDGoogleUser *)user withError:(NSError *)error {
  if (error) {
    [self.promiseWrapper reject:@"Error when revoking access." withError:error];
  } else {
    [self.promiseWrapper resolve:[NSNull null]];
  }
}

+ (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {
  return [[GIDSignIn sharedInstance] handleURL:url];
}

@end
