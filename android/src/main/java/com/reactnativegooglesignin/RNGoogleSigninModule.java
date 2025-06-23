package com.reactnativegooglesignin;

import static com.reactnativegooglesignin.PromiseWrapper.ASYNC_OP_IN_PROGRESS;
import static com.reactnativegooglesignin.Utils.createScopesArray;
import static com.reactnativegooglesignin.Utils.getExceptionCode;
import static com.reactnativegooglesignin.Utils.getSignInOptions;
import static com.reactnativegooglesignin.Utils.getUserProperties;
import static com.reactnativegooglesignin.Utils.scopesToString;

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
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;

import java.io.IOException;
import java.lang.ref.WeakReference;
import java.util.HashMap;
import java.util.Map;

public class RNGoogleSigninModule extends NativeGoogleSigninSpec {
    private GoogleSignInClient _apiClient;

    public static final int RC_SIGN_IN = 9001;
    public static final int REQUEST_CODE_RECOVER_AUTH = 53294;
    public static final int REQUEST_CODE_ADD_SCOPES = 53295;
    public static final String PLAY_SERVICES_NOT_AVAILABLE = "PLAY_SERVICES_NOT_AVAILABLE";
    private static final String SHOULD_RECOVER = "SHOULD_RECOVER";

    private PendingAuthRecovery pendingAuthRecovery;

    private final PromiseWrapper signInOrAddScopesPromiseWrapper = new PromiseWrapper(NativeGoogleSigninSpec.NAME);
    private final PromiseWrapper silentSignInPromiseWrapper = new PromiseWrapper(NativeGoogleSigninSpec.NAME);
    private final PromiseWrapper tokenRetrievalPromiseWrapper = new PromiseWrapper(NativeGoogleSigninSpec.NAME);
    private final PromiseWrapper tokenClearingPromiseWrapper = new PromiseWrapper(NativeGoogleSigninSpec.NAME);

    public PromiseWrapper getTokenClearingPromiseWrapper() {
        return tokenClearingPromiseWrapper;
    }
    public PromiseWrapper getTokenRetrievalPromiseWrapper() {
        return tokenRetrievalPromiseWrapper;
    }

    public RNGoogleSigninModule(final ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(new RNGoogleSigninActivityEventListener());
    }

    @Override
    protected Map<String, Object> getTypedExportedConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("BUTTON_SIZE_ICON", SignInButton.SIZE_ICON_ONLY);
        constants.put("BUTTON_SIZE_STANDARD", SignInButton.SIZE_STANDARD);
        constants.put("BUTTON_SIZE_WIDE", SignInButton.SIZE_WIDE);
        constants.put("SIGN_IN_CANCELLED", String.valueOf(GoogleSignInStatusCodes.SIGN_IN_CANCELLED));
        constants.put("SIGN_IN_REQUIRED", String.valueOf(CommonStatusCodes.SIGN_IN_REQUIRED));
        constants.put("SCOPES_ALREADY_GRANTED", "NEVER_HAPPENS_ON_ANDROID");
        constants.put("ONE_TAP_START_FAILED", "ONE_TAP_START_FAILED");
        constants.put("NO_SAVED_CREDENTIAL_FOUND", "NO_SAVED_CREDENTIAL_FOUND");
        constants.put("IN_PROGRESS", ASYNC_OP_IN_PROGRESS);
        constants.put(PLAY_SERVICES_NOT_AVAILABLE, PLAY_SERVICES_NOT_AVAILABLE);

