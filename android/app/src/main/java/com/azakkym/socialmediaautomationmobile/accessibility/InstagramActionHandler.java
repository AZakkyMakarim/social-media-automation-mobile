package com.azakkym.socialmediaautomationmobile.accessibility;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.GestureDescription;
import android.graphics.Path;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import java.util.List;

public class InstagramActionHandler {
    private static final String TAG = "IGActionHandler";
    private final AccessibilityService service;
    private final Handler handler = new Handler(Looper.getMainLooper());

    public InstagramActionHandler(AccessibilityService service) {
        this.service = service;
    }

    public void executeAction(String action, String commentText) {
        if ("like".equals(action)) {
            performLike();
        } else if ("comment".equals(action)) {
            performComment(commentText);
        } else if ("repost".equals(action)) {
            performRepost();
        }
    }

    private void performLike() {
        AccessibilityNodeInfo root = service.getRootInActiveWindow();
        if (root == null) return;
        
        // Find like button. IG often uses content-desc "Like"
        List<AccessibilityNodeInfo> likeNodes = root.findAccessibilityNodeInfosByViewId("com.instagram.android:id/row_feed_button_like");
        if (likeNodes.isEmpty()) {
            likeNodes = findNodesByContentDescription(root, "Like");
        }
        
        if (!likeNodes.isEmpty()) {
            AccessibilityNodeInfo likeButton = likeNodes.get(0);
            if (!likeButton.isSelected()) {
                likeButton.performAction(AccessibilityNodeInfo.ACTION_CLICK);
                Log.d(TAG, "Clicked Like button");
            }
        }
    }

    private void performComment(String text) {
        AccessibilityNodeInfo root = service.getRootInActiveWindow();
        if (root == null) return;

        List<AccessibilityNodeInfo> commentNodes = root.findAccessibilityNodeInfosByViewId("com.instagram.android:id/row_feed_button_comment");
        if (commentNodes.isEmpty()) {
            commentNodes = findNodesByContentDescription(root, "Comment");
        }

        if (!commentNodes.isEmpty()) {
            commentNodes.get(0).performAction(AccessibilityNodeInfo.ACTION_CLICK);
            
            // Wait for comment box to appear and paste text
            handler.postDelayed(() -> {
                AccessibilityNodeInfo newRoot = service.getRootInActiveWindow();
                if (newRoot != null) {
                    List<AccessibilityNodeInfo> editTexts = newRoot.findAccessibilityNodeInfosByViewId("com.instagram.android:id/layout_comment_thread_edittext");
                    if (!editTexts.isEmpty()) {
                        AccessibilityNodeInfo editText = editTexts.get(0);
                        android.os.Bundle arguments = new android.os.Bundle();
                        arguments.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text);
                        editText.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, arguments);
                        
                        handler.postDelayed(() -> {
                            AccessibilityNodeInfo latestRoot = service.getRootInActiveWindow();
                            if(latestRoot != null) {
                                List<AccessibilityNodeInfo> postBtns = latestRoot.findAccessibilityNodeInfosByViewId("com.instagram.android:id/layout_comment_thread_post_button");
                                if(!postBtns.isEmpty()) {
                                    postBtns.get(0).performAction(AccessibilityNodeInfo.ACTION_CLICK);
                                }
                            }
                        }, 1000);
                    }
                }
            }, 2000);
        }
    }

    private void performRepost() {
         AccessibilityNodeInfo root = service.getRootInActiveWindow();
        if (root == null) return;

        List<AccessibilityNodeInfo> shareNodes = root.findAccessibilityNodeInfosByViewId("com.instagram.android:id/row_feed_button_share");
        if (shareNodes.isEmpty()) {
            shareNodes = findNodesByContentDescription(root, "Share");
        }

        if (!shareNodes.isEmpty()) {
            shareNodes.get(0).performAction(AccessibilityNodeInfo.ACTION_CLICK);
            
            handler.postDelayed(() -> {
                 AccessibilityNodeInfo newRoot = service.getRootInActiveWindow();
                 if(newRoot != null) {
                     List<AccessibilityNodeInfo> addToStory = findNodesByText(newRoot, "Add to story"); // Example, IG UI varies heavily
                     if(!addToStory.isEmpty()) {
                         addToStory.get(0).getParent().performAction(AccessibilityNodeInfo.ACTION_CLICK);
                     }
                 }
            }, 2000);
        }
    }

    private List<AccessibilityNodeInfo> findNodesByContentDescription(AccessibilityNodeInfo root, String desc) {
        // Basic recursive search for content description matching "desc"
        java.util.List<AccessibilityNodeInfo> result = new java.util.ArrayList<>();
        searchContentDesc(root, desc, result);
        return result;
    }
    
    private void searchContentDesc(AccessibilityNodeInfo node, String desc, List<AccessibilityNodeInfo> result) {
        if(node == null) return;
        if(node.getContentDescription() != null && node.getContentDescription().toString().contains(desc)) {
            result.add(node);
        }
        for(int i=0; i<node.getChildCount(); i++) {
            searchContentDesc(node.getChild(i), desc, result);
        }
    }

    private List<AccessibilityNodeInfo> findNodesByText(AccessibilityNodeInfo root, String text) {
        return root.findAccessibilityNodeInfosByText(text);
    }
}
