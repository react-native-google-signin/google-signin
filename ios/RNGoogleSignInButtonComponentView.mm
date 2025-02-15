#ifdef RCT_NEW_ARCH_ENABLED

#import <React/RCTLog.h>
#import <GoogleSignIn/GoogleSignIn.h>
#import "RNGoogleSignInButtonComponentView.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>
#import <react/renderer/components/RNGoogleSignInCGen/ComponentDescriptors.h>
#import <react/renderer/components/RNGoogleSignInCGen/Props.h>
#import <react/renderer/components/RNGoogleSignInCGen/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNGoogleSignInButtonComponentView () <RCTRNGoogleSigninButtonViewProtocol>

@end

@implementation RNGoogleSignInButtonComponentView {
  GIDSignInButton *_button;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNGoogleSigninButtonComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if ((self = [super initWithFrame:frame])) {
    static const auto defaultProps = std::make_shared<const RNGoogleSigninButtonProps>();
    _props = defaultProps;

    _button = [[GIDSignInButton alloc] initWithFrame:self.bounds];
    [_button addTarget:self action:@selector(onButtonPress:) forControlEvents:UIControlEventTouchUpInside];
    self.contentView = _button;
  }
  return self;
}

-(void)onButtonPress:(GIDSignInButton *)sender
{
  std::dynamic_pointer_cast<const RNGoogleSigninButtonEventEmitter>(_eventEmitter)
  ->onPress(RNGoogleSigninButtonEventEmitter::OnPress{});
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &oldViewProps = *std::static_pointer_cast<RNGoogleSigninButtonProps const>(_props);
  const auto &newViewProps = *std::static_pointer_cast<RNGoogleSigninButtonProps const>(props);

  if (oldViewProps.disabled != newViewProps.disabled) {
    _button.enabled = !newViewProps.disabled;
  }
  if (oldViewProps.color != newViewProps.color) {
    _button.colorScheme = newViewProps.color == RNGoogleSigninButtonColor::Dark ? kGIDSignInButtonColorSchemeDark : kGIDSignInButtonColorSchemeLight;
  }
  if (oldViewProps.size != newViewProps.size) {
    _button.style = (GIDSignInButtonStyle) newViewProps.size;
  }

  [super updateProps:props oldProps:oldProps];
}

@end


Class<RCTComponentViewProtocol> RNGoogleSigninButtonCls(void)
{
  return RNGoogleSignInButtonComponentView.class;
}
#endif // RCT_NEW_ARCH_ENABLED
