import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { BubblingEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

export interface NativeProps extends ViewProps {
  onPress?: BubblingEventHandler<void>;
}

export const RNGoogleSigninButton = codegenNativeComponent<NativeProps>(
  'RNGoogleSigninButton',
) as HostComponent<NativeProps>;
