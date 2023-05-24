#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import <GoogleSignIn/GoogleSignIn.h>
#import "RNGoogleSignin.h"

@interface RNGoogleSignin ()

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

RCT_EXPORT_METHOD(configure:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString *pathName = options[@"googleServicePlistPath"] ? options[@"googleServicePlistPath"] : @"GoogleService-Info";

  NSURL *path = [[NSBundle mainBundle] URLForResource:pathName withExtension:@"plist"];

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
    NSError *error;
    NSDictionary *plist = [[NSDictionary alloc] initWithContentsOfURL:path error:&error];
    if (error) {
      NSString* message = [NSString stringWithFormat:@"RNGoogleSignin: Failed to read GoogleService-Info.plist."];
      RCTLogError(@"%@", message);
      reject(@"INTERNAL_PLIST_READ_ERR", message, error);
      return;
    }
    clientId = plist[kClientIdKey];
  }

  GIDConfiguration* config = [[GIDConfiguration alloc] initWithClientID:clientId serverClientID:options[@"webClientId"] hostedDomain:options[@"hostedDomain"] openIDRealm:options[@"openIDRealm"]];
  GIDSignIn.sharedInstance.configuration = config;

  _profileImageSize = 120;
  if (options[@"profileImageSize"]) {
    NSNumber* size = options[@"profileImageSize"];
    _profileImageSize = [size unsignedIntegerValue];
  }

  _scopes = options[@"scopes"];

  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(signInSilently:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  [GIDSignIn.sharedInstance restorePreviousSignInWithCompletion:^(GIDGoogleUser * _Nullable user, NSError * _Nullable error) {
    [self handleCompletion:user serverAuthCode:nil withError:error withResolver:resolve withRejector:reject fromCallsite:@"signInSilently"];
  }];
}

RCT_EXPORT_METHOD(signIn:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
      UIViewController* presentingViewController = RCTPresentedViewController();
      NSString* hint = options[@"loginHint"];
      NSArray* scopes = self.scopes;

      [GIDSignIn.sharedInstance signInWithPresentingViewController:presentingViewController hint:hint additionalScopes:scopes completion:^(GIDSignInResult * _Nullable signInResult, NSError * _Nullable error) {
          [self handleCompletion:signInResult withError:error withResolver:resolve withRejector:reject fromCallsite:@"signIn"];
      }];
  });
}

RCT_EXPORT_METHOD(addScopes:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
      GIDGoogleUser *currentUser = GIDSignIn.sharedInstance.currentUser;
      if (!currentUser) {
        resolve([NSNull null]);
        return;
      }
      NSArray* scopes = options[@"scopes"];
      UIViewController* presentingViewController = RCTPresentedViewController();

      [currentUser addScopes:scopes presentingViewController:presentingViewController completion:^(GIDSignInResult * _Nullable signInResult, NSError * _Nullable error) {
          [self handleCompletion:signInResult withError:error withResolver:resolve withRejector:reject fromCallsite:@"addScopes"];
      }];
  });
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
  [GIDSignIn.sharedInstance disconnectWithCompletion:^(NSError * _Nullable error) {
    if (error) {
      [RNGoogleSignin rejectWithSigninError:error withRejector:reject];
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
  resolve(RCTNullIfNil([self createUserDictionary:currentUser serverAuthCode:nil]));
}

RCT_EXPORT_METHOD(getTokens:(RCTPromiseResolveBlock)resolve
                    rejecter:(RCTPromiseRejectBlock)reject)
{
  GIDGoogleUser *currentUser = GIDSignIn.sharedInstance.currentUser;
  if (currentUser == nil) {
    reject(@"getTokens", @"getTokens requires a user to be signed in", nil);
    return;
  }
  [currentUser refreshTokensIfNeededWithCompletion:^(GIDGoogleUser * _Nullable user, NSError * _Nullable error) {
    if (error) {
      [RNGoogleSignin rejectWithSigninError:error withRejector:reject];
    } else {
      if (user) {
        resolve(@{
                  @"idToken" : user.idToken.tokenString,
                  @"accessToken" : user.accessToken.tokenString,
                  });
      } else {
        reject(@"getTokens", @"user was null", nil);
      }
    }
  }];
}

- (NSDictionary*)createUserDictionary: (nullable GIDSignInResult *) result {
  return [self createUserDictionary:result.user serverAuthCode:result.serverAuthCode];
}

- (NSDictionary*)createUserDictionary: (nullable GIDGoogleUser *) user serverAuthCode: (nullable NSString*) serverAuthCode {
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
                           @"idToken": user.idToken.tokenString,
                           @"serverAuthCode": RCTNullIfNil(serverAuthCode),
                           @"scopes": user.grantedScopes,
                           };
  return params;
}


- (void)handleCompletion: (GIDSignInResult * _Nullable) signInResult withError: (NSError * _Nullable) error withResolver: (RCTPromiseResolveBlock) resolve withRejector: (RCTPromiseRejectBlock) reject fromCallsite: (NSString *) from {
  [self handleCompletion:signInResult.user serverAuthCode:signInResult.serverAuthCode withError:error withResolver:resolve withRejector:reject fromCallsite:from];
}

- (void)handleCompletion: (GIDGoogleUser * _Nullable) user serverAuthCode: (nullable NSString*) serverAuthCode withError: (NSError * _Nullable) error withResolver: (RCTPromiseResolveBlock) resolve withRejector: (RCTPromiseRejectBlock) reject fromCallsite: (NSString *) from {
  if (error) {
    [RNGoogleSignin rejectWithSigninError:error withRejector:reject];
  } else {
    if (user) {
      resolve([self createUserDictionary:user serverAuthCode:serverAuthCode]);
    } else {
      reject(from, @"user was null", nil);
    }
  }
}

+ (void)rejectWithSigninError: (NSError *) error withRejector: (RCTPromiseRejectBlock) rejector {
  NSString *errorMessage = @"Unknown error in google sign in.";
  switch (error.code) {
    case kGIDSignInErrorCodeUnknown:
      errorMessage = @"Unknown error in google sign in.";
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
    case kGIDSignInErrorCodeScopesAlreadyGranted:
      errorMessage = @"The requested scopes have already been granted to the `currentUser`";
      break;
    case kGIDSignInErrorCodeMismatchWithCurrentUser:
      errorMessage = @"There was an operation on a previous user.";
      break;
  }
  NSString* message = [NSString stringWithFormat:@"RNGoogleSignInError: %@, %@", errorMessage, error.description];
  NSString* errorCode = [NSString stringWithFormat:@"%ld", error.code];
  rejector(errorCode, message, error);
}

+ (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {
  return [GIDSignIn.sharedInstance handleURL:url];
}

@end
