//
//  PromiseWrapper.m
//  RNGoogleSignin
//
//  Created by Vojtech Novak on 26/07/2018.
//  Copyright © 2018 Apptailor. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "RNGSPromiseWrapper.h"


@interface RNGSPromiseWrapper ()

@property (nonatomic, strong) RCTPromiseResolveBlock promiseResolve;
@property (nonatomic, strong) RCTPromiseRejectBlock promiseReject;

@end

@implementation RNGSPromiseWrapper

-(BOOL) setPromiseWithInProgressCheck: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject {
  BOOL success = NO;
  if (!self.promiseResolve) {
    self.promiseResolve = resolve;
    self.promiseReject = reject;
    success = YES;
  }
  return success;
}

-(void) resolve: (id) result {
  if (self.promiseResolve == nil) {
    NSLog(@"cannot resolve promise because it's null");
    return;
  }
  self.promiseResolve(result);
  self.promiseResolve = nil;
  self.promiseReject = nil;
}

-(void) reject:(NSString *)message withError:(NSError *)error {
  if (self.promiseResolve == nil) {
    NSLog(@"cannot resolve promise because it's null");
    return;
  }
  NSString* errorCode = [NSString stringWithFormat:@"%ld", error.code];
  NSString* errorMessage = [NSString stringWithFormat:@"RNGoogleSignInError: %@, %@", message, error.description];
  
  self.promiseReject(errorCode, errorMessage, error);
  
  self.promiseResolve = nil;
  self.promiseReject = nil;
}


@end
