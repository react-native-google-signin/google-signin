package co.apptailor.googlesignin;

import android.accounts.Account;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.util.Log;

import com.facebook.infer.annotation.Assertions;
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
import com.google.android.gms.auth.api.Auth;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInResult;
import com.google.android.gms.auth.api.signin.GoogleSignInStatusCodes;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.android.gms.common.SignInButton;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.GoogleApiClient.ConnectionCallbacks;
import com.google.android.gms.common.api.OptionalPendingResult;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Status;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static co.apptailor.googlesignin.Utils.createScopesArray;
import static co.apptailor.googlesignin.Utils.getSignInOptions;
import static co.apptailor.googlesignin.Utils.getUserProperties;
import static co.apptailor.googlesignin.Utils.scopesToString;


public class RNGoogleSigninModule extends ReactContextBaseJavaModule {
    private GoogleApiClient _apiClient;
    private Promise _signinPromise;

    public static final int RC_SIGN_IN = 9001;
    public static final String MODULE_NAME = "RNGoogleSignin";

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    public RNGoogleSigninModule(final ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(new RNGoogleSigninActivityEventListener());
    }

    private class RNGoogleSigninActivityEventListener extends BaseActivityEventListener {
        @Override
        public void onActivityResult(Activity activity, final int requestCode, final int resultCode, final Intent intent) {
            if (requestCode == RNGoogleSigninModule.RC_SIGN_IN) {
                GoogleSignInResult result = Auth.GoogleSignInApi.getSignInResultFromIntent(intent);
                handleSignInResult(result);
            }
        }
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
        return constants;
    }

