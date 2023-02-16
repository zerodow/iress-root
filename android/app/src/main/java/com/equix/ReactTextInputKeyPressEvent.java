package com.equix;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.facebook.react.views.textinput.ReactTextInputEvent;

/**
 * Event emitted by EditText native view when key pressed
 */
public class ReactTextInputKeyPressEvent extends Event<ReactTextInputEvent> {

	public static final String EVENT_NAME = "topKeyPress";

	private String mKey;

	ReactTextInputKeyPressEvent(int viewId, final String key) {
		super(viewId);
		mKey = key;
	}

	@Override
	public String getEventName() {
		return EVENT_NAME;
	}

	@Override
	public boolean canCoalesce() {
		// We don't want to miss any textinput event, as event data is incremental.
		return false;
	}

	@Override
	public void dispatch(RCTEventEmitter rctEventEmitter) {
		rctEventEmitter.receiveEvent(getViewTag(), getEventName(), serializeEventData());
	}

	private WritableMap serializeEventData() {
		WritableMap eventData = Arguments.createMap();
		eventData.putString("key", mKey);

		return eventData;
	}
}
