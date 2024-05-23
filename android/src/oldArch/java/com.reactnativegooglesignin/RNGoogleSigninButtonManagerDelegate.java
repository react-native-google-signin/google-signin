package com.reactnativegooglesignin;

// this is a dummy class to make the old architecture build
// should never be used in new architecture

import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.uimanager.ViewManagerDelegate;
import com.google.android.gms.common.SignInButton;

public class RNGoogleSigninButtonManagerDelegate implements ViewManagerDelegate<SignInButton> {
    RNGoogleSigninButtonManagerDelegate(RNGoogleSigninButtonViewManager viewManager) {
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            throw new RuntimeException("This class should not be used in new architecture");
        }
    }

    @Override
    public void setProperty(SignInButton signInButton, String s, @Nullable Object o) {
        throw new RuntimeException("setProperty must not be called");
    }

    @Override
    public void receiveCommand(SignInButton signInButton, String s, ReadableArray readableArray) {
        throw new RuntimeException("receiveCommand must not be called");
    }
}
