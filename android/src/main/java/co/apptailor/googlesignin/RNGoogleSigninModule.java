package co.apptailor.googlesignin;

import android.accounts.Account;
import android.app.Activity;
import android.content.Intent;
import android.os.AsyncTask;
import android.support.annotation.NonNull;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.auth.GoogleAuthUtil;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.auth.api.signin.GoogleSignInStatusCodes;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.android.gms.common.SignInButton;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.CommonStatusCodes;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;

import java.lang.ref.WeakReference;
import java.util.HashMap;
import java.util.Map;

import static co.apptailor.googlesignin.Utils.createScopesArray;
import static co.apptailor.googlesignin.Utils.getExceptionCode;
import static co.apptailor.googlesignin.Utils.getSignInOptions;
import static co.apptailor.googlesignin.Utils.getUserProperties;
import static co.apptailor.googlesignin.Utils.scopesToString;


public class RNGoogleSigninModule extends ReactContextBaseJavaModule {
    private GoogleSignInClient _apiClient;

    public static final int RC_SIGN_IN = 9001;
    public static final String MODULE_NAME = "RNGoogleSignin";
    public static final String ASYNC_OP_IN_PROGRESS = "ASYNC_OP_IN_PROGRESS";
    public static final String PLAY_SERVICES_NOT_AVAILABLE = "PLAY_SERVICES_NOT_AVAILABLE";

    private PromiseWrapper promiseWrapper;

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    public RNGoogleSigninModule(final ReactApplicationContext reactContext) {
        super(reactContext);
        promiseWrapper = new PromiseWrapper();
        reactContext.addActivityEventListener(new RNGoogleSigninActivityEventListener());
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("BUTTON_SIZE_ICON", SignInButton.SIZE_ICON_ONLY);
        constants.put("BUTTON_SIZE_STANDARD", SignInButton.SIZE_STANDARD);
        constants.put("BUTTON_SIZE_WIDE", SignInButton.SIZE_WIDE);
        constants.put("BUTTON_COLOR_AUTO", SignInButton.COLOR_AUTO);
        constants.put("BUTTON_COLOR_LIGHT", SignInButton.COLOR_LIGHT);
        constants.put("BUTTON_COLOR_DARK", SignInButton.COLOR_DARK);
        constants.put("SIGN_IN_CANCELLED", String.valueOf(GoogleSignInStatusCodes.SIGN_IN_CANCELLED));
        constants.put("SIGN_IN_REQUIRED", String.valueOf(CommonStatusCodes.SIGN_IN_REQUIRED));
        constants.put("IN_PROGRESS", ASYNC_OP_IN_PROGRESS);
        constants.put(PLAY_SERVICES_NOT_AVAILABLE, PLAY_SERVICES_NOT_AVAILABLE);
        return constants;
    }

