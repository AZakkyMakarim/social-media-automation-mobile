package com.azakkym.socialmediaautomationmobile.accessibility;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import android.content.Intent;
import android.provider.Settings;
import android.net.Uri;
import android.content.pm.PackageManager;
import android.content.ActivityNotFoundException;

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
        String[] packages = platform.equals("instagram") 
            ? new String[] {"com.instagram.android"} 
            : new String[] {"com.zhiliaoapp.musically", "com.ss.android.ugc.trill", "com.ss.android.ugc.aweme"};
            
        PackageManager pm = reactContext.getPackageManager();
        boolean installed = false;
        for (String pkg : packages) {
            try {
                pm.getPackageInfo(pkg, PackageManager.GET_ACTIVITIES);
                installed = true;
                break;
            } catch (PackageManager.NameNotFoundException e) {
                // Not found, check next
            }
        }
        promise.resolve(installed);
    }
    
    @ReactMethod
    public void executeAction(String platform, String action, String url, String commentText, Promise promise) {
        SocialMediaAccessibilityService service = SocialMediaAccessibilityService.getInstance();
        if (service == null) {
            promise.reject("SERVICE_DISABLED", "Accessibility Service goes offline or disabled");
            return;
        }
        
        try {
            service.startTask(platform, action, commentText);
            
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
            
            promise.resolve("Execution Started");
        } catch (ActivityNotFoundException e) {
            promise.reject("APP_NOT_FOUND", "Aplikasi tidak ditemukan untuk membuka URL ini");
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
}
