import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getTasks, deleteTask, resetTaskToPending, parseActions, Task, TaskStatus } from '../services/TaskService';
import { executeAction } from '../services/AccessibilityService';
import { createLog } from '../services/ActivityLogService';
import { getAccountById } from '../services/AccountService';
import { Colors, FontSize, Spacing, Radius } from '../utils/theme';

const STATUS_META: Record<TaskStatus, { color: string; label: string; icon: string }> = {
  pending:  { color: Colors.warning,  label: 'Pending',  icon: '🕐' },
  running:  { color: Colors.info,     label: 'Running',  icon: '⚡' },
  done:     { color: Colors.success,  label: 'Selesai',  icon: '✅' },
  failed:   { color: Colors.error,    label: 'Gagal',    icon: '❌' },
};



export default function TasksScreen() {
  const navigation = useNavigation<any>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setTasks(await getTasks()); } finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleRun = async (task: Task) => {
    setRunning(task.id);
    const actions = parseActions(task.action);
    try {
      const account = task.account_id ? await getAccountById(task.account_id) : null;
      const results: string[] = [];

      for (const action of actions) {
        const result = await executeAction(task.platform, action, task.url,
          action === 'comment' ? (task.comment_text ?? '') : '');
        results.push(result.message);
        await createLog({
          task_id: task.id, platform: task.platform, action,
          url: task.url, account_username: account?.username, status: 'success',
          result_message: result.message,
        });
      }

      await resetTaskToPending(task.id);
      await load();
      Alert.alert('Berhasil', results.join('\n'));
    } catch (e: any) {
      const actions2 = parseActions(task.action);
      await createLog({
        task_id: task.id, platform: task.platform, action: actions2[0] ?? 'like',
        url: task.url, status: 'failed', result_message: e.message,
      });
      Alert.alert('Gagal', e.message);
    } finally {
      setRunning(null);
    }
  };

  const handleDelete = (task: Task) => {
    Alert.alert('Hapus Task', 'Yakin hapus task ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => { await deleteTask(task.id); await load(); }},
    ]);
  };

  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} /> : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: Spacing.md, paddingBottom: 120 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>⚡</Text>
              <Text style={styles.emptyText}>Belum ada task</Text>
              <Text style={styles.emptySubtext}>Buat task baru untuk memulai otomatisasi</Text>
            </View>
          }
          renderItem={({ item }) => {
            const st = STATUS_META[item.status];
            const actions = parseActions(item.action);
            const actionIcons: Record<string, string> = { like: '❤️', comment: '💬', repost: '🔄' };
            const actionLabels = actions.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(' + ');
            const actionIconStr = actions.map(a => actionIcons[a] ?? '•').join(' ');
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={{ fontSize: 18 }}>{actionIconStr}</Text>
                  <Text style={styles.cardAction}>{actionLabels}</Text>
                  <Text style={{ fontSize: 14 }}>{item.platform === 'instagram' ? '📸' : '🎵'}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: st.color + '22' }]}>
                    <Text style={[styles.statusText, { color: st.color }]}>{st.icon} {st.label}</Text>
                  </View>
                </View>
                <Text style={styles.cardUrl} numberOfLines={1}>{item.url}</Text>
                {item.comment_text && <Text style={styles.commentPreview}>"{item.comment_text}"</Text>}
                {item.result_message && <Text style={styles.resultMsg}>{item.result_message}</Text>}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.runBtn, running === item.id && { opacity: 0.6 }]}
                    onPress={() => handleRun(item)} disabled={running !== null}>
                    {running === item.id
                      ? <ActivityIndicator color={Colors.text} size="small" />
                      : <Text style={styles.runBtnText}>▶ Jalankan</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                    <Text style={{ color: Colors.error }}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateTask')}>
        <Text style={styles.fabText}>+ Buat Task</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md,
    marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xs },
  cardAction: { flex: 1, fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  statusText: { fontSize: FontSize.xs, fontWeight: '600' },
  cardUrl: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xs },
  commentPreview: { fontSize: FontSize.sm, color: Colors.comment, fontStyle: 'italic', marginBottom: Spacing.xs },
  resultMsg: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.xs },
  cardActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  runBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: Radius.sm, padding: Spacing.sm, alignItems: 'center' },
  runBtnText: { color: Colors.text, fontWeight: '700', fontSize: FontSize.sm },
  deleteBtn: { padding: Spacing.sm, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.error + '44' },
  empty: { marginTop: 80, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { fontSize: FontSize.lg, color: Colors.text, fontWeight: '600' },
  emptySubtext: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  fab: {
    position: 'absolute', bottom: 24, left: Spacing.lg, right: Spacing.lg,
    backgroundColor: Colors.primary, borderRadius: Radius.full, padding: Spacing.md, alignItems: 'center',
  },
  fabText: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
});
