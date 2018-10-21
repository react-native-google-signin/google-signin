//
//  PromiseWrapper.h
//  RNGoogleSignin
//
//  Created by Vojtech Novak on 26/07/2018.
//  Copyright © 2018 Apptailor. All rights reserved.
//

#ifndef PromiseWrapper_h
#define PromiseWrapper_h
#import <React/RCTBridgeModule.h>

@interface RNGSPromiseWrapper : NSObject

-(BOOL)setPromiseWithInProgressCheck:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject fromCallSite: (NSString*) callsite;
-(void)resolve: (id) result;
-(void)reject:(NSString *)message withError:(NSError *)error;
@property (readonly, assign) NSString *nameOfCallInProgress;

@end

#endif /* PromiseWrapper_h */
