package com.azakkym.socialmediaautomationmobile.accessibility;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import android.content.Intent;
import android.provider.Settings;
import android.net.Uri;
import android.content.pm.PackageManager;

public class AccessibilityBridgeModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public AccessibilityBridgeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "AccessibilityBridge";
    }

    @ReactMethod
    public void isServiceEnabled(Promise promise) {
        SocialMediaAccessibilityService service = SocialMediaAccessibilityService.getInstance();
        promise.resolve(service != null);
    }

    @ReactMethod
    public void openAccessibilitySettings(Promise promise) {
        try {
            Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void checkAppInstalled(String platform, Promise promise) {
        String packageName = platform.equals("instagram") ? "com.instagram.android" : "com.zhiliaoapp.musically";
        PackageManager pm = reactContext.getPackageManager();
        try {
            pm.getPackageInfo(packageName, PackageManager.GET_ACTIVITIES);
            promise.resolve(true);
        } catch (PackageManager.NameNotFoundException e) {
            promise.resolve(false);
        }
    }
    
    @ReactMethod
    public void executeAction(String platform, String action, String url, String commentText, Promise promise) {
        SocialMediaAccessibilityService service = SocialMediaAccessibilityService.getInstance();
        if (service == null) {
            promise.reject("SERVICE_DISABLED", "Accessibility Service goes offline or disabled");
            return;
        }
        promise.resolve("Mock Execution Started in Recreated Module");
    }
}
