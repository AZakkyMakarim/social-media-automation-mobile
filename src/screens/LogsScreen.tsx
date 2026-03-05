import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getLogs, clearLogs, ActivityLog } from '../services/ActivityLogService';
import { Colors, FontSize, Spacing, Radius } from '../utils/theme';

export default function LogsScreen() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const load = useCallback(async () => {
    setLogs(await getLogs());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleClear = () => {
    Alert.alert('Hapus Semua Log', 'Yakin hapus semua riwayat aktivitas?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => { await clearLogs(); await load(); }},
    ]);
  };

  const ACTION_ICON: Record<string, string> = { like: '❤️', comment: '💬', repost: '🔄' };
  const PLATFORM_ICON: Record<string, string> = { instagram: '📸', tiktok: '🎵' };

  return (
    <View style={styles.container}>
      {logs.length > 0 && (
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearBtnText}>🗑 Hapus Semua</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>Belum ada aktivitas</Text>
            <Text style={styles.emptySubtext}>Jalankan task untuk melihat log di sini</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { borderLeftColor: item.status === 'success' ? Colors.success : Colors.error, borderLeftWidth: 3 }]}>
            <View style={styles.cardHeader}>
              <Text style={{ fontSize: 18 }}>{PLATFORM_ICON[item.platform] ?? '•'}</Text>
              <Text style={{ fontSize: 18 }}>{ACTION_ICON[item.action] ?? '•'}</Text>
              <Text style={styles.action}>{item.action.charAt(0).toUpperCase() + item.action.slice(1)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: (item.status === 'success' ? Colors.success : Colors.error) + '22' }]}>
                <Text style={{ color: item.status === 'success' ? Colors.success : Colors.error, fontSize: FontSize.xs, fontWeight: '600' }}>
                  {item.status === 'success' ? '✅ Berhasil' : '❌ Gagal'}
                </Text>
              </View>
            </View>
            {item.account_username && (
              <Text style={styles.account}>@{item.account_username}</Text>
            )}
            <Text style={styles.url} numberOfLines={1}>{item.url}</Text>
            {item.result_message && <Text style={styles.result}>{item.result_message}</Text>}
            <Text style={styles.time}>{new Date(item.created_at).toLocaleString('id-ID')}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  clearBtn: { alignSelf: 'flex-end', margin: Spacing.md, padding: Spacing.sm },
  clearBtnText: { color: Colors.error, fontSize: FontSize.sm },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md,
    marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xs },
  action: { flex: 1, fontWeight: '600', color: Colors.text, fontSize: FontSize.md },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  account: { fontSize: FontSize.sm, color: Colors.primary, marginBottom: 2 },
  url: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 2 },
  result: { fontSize: FontSize.sm, color: Colors.textMuted, fontStyle: 'italic', marginBottom: 2 },
  time: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.xs },
  empty: { marginTop: 80, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { fontSize: FontSize.lg, color: Colors.text, fontWeight: '600' },
  emptySubtext: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
});
