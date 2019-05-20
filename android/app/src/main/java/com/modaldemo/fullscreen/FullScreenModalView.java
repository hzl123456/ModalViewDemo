/*
 * FullScreenModalView.java
 * Copyright 2019 Qunhe Tech, all rights reserved.
 * Qunhe PROPRIETARY/CONFIDENTIAL, any form of usage is subject to approval.
 */
package com.modaldemo.fullscreen;

import android.app.Activity;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.support.annotation.Nullable;
import android.support.annotation.VisibleForTesting;
import android.text.TextUtils;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.view.accessibility.AccessibilityEvent;
import android.widget.FrameLayout;

import com.facebook.infer.annotation.Assertions;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.JSTouchDispatcher;
import com.facebook.react.uimanager.RootView;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.facebook.react.views.view.ReactViewGroup;
import com.modaldemo.R;

import java.util.ArrayList;

/**
 * @author linhe
 */
public class FullScreenModalView extends ViewGroup implements LifecycleEventListener {
    // This listener is called when the user presses KeyEvent.KEYCODE_BACK
    // An event is then passed to JS which can either close or not close the Modal by setting the
    // visible property
    public interface OnRequestCloseListener {
        void onRequestClose(DialogInterface dialog);
    }

    private DialogRootViewGroup mHostView;
    private @Nullable
    FullScreenDialog mDialog;
    private boolean mTransparent;
    private String mAnimationType;
    private boolean mHardwareAccelerated;
    // Set this flag to true if changing a particular property on the view requires a new Dialog to
    // be created.  For instance, animation does since it affects Dialog creation through the theme
    // but transparency does not since we can access the window to update the property.
    private boolean mPropertyRequiresNewDialog;
    private boolean isDarkMode = false; //默认状态栏为白底黑字
    private boolean autoKeyboard = false;
    private @Nullable
    DialogInterface.OnShowListener mOnShowListener;
    private @Nullable
    OnRequestCloseListener mOnRequestCloseListener;

    public FullScreenModalView(Context context) {
        super(context);
        ((ReactContext) context).addLifecycleEventListener(this);

        mHostView = new DialogRootViewGroup(context);
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        // Do nothing as we are laid out by UIManager
    }

    @Override
    public void addView(View child, int index) {
        mHostView.addView(child, index);
    }

    @Override
    public int getChildCount() {
        return mHostView.getChildCount();
    }

    @Override
    public View getChildAt(int index) {
        return mHostView.getChildAt(index);
    }

    @Override
    public void removeView(View child) {
        mHostView.removeView(child);
    }

    @Override
    public void removeViewAt(int index) {
        View child = getChildAt(index);
        mHostView.removeView(child);
    }

    @Override
    public void addChildrenForAccessibility(ArrayList<View> outChildren) {
        // Explicitly override this to prevent accessibility events being passed down to children
        // Those will be handled by the mHostView which lives in the dialog
    }

    @Override
    public boolean dispatchPopulateAccessibilityEvent(AccessibilityEvent event) {
        // Explicitly override this to prevent accessibility events being passed down to children
        // Those will be handled by the mHostView which lives in the dialog
        return false;
    }

    public void onDropInstance() {
        ((ReactContext) getContext()).removeLifecycleEventListener(this);
        dismiss();
    }

    private void dismiss() {
        if (mDialog != null) {
            mDialog.dismiss();
            mDialog = null;

            // We need to remove the mHostView from the parent
            // It is possible we are dismissing this dialog and reattaching the hostView to another
            ViewGroup parent = (ViewGroup) mHostView.getParent();
            parent.removeViewAt(0);
        }
    }

    protected void setAutoKeyboard(boolean autoKeyboard) {
        this.autoKeyboard = autoKeyboard;
    }

    protected void setDarkMode(boolean isDarkMode) {
        this.isDarkMode = isDarkMode;
    }

