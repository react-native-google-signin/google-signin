/*
 * GIDProfileData.h
 * Google Sign-In iOS SDK
 *
 * Copyright 2014 Google Inc.
 *
 * Use of this SDK is subject to the Google APIs Terms of Service:
 * https://developers.google.com/terms/
 */

#import <Foundation/Foundation.h>

// This class represents the basic profile information of a GIDGoogleUser.
@interface GIDProfileData : NSObject <NSCoding>

// The Google user's email.
@property(nonatomic, readonly) NSString *email;

// The Google user's name.
@property(nonatomic, readonly) NSString *name;

// Whether or not the user has profile image.
@property(nonatomic, readonly) BOOL hasImage;

// Gets the user's profile image URL for the given dimension in pixels for each side of the square.
- (NSURL *)imageURLWithDimension:(NSUInteger)dimension;

@end
