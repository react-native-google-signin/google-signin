package co.apptailor.googlesignin;

import android.net.Uri;
import android.support.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.common.Scopes;

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

        WritableArray scopes = Arguments.createArray();
        for(Scope scope : acct.getGrantedScopes()) {
            String scopeString = scope.toString();
            if (scopeString.startsWith("http")) {
                scopes.pushString(scopeString);
            }
        }

        WritableMap params = Arguments.createMap();
        params.putString("id", acct.getId());
        params.putString("name", acct.getDisplayName());
        params.putString("givenName", acct.getGivenName());
        params.putString("familyName", acct.getFamilyName());
        params.putString("email", acct.getEmail());
        params.putString("photo", photoUrl != null ? photoUrl.toString() : null);
        params.putString("idToken", acct.getIdToken());
        params.putString("serverAuthCode", acct.getServerAuthCode());
        params.putArray("scopes", scopes);
        return params;
    }

    static GoogleSignInOptions getSignInOptions(
            final Scope[] scopes,
            final String webClientId,
            final boolean offlineAcess,
            final boolean forceConsentPrompt,
            final String accountName,
            final String hostedDomain
    ) {
        GoogleSignInOptions.Builder googleSignInOptionsBuilder = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestScopes(new Scope(Scopes.EMAIL), scopes);
        if (webClientId != null && !webClientId.isEmpty()) {
            googleSignInOptionsBuilder.requestIdToken(webClientId);
            if (offlineAcess) {
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
}
