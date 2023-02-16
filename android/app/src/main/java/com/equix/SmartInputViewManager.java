package com.equix;

import android.text.InputType;
import android.text.TextUtils;
import android.view.View;
import android.widget.EditText;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import android.text.TextWatcher;
import android.text.Editable;
import android.text.InputFilter;
import android.text.Spanned;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.annotation.Nullable;

public class SmartInputViewManager extends SimpleViewManager<EditText> {

    @Override
    public String getName() {
        return "SmartInputAndroid";
    }

    private Pattern mPattern = Pattern.compile(".*");
    private View internalView = null;
    private String oldText = "";

    protected InputFilter filter = new InputFilter() {

        @Override
        public CharSequence filter(CharSequence source, int start, int end, Spanned dest, int dstart, int dend) {
            String replacement = source.subSequence(start, end).toString();
            String newVal = dest.subSequence(0, dstart).toString() + replacement
                    + dest.subSequence(dend, dest.length()).toString();
            Matcher matcher = mPattern.matcher(newVal);
            if (matcher.matches())
                return null;

            if (TextUtils.isEmpty(source))
                return dest.subSequence(dstart, dend);
            else
                return "";
        }
    };

    @Override
    protected EditText createViewInstance(ThemedReactContext reactContext){
        EditText smartInput = new EditText(reactContext);

        smartInput.setFilters(new InputFilter[] { filter });

        smartInput.addTextChangedListener(new TextWatcher() {

            public void afterTextChanged(Editable s) {
                if(internalView == null)return;

                String newValue = s.toString();

                if(oldText.equals("")){
                    oldText = newValue;
                } else {
                    if (oldText.equals(newValue)){
                        return;
                    } else {
                        oldText = newValue;
                    }
                }

                WritableMap event = Arguments.createMap();
                event.putString("value", newValue);

                ReactContext reactContext = (ReactContext) internalView.getContext();
                reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                        internalView.getId(), "progress", event);
            }

            public void beforeTextChanged(CharSequence s, int start, int count, int after) { }

            public void onTextChanged(CharSequence s, int start, int before, int count) { }
        });

        smartInput.setOnFocusChangeListener(new View.OnFocusChangeListener() {
            @Override
            public void onFocusChange(View view, boolean hasFocus) {
                internalView = view;
            }
        });

        return smartInput;
    }

    @ReactProp(name = "value")
    public void setText(EditText smartInput,String value){
        smartInput.setText(value);
    }

    @ReactProp(name = "pattern")
    public void setPattern(EditText smartInput,String pattern){
        mPattern = Pattern.compile(pattern);
    }

    @ReactProp(name = "editable")
    public void setPattern(EditText smartInput,Boolean editable){
        smartInput.setEnabled(editable);
    }

    @ReactProp(name = "keyboard")
    public void setKeyboard(EditText smartInput,String keyboard){
        int inputType = InputType.TYPE_CLASS_TEXT;

        switch (keyboard){
            case "numeric":
                inputType = InputType.TYPE_NUMBER_FLAG_SIGNED;
                break;
            case "decimal-pad":
                inputType = InputType.TYPE_NUMBER_FLAG_DECIMAL;
                break;
            default:
                break;
        }

        smartInput.setInputType(inputType);
    }

    @Override
    public @Nullable Map getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.of(
                "progress",
                MapBuilder.of("registrationName", "onUpdate")
        );
    }

}
