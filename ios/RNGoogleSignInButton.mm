#import <React/RCTLog.h>
#import "RNGoogleSignInButton.h"

#ifdef RCT_NEW_ARCH_ENABLED

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>
#import <react/renderer/components/RNGoogleSignInCGen/ComponentDescriptors.h>
#import <react/renderer/components/RNGoogleSignInCGen/Props.h>
#import <react/renderer/components/RNGoogleSignInCGen/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNGoogleSignInButton () <RCTRNGoogleSigninButtonViewProtocol>
#else
@interface RNGoogleSignInButton ()
#endif // RCT_NEW_ARCH_ENABLED
@end

@implementation RNGoogleSignInButton {
  GIDSignInButton *_button;
}

#ifdef RCT_NEW_ARCH_ENABLED
+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNGoogleSigninButtonComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNGoogleSigninButtonProps>();
    _props = defaultProps;

    _button = [[GIDSignInButton alloc] initWithFrame:self.bounds];
    [_button addTarget:self action:@selector(onButtonPress:) forControlEvents:UIControlEventTouchUpInside];
    self.contentView = _button;
  }
  return self;
}

-(void)onButtonPress:(RNGoogleSignInButton *)sender
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
#endif

@end


#ifdef RCT_NEW_ARCH_ENABLED
Class<RCTComponentViewProtocol> RNGoogleSigninButtonCls(void)
{
  return RNGoogleSignInButton.class;
}
#endif // RCT_NEW_ARCH_ENABLED
