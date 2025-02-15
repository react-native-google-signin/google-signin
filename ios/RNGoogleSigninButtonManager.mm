#import <React/RCTViewManager.h>
#import "RCTConvert+RNGoogleSignin.h"
#import "RNGoogleSignInButton.h"

@interface RNGoogleSigninButtonManager : RCTViewManager
@end

@implementation RNGoogleSigninButtonManager

RCT_EXPORT_MODULE()

- (UIView *)view
{
  RNGoogleSignInButton *button = [RNGoogleSignInButton new];

  [button addTarget:self action:@selector(onButtonPress:) forControlEvents:UIControlEventTouchUpInside];

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

-(void)onButtonPress:(RNGoogleSignInButton *)sender
{
  if (sender.onPress) {
    sender.onPress(nil);
  }
}

@end
