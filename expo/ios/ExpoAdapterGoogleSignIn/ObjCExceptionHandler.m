#import "ObjCExceptionHandler.h"

@implementation ObjCExceptionHandler

+ (BOOL)tryCatch:(void (^)(void))tryBlock error:(__autoreleasing NSError **)error {
    @try {
        tryBlock();
        return YES;
    }
    @catch (NSException *exception) {
        if (error) {
            *error = [NSError errorWithDomain:@"ObjCExceptionDomain"
                                         code:-1
                                     userInfo:@{
                NSLocalizedDescriptionKey: exception.reason ?: @"Unknown exception",
                @"ExceptionName": exception.name ?: @"Unknown",
                @"CallStackSymbols": exception.callStackSymbols ?: @[]
            }];
        }
        return NO;
    }
}

@end