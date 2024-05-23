import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type {
  BubblingEventHandler,
  WithDefault,
  Int32,
} from 'react-native/Libraries/Types/CodegenTypes';

interface EventParams {}
interface NativeProps extends ViewProps {
  onPress?: BubblingEventHandler<EventParams>;
  disabled?: WithDefault<boolean, false>;
  color?: WithDefault<'dark' | 'light', 'light'>;
  size: Int32;
}

export default codegenNativeComponent<NativeProps>(
  'RNGoogleSigninButton',
) as HostComponent<NativeProps>;
