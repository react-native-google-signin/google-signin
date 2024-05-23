package com.reactnativegooglesignin;

import static com.reactnativegooglesignin.SigninButtonEvent.EVENT_NAME;

import android.view.View;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIManagerHelper;
import com.facebook.react.uimanager.ViewManagerDelegate;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.google.android.gms.common.SignInButton;

import java.util.HashMap;
import java.util.Map;

public class RNGoogleSigninButtonViewManager extends SimpleViewManager<SignInButton> implements RNGoogleSigninButtonManagerInterface<SignInButton> {

    public static final String MODULE_NAME = "RNGoogleSigninButton";
    private final ViewManagerDelegate<SignInButton> mDelegate;

    private static final View.OnClickListener mOnClickListener = button -> {
        ReactContext reactContext = (ReactContext) button.getContext();

        int reactTag = button.getId();
        UIManagerHelper.getEventDispatcherForReactTag(reactContext, reactTag)
            .dispatchEvent(
                new SigninButtonEvent(UIManagerHelper.getSurfaceId(reactContext), reactTag));
    };

    @Override
    public Map<String, Object> getExportedCustomBubblingEventTypeConstants() {
        // fabric doesn't seem to need this but paper does
        Map<String, Object> baseEvents = super.getExportedCustomBubblingEventTypeConstants();
        Map<String, Object> eventTypeConstants = baseEvents == null ? new HashMap<>() : baseEvents;
        eventTypeConstants.put(
            EVENT_NAME,
            MapBuilder.of(
                "phasedRegistrationNames",
                MapBuilder.of("bubbled", "onPress")
            )
        );
        return eventTypeConstants;
    }

    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    public RNGoogleSigninButtonViewManager() {
        mDelegate = new RNGoogleSigninButtonManagerDelegate(this);
    }

    @Nullable
    @Override
    protected ViewManagerDelegate<SignInButton> getDelegate() {
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            return mDelegate;
        } else {
            return null;
        }
    }

    @NonNull
    @Override
    protected SignInButton createViewInstance(@NonNull final ThemedReactContext reactContext) {
        SignInButton button = new SignInButton(reactContext);
        return button;
    }

    @Override
    protected void addEventEmitters(@NonNull final ThemedReactContext reactContext, final SignInButton view) {
        view.setOnClickListener(mOnClickListener);
    }

    @Override
    @ReactProp(name = "size")
    public void setSize(SignInButton button, int size) {
        button.setSize(size);
    }

    @Override
    @ReactProp(name = "disabled")
    public void setDisabled(SignInButton button, boolean disabled) {
        button.setEnabled(!disabled);
    }

    @Override
    @ReactProp(name = "color")
    public void setColor(SignInButton button, @Nullable String value) {
        if (value == null) {
            button.setColorScheme(SignInButton.COLOR_AUTO);
        } else {
            int color = "dark".equals(value) ? SignInButton.COLOR_DARK : SignInButton.COLOR_LIGHT;
            button.setColorScheme(color);
        }
    }
}
