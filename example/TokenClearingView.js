// @flow
import React, { useState, useCallback } from 'react';
import { Button, TextInput } from 'react-native';
import type { User } from '@react-native-community/google-signin';
import { GoogleSignin } from '@react-native-community/google-signin';
export function TokenClearingView({ userInfo }: { userInfo: User }) {
  const [tokenToClear, setToken] = useState(userInfo.idToken);
  const clearToken = useCallback(
    async () => {
      try {
        await GoogleSignin.clearCachedToken(tokenToClear);
        console.warn('success!');
      } catch (err) {
        console.error(err);
      }
    },
    [tokenToClear]
  );
  return (
    <>
      <TextInput onChangeText={setToken} value={tokenToClear} style={{ height: 50, width: 200 }} />
      <Button title="clear token" onPress={clearToken} />
    </>
  );
}
