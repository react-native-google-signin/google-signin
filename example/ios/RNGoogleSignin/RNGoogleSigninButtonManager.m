
#import "RCTViewManager.h"
#import "RNGoogleSignIn.h"

@interface RNGoogleSigninButtonManager : RCTViewManager
@end

@implementation RNGoogleSigninButtonManager

RCT_EXPORT_MODULE()

- (UIView *)view
{
  GIDSignInButton *button = [[GIDSignInButton alloc] init];
  button.colorScheme = kGIDSignInButtonColorSchemeLight;
  button.style = kGIDSignInButtonStyleStandard;

//  [button removeTarget:nil action:NULL forControlEvents:UIControlEventTouchUpInside];
//  [button addTarget:self action:@selector(buttonAction:) forControlEvents:UIControlEventTouchUpInside];
  return button;
}

RCT_CUSTOM_VIEW_PROPERTY(color, NSString, GIDSignInButton)
{
  view.colorScheme = json ? [RCTConvert GIDSignInButtonColorScheme:json] :kGIDSignInButtonColorSchemeLight;

}

RCT_CUSTOM_VIEW_PROPERTY(size, NSString, GIDSignInButton)
{
  view.style = json ? [RCTConvert GIDSignInButtonStyle:json] :kGIDSignInButtonStyleStandard;

}

//-(void)buttonAction:(GIDSignInButton*)sender
//{
//
//}

@end