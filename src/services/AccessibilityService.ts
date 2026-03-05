import { NativeModules, Alert } from 'react-native';

const { AccessibilityBridge } = NativeModules;

export type Platform = 'instagram' | 'tiktok';
export type Action = 'like' | 'comment' | 'repost';

export interface ActionResult {
  success: boolean;
  message: string;
}

/**
 * Check if the Accessibility Service is currently running.
 * Returns false when running in Expo Go (native module not available).
 */
export async function isServiceEnabled(): Promise<boolean> {
  if (!AccessibilityBridge) return false;
  try {
    return await AccessibilityBridge.isServiceEnabled();
  } catch {
    return false;
  }
}

/**
 * Open Android Accessibility Settings so user can enable the service.
 */
export async function openAccessibilitySettings(): Promise<void> {
  if (!AccessibilityBridge) {
    Alert.alert(
      'Fitur Native Tidak Tersedia',
      'Kamu sedang menjalankan app di Expo Go.\n\nFitur Accessibility Service & deteksi app membutuhkan modul native Android. Silakan build APK terlebih dahulu menggunakan EAS Build.'
    );
    return;
  }
  await AccessibilityBridge.openAccessibilitySettings();
}

/**
 * Execute a social media action on the given post URL.
 */
export async function executeAction(
  platform: Platform,
  action: Action,
  url: string,
  commentText?: string
): Promise<ActionResult> {
  if (!AccessibilityBridge) {
    throw new Error('Native module tidak tersedia. Build APK diperlukan untuk fitur ini.');
  }
  return AccessibilityBridge.executeAction(platform, action, url, commentText ?? '');
}

/**
 * Check if the native Instagram or TikTok app is installed.
 */
export async function checkAppInstalled(platform: Platform): Promise<boolean> {
  if (!AccessibilityBridge) return false;
  try {
    return await AccessibilityBridge.checkAppInstalled(platform);
  } catch {
    return false;
  }
}
