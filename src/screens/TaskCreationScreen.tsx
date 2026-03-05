import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { parseUrl, getPlatformLabel, getPlatformColor } from '../utils/urlParser';
import { getAccounts, Account } from '../services/AccountService';
import { createTask, TaskAction } from '../services/TaskService';
import { Colors, FontSize, Spacing, Radius } from '../utils/theme';

const ACTIONS: Array<{ key: TaskAction; label: string; icon: string; color: string }> = [
  { key: 'like', label: 'Like', icon: '❤️', color: Colors.like },
  { key: 'comment', label: 'Comment', icon: '💬', color: Colors.comment },
  { key: 'repost', label: 'Repost', icon: '🔄', color: Colors.repost },
];


export default function TaskCreationScreen() {
  const navigation = useNavigation<any>();
  const [url, setUrl] = useState('');
  const [selectedActions, setSelectedActions] = useState<TaskAction[]>([]);
  const [commentText, setCommentText] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const parsed = parseUrl(url);
  const filteredAccounts = accounts.filter((a) => a.platform === parsed.platform);
  const needsComment = selectedActions.includes('comment');

  useFocusEffect(useCallback(() => {
    getAccounts().then(setAccounts);
  }, []));

  const toggleAction = (key: TaskAction) => {
    setSelectedActions((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );
  };

  const handleCreate = async () => {
    if (!url.trim()) { Alert.alert('Error', 'Masukkan URL postingan'); return; }
    if (!parsed.isValid) { Alert.alert('Error', parsed.error || 'URL tidak valid'); return; }
    if (selectedActions.length === 0) { Alert.alert('Error', 'Pilih minimal satu aksi'); return; }
    if (!selectedAccountId) { Alert.alert('Error', 'Pilih akun yang akan digunakan'); return; }
    if (needsComment && !commentText.trim()) {
      Alert.alert('Error', 'Masukkan teks komentar'); return;
    }

    setSaving(true);
    try {
      await createTask({
        platform: parsed.platform as any,
        actions: selectedActions,
        url: parsed.originalUrl,
        post_id: parsed.postId ?? undefined,
        account_id: selectedAccountId,
        comment_text: needsComment ? commentText.trim() : undefined,
      });
      Alert.alert('Berhasil', 'Task berhasil dibuat!', [
        { text: 'OK', onPress: () => navigation.navigate('TaskQueue') }
      ]);
      setUrl('');
      setCommentText('');
      setSelectedActions([]);
      setSelectedAccountId(null);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">

      {/* URL */}
      <Text style={styles.sectionLabel}>URL Postingan</Text>
      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        placeholder="https://www.instagram.com/p/... atau tiktok.com/..."
        placeholderTextColor={Colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        multiline
      />
      {url.length > 0 && (
        <View style={[styles.urlPreview, {
          borderColor: parsed.isValid ? getPlatformColor(parsed.platform) + '44' : Colors.error + '44',
          backgroundColor: parsed.isValid ? getPlatformColor(parsed.platform) + '11' : Colors.error + '11',
        }]}>
          <Text style={{ color: parsed.isValid ? getPlatformColor(parsed.platform) : Colors.error, fontSize: FontSize.sm }}>
            {parsed.isValid
              ? `✅ ${getPlatformLabel(parsed.platform)} — Post ID: ${parsed.postId}`
              : `❌ ${parsed.error}`}
          </Text>
        </View>
      )}

      {/* Action Multi-Select */}
      <Text style={styles.sectionLabel}>Pilih Aksi</Text>
      <View style={styles.ruleHint}>
        {selectedActions.includes('comment') && (selectedActions.includes('like') || selectedActions.includes('repost'))
          ? <Text style={styles.ruleHintText}>📸 Screenshot 2x: Like/Repost screenshot pertama, Comment screenshot kedua.</Text>
          : <Text style={styles.ruleHintText}>💡 Bisa pilih kombinasi apapun. Like+Repost = 1 screenshot. Tambah Comment = screenshot tambahan.</Text>
        }
      </View>
      <View style={styles.actionRow}>
        {ACTIONS.map((a) => {
          const isSelected = selectedActions.includes(a.key);
          return (
            <TouchableOpacity
              key={a.key}
              style={[
                styles.actionBtn,
                isSelected && { borderColor: a.color, backgroundColor: a.color + '22' },
              ]}
              onPress={() => toggleAction(a.key)}>
              <Text style={{ fontSize: 24 }}>{a.icon}</Text>
              <Text style={[
                styles.actionLabel,
                { color: isSelected ? a.color : Colors.textSecondary }
              ]}>
                {a.label}
              </Text>
              {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: a.color }]}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Comment text — only shown when comment is selected */}
      {needsComment && (
        <>
          <Text style={styles.sectionLabel}>Teks Komentar</Text>
          <TextInput
            style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Tulis komentar di sini..."
            placeholderTextColor={Colors.textMuted}
            multiline
          />
        </>
      )}

      {/* Account selector */}
      <Text style={styles.sectionLabel}>Pilih Akun</Text>
      {!parsed.isValid && url.length > 4 ? (
        <Text style={styles.accountHint}>Masukkan URL valid untuk memilih akun</Text>
      ) : filteredAccounts.length === 0 ? (
        <Text style={styles.accountHint}>
          {parsed.isValid
            ? `Belum ada akun ${getPlatformLabel(parsed.platform)}. Tambahkan di tab Akun.`
            : 'Masukkan URL dulu untuk melihat akun tersedia'}
        </Text>
      ) : (
        filteredAccounts.map((acc) => (
          <TouchableOpacity
            key={acc.id}
            style={[styles.accountOption, selectedAccountId === acc.id && styles.accountOptionActive]}
            onPress={() => setSelectedAccountId(acc.id)}>
            <Text style={{ fontSize: 18 }}>{acc.platform === 'instagram' ? '📸' : '🎵'}</Text>
            <Text style={[styles.accountOptionText, { color: selectedAccountId === acc.id ? Colors.primary : Colors.text }]}>
              @{acc.username}
            </Text>
            {selectedAccountId === acc.id && <Text style={{ color: Colors.primary }}>✓</Text>}
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity
        style={[styles.createBtn, selectedActions.length === 0 && { opacity: 0.5 }]}
        onPress={handleCreate}
        disabled={saving || selectedActions.length === 0}>
        {saving
          ? <ActivityIndicator color={Colors.text} />
          : <Text style={styles.createBtnText}>
              ⚡ Buat Task {selectedActions.length > 0 ? `(${selectedActions.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(' + ')})` : ''}
            </Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 60 },
  sectionLabel: {
    fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.xs, marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.surface, borderRadius: Radius.sm, padding: Spacing.md,
    color: Colors.text, fontSize: FontSize.md, borderWidth: 1, borderColor: Colors.border,
  },
  urlPreview: { marginTop: Spacing.xs, padding: Spacing.sm, borderRadius: Radius.sm, borderWidth: 1 },
  ruleHint: {
    backgroundColor: Colors.primary + '15', borderRadius: Radius.sm, padding: Spacing.sm,
    marginBottom: Spacing.xs, borderWidth: 1, borderColor: Colors.primary + '30',
  },
  ruleHintText: { color: Colors.primaryLight, fontSize: FontSize.sm },
  actionRow: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    flex: 1, alignItems: 'center', padding: Spacing.md, borderRadius: Radius.sm,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface, gap: 4,
    position: 'relative',
  },
  actionBtnDisabled: { opacity: 0.4 },
  actionLabel: { fontSize: FontSize.sm, fontWeight: '600' },
  checkBadge: {
    position: 'absolute', top: 6, right: 6,
    width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  accountHint: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: Spacing.xs },
  accountOption: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.sm, marginBottom: Spacing.xs,
    borderWidth: 1, borderColor: Colors.border,
  },
  accountOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '11' },
  accountOptionText: { flex: 1, fontSize: FontSize.md, fontWeight: '500' },
  createBtn: {
    marginTop: Spacing.xl, backgroundColor: Colors.primary, borderRadius: Radius.full,
    padding: Spacing.md, alignItems: 'center',
  },
  createBtnText: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
});
