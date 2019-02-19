package co.apptailor.googlesignin;

import com.facebook.react.bridge.WritableMap;

public class PendingAuthRecovery {
    private WritableMap userProperties;

    public PendingAuthRecovery(WritableMap userProperties) {
        this.userProperties = userProperties;
    }

    public WritableMap getUserProperties() {
        return userProperties;
    }
}
