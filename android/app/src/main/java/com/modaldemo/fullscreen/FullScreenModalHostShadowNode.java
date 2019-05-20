package com.modaldemo.fullscreen;

import android.graphics.Point;

import com.facebook.react.uimanager.LayoutShadowNode;
import com.facebook.react.uimanager.ReactShadowNodeImpl;

/**
 * @author linhe
 */
public class FullScreenModalHostShadowNode extends LayoutShadowNode {
    @Override
    public void addChildAt(ReactShadowNodeImpl child, int i) {
        super.addChildAt(child, i);
        Point modalSize = FullScreenModalHostHelper.getModalHostSize(getThemedContext());
        child.setStyleWidth(modalSize.x);
        child.setStyleHeight(modalSize.y);
    }
}