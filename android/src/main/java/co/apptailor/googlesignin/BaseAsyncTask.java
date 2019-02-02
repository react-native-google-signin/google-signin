package co.apptailor.googlesignin;

import android.os.AsyncTask;

import com.facebook.react.bridge.WritableMap;

import java.lang.ref.WeakReference;


public abstract class BaseAsyncTask extends AsyncTask<WritableMap, Void, WritableMap> {

    protected WeakReference<RNGoogleSigninModule> weakModuleRef;

    BaseAsyncTask(RNGoogleSigninModule module) {
        this.weakModuleRef = new WeakReference<>(module);
    }

    @Override
    protected void onPostExecute(WritableMap result) {
        super.onPostExecute(result);
        RNGoogleSigninModule moduleInstance = weakModuleRef.get();
        if (moduleInstance != null && result != null) {
            moduleInstance.getPromiseWrapper().resolve(result);
        }
    }
}