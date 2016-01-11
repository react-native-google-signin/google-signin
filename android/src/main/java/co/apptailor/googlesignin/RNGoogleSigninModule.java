package co.apptailor.googlesignin;

import android.app.Activity;
import android.content.Intent;
import android.content.IntentSender;

import com.facebook.react.bridge.Arguments;
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
import com.google.android.gms.common.GooglePlayServicesUtil;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.OptionalPendingResult;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.common.api.Scope;


public class RNGoogleSigninModule
        extends ReactContextBaseJavaModule
        implements GoogleApiClient.OnConnectionFailedListener {

    private Activity _activity;
    private GoogleApiClient _apiClient;
    private static ReactApplicationContext _context;

    public static final int RC_SIGN_IN = 9001;

    public RNGoogleSigninModule(final ReactApplicationContext reactContext, Activity activity) {
        super(reactContext);
        _activity = activity;
        _context = reactContext;
    }

    @Override
    public String getName() {
        return "GoogleSignin";
    }

    @ReactMethod
    public void configure(final String clientID, final ReadableArray scopes) {
        _activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                _apiClient = new GoogleApiClient.Builder(_activity.getBaseContext())
//                        .enableAutoManage(_activity, RNGoogleSigninModule.this)
                        .addApi(Auth.GOOGLE_SIGN_IN_API, getSignInOptions(clientID, scopes))
                        .build();
                _apiClient.connect();
                start();
            }
        });
    }

    private GoogleSignInOptions getSignInOptions(final String clientID, final ReadableArray scopes) {

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

      if (clientID != null && !clientID.isEmpty()) {
        return new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
          .requestIdToken(clientID)
          .requestScopes(new Scope("email"), _scopes)
          .build();
      }
      else {
        return new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
          .requestScopes(new Scope("email"), _scopes)
          .build();
      }

    }

    @ReactMethod
    public void signIn() {
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
        Auth.GoogleSignInApi.signOut(_apiClient).setResultCallback(
                new ResultCallback<Status>() {
                    @Override
                    public void onResult(Status status) {

                    }
                });
    }

    public static void onActivityResult(Intent data) {
        GoogleSignInResult result = Auth.GoogleSignInApi.getSignInResultFromIntent(data);
        handleSignInResult(result);
    }

    @Override
    public void onConnectionFailed(ConnectionResult connectionResult) {
        if (!connectionResult.hasResolution()) {
            GooglePlayServicesUtil.getErrorDialog(connectionResult.getErrorCode(), _activity, 0).show();
            return;
        }

        try {
            connectionResult.startResolutionForResult(_activity, RC_SIGN_IN);
        } catch (IntentSender.SendIntentException e) {
            e.printStackTrace();
        }
    }

    private void start() {
        OptionalPendingResult<GoogleSignInResult> opr = Auth.GoogleSignInApi.silentSignIn(_apiClient);

        if (opr.isDone()) {
            GoogleSignInResult result = opr.get();
            handleSignInResult(result);
        } else {
            opr.setResultCallback(new ResultCallback<GoogleSignInResult>() {
                @Override
                public void onResult(GoogleSignInResult googleSignInResult) {
                    handleSignInResult(googleSignInResult);
                }
            });
        }
    }

    private static void handleSignInResult(GoogleSignInResult result) {
        WritableMap params = Arguments.createMap();
        WritableArray scopes = Arguments.createArray();

        if (result.isSuccess()) {
            GoogleSignInAccount acct = result.getSignInAccount();
            for(Scope scope : acct.getGrantedScopes()) {
                String scopeString = scope.toString();
                if (scopeString.startsWith("http")) {
                    scopes.pushString(scopeString);
                }
            }

            params.putString("id", acct.getId());
            params.putString("name", acct.getDisplayName());
            params.putString("email", acct.getEmail());
            params.putString("photo", acct.getPhotoUrl().toString());
            params.putString("accessToken", acct.getIdToken());
            params.putArray("scopes", scopes);

            _context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("googleSignIn", params);
        } else {
            int code = result.getStatus().getStatusCode();
            String error = GoogleSignInStatusCodes.getStatusCodeString(code);

            params.putInt("code", code);
            params.putString("error", error);

            _context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("googleSignInError", params);
        }
    }
}