    @ReactMethod
    public void playServicesAvailable(boolean showPlayServicesUpdateDialog, Promise promise) {
        Activity activity = getCurrentActivity();

        if (activity == null) {
            Log.w(MODULE_NAME, "could not determine playServicesAvailable, activity is null");
            promise.reject(MODULE_NAME, "activity is null");
            return;
        }

        GoogleApiAvailability googleApiAvailability = GoogleApiAvailability.getInstance();
        int status = googleApiAvailability.isGooglePlayServicesAvailable(activity);

        if (status != ConnectionResult.SUCCESS) {
            if (showPlayServicesUpdateDialog && googleApiAvailability.isUserResolvableError(status)) {
                googleApiAvailability.getErrorDialog(activity, status, 2404).show();
            }
            promise.reject(PLAY_SERVICES_NOT_AVAILABLE, "Play services not available");
        } else {
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void configure(
            final ReadableMap config,
            final Promise promise
    ) {
        final ReadableArray scopes = config.hasKey("scopes") ? config.getArray("scopes") : Arguments.createArray();
        final String webClientId = config.hasKey("webClientId") ? config.getString("webClientId") : null;
        final boolean offlineAccess = config.hasKey("offlineAccess") && config.getBoolean("offlineAccess");
        final boolean forceConsentPrompt = config.hasKey("forceConsentPrompt") && config.getBoolean("forceConsentPrompt");
        final String accountName = config.hasKey("accountName") ? config.getString("accountName") : null;
        final String hostedDomain = config.hasKey("hostedDomain") ? config.getString("hostedDomain") : null;

        GoogleSignInOptions options = getSignInOptions(createScopesArray(scopes), webClientId, offlineAccess, forceConsentPrompt, accountName, hostedDomain);
        _apiClient = GoogleSignIn.getClient(getReactApplicationContext(), options);
        promise.resolve(true);
    }

    @ReactMethod
    public void signInSilently(Promise promise) {
        if (_apiClient == null) {
            rejectWithNullClientError(promise);
            return;
        }
        String methodName = "signInSilently";
        boolean wasPromiseSet = promiseWrapper.setPromiseWithInProgressCheck(promise, methodName);
        if (!wasPromiseSet) {
            rejectWithAsyncOperationStillInProgress(promise, methodName);
            return;
        }

        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Task<GoogleSignInAccount> result = _apiClient.silentSignIn();
                if (result.isSuccessful()) {
                    // There's immediate result available.
                    handleSignInTaskResult(result);
                } else {
                    result.addOnCompleteListener(new OnCompleteListener() {
                        @Override
                        public void onComplete(Task task) {
                            handleSignInTaskResult(task);
                        }
                    });
                }
            }
        });
    }

    private void handleSignInTaskResult(Task<GoogleSignInAccount> result) {
        try {
            GoogleSignInAccount account = result.getResult(ApiException.class);
            WritableMap params = getUserProperties(account);
            new AccessTokenRetrievalTask(this).execute(params);
        } catch (ApiException e) {
            int code = e.getStatusCode();
            String errorDescription = GoogleSignInStatusCodes.getStatusCodeString(code);
            promiseWrapper.reject(String.valueOf(code), errorDescription);
        }
    }

    @ReactMethod
    public void signIn(Promise promise) {
        if (_apiClient == null) {
            rejectWithNullClientError(promise);
            return;
        }

        final Activity activity = getCurrentActivity();

        if (activity == null) {
            promise.reject(MODULE_NAME, "activity is null");
            return;
        }
        String methodName = "signIn";
        boolean wasPromiseSet = promiseWrapper.setPromiseWithInProgressCheck(promise, methodName);
        if (!wasPromiseSet) {
            rejectWithAsyncOperationStillInProgress(promise, methodName);
            return;
        }

        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Intent signInIntent = _apiClient.getSignInIntent();
                activity.startActivityForResult(signInIntent, RC_SIGN_IN);
            }
        });
    }

    private class RNGoogleSigninActivityEventListener extends BaseActivityEventListener {
        @Override
        public void onActivityResult(Activity activity, final int requestCode, final int resultCode, final Intent intent) {
            if (requestCode == RC_SIGN_IN) {
                // The Task returned from this call is always completed, no need to attach a listener.
                Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(intent);
                handleSignInTaskResult(task);
            }
        }
    }

    @ReactMethod
    public void signOut(final Promise promise) {
        if (_apiClient == null) {
            rejectWithNullClientError(promise);
            return;
        }

        _apiClient.signOut()
                .addOnCompleteListener(new OnCompleteListener<Void>() {
                    @Override
                    public void onComplete(@NonNull Task<Void> task) {
                        handleSignOutOrRevokeAccessTask(task, promise);
                    }
                });
    }

    private void handleSignOutOrRevokeAccessTask(@NonNull Task<Void> task, final Promise promise) {
        if (task.isSuccessful()) {
            promise.resolve(true);
        } else {
            int code = getExceptionCode(task);
            String errorDescription = GoogleSignInStatusCodes.getStatusCodeString(code);
            promise.reject(String.valueOf(code), errorDescription);
        }
    }

    @ReactMethod
    public void revokeAccess(final Promise promise) {
        if (_apiClient == null) {
            rejectWithNullClientError(promise);
            return;
        }

        _apiClient.revokeAccess()
                .addOnCompleteListener(new OnCompleteListener<Void>() {
                    @Override
                    public void onComplete(@NonNull Task<Void> task) {
                        handleSignOutOrRevokeAccessTask(task, promise);
                    }
                });
    }

    @ReactMethod
    public void isSignedIn(Promise promise) {
        boolean isSignedIn = GoogleSignIn.getLastSignedInAccount(getReactApplicationContext()) != null;
        promise.resolve(isSignedIn);
    }

    private static class AccessTokenRetrievalTask extends AsyncTask<WritableMap, Void, WritableMap> {

        private WeakReference<RNGoogleSigninModule> weakModuleRef;

        AccessTokenRetrievalTask(RNGoogleSigninModule module) {
            this.weakModuleRef = new WeakReference<>(module);
        }

        @Override
        protected WritableMap doInBackground(WritableMap... params) {
            WritableMap result = params[0];
            String mail = result.getMap("user").getString("email");
            RNGoogleSigninModule moduleInstance = weakModuleRef.get();
            if (moduleInstance == null) {
                return result;
            }
            try {
                String token = GoogleAuthUtil.getToken(moduleInstance.getReactApplicationContext(),
                        new Account(mail, "com.google"),
                        scopesToString(result.getArray("scopes")));
                result.putString("accessToken", token);
                return result;
            } catch (Exception e) {
                moduleInstance.promiseWrapper.reject(MODULE_NAME, e.getLocalizedMessage());
                return null;
            }
        }

        @Override
        protected void onPostExecute(WritableMap result) {
            super.onPostExecute(result);
            RNGoogleSigninModule moduleInstance = weakModuleRef.get();
            if (moduleInstance != null && result != null) {
                moduleInstance.promiseWrapper.resolve(result);
            }
        }
    }

    private void rejectWithNullClientError(Promise promise) {
        promise.reject(MODULE_NAME, "apiClient is null - call configure first");
    }

    private void rejectWithAsyncOperationStillInProgress(Promise promise, String requestedOperation) {
        promise.reject(ASYNC_OP_IN_PROGRESS, "Cannot set promise. You've called \"" + requestedOperation + "\" while \"" + promiseWrapper.getNameOfCallInProgress() + "\" is already in progress and has not completed yet. " +
                "Make sure you're not repeatedly calling signInSilently and signIn from your JS code while the previous call has not completed yet.");
    }

}
