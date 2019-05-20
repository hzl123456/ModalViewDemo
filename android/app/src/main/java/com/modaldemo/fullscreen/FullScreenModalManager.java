package com.modaldemo.fullscreen;

import android.content.DialogInterface;
import android.support.annotation.Nullable;

import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.LayoutShadowNode;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import java.util.Map;

/**
 * @author linhe
 * 可以进行全屏显示的dialog，用来代替RN的modal
 */
public class FullScreenModalManager extends ViewGroupManager<FullScreenModalView> {
    @Override
    public String getName() {
        return "RCTFullScreenModalHostView";
    }

    public enum Events {
        ON_SHOW("onFullScreenShow"),
        ON_REQUEST_CLOSE("onFullScreenRequstClose");
        private final String mName;

        Events(final String name) {
            mName = name;
        }

        @Override
        public String toString() {
            return mName;
        }
    }

    @Override
    @Nullable
    public Map getExportedCustomDirectEventTypeConstants() {
        MapBuilder.Builder builder = MapBuilder.builder();
        for (Events event : Events.values()) {
            builder.put(event.toString(), MapBuilder.of("registrationName", event.toString()));
        }
        return builder.build();
    }

    @Override
    protected FullScreenModalView createViewInstance(ThemedReactContext reactContext) {
        final FullScreenModalView view = new FullScreenModalView(reactContext);
        final RCTEventEmitter mEventEmitter = reactContext.getJSModule(RCTEventEmitter.class);
        view.setOnRequestCloseListener(new FullScreenModalView.OnRequestCloseListener() {
            @Override
            public void onRequestClose(DialogInterface dialog) {
                mEventEmitter.receiveEvent(view.getId(), Events.ON_REQUEST_CLOSE.toString(), null);
            }
        });
        view.setOnShowListener(new DialogInterface.OnShowListener() {
            @Override
            public void onShow(DialogInterface dialog) {
                mEventEmitter.receiveEvent(view.getId(), Events.ON_SHOW.toString(), null);
            }
        });
        return view;
    }

    @Override
    public LayoutShadowNode createShadowNodeInstance() {
        return new FullScreenModalHostShadowNode();
    }

    @Override
    public Class<? extends LayoutShadowNode> getShadowNodeClass() {
        return FullScreenModalHostShadowNode.class;
    }

    @Override
    public void onDropViewInstance(FullScreenModalView view) {
        super.onDropViewInstance(view);
        view.onDropInstance();
    }

    @ReactProp(name = "autoKeyboard")
    public void setAutoKeyboard(FullScreenModalView view, boolean autoKeyboard) {
        view.setAutoKeyboard(autoKeyboard);
    }

    @ReactProp(name = "isDarkMode")
    public void setDarkMode(FullScreenModalView view, boolean isDarkMode) {
        view.setDarkMode(isDarkMode);
    }

    @ReactProp(name = "animationType")
    public void setAnimationType(FullScreenModalView view, String animationType) {
        view.setAnimationType(animationType);
    }

    @ReactProp(name = "transparent")
    public void setTransparent(FullScreenModalView view, boolean transparent) {
        view.setTransparent(transparent);
    }

    @ReactProp(name = "hardwareAccelerated")
    public void setHardwareAccelerated(FullScreenModalView view, boolean hardwareAccelerated) {
        view.setHardwareAccelerated(hardwareAccelerated);
    }

    @Override
    protected void onAfterUpdateTransaction(FullScreenModalView view) {
        super.onAfterUpdateTransaction(view);
        view.showOrUpdate();
    }
}

