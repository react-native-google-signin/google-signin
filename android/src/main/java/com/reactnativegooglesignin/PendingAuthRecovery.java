package com.reactnativegooglesignin;

import com.facebook.react.bridge.WritableMap;

public class PendingAuthRecovery {
    private final WritableMap userProperties;

    public PendingAuthRecovery(WritableMap userProperties) {
        this.userProperties = userProperties;
    }

    public WritableMap getUserProperties() {
        return userProperties;
    }
}
