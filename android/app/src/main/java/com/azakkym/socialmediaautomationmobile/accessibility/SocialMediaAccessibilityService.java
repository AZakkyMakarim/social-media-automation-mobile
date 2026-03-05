package com.azakkym.socialmediaautomationmobile.accessibility;

import android.accessibilityservice.AccessibilityService;
import android.view.accessibility.AccessibilityEvent;
import android.util.Log;

public class SocialMediaAccessibilityService extends AccessibilityService {
    private static final String TAG = "SocialMediaAccess";
    private static SocialMediaAccessibilityService instance;

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        // Not implemented for this stub
    }

    @Override
    public void onInterrupt() {
        Log.d(TAG, "Service Interrupted");
    }

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        instance = this;
        Log.d(TAG, "Service Connected");
    }

    public static SocialMediaAccessibilityService getInstance() {
        return instance;
    }
}
