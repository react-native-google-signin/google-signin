package co.apptailor.googlesignin;

import android.util.Log;

import com.facebook.react.bridge.Promise;

import static co.apptailor.googlesignin.RNGoogleSigninModule.MODULE_NAME;

public class PromiseWrapper {
    private Promise promise;
    private String nameOfCallInProgress;


    public boolean setPromiseWithInProgressCheck(Promise promise, String fromCallsite) {
        boolean success = false;
        if (this.promise == null) {
            this.promise = promise;
            nameOfCallInProgress = fromCallsite;
            success = true;
        }
        return success;
    }

    public void resolve(Object value) {
        if (promise == null) {
            Log.w(MODULE_NAME, "cannot resolve promise because it's null");
            return;
        }

        promise.resolve(value);
        resetMembers();
    }

    public void reject(String code, String message) {
        if (promise == null) {
            Log.w(MODULE_NAME, "cannot reject promise because it's null");
            return;
        }

        promise.reject(code, message);
        resetMembers();
    }

    public String getNameOfCallInProgress(){
        return nameOfCallInProgress;
    }

    private void resetMembers() {
        promise = null;
        nameOfCallInProgress = null;
    }
}
