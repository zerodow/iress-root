package com.equix;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.UIImplementation;
import com.facebook.react.uimanager.UIImplementationProvider;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.ViewManager;
import com.facebook.react.uimanager.events.EventDispatcher;

import java.util.List;

/**
 * Created by idynopia on 24/05/2018.
 */


/**
 * Provides UIImplementation to use in {@link UIManagerModule}.
 */
public class CalendarUIImplementationProvider extends UIImplementationProvider {
    @Override
    public UIImplementation createUIImplementation(
            ReactApplicationContext reactContext,
            UIManagerModule.ViewManagerResolver viewManagerResolver,
            EventDispatcher eventDispatcher,
            int minTimeLeftInFrameForNonBatchedOperationMs) {
        return new CalendarUIImplementation(
                reactContext,
                viewManagerResolver,
                eventDispatcher,
                minTimeLeftInFrameForNonBatchedOperationMs);
    }

    @Override
    public UIImplementation createUIImplementation(
            ReactApplicationContext reactContext,
            List<ViewManager> viewManagerList,
            EventDispatcher eventDispatcher,
            int minTimeLeftInFrameForNonBatchedOperationMs) {
        return new CalendarUIImplementation(
                reactContext,
                viewManagerList,
                eventDispatcher,
                minTimeLeftInFrameForNonBatchedOperationMs);
    }
}