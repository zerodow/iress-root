package com.equix;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import android.content.res.Resources;
import android.os.Build;
import android.view.View;
import android.view.WindowInsets;
import android.util.Log;

public class DetectNavigationBar extends ReactContextBaseJavaModule {
    private View view;
    private WindowInsets windowInsets;
    private Resources resources;

    public DetectNavigationBar(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "DetectNavigationBar";
    }

    @ReactMethod
    public void getScreenHeight(final Promise promise) {
        promise.resolve(getRealScreenHeight());
    }

    private int getRealScreenHeight() {
        resources = getReactApplicationContext().getResources();
        int screenHeight = resources.getDisplayMetrics().heightPixels;

        if (this.classifyManufacturer()) {
            // Get navigation bar's height
            int navigationBarHeight = 0;
            int resourceId = resources.getIdentifier("navigation_bar_height", "dimen", "android");
            if (resourceId > 0) {
                navigationBarHeight = resources.getDimensionPixelSize(resourceId);
            }

            // Check if navigation bar is shown
            view = getCurrentActivity().getWindow().getDecorView();
            windowInsets = new WindowInsets(view.getRootWindowInsets());
            if (windowInsets.getSystemWindowInsetBottom() == 0) {
                return screenHeight + navigationBarHeight;
            }
        }
        return screenHeight;
    }

    private boolean classifyManufacturer() {
        switch (android.os.Build.MANUFACTURER) {
        case "Xiaomi":
            return true;
        default:
            return false;
        }
    }
}