    @ReactMethod
    public void playServicesAvailable(boolean autoresolve, Promise promise) {
        Activity activity = getCurrentActivity();

        if (activity == null) {
            Log.w(MODULE_NAME, "could not determine playServicesAvailable, activity is null");
            promise.reject(MODULE_NAME,  "activity is null");
            return;
        }
        _signinPromise = promise;

        GoogleApiAvailability googleApiAvailability = GoogleApiAvailability.getInstance();
        int status = googleApiAvailability.isGooglePlayServicesAvailable(activity);

        if (status != ConnectionResult.SUCCESS) {
            if (autoresolve && googleApiAvailability.isUserResolvableError(status)) {
                googleApiAvailability.getErrorDialog(activity, status, 2404).show();
            }
            reject(String.valueOf(status), "Play services not available");
        } else {
            resolve(true);
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
        _signinPromise = promise;

        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                _apiClient = new GoogleApiClient.Builder(getReactApplicationContext())
                        .addApi(Auth.GOOGLE_SIGN_IN_API, getSignInOptions(createScopesArray(scopes), webClientId, offlineAccess, forceConsentPrompt, accountName, hostedDomain))
                        .addConnectionCallbacks(new ConnectionCallbacks() {
                            @Override
                            public void onConnected(@Nullable Bundle bundle) {
                                // TODO vonovak we should dispatch an event to JS in this case
                                resolve(true);
                            }

                            @Override
                            public void onConnectionSuspended(int cause) {
                                // Called when the client is temporarily in a disconnected state. GoogleApiClient will automatically attempt to restore the connection.
                                // Applications should disable UI components that require the service, and wait for a call to onConnected(Bundle) to re-enable them.
                                // TODO vonovak we should dispatch an event to JS in this case
                            }
                        })
                        .addOnConnectionFailedListener(new GoogleApiClient.OnConnectionFailedListener() {
                            @Override
                            public void onConnectionFailed(@NonNull ConnectionResult connectionResult) {
                                reject(String.valueOf(connectionResult.getErrorCode()), connectionResult.getErrorMessage());
                            }
                        })
                        .build();
                _apiClient.connect();
            }
        });
    }

    @ReactMethod
    public void currentUserAsync(Promise promise) {
        if (_apiClient == null) {
            rejectWithNullClientError();
            return;
        }
        _signinPromise = promise;

        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                OptionalPendingResult<GoogleSignInResult> pendingResult = Auth.GoogleSignInApi.silentSignIn(_apiClient);

                if (pendingResult.isDone()) {
                    GoogleSignInResult result = pendingResult.get();
                    handleSignInResult(result);
                } else {
                    pendingResult.setResultCallback(new ResultCallback<GoogleSignInResult>() {
                        @Override
                        public void onResult(@NonNull GoogleSignInResult googleSignInResult) {
                            handleSignInResult(googleSignInResult);
                        }
                    });
                }
            }
        });
    }

    private void handleSignInResult(@NonNull GoogleSignInResult result) {
        if (result.getStatus().isSuccess()) {
            // since status is success, getSignInAccount() will return non-null value
            GoogleSignInAccount acct = Assertions.assertNotNull(result.getSignInAccount());
            WritableMap params = getUserProperties(acct);
            resolve(params);
        } else {
            int code = result.getStatus().getStatusCode();
            reject(String.valueOf(code), GoogleSignInStatusCodes.getStatusCodeString(code));
        }
    }

    @ReactMethod
    public void signIn(Promise promise) {
        if (_apiClient == null) {
            rejectWithNullClientError();
            return;
        }

        final Activity activity = getCurrentActivity();

        if (activity == null) {
            promise.reject(MODULE_NAME,  "activity is null");
            return;
        }

        _signinPromise = promise;

        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Intent signInIntent = Auth.GoogleSignInApi.getSignInIntent(_apiClient);
                activity.startActivityForResult(signInIntent, RC_SIGN_IN);
            }
        });
    }

    @ReactMethod
    public void signOut(final Promise promise) {
        if (_apiClient == null) {
            rejectWithNullClientError();
            return;
        }
        _signinPromise = promise;

        Auth.GoogleSignInApi.signOut(_apiClient).setResultCallback(new ResultCallback<Status>() {
            @Override
            public void onResult(@NonNull Status status) {
                if (status.isSuccess()) {
                    resolve(true);
                } else {
                    int code = status.getStatusCode();
                    reject(String.valueOf(code), GoogleSignInStatusCodes.getStatusCodeString(code));
                }
            }
        });
    }

    @ReactMethod
    public void revokeAccess(final Promise promise) {
        if (_apiClient == null) {
            rejectWithNullClientError();
            return;
        }
        _signinPromise = promise;

        Auth.GoogleSignInApi.revokeAccess(_apiClient).setResultCallback(new ResultCallback<Status>() {
            @Override
            public void onResult(@NonNull Status status) {
                if (status.isSuccess()) {
                    resolve( true);
                } else {
                    int code = status.getStatusCode();
                    reject(String.valueOf(code), GoogleSignInStatusCodes.getStatusCodeString(code));
                }
            }
        });
    }

    @ReactMethod
    public void getAccessToken(ReadableMap user, Promise promise) {
        Account acct = new Account(user.getString("email"), "com.google");

        try {
            String token = GoogleAuthUtil.getToken(getReactApplicationContext(), acct, scopesToString(user.getArray("scopes")));
            promise.resolve(token);
        } catch (IOException | GoogleAuthException e) {
            Log.e(MODULE_NAME, e.getLocalizedMessage());
            promise.reject(e);
        }
    }

    private void resolve(Object value) {
        if (_signinPromise == null) {
            Log.w(MODULE_NAME, "could not resolve promise because it's null");
            return;
        }

        _signinPromise.resolve(value);
        _signinPromise = null;
    }

    private void rejectWithNullClientError() {
        reject(MODULE_NAME,"apiClient is null - call configure first");
    }

    private void reject(String code, String message) {
        if (_signinPromise == null) {
            Log.w(MODULE_NAME, "could not reject promise because it's null");
            return;
        }

        _signinPromise.reject(code, message);
        _signinPromise = null;
    }

}
