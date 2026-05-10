import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Switch, Modal, TextInput, Alert, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../utils/theme';
import { Card, GradientButton } from '../components/UIComponents';
import { getReminders, saveReminder, deleteReminder } from '../services/storage';

const FREQUENCY_OPTIONS = [
  { id: 'daily', label: 'Her Gün' },
  { id: 'every2days', label: '2 Günde Bir' },
  { id: 'weekly', label: 'Haftada Bir' },
  { id: 'biweekly', label: '2 Haftada Bir' },
];

const ICONS = ['🧪', '💧', '⚡', '🔄', '🌡️', '🌱', '📊', '🔬', '🌿', '⏰'];
const COLORS_LIST = [Colors.primary, Colors.secondary, Colors.accent, Colors.warning, Colors.danger, '#A78BFA', '#F472B6'];

export default function RemindersScreen({ navigation }) {
  const [reminders, setReminders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', frequency: 'daily', time: '09:00',
    icon: '💧', enabled: true, color: Colors.primary,
  });

  useEffect(() => {
    loadReminders();
    const unsub = navigation.addListener('focus', loadReminders);
    return unsub;
  }, [navigation]);

  async function loadReminders() {
    const data = await getReminders();
    setReminders(data);
  }

  const openAdd = () => {
    setEditingReminder(null);
    setForm({ title: '', description: '', frequency: 'daily', time: '09:00', icon: '💧', enabled: true, color: Colors.primary });
    setShowModal(true);
  };

  const openEdit = (rem) => {
    setEditingReminder(rem);
    setForm({ ...rem });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title) {
      Alert.alert('Eksik Bilgi', 'Hatırlatıcı başlığını girin.');
      return;
    }
    await saveReminder(editingReminder ? { ...form, id: editingReminder.id } : form);
    await loadReminders();
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    Alert.alert('Sil', 'Bu hatırlatıcıyı silmek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        await deleteReminder(id);
        await loadReminders();
      }},
    ]);
  };

  const toggleEnabled = async (rem) => {
    await saveReminder({ ...rem, enabled: !rem.enabled });
    await loadReminders();
  };

  const frequencyLabel = (f) => FREQUENCY_OPTIONS.find(o => o.id === f)?.label || f;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Hatırlatıcılar</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <LinearGradient colors={['#0A2340', '#061828']} style={styles.infoCard}>
        <Text style={styles.infoIcon}>⏰</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>Akıllı Hatırlatıcılar</Text>
          <Text style={styles.infoSub}>pH, EC ve bakım zamanlarınızı asla kaçırmayın</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {reminders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>⏰</Text>
              <Text style={styles.emptyTitle}>Hatırlatıcı yok</Text>
              <Text style={styles.emptySub}>İlk hatırlatıcını ekle</Text>
              <GradientButton title="+ Hatırlatıcı Ekle" onPress={openAdd} style={{ marginTop: 16 }} />
            </View>
          ) : (
            reminders.map(rem => (
              <Card key={rem.id} style={[styles.remCard, { borderLeftColor: rem.color, borderLeftWidth: 3 }]}>
                <View style={styles.remRow}>
                  <View style={[styles.remIcon, { backgroundColor: rem.color + '20' }]}>
                    <Text style={{ fontSize: 22 }}>{rem.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.remTitle}>{rem.title}</Text>
                    <Text style={styles.remDesc}>{rem.description}</Text>
                    <View style={styles.remMeta}>
                      <Text style={[styles.remFreq, { color: rem.color }]}>{frequencyLabel(rem.frequency)}</Text>
                      <Text style={styles.remDot}>·</Text>
                      <Text style={styles.remTime}>{rem.time}</Text>
                    </View>
                  </View>
                  <Switch
                    value={rem.enabled}
                    onValueChange={() => toggleEnabled(rem)}
                    trackColor={{ false: Colors.surfaceHigh, true: rem.color + '80' }}
                    thumbColor={rem.enabled ? rem.color : Colors.textMuted}
                  />
                </View>
                <View style={styles.remActions}>
                  <TouchableOpacity style={styles.remActionBtn} onPress={() => openEdit(rem)}>
                    <Text style={styles.remActionText}>✏️ Düzenle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.remActionBtn} onPress={() => handleDelete(rem.id)}>
                    <Text style={[styles.remActionText, { color: Colors.danger }]}>🗑️ Sil</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingReminder ? '✏️ Düzenle' : '+ Yeni Hatırlatıcı'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Başlık (örn: pH Ölçümü)"
              placeholderTextColor={Colors.textMuted}
              value={form.title}
              onChangeText={t => setForm(f => ({ ...f, title: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Açıklama"
              placeholderTextColor={Colors.textMuted}
              value={form.description}
              onChangeText={t => setForm(f => ({ ...f, description: t }))}
            />

            <Text style={styles.label}>Sıklık</Text>
            <View style={styles.optionRow}>
              {FREQUENCY_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optBtn, form.frequency === opt.id && { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow }]}
                  onPress={() => setForm(f => ({ ...f, frequency: opt.id }))}
                >
                  <Text style={[styles.optBtnText, form.frequency === opt.id && { color: Colors.primary }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>İkon</Text>
            <View style={styles.iconRow}>
              {ICONS.map(icon => (
                <TouchableOpacity
                  key={icon}
                  style={[styles.iconBtn, form.icon === icon && styles.iconBtnSelected]}
                  onPress={() => setForm(f => ({ ...f, icon }))}
                >
                  <Text style={{ fontSize: 20 }}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Renk</Text>
            <View style={styles.colorRow}>
              {COLORS_LIST.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorDot, { backgroundColor: c }, form.color === c && styles.colorDotSelected]}
                  onPress={() => setForm(f => ({ ...f, color: c }))}
                />
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>İptal</Text>
              </TouchableOpacity>
              <GradientButton title="Kaydet" onPress={handleSave} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: 12,
  },
  backBtn: { color: Colors.primary, fontSize: Typography.base },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
  addBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: Colors.textInverse, fontSize: 22, fontWeight: Typography.bold },
  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: Spacing.base, marginBottom: 16,
    borderRadius: BorderRadius.lg, padding: Spacing.base,
  },
  infoIcon: { fontSize: 32 },
  infoTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  infoSub: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, gap: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
  emptySub: { fontSize: Typography.base, color: Colors.textSecondary },
  remCard: { gap: 12 },
  remRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  remIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  remTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  remDesc: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2 },
  remMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  remFreq: { fontSize: Typography.xs, fontWeight: Typography.semibold },
  remDot: { color: Colors.textMuted },
  remTime: { fontSize: Typography.xs, color: Colors.textMuted },
  remActions: { flexDirection: 'row', gap: 10 },
  remActionBtn: {
    flex: 1, paddingVertical: 8, backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.full, alignItems: 'center',
  },
  remActionText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.xl, gap: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  modalTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary, textAlign: 'center' },
  input: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base, paddingVertical: 12,
    color: Colors.textPrimary, fontSize: Typography.base,
    borderWidth: 1, borderColor: Colors.border,
  },
  label: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.semibold },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optBtn: {
    paddingHorizontal: 12, paddingVertical: 7,
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.border,
  },
  optBtnText: { fontSize: Typography.sm, color: Colors.textSecondary },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  iconBtnSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow },
  colorRow: { flexDirection: 'row', gap: 10 },
  colorDot: { width: 30, height: 30, borderRadius: 15 },
  colorDotSelected: { borderWidth: 3, borderColor: Colors.textPrimary },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 0.6, paddingVertical: 14, backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.full, alignItems: 'center',
  },
  cancelText: { color: Colors.textSecondary, fontWeight: Typography.semibold },
});
