package com.azakkym.socialmediaautomationmobile.accessibility;

import android.accessibilityservice.AccessibilityService;
import android.view.accessibility.AccessibilityEvent;
import android.util.Log;

public class SocialMediaAccessibilityService extends AccessibilityService {
    private static final String TAG = "SocialMediaAccess";
    private static SocialMediaAccessibilityService instance;
    
    private String currentPlatform = null;
    private String currentAction = null;
    private String currentComment = null;
    private boolean isTaskActive = false;

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        instance = this;
        Log.d(TAG, "Service Connected");
    }

    public static SocialMediaAccessibilityService getInstance() {
        return instance;
    }

    public void startTask(String platform, String action, String comment) {
        this.currentPlatform = platform;
        this.currentAction = action;
        this.currentComment = comment;
        this.isTaskActive = true;
        Log.d(TAG, "Task started: " + platform + " " + action);
    }

    public void finishTask() {
        Log.d(TAG, "Task finished or delegated to handler");
        isTaskActive = false;
        currentPlatform = null;
        currentAction = null;
        currentComment = null;
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (!isTaskActive) return;

        String packageName = event.getPackageName() != null ? event.getPackageName().toString() : "";
        
        if ("instagram".equals(currentPlatform) && packageName.contains("instagram")) {
            new InstagramActionHandler(this).executeAction(currentAction, currentComment);
            finishTask(); 
        } else if ("tiktok".equals(currentPlatform) && 
                  (packageName.contains("zhiliaoapp") || packageName.contains("aweme") || packageName.contains("trill"))) {
            new TikTokActionHandler(this).executeAction(currentAction, currentComment);
            finishTask();
        }
    }

    @Override
    public void onInterrupt() {
        Log.d(TAG, "Service Interrupted");
        finishTask();
    }
}
