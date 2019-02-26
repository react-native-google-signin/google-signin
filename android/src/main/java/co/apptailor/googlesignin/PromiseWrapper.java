package co.apptailor.googlesignin;

import android.util.Log;

import com.facebook.react.bridge.Promise;

import static co.apptailor.googlesignin.RNGoogleSigninModule.MODULE_NAME;

public class PromiseWrapper {
    private Promise promise;
    private String nameOfCallInProgress;


    public boolean setPromiseWithInProgressCheck(Promise promise, String fromCallsite) {
        if (this.promise != null) {
            return false;
        }
        this.promise = promise;
        nameOfCallInProgress = fromCallsite;
        return true;
    }

    public void resolve(Object value) {
        Promise resolver = promise;
        if (resolver == null) {
            Log.w(MODULE_NAME, "cannot resolve promise because it's null");
            return;
        }

        resetMembers();
        resolver.resolve(value);
    }

    public void reject(String code, Throwable throwable) {
        Promise rejecter = promise;
        if (rejecter == null) {
            Log.w(MODULE_NAME, "cannot reject promise because it's null");
            return;
        }

        resetMembers();
        rejecter.reject(code, throwable.getLocalizedMessage(), throwable);
    }

    public void reject(String code, String message) {
        Promise rejecter = promise;
        if (rejecter == null) {
            Log.w(MODULE_NAME, "cannot reject promise because it's null");
            return;
        }

        resetMembers();
        rejecter.reject(code, message);
    }

    public String getNameOfCallInProgress(){
        return nameOfCallInProgress;
    }

    private void resetMembers() {
        promise = null;
        nameOfCallInProgress = null;
    }
}
