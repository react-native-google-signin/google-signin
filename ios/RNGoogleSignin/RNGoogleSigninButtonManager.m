#import <React/RCTViewManager.h>
#import <React/RCTLog.h>
#import "RNGoogleSignin.h"
#import "RNGoogleSignInButton.h"

@interface RNGoogleSigninButtonManager : RCTViewManager
@end

@implementation RNGoogleSigninButtonManager

RCT_EXPORT_MODULE()

- (UIView *)view
{
  RNGoogleSignInButton *button = [[RNGoogleSignInButton alloc] init];
  button.colorScheme = kGIDSignInButtonColorSchemeLight;
  button.style = kGIDSignInButtonStyleStandard;
  
  [button removeTarget:nil action:NULL forControlEvents:UIControlEventTouchUpInside];
  [button addTarget:self action:@selector(onPress:) forControlEvents:UIControlEventTouchUpInside];
  
  return button;
}

RCT_CUSTOM_VIEW_PROPERTY(color, NSString, RNGoogleSignInButton)
{
  view.colorScheme = json ? [RCTConvert GIDSignInButtonColorScheme:json] : kGIDSignInButtonColorSchemeLight;
}

RCT_CUSTOM_VIEW_PROPERTY(size, NSString, RNGoogleSignInButton)
{
  view.style = json ? [RCTConvert GIDSignInButtonStyle:json] : kGIDSignInButtonStyleStandard;
}

RCT_CUSTOM_VIEW_PROPERTY(disabled, BOOL, RNGoogleSignInButton)
{
  view.enabled = ![RCTConvert BOOL:json];
}

RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)

-(void)onPress:(RNGoogleSignInButton *)sender
{
  if (!sender.onPress) {
    return;
  }
  
  sender.onPress(nil);
}

@end