    protected void setOnRequestCloseListener(OnRequestCloseListener listener) {
        mOnRequestCloseListener = listener;
    }

    protected void setOnShowListener(DialogInterface.OnShowListener listener) {
        mOnShowListener = listener;
    }

    protected void setTransparent(boolean transparent) {
        mTransparent = transparent;
    }

    protected void setAnimationType(String animationType) {
        mAnimationType = animationType;
        mPropertyRequiresNewDialog = true;
    }

    protected void setHardwareAccelerated(boolean hardwareAccelerated) {
        mHardwareAccelerated = hardwareAccelerated;
        mPropertyRequiresNewDialog = true;
    }

    @Override
    public void onHostResume() {
        // We show the dialog again when the host resumes
        showOrUpdate();
    }

    @Override
    public void onHostPause() {
        // We dismiss the dialog and reconstitute it onHostResume
        dismiss();
    }

    @Override
    public void onHostDestroy() {
        // Drop the instance if the host is destroyed which will dismiss the dialog
        onDropInstance();
    }

    @VisibleForTesting
    public @Nullable
    Dialog getDialog() {
        return mDialog;
    }

    /**
     * showOrUpdate will display the Dialog.  It is called by the manager once all properties are set
     * because we need to know all of them before creating the Dialog.  It is also smart during
     * updates if the changed properties can be applied directly to the Dialog or require the
     * recreation of a new Dialog.
     */
    protected void showOrUpdate() {
        // If the existing Dialog is currently up, we may need to redraw it or we may be able to update
        // the property without having to recreate the dialog
        if (mDialog != null) {
            if (mPropertyRequiresNewDialog) {
                dismiss();
            } else {
                updateProperties();
                return;
            }
        }

        // Reset the flag since we are going to create a new dialog
        mPropertyRequiresNewDialog = false;
        int theme = R.style.Theme_FullScreenDialog;
        if (TextUtils.isEmpty(mAnimationType) || mAnimationType.equals("none")) {
            theme = R.style.Theme_FullScreenDialog;
        } else if (mAnimationType.equals("fade")) {
            theme = R.style.Theme_FullScreenDialogAnimatedFade;
        } else if (mAnimationType.equals("slide")) {
            theme = R.style.Theme_FullScreenDialogAnimatedSlide;
        }
        mDialog = new FullScreenDialog(getContext(), theme);
        mDialog.setDarkMode(isDarkMode);
        mDialog.setContentView(getContentView());
        updateProperties();

        mDialog.setOnShowListener(mOnShowListener);
        mDialog.setOnKeyListener(new DialogInterface.OnKeyListener() {
            @Override
            public boolean onKey(DialogInterface dialog, int keyCode, KeyEvent event) {
                if (event.getAction() == KeyEvent.ACTION_UP) {
                    // We need to stop the BACK button from closing the dialog by default so we capture that
                    // event and instead inform JS so that it can make the decision as to whether or not to
                    // allow the back button to close the dialog.  If it chooses to, it can just set visible
                    // to false on the Modal and the Modal will go away
                    if (keyCode == KeyEvent.KEYCODE_BACK) {
                        Assertions.assertNotNull(mOnRequestCloseListener, "setOnRequestCloseListener must be called " +
                                "by the manager");
                        mOnRequestCloseListener.onRequestClose(dialog);
                        return true;
                    } else {
                        // We redirect the rest of the key events to the current activity, since the activity
                        // expects to receive those events and react to them, ie. in the case of the dev menu
                        Activity currentActivity = ((ReactContext) getContext()).getCurrentActivity();
                        if (currentActivity != null) {
                            return currentActivity.onKeyUp(keyCode, event);
                        }
                    }
                }
                return false;
            }
        });

        int keyboardType = WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE;
        if (autoKeyboard) {
            keyboardType |= WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_VISIBLE;
        }
        mDialog.getWindow().setSoftInputMode(keyboardType);

        if (mHardwareAccelerated) {
            mDialog.getWindow().addFlags(WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED);
        }
        mDialog.show();
    }

