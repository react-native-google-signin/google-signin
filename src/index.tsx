import { NativeModules } from 'react-native';

type GoogleSigninType = {
  multiply(a: number, b: number): Promise<number>;
};

const { GoogleSignin } = NativeModules;

export default GoogleSignin as GoogleSigninType;
