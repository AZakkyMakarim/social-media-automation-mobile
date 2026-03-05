package com.azakkym.socialmediaautomationmobile.accessibility;

import android.accessibilityservice.AccessibilityService;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.accessibility.AccessibilityNodeInfo;
import java.util.List;

public class TikTokActionHandler {
    private static final String TAG = "TikTokActionHandler";
    private final AccessibilityService service;
    private final Handler handler = new Handler(Looper.getMainLooper());

    public TikTokActionHandler(AccessibilityService service) {
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
        
        List<AccessibilityNodeInfo> likeNodes = findNodesByDesc(root, "k5y"); // Typical TikTok like button class/desc but changes often
        if (likeNodes.isEmpty()) {
            likeNodes = findNodesByDesc(root, "Like");
        }
        
        if (!likeNodes.isEmpty()) {
            AccessibilityNodeInfo likeButton = likeNodes.get(0);
            if (!likeButton.isSelected()) {
                likeButton.performAction(AccessibilityNodeInfo.ACTION_CLICK);
                Log.d(TAG, "Clicked TikTok Like button");
            }
        }
    }

    private void performComment(String text) {
        AccessibilityNodeInfo root = service.getRootInActiveWindow();
        if (root == null) return;

        List<AccessibilityNodeInfo> commentNodes = findNodesByDesc(root, "Comment");

        if (!commentNodes.isEmpty()) {
            commentNodes.get(0).performAction(AccessibilityNodeInfo.ACTION_CLICK);
            
            handler.postDelayed(() -> {
                AccessibilityNodeInfo newRoot = service.getRootInActiveWindow();
                if (newRoot != null) {
                    List<AccessibilityNodeInfo> editTexts = newRoot.findAccessibilityNodeInfosByViewId("com.zhiliaoapp.musically:id/eg4"); // ID placeholder
                    if (editTexts.isEmpty()) {
                        editTexts = findNodesByText(newRoot, "Add comment...");
                    }
                    if (!editTexts.isEmpty()) {
                        AccessibilityNodeInfo editText = editTexts.get(0);
                        android.os.Bundle arguments = new android.os.Bundle();
                        arguments.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text);
                        editText.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, arguments);
                        
                        handler.postDelayed(() -> {
                            AccessibilityNodeInfo latestRoot = service.getRootInActiveWindow();
                            if(latestRoot != null) {
                                List<AccessibilityNodeInfo> postBtns = findNodesByDesc(latestRoot, "Send");
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

        List<AccessibilityNodeInfo> shareNodes = findNodesByDesc(root, "Share");

        if (!shareNodes.isEmpty()) {
            shareNodes.get(0).performAction(AccessibilityNodeInfo.ACTION_CLICK);
            
            handler.postDelayed(() -> {
                 AccessibilityNodeInfo newRoot = service.getRootInActiveWindow();
                 if(newRoot != null) {
                     List<AccessibilityNodeInfo> repostNodes = findNodesByText(newRoot, "Repost");
                     if(!repostNodes.isEmpty()) {
                         repostNodes.get(0).getParent().performAction(AccessibilityNodeInfo.ACTION_CLICK);
                     }
                 }
            }, 2000);
        }
    }

    private List<AccessibilityNodeInfo> findNodesByText(AccessibilityNodeInfo root, String text) {
        return root.findAccessibilityNodeInfosByText(text);
    }

    private List<AccessibilityNodeInfo> findNodesByDesc(AccessibilityNodeInfo root, String desc) {
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
}
