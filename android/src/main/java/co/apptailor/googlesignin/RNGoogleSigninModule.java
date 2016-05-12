package co.apptailor.googlesignin;

import android.app.Activity;
import android.content.Intent;
import android.content.IntentSender;
import android.net.Uri;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.gms.auth.api.Auth;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.auth.api.signin.GoogleSignInResult;
import com.google.android.gms.auth.api.signin.GoogleSignInStatusCodes;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.android.gms.common.SignInButton;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.OptionalPendingResult;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.common.api.Status;

import java.util.HashMap;
import java.util.Map;


public class RNGoogleSigninModule extends ReactContextBaseJavaModule {
    private Activity _activity;
    private GoogleApiClient _apiClient;
    private static ReactApplicationContext _context;

    public static final int RC_SIGN_IN = 9001;

    public RNGoogleSigninModule(final ReactApplicationContext reactContext, Activity activity) {
        super(reactContext);
        _activity = activity;
        _context = reactContext;
    }

    public static void onActivityResult(Intent data) {
        GoogleSignInResult result = Auth.GoogleSignInApi.getSignInResultFromIntent(data);
        handleSignInResult(result, false);
    }

    @Override
    public String getName() {
        return "RNGoogleSignin";
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
        GoogleApiAvailability googleApiAvailability = GoogleApiAvailability.getInstance();
        int status = googleApiAvailability.isGooglePlayServicesAvailable(_activity);

        if(status != ConnectionResult.SUCCESS) {
            promise.reject("" + status, "Play services not available");
            if(autoresolve && googleApiAvailability.isUserResolvableError(status)) {
                googleApiAvailability.getErrorDialog(_activity, status, 2404).show();
            }
        }
        else {
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void configure(final ReadableArray scopes, final String webClientId, final Boolean offlineAccess) {
        _activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                _apiClient = new GoogleApiClient.Builder(_activity.getBaseContext())
                        .addApi(Auth.GOOGLE_SIGN_IN_API, getSignInOptions(scopes, webClientId, offlineAccess))
                        .build();
                _apiClient.connect();
            }
        });
    }

    @ReactMethod
    public void currentUserAsync() {
        if (_apiClient == null) {
            emitError("RNGoogleSignInSilentError", -1, "GoogleSignin is undefined - call configure first");
            return;
        }

        _activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                OptionalPendingResult<GoogleSignInResult> opr = Auth.GoogleSignInApi.silentSignIn(_apiClient);

                if (opr.isDone()) {
                    GoogleSignInResult result = opr.get();
                    handleSignInResult(result, true);
                } else {
                    opr.setResultCallback(new ResultCallback<GoogleSignInResult>() {
                        @Override
                        public void onResult(GoogleSignInResult googleSignInResult) {
                            handleSignInResult(googleSignInResult, true);
                        }
                    });
                }
            }
        });
    }


    @ReactMethod
    public void signIn() {
        if (_apiClient == null) {
            emitError("RNGoogleSignInError", -1, "GoogleSignin is undefined - call configure first");
            return;
        }

        _activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Intent signInIntent = Auth.GoogleSignInApi.getSignInIntent(_apiClient);
                _activity.startActivityForResult(signInIntent, RC_SIGN_IN);
            }
        });
    }

    @ReactMethod
    public void signOut() {
        if (_apiClient == null) {
            emitError("RNGoogleSignOutError", -1, "GoogleSignin is undefined - call configure first");
            return;
        }

        Auth.GoogleSignInApi.signOut(_apiClient).setResultCallback(new ResultCallback<Status>() {
            @Override
            public void onResult(Status status) {
                if (status.isSuccess()) {
                    _context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("RNGoogleSignOutSuccess", null);
                } else {
                    int code = status.getStatusCode();
                    String error = GoogleSignInStatusCodes.getStatusCodeString(code);
                    emitError("RNGoogleSignOutError", code, error);
                }
            }
        });
    }

    @ReactMethod
    public void revokeAccess() {
        if (_apiClient == null) {
            emitError("RNGoogleRevokeError", -1, "GoogleSignin is undefined - call configure first");
            return;
        }

        Auth.GoogleSignInApi.revokeAccess(_apiClient).setResultCallback(new ResultCallback<Status>() {
            @Override
            public void onResult(Status status) {
                if (status.isSuccess()) {
                    _context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("RNGoogleRevokeSuccess", null);
                } else {
                    int code = status.getStatusCode();
                    String error = GoogleSignInStatusCodes.getStatusCodeString(code);
                    emitError("RNGoogleRevokeError", code, error);
                }
            }
        });
    }

    /* Private API */

    private void emitError(String eventName, int code, String error) {
        WritableMap params = Arguments.createMap();
        params.putInt("code", code);
        params.putString("error", error);
        _context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    private GoogleSignInOptions getSignInOptions(final ReadableArray scopes, final String webClientId, final Boolean offlineAcess) {

        int size = scopes.size();
        Scope[] _scopes = new Scope[size];

        if(scopes != null && size > 0){
            for(int i = 0; i < size; i++){
                if(scopes.getType(i).name() == "String"){
                    String scope = scopes.getString(i);
                    if (scope != "email"){ // will be added by default
                        _scopes[i] = new Scope(scope);
                    }
                }
            }
        }

        if (webClientId != null && !webClientId.isEmpty()) {
            if (!offlineAcess) {
                return new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                        .requestIdToken(webClientId)
                        .requestScopes(new Scope("email"), _scopes)
                        .build();
            }
            else {
                return new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                        .requestServerAuthCode(webClientId, false)
                        .requestScopes(new Scope("email"), _scopes)
                        .build();
            }
        }
        else {
            return new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                    .requestScopes(new Scope("email"), _scopes)
                    .build();
        }

    }

    private static void handleSignInResult(GoogleSignInResult result, Boolean isSilent) {
        WritableMap params = Arguments.createMap();
        WritableArray scopes = Arguments.createArray();

        if (result.isSuccess()) {
            GoogleSignInAccount acct = result.getSignInAccount();
            Uri photoUrl = acct.getPhotoUrl();

            for(Scope scope : acct.getGrantedScopes()) {
                String scopeString = scope.toString();
                if (scopeString.startsWith("http")) {
                    scopes.pushString(scopeString);
                }
            }

            params.putString("id", acct.getId());
            params.putString("name", acct.getDisplayName());
            params.putString("email", acct.getEmail());
            params.putString("photo", photoUrl != null ? photoUrl.toString() : null);
            params.putString("idToken", acct.getIdToken());
            params.putString("serverAuthCode", acct.getServerAuthCode());
            params.putArray("scopes", scopes);

            _context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(isSilent ? "RNGoogleSignInSilentSuccess" : "RNGoogleSignInSuccess" , params);
        } else {
            int code = result.getStatus().getStatusCode();
            String error = GoogleSignInStatusCodes.getStatusCodeString(code);

            params.putInt("code", code);
            params.putString("error", error);

            _context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(isSilent ? "RNGoogleSignInSilentError" : "RNGoogleSignInError", params);
        }
    }
}
