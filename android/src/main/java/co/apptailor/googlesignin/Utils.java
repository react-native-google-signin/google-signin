package co.apptailor.googlesignin;

import android.net.Uri;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.CommonStatusCodes;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.common.Scopes;
import com.google.android.gms.tasks.Task;

public class Utils {

    static String scopesToString(ReadableArray scopes) {
        StringBuilder sb = new StringBuilder("oauth2:");
        for (int i = 0; i < scopes.size(); i++) {
            sb.append(scopes.getString(i)).append(" ");
        }
        return sb.toString().trim();
    }


    static WritableMap getUserProperties(@NonNull GoogleSignInAccount acct) {
        Uri photoUrl = acct.getPhotoUrl();

        WritableMap user = Arguments.createMap();
        user.putString("id", acct.getId());
        user.putString("name", acct.getDisplayName());
        user.putString("givenName", acct.getGivenName());
        user.putString("familyName", acct.getFamilyName());
        user.putString("email", acct.getEmail());
        user.putString("photo", photoUrl != null ? photoUrl.toString() : null);

        WritableMap params = Arguments.createMap();
        params.putMap("user", user);
        params.putString("idToken", acct.getIdToken());
        params.putString("serverAuthCode", acct.getServerAuthCode());

        WritableArray scopes = Arguments.createArray();
        for (Scope scope : acct.getGrantedScopes()) {
            String scopeString = scope.toString();
            if (scopeString.startsWith("http")) {
                scopes.pushString(scopeString);
            }
        }
        params.putArray("scopes", scopes);
        return params;
    }

    static GoogleSignInOptions getSignInOptions(
            final Scope[] scopes,
            final String webClientId,
            final boolean offlineAccess,
            final boolean forceConsentPrompt,
            final String accountName,
            final String hostedDomain
    ) {
        GoogleSignInOptions.Builder googleSignInOptionsBuilder = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestScopes(new Scope(Scopes.EMAIL), scopes);
        if (webClientId != null && !webClientId.isEmpty()) {
            googleSignInOptionsBuilder.requestIdToken(webClientId);
            if (offlineAccess) {
                googleSignInOptionsBuilder.requestServerAuthCode(webClientId, forceConsentPrompt);
            }
        }
        if (accountName != null && !accountName.isEmpty()) {
            googleSignInOptionsBuilder.setAccountName(accountName);
        }
        if (hostedDomain != null && !hostedDomain.isEmpty()) {
            googleSignInOptionsBuilder.setHostedDomain(hostedDomain);
        }
        return googleSignInOptionsBuilder.build();
    }

    @NonNull
    static Scope[] createScopesArray(ReadableArray scopes) {
        int size = scopes.size();
        Scope[] _scopes = new Scope[size];

        for (int i = 0; i < size; i++) {
            String scopeName = scopes.getString(i);
            _scopes[i] = new Scope(scopeName);
        }
        return _scopes;
    }

    public static int getExceptionCode(@NonNull Task<Void> task) {
        Exception e = task.getException();

        if (e instanceof ApiException) {
            ApiException exception = (ApiException) e;
            return exception.getStatusCode();
        }
        return CommonStatusCodes.INTERNAL_ERROR;
    }
}