    /**
     * Returns the view that will be the root view of the dialog. We are wrapping this in a
     * FrameLayout because this is the system's way of notifying us that the dialog size has changed.
     * This has the pleasant side-effect of us not having to preface all Modals with
     * "top: statusBarHeight", since that margin will be included in the FrameLayout.
     */
    private View getContentView() {
        FrameLayout frameLayout = new FrameLayout(getContext());
        frameLayout.setLayoutParams(new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
        frameLayout.addView(mHostView);
        return frameLayout;
    }

    /**
     * updateProperties will update the properties that do not require us to recreate the dialog
     * Properties that do require us to recreate the dialog should set mPropertyRequiresNewDialog to
     * true when the property changes
     */
    private void updateProperties() {
        Assertions.assertNotNull(mDialog, "mDialog must exist when we call updateProperties");

        if (mTransparent) {
            mDialog.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND);
        } else {
            mDialog.getWindow().setDimAmount(0.5f);
            mDialog.getWindow().setFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND,
                    WindowManager.LayoutParams.FLAG_DIM_BEHIND);
        }
    }

    /**
     * DialogRootViewGroup is the ViewGroup which contains all the children of a Modal.  It gets all
     * child information forwarded from FullScreenModalView and uses that to create children.  It is
     * also responsible for acting as a RootView and handling touch events.  It does this the same
     * way as ReactRootView.
     * <p>
     * To get layout to work properly, we need to layout all the elements within the Modal as if they
     * can fill the entire window.  To do that, we need to explicitly set the styleWidth and
     * styleHeight on the LayoutShadowNode to be the window size. This is done through the
     * UIManagerModule, and will then cause the children to layout as if they can fill the window.
     */
    static class DialogRootViewGroup extends ReactViewGroup implements RootView {
        private final JSTouchDispatcher mJSTouchDispatcher = new JSTouchDispatcher(this);

        public DialogRootViewGroup(Context context) {
            super(context);
        }

        @Override
        protected void onSizeChanged(final int w, final int h, int oldw, int oldh) {
            super.onSizeChanged(w, h, oldw, oldh);
            if (getChildCount() > 0) {
                final int viewTag = getChildAt(0).getId();
                ReactContext reactContext = (ReactContext) getContext();
                reactContext.runOnNativeModulesQueueThread(new Runnable() {
                    @Override
                    public void run() {
                        ((ReactContext) getContext()).getNativeModule(UIManagerModule.class)
                                .updateNodeSize(viewTag, w, h);
                    }
                });
            }
        }

        @Override
        public boolean onInterceptTouchEvent(MotionEvent event) {
            mJSTouchDispatcher.handleTouchEvent(event, getEventDispatcher());
            return super.onInterceptTouchEvent(event);
        }

        @Override
        public boolean onTouchEvent(MotionEvent event) {
            mJSTouchDispatcher.handleTouchEvent(event, getEventDispatcher());
            super.onTouchEvent(event);
            // In case when there is no children interested in handling touch event, we return true from
            // the root view in order to receive subsequent events related to that gesture
            return true;
        }

        @Override
        public void onChildStartedNativeGesture(MotionEvent androidEvent) {
            mJSTouchDispatcher.onChildStartedNativeGesture(androidEvent, getEventDispatcher());
        }

        @Override
        public void handleException(Throwable t) {
            ((ReactContext) getContext()).handleException(new RuntimeException(t));
        }

        @Override
        public void requestDisallowInterceptTouchEvent(boolean disallowIntercept) {
            // No-op - override in order to still receive events to onInterceptTouchEvent
            // even when some other view disallow that
        }

        private EventDispatcher getEventDispatcher() {
            ReactContext reactContext = (ReactContext) getContext();
            return reactContext.getNativeModule(UIManagerModule.class).getEventDispatcher();
        }
    }
}
