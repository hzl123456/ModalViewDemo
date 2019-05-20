package com.modaldemo.fullscreen;

import android.app.Dialog;
import android.content.Context;
import android.support.annotation.NonNull;
import android.support.annotation.StyleRes;
import android.view.View;

import com.modaldemo.fullscreen.util.AndroidBug5497Workaround;
import com.modaldemo.fullscreen.util.StatusBarUtil;

/**
 * @author linhe
 * 一个可以全屏显示的弹窗控件，从状态栏处开始布局
 */
public class FullScreenDialog extends Dialog {
    private boolean isDarkMode;
    private View rootView;

    public void setDarkMode(boolean isDarkMode) {
        this.isDarkMode = isDarkMode;
    }

    public FullScreenDialog(@NonNull Context context, @StyleRes int themeResId) {
        super(context, themeResId);
    }

    @Override
    public void setContentView(@NonNull View view) {
        super.setContentView(view);
        this.rootView = view;
    }

    @Override
    public void show() {
        super.show();
        StatusBarUtil.setTransparent(getWindow());
        if (isDarkMode) {
            StatusBarUtil.setDarkMode(getWindow());
        } else {
            StatusBarUtil.setLightMode(getWindow());
        }
        AndroidBug5497Workaround.assistView(rootView, getWindow());
    }
}
