package co.apptailor.googlesignin;

import android.util.Log;

import com.facebook.react.bridge.Promise;

import static co.apptailor.googlesignin.RNGoogleSigninModule.MODULE_NAME;

public class PromiseWrapper {
    private Promise _promise;


    public boolean setPromiseWithInProgressCheck(Promise promise) {
        boolean success = false;
        if (_promise == null) {
            _promise = promise;
            success = true;
        }
        return success;
    }

    public void resolve(Object value) {
        if (_promise == null) {
            Log.w(MODULE_NAME, "cannot resolve promise because it's null");
            return;
        }

        _promise.resolve(value);
        _promise = null;
    }

    public void reject(String code, String message) {
        if (_promise == null) {
            Log.w(MODULE_NAME, "cannot reject promise because it's null");
            return;
        }

        _promise.reject(code, message);
        _promise = null;
    }
}
