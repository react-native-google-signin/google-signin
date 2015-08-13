/*
 * GIDAuthentication.h
 * Google Sign-In iOS SDK
 *
 * Copyright 2014 Google Inc.
 *
 * Use of this SDK is subject to the Google APIs Terms of Service:
 * https://developers.google.com/terms/
 */

#import <Foundation/Foundation.h>

// @relates GIDAuthentication
//
// The callback block that takes an access token or an error if attempt to refresh was unsuccessful.
typedef void (^GIDAccessTokenHandler)(NSString *accessToken, NSError *error);

// This class represents the OAuth 2.0 entities needed for sign-in.
@interface GIDAuthentication : NSObject <NSCoding>

// The client ID associated with the authentication.
@property(nonatomic, readonly) NSString *clientID;

// The OAuth2 access token to access Google services.
@property(nonatomic, readonly) NSString *accessToken;

// The estimated expiration date of the access token.
@property(nonatomic, readonly) NSDate *accessTokenExpirationDate;

// The OAuth2 refresh token to exchange for new access tokens.
@property(nonatomic, readonly) NSString *refreshToken;

// An OpenID Connect ID token that identifies the user. Send this token to your server to
// authenticate the user there. For more information on this topic, see
// https://developers.google.com/identity/sign-in/ios/backend-auth
@property(nonatomic, readonly) NSString *idToken;

// Gets the access token, which may be a new one from the refresh token if the original has already
// expired or is about to expire.
- (void)getAccessTokenWithHandler:(GIDAccessTokenHandler)handler;

// Refreshes the access token with the refresh token.
- (void)refreshAccessTokenWithHandler:(GIDAccessTokenHandler)handler;

@end
