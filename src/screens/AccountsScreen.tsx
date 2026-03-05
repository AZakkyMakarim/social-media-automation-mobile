import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, Modal, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAccounts, addAccount, deleteAccount, Account } from '../services/AccountService';
import { Colors, FontSize, Spacing, Radius } from '../utils/theme';

const PLATFORMS: Array<{ key: 'instagram' | 'tiktok'; label: string; icon: string }> = [
  { key: 'instagram', label: 'Instagram', icon: '📸' },
  { key: 'tiktok', label: 'TikTok', icon: '🎵' },
];

export default function AccountsScreen() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPlatform, setNewPlatform] = useState<'instagram' | 'tiktok'>('instagram');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAccounts();
      setAccounts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleAdd = async () => {
    if (!newUsername.trim()) { Alert.alert('Error', 'Username tidak boleh kosong'); return; }
    setSaving(true);
    try {
      await addAccount(newPlatform, newUsername.trim());
      setModalVisible(false);
      setNewUsername('');
      await load();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (account: Account) => {
    Alert.alert('Hapus Akun', `Hapus @${account.username}?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
        await deleteAccount(account.id);
        await load();
      }},
    ]);
  };

  const platformColor = (p: string) => p === 'instagram' ? Colors.instagram : Colors.tiktokAccent;
  const platformIcon = (p: string) => p === 'instagram' ? '📸' : '🎵';

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: Spacing.md, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>👤</Text>
              <Text style={styles.emptyText}>Belum ada akun tersimpan</Text>
              <Text style={styles.emptySubtext}>Tambahkan akun Instagram atau TikTok</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={[styles.platformBadge, { backgroundColor: platformColor(item.platform) + '22' }]}>
                <Text style={{ fontSize: 20 }}>{platformIcon(item.platform)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.username}>@{item.username}</Text>
                <Text style={[styles.platform, { color: platformColor(item.platform) }]}>
                  {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
                </Text>
              </View>
              <View style={[styles.statusBadge,
                { backgroundColor: item.status === 'active' ? Colors.success + '22' : Colors.error + '22' }]}>
                <Text style={{ color: item.status === 'active' ? Colors.success : Colors.error, fontSize: FontSize.xs }}>
                  {item.status === 'active' ? 'Aktif' : 'Expired'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                <Text style={{ color: Colors.error, fontSize: 18 }}>🗑</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* FAB Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ Tambah Akun</Text>
      </TouchableOpacity>

      {/* Add Account Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Tambah Akun</Text>

            <Text style={styles.modalLabel}>Platform</Text>
            <View style={styles.platformRow}>
              {PLATFORMS.map((p) => (
                <TouchableOpacity
                  key={p.key}
                  style={[styles.platformOption, newPlatform === p.key && styles.platformOptionActive]}
                  onPress={() => setNewPlatform(p.key)}>
                  <Text style={{ fontSize: 18 }}>{p.icon}</Text>
                  <Text style={[styles.platformOptionText,
                    { color: newPlatform === p.key ? Colors.primary : Colors.textSecondary }]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Username</Text>
            <TextInput
              style={styles.input}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="contoh: johndoe123"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setModalVisible(false); setNewUsername(''); }}>
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd} disabled={saving}>
                {saving ? <ActivityIndicator color={Colors.text} size="small" />
                  : <Text style={styles.saveBtnText}>Simpan</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md,
    marginBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  platformBadge: { width: 44, height: 44, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  username: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  platform: { fontSize: FontSize.sm, marginTop: 2 },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  deleteBtn: { padding: Spacing.xs },
  empty: { marginTop: 80, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { fontSize: FontSize.lg, color: Colors.text, fontWeight: '600' },
  emptySubtext: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  fab: {
    position: 'absolute', bottom: 24, left: Spacing.lg, right: Spacing.lg,
    backgroundColor: Colors.primary, borderRadius: Radius.full, padding: Spacing.md,
    alignItems: 'center',
  },
  fabText: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.xl, paddingBottom: 40,
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.lg },
  modalLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  platformRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  platformOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    padding: Spacing.sm, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
  },
  platformOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '22' },
  platformOptionText: { fontSize: FontSize.sm, fontWeight: '600' },
  input: {
    backgroundColor: Colors.surfaceElevated, borderRadius: Radius.sm, padding: Spacing.md,
    color: Colors.text, fontSize: FontSize.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg,
  },
  modalActions: { flexDirection: 'row', gap: Spacing.sm },
  cancelBtn: { flex: 1, padding: Spacing.md, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  cancelBtnText: { color: Colors.textSecondary, fontWeight: '600' },
  saveBtn: { flex: 1, padding: Spacing.md, borderRadius: Radius.sm, backgroundColor: Colors.primary, alignItems: 'center' },
  saveBtnText: { color: Colors.text, fontWeight: '700' },
});
