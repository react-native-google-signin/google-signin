package com.reactnativegooglesignin;

import static com.reactnativegooglesignin.RNGoogleSigninModule.MODULE_NAME;

import android.util.Log;

import com.facebook.react.bridge.Promise;


public class PromiseWrapper {
    private Promise promise;
    private String nameOfCallInProgress;
    public static final String ASYNC_OP_IN_PROGRESS = "ASYNC_OP_IN_PROGRESS";


    public void setPromiseWithInProgressCheck(Promise promise, String fromCallsite) {
        if (this.promise != null) {
            rejectPreviousPromiseBecauseNewOneIsInProgress(this.promise, fromCallsite);
        }
        this.promise = promise;
        nameOfCallInProgress = fromCallsite;
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

    private void rejectPreviousPromiseBecauseNewOneIsInProgress(Promise promise, String requestedOperation) {
        promise.reject(ASYNC_OP_IN_PROGRESS, "Warning: previous promise did not settle and was overwritten. " +
          "You've called \"" + requestedOperation + "\" while \"" + getNameOfCallInProgress() + "\" was already in progress and has not completed yet.");
    }
}
