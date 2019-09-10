package co.apptailor.googlesignin;

import android.accounts.Account;
import android.app.Activity;
import android.content.Intent;
import android.os.AsyncTask;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

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
import com.google.android.gms.auth.GoogleAuthException;
import com.google.android.gms.auth.GoogleAuthUtil;
import com.google.android.gms.auth.UserRecoverableAuthException;
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

import java.io.IOException;
import java.lang.ref.WeakReference;
import java.util.HashMap;
import java.util.Map;

import static co.apptailor.googlesignin.PromiseWrapper.ASYNC_OP_IN_PROGRESS;
import static co.apptailor.googlesignin.Utils.createScopesArray;
import static co.apptailor.googlesignin.Utils.getExceptionCode;
import static co.apptailor.googlesignin.Utils.getSignInOptions;
import static co.apptailor.googlesignin.Utils.getUserProperties;
import static co.apptailor.googlesignin.Utils.scopesToString;


public class RNGoogleSigninModule extends ReactContextBaseJavaModule {
    private GoogleSignInClient _apiClient;

    public static final int RC_SIGN_IN = 9001;
    public static final int REQUEST_CODE_RECOVER_AUTH = 53294;
    public static final String MODULE_NAME = "RNGoogleSignin";
    public static final String PLAY_SERVICES_NOT_AVAILABLE = "PLAY_SERVICES_NOT_AVAILABLE";
    public static final String ERROR_USER_RECOVERABLE_AUTH = "ERROR_USER_RECOVERABLE_AUTH";
    private static final String SHOULD_RECOVER = "SHOULD_RECOVER";

    private PendingAuthRecovery pendingAuthRecovery;

    private PromiseWrapper promiseWrapper;

