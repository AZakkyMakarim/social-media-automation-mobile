import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getTodayStats } from '../services/ActivityLogService';
import { getPendingTasks } from '../services/TaskService';
import { getAccounts } from '../services/AccountService';
import { isServiceEnabled } from '../services/AccessibilityService';
import { Colors, FontSize, Spacing, Radius } from '../utils/theme';

interface Stat {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState<Stat[]>([]);
  const [serviceOk, setServiceOk] = useState(false);

  const load = useCallback(async () => {
    const [todayStats, pendingTasks, accounts, svcEnabled] = await Promise.all([
      getTodayStats(),
      getPendingTasks(),
      getAccounts(),
      isServiceEnabled(),
    ]);
    setServiceOk(svcEnabled);
    setStats([
      { label: 'Aksi Hari Ini', value: todayStats.total, icon: '⚡', color: Colors.primary },
      { label: 'Berhasil', value: todayStats.success, icon: '✅', color: Colors.success },
      { label: 'Gagal', value: todayStats.failed, icon: '❌', color: Colors.error },
      { label: 'Task Pending', value: pendingTasks.length, icon: '🕐', color: Colors.warning },
      { label: 'Akun Aktif', value: accounts.filter((a) => a.status === 'active').length, icon: '👤', color: Colors.info },
    ]);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Banner */}
      <View style={[styles.banner, { backgroundColor: serviceOk ? Colors.success + '22' : Colors.warning + '22',
        borderColor: serviceOk ? Colors.success + '44' : Colors.warning + '44' }]}>
        <Text style={{ fontSize: 20 }}>{serviceOk ? '🟢' : '🟡'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.bannerTitle, { color: serviceOk ? Colors.success : Colors.warning }]}>
            {serviceOk ? 'Accessibility Service Aktif' : 'Accessibility Service Belum Aktif'}
          </Text>
          {!serviceOk && (
            <Text style={styles.bannerSub}>Buka tab Setup untuk mengaktifkan</Text>
          )}
        </View>
      </View>

      {/* Stats Grid */}
      <Text style={styles.sectionTitle}>Statistik</Text>
      <View style={styles.grid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('Tasks', { screen: 'CreateTask' })}>
        <Text style={{ fontSize: 24 }}>⚡</Text>
        <View>
          <Text style={styles.quickActionTitle}>Buat Task Baru</Text>
          <Text style={styles.quickActionSub}>Like, Comment, atau Repost</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('Accounts')}>
        <Text style={{ fontSize: 24 }}>👤</Text>
        <View>
          <Text style={styles.quickActionTitle}>Kelola Akun</Text>
          <Text style={styles.quickActionSub}>Tambah atau hapus akun</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('Setup')}>
        <Text style={{ fontSize: 24 }}>⚙️</Text>
        <View>
          <Text style={styles.quickActionTitle}>Setup & Izin</Text>
          <Text style={styles.quickActionSub}>Cek status permission</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.xl,
  },
  bannerTitle: { fontWeight: '700', fontSize: FontSize.md },
  bannerSub: { color: Colors.textSecondary, fontSize: FontSize.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  statCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
    width: '47%',
  },
  statIcon: { fontSize: 28, marginBottom: 4 },
  statValue: { fontSize: FontSize.xxxl, fontWeight: '800' },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
  quickAction: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md,
    marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  quickActionTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  quickActionSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  chevron: { fontSize: FontSize.xl, color: Colors.textMuted, marginLeft: 'auto' },
});