        return constants;
    }

    @ReactMethod
    public void playServicesAvailable(boolean showPlayServicesUpdateDialog, Promise promise) {
        Activity activity = getCurrentActivity();

        if (activity == null) {
            Log.w(NAME, "could not determine playServicesAvailable, activity is null");
            rejectWithNullActivity(promise);
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

    static void rejectWithNullActivity(Promise promise) {
        promise.reject(NAME, "activity is null");
    }

    @ReactMethod
    public void configure(
            final ReadableMap config,
            final Promise promise
    ) {
        final ReadableArray scopes = config.hasKey("scopes") ? config.getArray("scopes") : Arguments.createArray();
        final String webClientId = config.hasKey("webClientId") ? config.getString("webClientId") : null;
        final boolean offlineAccess = config.hasKey("offlineAccess") && config.getBoolean("offlineAccess");
        final boolean forceCodeForRefreshToken = config.hasKey("forceCodeForRefreshToken") && config.getBoolean("forceCodeForRefreshToken");
        final String accountName = config.hasKey("accountName") ? config.getString("accountName") : null;
        final String hostedDomain = config.hasKey("hostedDomain") ? config.getString("hostedDomain") : null;

        GoogleSignInOptions options = getSignInOptions(createScopesArray(scopes), webClientId, offlineAccess, forceCodeForRefreshToken, accountName, hostedDomain);
        _apiClient = GoogleSignIn.getClient(getReactApplicationContext(), options);
        promise.resolve(null);
    }

    @ReactMethod
    public void signInSilently(final Promise promise) {
        if (_apiClient == null) {
            rejectWithNullClientError(promise);
            return;
        }
        silentSignInPromiseWrapper.setPromiseWithInProgressCheck(promise, "signInSilently");
        UiThreadUtil.runOnUiThread(() -> {
            Task<GoogleSignInAccount> result = _apiClient.silentSignIn();
            if (result.isSuccessful()) {
                // There's an immediate result available.
                handleSignInTaskResult(result, silentSignInPromiseWrapper);
            } else {
                result.addOnCompleteListener((OnCompleteListener) task -> handleSignInTaskResult(task, silentSignInPromiseWrapper));
            }
        });
    }

    private void handleSignInTaskResult(Task<GoogleSignInAccount> result, final PromiseWrapper promiseWrapper) {
        try {
            GoogleSignInAccount account = result.getResult(ApiException.class);
            if (account == null) {
                promiseWrapper.reject("GoogleSignInAccount instance was null");
            } else {
                WritableMap userParams = getUserProperties(account);
                promiseWrapper.resolve(userParams);
            }
        } catch (ApiException e) {
            if (e.getStatusCode() == CommonStatusCodes.DEVELOPER_ERROR) {
                promiseWrapper.reject(String.valueOf(CommonStatusCodes.DEVELOPER_ERROR), "DEVELOPER_ERROR: Follow troubleshooting instructions at https://react-native-google-signin.github.io/docs/troubleshooting");
            } else {
                promiseWrapper.reject(e);
            }
        }
    }

    @ReactMethod
    public void signIn(final ReadableMap config, Promise promise) {
        if (_apiClient == null) {
            rejectWithNullClientError(promise);
            return;
        }

        final Activity activity = getCurrentActivity();

        if (activity == null) {
            rejectWithNullActivity(promise);
            return;
        }
        signInOrAddScopesPromiseWrapper.setPromiseWithInProgressCheck(promise, "signIn");
        UiThreadUtil.runOnUiThread(() -> {
            Intent signInIntent = _apiClient.getSignInIntent();
            activity.startActivityForResult(signInIntent, RC_SIGN_IN);
        });
    }

    @ReactMethod
    public void addScopes(final ReadableMap config, Promise promise) {
      final Activity activity = getCurrentActivity();
      if (activity == null) {
        rejectWithNullActivity(promise);
        return;
      }
      GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(getReactApplicationContext());
      if (account == null) {
        promise.resolve(false);
        return;
      }
      signInOrAddScopesPromiseWrapper.setPromiseWithInProgressCheck(promise, "addScopes");

      Scope[] scopeArr = createScopesArray(config.getArray("scopes"));

      GoogleSignIn.requestPermissions(
        activity, REQUEST_CODE_ADD_SCOPES, account, scopeArr);
    }

    private class RNGoogleSigninActivityEventListener extends BaseActivityEventListener {
        @Override
        public void onActivityResult(Activity activity, final int requestCode, final int resultCode, final Intent intent) {
            if (requestCode == RC_SIGN_IN) {
                // The Task returned from this call is always completed, no need to attach a listener.
                Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(intent);
                handleSignInTaskResult(task, signInOrAddScopesPromiseWrapper);
            } else if (requestCode == REQUEST_CODE_RECOVER_AUTH) {
                if (resultCode == Activity.RESULT_OK) {
                    rerunFailedAuthTokenTask();
                } else {
                    tokenRetrievalPromiseWrapper.reject("Failed authentication recovery attempt, probably user-rejected.");
                }
            } else if (requestCode == REQUEST_CODE_ADD_SCOPES) {
                if (resultCode == Activity.RESULT_OK) {
                  signInOrAddScopesPromiseWrapper.resolve(true);
                } else {
                  signInOrAddScopesPromiseWrapper.reject("Failed to add scopes.");
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
            tokenRetrievalPromiseWrapper.reject("rerunFailedAuthTokenTask: recovery failed");
        }
    }

    @ReactMethod
    public void signOut(final Promise promise) {
        if (_apiClient == null) {
            rejectWithNullClientError(promise);
            return;
        }

        _apiClient.signOut()
                .addOnCompleteListener(task -> handleSignOutOrRevokeAccessTask(task, promise));
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
                .addOnCompleteListener(task -> handleSignOutOrRevokeAccessTask(task, promise));
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public boolean hasPreviousSignIn() {
        boolean isSignedIn = GoogleSignIn.getLastSignedInAccount(getReactApplicationContext()) != null;
        return isSignedIn;
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public @Nullable WritableMap getCurrentUser() {
        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(getReactApplicationContext());
        return account == null ? null : getUserProperties(account);
    }

    @ReactMethod
    public void clearCachedAccessToken(String tokenToClear, Promise promise) {
        tokenClearingPromiseWrapper.setPromiseWithInProgressCheck(promise, "clearCachedAccessToken");
        new TokenClearingTask(this).execute(tokenToClear);
    }

    @ReactMethod
    public void getTokens(final Promise promise) {
        final GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(getReactApplicationContext());
        if (account == null) {
            promise.reject("getTokens", "getTokens requires a user to be signed in");
            return;
        }

        tokenRetrievalPromiseWrapper.setPromiseWithInProgressCheck(promise, "getTokens");
        startTokenRetrievalTaskWithRecovery(account);
    }

    private void startTokenRetrievalTaskWithRecovery(GoogleSignInAccount account) {
        WritableMap userParams = getUserProperties(account);
        WritableMap recoveryParams = Arguments.createMap();
        recoveryParams.putBoolean(SHOULD_RECOVER, true);
        new AccessTokenRetrievalTask(this).execute(userParams, recoveryParams);
    }

    private static class AccessTokenRetrievalTask extends AsyncTask<WritableMap, Void, Void> {

        private final WeakReference<RNGoogleSigninModule> weakModuleRef;

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
                moduleInstance.getTokenRetrievalPromiseWrapper().resolve(userProperties);
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
                    moduleInstance.getTokenRetrievalPromiseWrapper().reject(cause);
                }
            } else {
                moduleInstance.getTokenRetrievalPromiseWrapper().reject(cause);
            }
        }

        private void attemptRecovery(RNGoogleSigninModule moduleInstance, Exception e, WritableMap userProperties) {
            Activity activity = moduleInstance.getCurrentActivity();
            if (activity == null) {
                moduleInstance.pendingAuthRecovery = null;
                moduleInstance.getTokenRetrievalPromiseWrapper().reject("Cannot attempt recovery auth because app is not in foreground. "
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

        private final WeakReference<RNGoogleSigninModule> weakModuleRef;

        TokenClearingTask(RNGoogleSigninModule module) {
            this.weakModuleRef = new WeakReference<>(module);
        }

        @Override
        protected Void doInBackground(String... tokenToClear) {
            RNGoogleSigninModule moduleInstance = weakModuleRef.get();
            if (moduleInstance == null) {
                return null;
            }
            PromiseWrapper promiseWrapper = moduleInstance.getTokenClearingPromiseWrapper();
            try {
                GoogleAuthUtil.clearToken(moduleInstance.getReactApplicationContext(), tokenToClear[0]);
                promiseWrapper.resolve(null);
            } catch (Exception e) {
                promiseWrapper.reject(e);
            }
            return null;
        }
    }

    private void rejectWithNullClientError(Promise promise) {
        promise.reject(NAME, "apiClient is null - call configure() first");
    }

}