    public PromiseWrapper getPromiseWrapper() {
        return promiseWrapper;
    }

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
                int requestCode = 2404;
                googleApiAvailability.getErrorDialog(activity, status, requestCode).show();
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
        promise.resolve(null);
    }

    @ReactMethod
    public void signInSilently(Promise promise) {
        if (_apiClient == null) {
            rejectWithNullClientError(promise);
            return;
        }
        if (promiseWrapper.setPromiseWithInProgressCheck(promise, "signInSilently")) {
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
    }

    private void handleSignInTaskResult(Task<GoogleSignInAccount> result) {
        try {
            GoogleSignInAccount account = result.getResult(ApiException.class);
            if (account == null) {
                promiseWrapper.reject(MODULE_NAME, "GoogleSignInAccount instance was null");
            } else {
                WritableMap userParams = getUserProperties(account);
                promiseWrapper.resolve(userParams);
            }
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
        if (promiseWrapper.setPromiseWithInProgressCheck(promise, "signIn")) {
            UiThreadUtil.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Intent signInIntent = _apiClient.getSignInIntent();
                    activity.startActivityForResult(signInIntent, RC_SIGN_IN);
                }
            });
        }
    }

    private class RNGoogleSigninActivityEventListener extends BaseActivityEventListener {
        @Override
        public void onActivityResult(Activity activity, final int requestCode, final int resultCode, final Intent intent) {
            if (requestCode == RC_SIGN_IN) {
                // The Task returned from this call is always completed, no need to attach a listener.
                Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(intent);
                handleSignInTaskResult(task);
            } else if (requestCode == REQUEST_CODE_RECOVER_AUTH) {
                if (resultCode == Activity.RESULT_OK) {
                    rerunFailedAuthTokenTask();
                } else {
                    promiseWrapper.reject(MODULE_NAME, "Failed authentication recovery attempt, probably user-rejected.");
                }
            }
        }
    }

    private void rerunFailedAuthTokenTask() {
        WritableMap userProperties = pendingAuthRecovery.getUserProperties();
        if (userProperties != null) {
            new AccessTokenRetrievalTask(this).execute(userProperties, null);
        } else {
            // this is unlikely to happen, since we set the pendingRecovery in AccessTokenRetrievalTask
            promiseWrapper.reject(MODULE_NAME, "rerunFailedAuthTokenTask: recovery failed");
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
            promise.resolve(null);
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

    @ReactMethod
    public void getCurrentUser(Promise promise) {
        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(getReactApplicationContext());
        promise.resolve(account == null ? null : getUserProperties(account));
    }

    @ReactMethod
    public void clearCachedToken(String tokenToClear, Promise promise) {
        if (promiseWrapper.setPromiseWithInProgressCheck(promise, "clearCachedToken")) {
            new TokenClearingTask(this).execute(tokenToClear);
        }
    }

    @ReactMethod
    public void getTokens(final Promise promise) {
        final GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(getReactApplicationContext());
        if (account == null) {
            promise.reject(MODULE_NAME, "getTokens requires a user to be signed in");
            return;
        }

        if (promiseWrapper.setPromiseWithInProgressCheck(promise, "getTokens")) {
            startTokenRetrievalTaskWithRecovery(account);
        }
    }

    private void startTokenRetrievalTaskWithRecovery(GoogleSignInAccount account) {
        WritableMap userParams = getUserProperties(account);
        WritableMap recoveryParams = Arguments.createMap();
        recoveryParams.putBoolean(SHOULD_RECOVER, true);
        new AccessTokenRetrievalTask(this).execute(userParams, recoveryParams);
    }

    private static class AccessTokenRetrievalTask extends AsyncTask<WritableMap, Void, Void> {

        private WeakReference<RNGoogleSigninModule> weakModuleRef;

        AccessTokenRetrievalTask(RNGoogleSigninModule module) {
            this.weakModuleRef = new WeakReference<>(module);
        }

        @Override
        protected Void doInBackground(WritableMap... params) {
            WritableMap userProperties = params[0];
            final RNGoogleSigninModule moduleInstance = weakModuleRef.get();
            if (moduleInstance == null) {
                return null;
            }
            try {
                insertAccessTokenIntoUserProperties(moduleInstance, userProperties);
                moduleInstance.getPromiseWrapper().resolve(userProperties);
            } catch (Exception e) {
                WritableMap recoverySettings = params.length >= 2 ? params[1] : null;
                handleException(moduleInstance, e, userProperties, recoverySettings);
            }
            return null;
        }

        private void insertAccessTokenIntoUserProperties(RNGoogleSigninModule moduleInstance, WritableMap userProperties) throws IOException, GoogleAuthException {
            String mail = userProperties.getMap("user").getString("email");
            String token = GoogleAuthUtil.getToken(moduleInstance.getReactApplicationContext(),
                    new Account(mail, "com.google"),
                    scopesToString(userProperties.getArray("scopes")));

            userProperties.putString("accessToken", token);
        }

        private void handleException(RNGoogleSigninModule moduleInstance, Exception cause,
                                     WritableMap userProperties, @Nullable WritableMap settings) {
            boolean isRecoverable = cause instanceof UserRecoverableAuthException;
            if (isRecoverable) {
                boolean shouldRecover = settings != null
                        && settings.hasKey(SHOULD_RECOVER)
                        && settings.getBoolean(SHOULD_RECOVER);
                if (shouldRecover) {
                    attemptRecovery(moduleInstance, cause, userProperties);
                } else {
                    moduleInstance.promiseWrapper.reject(ERROR_USER_RECOVERABLE_AUTH, cause);
                }
            } else {
                moduleInstance.promiseWrapper.reject(MODULE_NAME, cause);
            }
        }

        private void attemptRecovery(RNGoogleSigninModule moduleInstance, Exception e, WritableMap userProperties) {
            Activity activity = moduleInstance.getCurrentActivity();
            if (activity == null) {
                moduleInstance.pendingAuthRecovery = null;
                moduleInstance.promiseWrapper.reject(MODULE_NAME,
                        "Cannot attempt recovery auth because app is not in foreground. "
                                + e.getLocalizedMessage());
            } else {
                moduleInstance.pendingAuthRecovery = new PendingAuthRecovery(userProperties);
                Intent recoveryIntent =
                        ((UserRecoverableAuthException) e).getIntent();
                activity.startActivityForResult(recoveryIntent, REQUEST_CODE_RECOVER_AUTH);
            }
        }
    }

    private static class TokenClearingTask extends AsyncTask<String, Void, Void> {

        private WeakReference<RNGoogleSigninModule> weakModuleRef;

        TokenClearingTask(RNGoogleSigninModule module) {
            this.weakModuleRef = new WeakReference<>(module);
        }

        @Override
        protected Void doInBackground(String... tokenToClear) {
            RNGoogleSigninModule moduleInstance = weakModuleRef.get();
            if (moduleInstance == null) {
                return null;
            }
            try {
                GoogleAuthUtil.clearToken(moduleInstance.getReactApplicationContext(), tokenToClear[0]);
                moduleInstance.getPromiseWrapper().resolve(null);
            } catch (Exception e) {
                moduleInstance.promiseWrapper.reject(MODULE_NAME, e);
            }
            return null;
        }
    }

    private void rejectWithNullClientError(Promise promise) {
        promise.reject(MODULE_NAME, "apiClient is null - call configure first");
    }

}
