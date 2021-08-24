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
@property (readwrite, assign) NSString *nameOfCallInProgress;

@end

@implementation RNGSPromiseWrapper

-(void)setPromiseWithInProgressCheck: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject fromCallSite:(NSString *) callsite {
  if (self.promiseReject) {
    [self rejectPreviousPromiseBecauseNewOneIsInProgress:self.promiseReject requestedOperation:callsite];
  }
  self.promiseResolve = resolve;
  self.promiseReject = reject;
  self.nameOfCallInProgress = callsite;
}

-(void)resolve: (id) result {
  RCTPromiseResolveBlock resolver = self.promiseResolve;
  if (resolver == nil) {
    NSLog(@"cannot resolve promise because it's null");
    return;
  }
  [self resetMembers];
  resolver(result);
}

-(void)reject:(NSString *)message withError:(NSError *)error {
  RCTPromiseRejectBlock rejecter = self.promiseReject;
  if (rejecter == nil) {
    NSLog(@"cannot reject promise because it's null");
    return;
  }
  NSString* errorCode = [NSString stringWithFormat:@"%ld", error.code];
  NSString* errorMessage = [NSString stringWithFormat:@"RNGoogleSignInError: %@, %@", message, error.description];

  [self resetMembers];
  rejecter(errorCode, errorMessage, error);
}

-(void)resetMembers {
  self.promiseResolve = nil;
  self.promiseReject = nil;
  self.nameOfCallInProgress = nil;
}

- (void)rejectPreviousPromiseBecauseNewOneIsInProgress: (RCTPromiseRejectBlock)reject requestedOperation:(NSString *) callSiteName {
  NSString *msg = [NSString stringWithFormat:@"Warning: previous promise did not settle and was overwritten. You've called \"%@\" while \"%@\" was already in progress and has not completed yet.", callSiteName, self.nameOfCallInProgress];
  reject(ASYNC_OP_IN_PROGRESS, msg, nil);
}


@end
