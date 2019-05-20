package com.modaldemo;

import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.modaldemo.fullscreen.util.AndroidBug5497Workaround;
import com.modaldemo.fullscreen.util.StatusBarUtil;

public class MainActivity extends ReactActivity {
    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "ModalDemo";
    }

    @Override
    protected void onCreate(final Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        StatusBarUtil.setTransparent(getWindow());
        StatusBarUtil.setLightMode(getWindow());
        AndroidBug5497Workaround.assistActivity(this);
    }
}
