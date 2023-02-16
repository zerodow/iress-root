package com.equix;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ShadowNodeRegistry;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIImplementation;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.ViewManager;
import com.facebook.react.uimanager.common.MeasureSpecProvider;
import com.facebook.react.uimanager.common.SizeMonitoringFrameLayout;
import com.facebook.react.uimanager.events.EventDispatcher;

import java.util.List;

import javax.annotation.Nullable;

/**
 * Created by idynopia on 24/05/2018.
 * We need to enforce thread safety, therefore we pass a lock
 */

public class CalendarUIImplementation extends UIImplementation {

    protected Object uiImplementationLock = new Object();
    protected boolean threadSafety = true;

    public CalendarUIImplementation(ReactApplicationContext reactContext, UIManagerModule.ViewManagerResolver viewManagerResolver, EventDispatcher eventDispatcher, int minTimeLeftInFrameForNonBatchedOperationMs) {
        super(reactContext, viewManagerResolver, eventDispatcher, minTimeLeftInFrameForNonBatchedOperationMs);
    }

    public CalendarUIImplementation(ReactApplicationContext reactContext, List<ViewManager> viewManagers, EventDispatcher eventDispatcher, int minTimeLeftInFrameForNonBatchedOperationMs) {
        super(reactContext, viewManagers, eventDispatcher, minTimeLeftInFrameForNonBatchedOperationMs);
    }

    public ShadowNodeRegistry getShadowNodeRegistry() {
        return mShadowNodeRegistry;
    }

    public boolean isThreadSafetyOn() {
        return threadSafety;
    }

    public void setThreadSafety(boolean threadSafety) {
        this.threadSafety = threadSafety;
    }


    @Override
    public void manageChildren(
            int viewTag,
            @Nullable ReadableArray moveFrom,
            @Nullable ReadableArray moveTo,
            @Nullable ReadableArray addChildTags,
            @Nullable ReadableArray addAtIndices,
            @Nullable ReadableArray removeFrom) {
        synchronized (uiImplementationLock) {
            super.manageChildren(viewTag, moveFrom, moveTo, addChildTags, addAtIndices, removeFrom);
        }
    }

    @Override
    public void setChildren(int viewTag, ReadableArray childrenTags) {
        if (threadSafety) {
            synchronized (uiImplementationLock) {
                super.setChildren(viewTag, childrenTags);
            }
        } else {
            super.setChildren(viewTag, childrenTags);
        }
    }

    @Override
    public void createView(int tag, String className, int rootViewTag, ReadableMap props) {
        if (threadSafety) {
            synchronized (uiImplementationLock) {
                super.createView(tag, className, rootViewTag, props);
            }
        } else {
            super.createView(tag, className, rootViewTag, props);
        }
    }

    @Override
    public void removeRootShadowNode(int rootViewTag) {
        if (threadSafety) {
            synchronized (uiImplementationLock) {
                super.removeRootShadowNode(rootViewTag);
            }
        } else {
            super.removeRootShadowNode(rootViewTag);
        }
    }

    @Override
    public <T extends SizeMonitoringFrameLayout & MeasureSpecProvider> void registerRootView(T rootView, int tag, ThemedReactContext context) {
        if (threadSafety) {
            synchronized (uiImplementationLock) {
                super.registerRootView(rootView, tag, context);
            }
        } else {
            super.registerRootView(rootView, tag, context);
        }
    }

}