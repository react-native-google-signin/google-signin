#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import <GoogleSignIn/GoogleSignIn.h>
#import "RNGoogleSignin.h"

@interface RNGoogleSignin ()

@property (nonatomic) GIDConfiguration *configuration;
@property (nonatomic) NSArray *scopes;
@property (nonatomic) NSUInteger profileImageSize;

@end

@implementation RNGoogleSignin

RCT_EXPORT_MODULE();

static NSString *const PLAY_SERVICES_NOT_AVAILABLE = @"PLAY_SERVICES_NOT_AVAILABLE";
static NSString *const ASYNC_OP_IN_PROGRESS = @"ASYNC_OP_IN_PROGRESS";


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

RCT_EXPORT_METHOD(configure:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString *pathName = options[@"googleServicePlistPath"] ? options[@"googleServicePlistPath"] : @"GoogleService-Info";

  NSString *path = [[NSBundle mainBundle] pathForResource:pathName ofType:@"plist"];

  if (!options[@"iosClientId"] && !path) {
    NSString* message = @"RNGoogleSignin: failed to determine clientID - GoogleService-Info.plist was not found and iosClientId was not provided. To fix this error: if you have GoogleService-Info.plist file (usually downloaded from firebase) place it into the project as seen in the iOS guide. Otherwise pass iosClientId option to configure()";
    RCTLogError(@"%@", message);
    reject(@"INTERNAL_MISSING_CONFIG", message, nil);
    return;
  }
  
  NSString* clientId;
  if (options[@"iosClientId"]) {
    clientId = options[@"iosClientId"];
  } else {
    NSDictionary *plist = [[NSDictionary alloc] initWithContentsOfFile:path];
    clientId = plist[kClientIdKey];
  }
  if (options[@"profileImageSize"]) {
    NSNumber* size = options[@"profileImageSize"];
    _profileImageSize = [size unsignedIntegerValue];
  } else {
    _profileImageSize = 120;
  }

  GIDConfiguration* config = [[GIDConfiguration alloc] initWithClientID:clientId serverClientID:options[@"webClientId"] hostedDomain:options[@"hostedDomain"] openIDRealm:options[@"openIDRealm"]];
  _configuration = config;
  
  NSArray* scopes=options[@"scopes"];
  _scopes=scopes;

  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(signInSilently:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  [GIDSignIn.sharedInstance restorePreviousSignInWithCallback:^(GIDGoogleUser * _Nullable user, NSError * _Nullable error) {
    [self handleAsyncCallback:user withError:error withResolver:resolve withRejector:reject fromCallsite:@"signInSilently"];
  }];
}

RCT_EXPORT_METHOD(signIn:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  UIViewController* presentingViewController = RCTPresentedViewController();
  NSString* hint = options[@"loginHint"];
  [GIDSignIn.sharedInstance signInWithConfiguration:_configuration presentingViewController:presentingViewController hint:hint additionalScopes:_scopes callback:^(GIDGoogleUser * _Nullable user, NSError * _Nullable error) {
    [self handleAsyncCallback:user withError:error withResolver:resolve withRejector:reject fromCallsite:@"signIn"];
  }];
  
}

RCT_EXPORT_METHOD(addScopes:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSArray* scopes = options[@"scopes"];
  UIViewController* presentingViewController = RCTPresentedViewController();

  [GIDSignIn.sharedInstance addScopes:scopes presentingViewController:presentingViewController callback:^(GIDGoogleUser * _Nullable user, NSError * _Nullable error) {
    [self handleAsyncCallback:user withError:error withResolver:resolve withRejector:reject fromCallsite:@"addScopes"];
  }];
}

RCT_EXPORT_METHOD(signOut:(RCTPromiseResolveBlock)resolve
                  signOutReject:(RCTPromiseRejectBlock)reject)
{
  [GIDSignIn.sharedInstance signOut];
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(revokeAccess:(RCTPromiseResolveBlock)resolve
                  revokeAccessReject:(RCTPromiseRejectBlock)reject)
{
  [GIDSignIn.sharedInstance disconnectWithCallback:^(NSError * _Nullable error) {
      if (error) {
        reject(@"revokeAccess", error.localizedDescription, error);
      } else {
        resolve([NSNull null]);
      }
  }];
}

RCT_EXPORT_METHOD(isSignedIn:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  BOOL isSignedIn = [GIDSignIn.sharedInstance hasPreviousSignIn];
  resolve(@(isSignedIn));
}

RCT_EXPORT_METHOD(getCurrentUser:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  GIDGoogleUser *currentUser = GIDSignIn.sharedInstance.currentUser;
  resolve(RCTNullIfNil([self createUserDictionary:currentUser]));
}

RCT_EXPORT_METHOD(getTokens:(RCTPromiseResolveBlock)resolve
                    rejecter:(RCTPromiseRejectBlock)reject)
{
  GIDGoogleUser *currentUser = GIDSignIn.sharedInstance.currentUser;
  if (currentUser == nil) {
    reject(@"getTokens", @"getTokens requires a user to be signed in", nil);
    return;
  }

  [currentUser.authentication doWithFreshTokens:^(GIDAuthentication * _Nullable authentication, NSError * _Nullable error) {
    if (error) {
      reject(@"getTokens", error.localizedDescription, error);
    } else {
      if (authentication) {
        resolve(@{
                  @"idToken" : authentication.idToken,
                  @"accessToken" : authentication.accessToken,
                  });
      } else {
        reject(@"getTokens", @"authentication was null", nil);
      }
    }
  }];
}

- (NSDictionary*)createUserDictionary: (nullable GIDGoogleUser *) user {
  if (!user) {
    return nil;
  }
  NSURL *imageURL = user.profile.hasImage ? [user.profile imageURLWithDimension:_profileImageSize] : nil;

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


- (void)handleAsyncCallback: (GIDGoogleUser * _Nullable) user withError: (NSError * _Nullable) error withResolver: (RCTPromiseResolveBlock) resolve withRejector: (RCTPromiseRejectBlock) reject fromCallsite: (NSString *) from {
  if (error) {
    [RNGoogleSignin rejectWithSigninError:error withRejector:reject];
  } else {
    if (user) {
      resolve([self createUserDictionary:user]);
    } else {
      reject(from, @"user was null", nil);
    }
  }
}

+ (void)rejectWithSigninError: (NSError *) error withRejector: (RCTPromiseRejectBlock) rejector {
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
  NSString* errorCode = [NSString stringWithFormat:@"%ld", error.code];
  NSString* message = [NSString stringWithFormat:@"RNGoogleSignInError: %@, %@", errorMessage, error.description];
  rejector(errorCode, message, error);
}

+ (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {
  return [GIDSignIn.sharedInstance handleURL:url];
}

@end
