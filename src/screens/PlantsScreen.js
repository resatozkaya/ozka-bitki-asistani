import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, Dimensions, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius } from '../utils/theme';
import { Card, GradientButton, SectionHeader, ProgressBar, EmptyState } from '../components/UIComponents';
import { getMyPlants, savePlant, deletePlant, updatePlant } from '../services/storage';
import { PLANTS, GROWTH_STAGES } from '../utils/plantDatabase';

const { width: W } = Dimensions.get('window');
const PLANT_LIST = Object.values(PLANTS);

export default function PlantsScreen({ navigation }) {
  const [plants, setPlants] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlant, setNewPlant] = useState({ name: '', plantType: '', notes: '', plantedDate: '' });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlants();
    const unsub = navigation.addListener('focus', loadPlants);
    return unsub;
  }, [navigation]);

  async function loadPlants() {
    const data = await getMyPlants();
    setPlants(data);
  }

  async function handleAddPlant() {
    if (!newPlant.name || !newPlant.plantType) {
      Alert.alert('Eksik Bilgi', 'Lütfen bitki adı ve türünü girin.');
      return;
    }
    setLoading(true);
    const plantData = {
      ...newPlant,
      plantedDate: newPlant.plantedDate || new Date().toISOString(),
      status: 'healthy',
      stage: 'seedling',
      phValue: PLANTS[newPlant.plantType]?.optimalPH.min || 6.0,
      ecValue: PLANTS[newPlant.plantType]?.optimalEC.min || 1.2,
    };
    await savePlant(plantData);
    await loadPlants();
    setShowAddModal(false);
    setNewPlant({ name: '', plantType: '', notes: '', plantedDate: '' });
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function handleDelete(plantId) {
    Alert.alert(
      'Bitkiyi Sil',
      'Bu bitkiyi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await deletePlant(plantId);
            await loadPlants();
          },
        },
      ]
    );
  }

  const filteredPlants = plants.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'healthy') return p.status === 'healthy';
    if (filter === 'sick') return p.status === 'sick';
    return true;
  });

  const healthyCount = plants.filter(p => p.status === 'healthy').length;
  const sickCount = plants.filter(p => p.status === 'sick').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Bitkilerim</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <SummaryChip label="Toplam" value={plants.length} color={Colors.primary} icon="🌱" />
        <SummaryChip label="Sağlıklı" value={healthyCount} color={Colors.success} icon="✅" />
        <SummaryChip label="Hasta" value={sickCount} color={Colors.danger} icon="⚠️" />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {[
          { id: 'all', label: 'Tümü' },
          { id: 'healthy', label: '✅ Sağlıklı' },
          { id: 'sick', label: '⚠️ Hasta' },
        ].map(f => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
            onPress={() => setFilter(f.id)}
          >
            <Text style={[styles.filterText, filter === f.id && { color: Colors.primary }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {filteredPlants.length === 0 ? (
            <EmptyState
              icon="🪴"
              title="Bitki bulunamadı"
              subtitle="Yeni bir bitki ekleyerek büyüme takibine başlayın"
              action="+ Bitki Ekle"
              onAction={() => setShowAddModal(true)}
            />
          ) : (
            filteredPlants.map(plant => (
              <PlantDetailCard
                key={plant.id}
                plant={plant}
                onDelete={() => handleDelete(plant.id)}
                onDiagnose={() => navigation.navigate('Diagnose')}
                onUpdateStatus={async (status) => {
                  await updatePlant(plant.id, { status });
                  await loadPlants();
                }}
              />
            ))
          )}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Add Plant Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🌱 Yeni Bitki Ekle</Text>

            <TextInput
              style={styles.input}
              placeholder="Bitki adı (örn: Balkon Marulum)"
              placeholderTextColor={Colors.textMuted}
              value={newPlant.name}
              onChangeText={t => setNewPlant(p => ({ ...p, name: t }))}
            />

            <Text style={styles.inputLabel}>Bitki Türü</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plantTypeScroll}>
              {PLANT_LIST.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.plantTypeChip, newPlant.plantType === p.id && styles.plantTypeChipSelected]}
                  onPress={() => setNewPlant(prev => ({ ...prev, plantType: p.id }))}
                >
                  <Text style={styles.plantTypeEmoji}>{p.emoji}</Text>
                  <Text style={[styles.plantTypeName, newPlant.plantType === p.id && { color: Colors.primary }]}>
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notlar (isteğe bağlı)"
              placeholderTextColor={Colors.textMuted}
              value={newPlant.notes}
              onChangeText={t => setNewPlant(p => ({ ...p, notes: t }))}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
              <GradientButton
                title="Ekle"
                onPress={handleAddPlant}
                loading={loading}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SummaryChip({ label, value, color, icon }) {
  return (
    <View style={[styles.summaryChip, { borderColor: color + '30' }]}>
      <Text style={styles.summaryIcon}>{icon}</Text>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function PlantDetailCard({ plant, onDelete, onDiagnose, onUpdateStatus }) {
  const plantData = PLANTS[plant.plantType] || {};
  const daysOld = plant.plantedDate
    ? Math.floor((Date.now() - new Date(plant.plantedDate)) / 86400000)
    : 0;
  const growthProgress = Math.min(100, (daysOld / (plantData.growthDays?.max || 60)) * 100);
  const isHealthy = plant.status === 'healthy';

  return (
    <Card style={[styles.plantCard, !isHealthy && styles.plantCardSick]}>
      <View style={styles.plantCardHeader}>
        <View style={[styles.plantEmojiWrap, { backgroundColor: isHealthy ? Colors.primaryGlow : Colors.dangerGlow }]}>
          <Text style={styles.plantEmoji}>{plantData.emoji || '🌱'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.plantName}>{plant.name}</Text>
          <Text style={styles.plantType}>{plantData.name || plant.plantType}</Text>
          <View style={[styles.statusBadge, { backgroundColor: isHealthy ? Colors.success + '20' : Colors.danger + '20' }]}>
            <Text style={[styles.statusText, { color: isHealthy ? Colors.success : Colors.danger }]}>
              {isHealthy ? '✅ Sağlıklı' : '⚠️ Hasta'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* Growth Progress */}
      <View style={styles.growthSection}>
        <View style={styles.growthHeader}>
          <Text style={styles.growthLabel}>Büyüme İlerlemesi</Text>
          <Text style={styles.growthValue}>{Math.round(growthProgress)}%</Text>
        </View>
        <ProgressBar
          value={growthProgress}
          color={isHealthy ? Colors.primary : Colors.warning}
        />
        <Text style={styles.growthDays}>{daysOld} / {plantData.growthDays?.max || '?'} gün</Text>
      </View>

      {/* Parameters */}
      <View style={styles.paramsRow}>
        <ParamChip
          icon="🧪"
          label="pH"
          value={plant.phValue?.toFixed(1) || '6.0'}
          optimal={plantData.optimalPH}
          color={Colors.secondary}
        />
        <ParamChip
          icon="⚡"
          label="EC"
          value={`${plant.ecValue?.toFixed(1) || '1.2'}`}
          unit="mS"
          optimal={plantData.optimalEC}
          color={Colors.accent}
        />
        <ParamChip
          icon="🌡️"
          label="Sıcaklık"
          value={plant.temperature || '--'}
          unit="°C"
          optimal={plantData.optimalTemp}
          color={Colors.warning}
        />
      </View>

      {/* Notes */}
      {plant.notes ? (
        <Text style={styles.plantNotes}>📝 {plant.notes}</Text>
      ) : null}

      {/* Actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: Colors.primaryGlow }]}
          onPress={onDiagnose}
        >
          <Text style={[styles.actionBtnText, { color: Colors.primary }]}>🔬 Teşhis</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, {
            backgroundColor: isHealthy ? Colors.dangerGlow : Colors.primaryGlow,
          }]}
          onPress={() => onUpdateStatus(isHealthy ? 'sick' : 'healthy')}
        >
          <Text style={[styles.actionBtnText, {
            color: isHealthy ? Colors.danger : Colors.success,
          }]}>
            {isHealthy ? '⚠️ Hasta İşaretle' : '✅ İyileşti'}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

function ParamChip({ icon, label, value, unit, optimal, color }) {
  const numVal = parseFloat(value);
  const inRange = optimal
    ? numVal >= optimal.min && numVal <= optimal.max
    : true;

  return (
    <View style={styles.paramChip}>
      <Text style={styles.paramIcon}>{icon}</Text>
      <Text style={[styles.paramValue, { color }]}>{value}{unit}</Text>
      <Text style={styles.paramLabel}>{label}</Text>
      <View style={[styles.paramStatus, { backgroundColor: inRange ? Colors.success + '30' : Colors.danger + '30' }]}>
        <Text style={{ fontSize: 8, color: inRange ? Colors.success : Colors.danger }}>
          {inRange ? 'Normal' : 'Dikkat'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
  },
  backBtn: { color: Colors.primary, fontSize: Typography.base },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: Colors.textInverse, fontSize: 22, fontWeight: Typography.bold, lineHeight: 26 },
  summary: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Spacing.base,
    marginBottom: 12,
  },
  summaryChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    borderWidth: 1,
  },
  summaryIcon: { fontSize: 18, marginBottom: 2 },
  summaryValue: { fontSize: Typography.xl, fontWeight: Typography.bold },
  summaryLabel: { fontSize: 10, color: Colors.textMuted },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.base,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryGlow,
  },
  filterText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, gap: 12 },
  plantCard: { gap: 14 },
  plantCardSick: { borderColor: Colors.danger + '40' },
  plantCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  plantEmojiWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plantEmoji: { fontSize: 30 },
  plantName: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary },
  plantType: { fontSize: Typography.sm, color: Colors.textSecondary },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusText: { fontSize: 11, fontWeight: Typography.semibold },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 20 },
  growthSection: { gap: 6 },
  growthHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  growthLabel: { fontSize: Typography.sm, color: Colors.textSecondary },
  growthValue: { fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.semibold },
  growthDays: { fontSize: 11, color: Colors.textMuted },
  paramsRow: { flexDirection: 'row', gap: 8 },
  paramChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: 2,
  },
  paramIcon: { fontSize: 16 },
  paramValue: { fontSize: Typography.md, fontWeight: Typography.bold },
  paramLabel: { fontSize: 10, color: Colors.textMuted },
  paramStatus: {
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  plantNotes: { fontSize: Typography.sm, color: Colors.textSecondary, fontStyle: 'italic' },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  actionBtnText: { fontSize: Typography.sm, fontWeight: Typography.semibold },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: Typography.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  inputLabel: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: -4 },
  plantTypeScroll: { marginHorizontal: -4 },
  plantTypeChip: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 4,
    minWidth: 70,
  },
  plantTypeChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryGlow,
  },
  plantTypeEmoji: { fontSize: 24, marginBottom: 4 },
  plantTypeName: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 0.6,
    paddingVertical: 14,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  cancelBtnText: { color: Colors.textSecondary, fontWeight: Typography.semibold },
});
