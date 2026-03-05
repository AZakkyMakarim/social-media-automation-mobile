import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Linking
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { isServiceEnabled, openAccessibilitySettings, checkAppInstalled } from '../services/AccessibilityService';
import { Colors, FontSize, Spacing, Radius } from '../utils/theme';

interface Permission {
  key: string;
  label: string;
  description: string;
  granted: boolean;
  onFix?: () => void;
}

export default function OnboardingScreen() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const checkPermissions = useCallback(async () => {
    setLoading(true);
    const serviceEnabled = await isServiceEnabled();
    const igInstalled = await checkAppInstalled('instagram');
    const ttInstalled = await checkAppInstalled('tiktok');

    setPermissions([
      {
        key: 'accessibility',
        label: 'Accessibility Service',
        description: 'Diperlukan untuk menjalankan Like, Comment, Repost',
        granted: serviceEnabled,
        onFix: () => openAccessibilitySettings(),
      },
      {
        key: 'instagram',
        label: 'Instagram App',
        description: 'Aplikasi Instagram harus terinstall di perangkat',
        granted: igInstalled,
        onFix: () => Linking.openURL('market://details?id=com.instagram.android'),
      },
      {
        key: 'tiktok',
        label: 'TikTok App',
        description: 'Aplikasi TikTok harus terinstall di perangkat',
        granted: ttInstalled,
        onFix: () => Linking.openURL('market://details?id=com.zhiliaoapp.musically'),
      },
    ]);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { checkPermissions(); }, [checkPermissions]));

  const allGranted = permissions.every((p) => p.granted);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Setup Diperlukan</Text>
      <Text style={styles.subtitle}>
        Aktifkan semua izin berikut agar app dapat bekerja.
      </Text>

      {loading ? (
        <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 32 }} />
      ) : (
        <>
          {permissions.map((perm) => (
            <View key={perm.key} style={[styles.card, perm.granted ? styles.cardGranted : styles.cardPending]}>
              <View style={styles.cardLeft}>
                <Text style={styles.statusIcon}>{perm.granted ? '✅' : '⚠️'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardLabel}>{perm.label}</Text>
                  <Text style={styles.cardDesc}>{perm.description}</Text>
                </View>
              </View>
              {!perm.granted && perm.onFix && (
                <TouchableOpacity style={styles.fixBtn} onPress={perm.onFix}>
                  <Text style={styles.fixBtnText}>Aktifkan</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {allGranted && (
            <View style={styles.allDoneCard}>
              <Text style={styles.allDoneText}>✅ Semua izin aktif! Kamu siap menggunakan app.</Text>
            </View>
          )}

          <TouchableOpacity style={styles.refreshBtn} onPress={checkPermissions}>
            <Text style={styles.refreshBtnText}>🔄 Refresh Status</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.xl },
  card: {
    borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  cardGranted: { backgroundColor: Colors.surfaceElevated, borderColor: Colors.success + '44' },
  cardPending: { backgroundColor: Colors.surfaceElevated, borderColor: Colors.warning + '66' },
  cardLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, gap: Spacing.sm },
  statusIcon: { fontSize: 22 },
  cardLabel: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  cardDesc: { fontSize: FontSize.sm, color: Colors.textSecondary },
  fixBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, marginLeft: Spacing.sm,
  },
  fixBtnText: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
  allDoneCard: {
    backgroundColor: Colors.success + '22', borderRadius: Radius.md, padding: Spacing.md,
    marginTop: Spacing.md, borderWidth: 1, borderColor: Colors.success + '44',
  },
  allDoneText: { color: Colors.success, fontSize: FontSize.md, fontWeight: '600' },
  refreshBtn: {
    marginTop: Spacing.lg, alignSelf: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
  },
  refreshBtnText: { color: Colors.textSecondary, fontSize: FontSize.md },
});
