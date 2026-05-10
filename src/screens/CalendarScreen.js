import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../utils/theme';
import { Card, ProgressBar, SectionHeader } from '../components/UIComponents';
import { getMyPlants } from '../services/storage';
import { PLANTS, GROWTH_STAGES } from '../utils/plantDatabase';

const { width: W } = Dimensions.get('window');

export default function CalendarScreen({ navigation }) {
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const today = new Date();

  useEffect(() => {
    loadPlants();
    const unsub = navigation.addListener('focus', loadPlants);
    return unsub;
  }, [navigation]);

  async function loadPlants() {
    const data = await getMyPlants();
    setPlants(data);
    if (data.length > 0 && !selectedPlant) setSelectedPlant(data[0]);
  }

  const getDaysOld = (plant) => {
    if (!plant.plantedDate) return 0;
    return Math.floor((Date.now() - new Date(plant.plantedDate)) / 86400000);
  };

  const getStage = (plant) => {
    const days = getDaysOld(plant);
    if (days < 7) return 'seedling';
    if (days < 30) return 'vegetative';
    if (days < 50) return 'flowering';
    if (days < 80) return 'fruiting';
    return 'harvest';
  };

  const getProgress = (plant) => {
    const days = getDaysOld(plant);
    const plantData = PLANTS[plant.plantType];
    if (!plantData) return 0;
    return Math.min(100, (days / plantData.growthDays.max) * 100);
  };

  const getHarvestDate = (plant) => {
    if (!plant.plantedDate) return 'Bilinmiyor';
    const plantData = PLANTS[plant.plantType];
    if (!plantData) return 'Bilinmiyor';
    const harvest = new Date(plant.plantedDate);
    harvest.setDate(harvest.getDate() + plantData.growthDays.max);
    return harvest.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  };

  const getDaysToHarvest = (plant) => {
    if (!plant.plantedDate) return '-';
    const plantData = PLANTS[plant.plantType];
    if (!plantData) return '-';
    const days = getDaysOld(plant);
    const remaining = plantData.growthDays.max - days;
    return remaining > 0 ? remaining : 0;
  };

  const monthDays = () => {
    const result = [];
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      result.push(new Date(d));
    }
    return result;
  };

  const isPlantDay = (date, plant) => {
    if (!plant.plantedDate) return false;
    const planted = new Date(plant.plantedDate);
    return planted.toDateString() === date.toDateString();
  };

  const isHarvestDay = (date, plant) => {
    if (!plant.plantedDate) return false;
    const plantData = PLANTS[plant.plantType];
    if (!plantData) return false;
    const harvest = new Date(plant.plantedDate);
    harvest.setDate(harvest.getDate() + plantData.growthDays.max);
    return harvest.toDateString() === date.toDateString();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Büyüme Takvimi</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Plant Selector */}
          {plants.length > 0 && (
            <>
              <SectionHeader title="Bitki Seçin" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                {plants.map(plant => {
                  const pd = PLANTS[plant.plantType];
                  const isSelected = selectedPlant?.id === plant.id;
                  return (
                    <TouchableOpacity
                      key={plant.id}
                      style={[styles.plantChip, isSelected && styles.plantChipActive]}
                      onPress={() => setSelectedPlant(plant)}
                    >
                      <Text style={{ fontSize: 20 }}>{pd?.emoji || '🌱'}</Text>
                      <Text style={[styles.plantChipName, isSelected && { color: Colors.primary }]}>
                        {plant.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

          {selectedPlant ? (
            <>
              {/* Growth Overview */}
              <Card style={styles.growthCard} glow>
                <View style={styles.growthHeader}>
                  <Text style={{ fontSize: 40 }}>{PLANTS[selectedPlant.plantType]?.emoji || '🌱'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.plantName}>{selectedPlant.name}</Text>
                    <Text style={styles.plantType}>{PLANTS[selectedPlant.plantType]?.name}</Text>
                  </View>
                  <View style={styles.stageBadge}>
                    <Text style={styles.stageIcon}>{GROWTH_STAGES[getStage(selectedPlant)]?.icon}</Text>
                    <Text style={styles.stageLabel}>{GROWTH_STAGES[getStage(selectedPlant)]?.name}</Text>
                  </View>
                </View>

                <View style={styles.growthProgress}>
                  <View style={styles.growthProgressLabel}>
                    <Text style={styles.progressLabelText}>Büyüme İlerlemesi</Text>
                    <Text style={[styles.progressLabelVal, { color: Colors.primary }]}>
                      {Math.round(getProgress(selectedPlant))}%
                    </Text>
                  </View>
                  <ProgressBar value={getProgress(selectedPlant)} />
                </View>

                <View style={styles.growthStats}>
                  <GrowthStat icon="📅" label="Ekim Tarihi" value={
                    selectedPlant.plantedDate
                      ? new Date(selectedPlant.plantedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
                      : 'Bilinmiyor'
                  } color={Colors.secondary} />
                  <GrowthStat icon="🌾" label="Hasat Tarihi" value={getHarvestDate(selectedPlant)} color={Colors.accent} />
                  <GrowthStat icon="⏳" label="Kalan Gün" value={`${getDaysToHarvest(selectedPlant)} gün`} color={Colors.primary} />
                </View>
              </Card>

              {/* Growth Stages Timeline */}
              <SectionHeader title="Büyüme Aşamaları" />
              <View style={styles.timeline}>
                {Object.values(GROWTH_STAGES).map((stage, i) => {
                  const currentStage = getStage(selectedPlant);
                  const stageKeys = Object.keys(GROWTH_STAGES);
                  const currentIdx = stageKeys.indexOf(currentStage);
                  const stageIdx = stageKeys.indexOf(stage.id);
                  const isPast = stageIdx < currentIdx;
                  const isCurrent = stage.id === currentStage;

                  return (
                    <View key={stage.id} style={styles.timelineItem}>
                      <View style={styles.timelineLeft}>
                        <View style={[
                          styles.timelineDot,
                          isPast && styles.timelineDotDone,
                          isCurrent && styles.timelineDotActive,
                        ]}>
                          <Text style={{ fontSize: isCurrent ? 14 : 12 }}>{stage.icon}</Text>
                        </View>
                        {i < Object.values(GROWTH_STAGES).length - 1 && (
                          <View style={[styles.timelineLine, isPast && styles.timelineLineDone]} />
                        )}
                      </View>
                      <View style={[styles.timelineContent, isCurrent && styles.timelineContentActive]}>
                        <Text style={[styles.timelineName, isCurrent && { color: Colors.primary }]}>
                          {stage.name}
                          {isCurrent && <Text style={styles.currentBadge}> ← Şu an</Text>}
                        </Text>
                        <Text style={styles.timelineDays}>Gün {stage.days}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Monthly Calendar */}
              <SectionHeader
                title={today.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
              />
              <Card>
                {/* Day Labels */}
                <View style={styles.calHeader}>
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
                    <Text key={d} style={styles.calHeaderDay}>{d}</Text>
                  ))}
                </View>

                {/* Days Grid */}
                <View style={styles.calGrid}>
                  {/* Empty cells for first day offset */}
                  {Array(((new Date(today.getFullYear(), today.getMonth(), 1).getDay() + 6) % 7)).fill(null).map((_, i) => (
                    <View key={`e${i}`} style={styles.calDay} />
                  ))}
                  {monthDays().map((date, i) => {
                    const isToday = date.toDateString() === today.toDateString();
                    const planted = isPlantDay(date, selectedPlant);
                    const harvest = isHarvestDay(date, selectedPlant);

                    return (
                      <View key={i} style={[
                        styles.calDay,
                        isToday && styles.calDayToday,
                        planted && styles.calDayPlanted,
                        harvest && styles.calDayHarvest,
                      ]}>
                        <Text style={[
                          styles.calDayNum,
                          isToday && { color: Colors.textInverse, fontWeight: Typography.bold },
                          planted && { color: Colors.secondary },
                          harvest && { color: Colors.accent },
                        ]}>
                          {date.getDate()}
                        </Text>
                        {planted && <Text style={{ fontSize: 8 }}>🌱</Text>}
                        {harvest && <Text style={{ fontSize: 8 }}>🌾</Text>}
                      </View>
                    );
                  })}
                </View>

                {/* Legend */}
                <View style={styles.legend}>
                  <LegendItem color={Colors.primary} label="Bugün" />
                  <LegendItem color={Colors.secondary} label="Ekim" />
                  <LegendItem color={Colors.accent} label="Hasat" />
                </View>
              </Card>

              {/* Optimal Parameters */}
              {PLANTS[selectedPlant.plantType] && (
                <>
                  <SectionHeader title="Optimal Parametreler" />
                  <Card>
                    <View style={styles.paramsGrid}>
                      <ParamItem icon="🧪" label="pH Aralığı"
                        value={`${PLANTS[selectedPlant.plantType].optimalPH.min} - ${PLANTS[selectedPlant.plantType].optimalPH.max}`}
                        color={Colors.secondary} />
                      <ParamItem icon="⚡" label="EC (mS/cm)"
                        value={`${PLANTS[selectedPlant.plantType].optimalEC.min} - ${PLANTS[selectedPlant.plantType].optimalEC.max}`}
                        color={Colors.accent} />
                      <ParamItem icon="🌡️" label="Sıcaklık (°C)"
                        value={`${PLANTS[selectedPlant.plantType].optimalTemp.min} - ${PLANTS[selectedPlant.plantType].optimalTemp.max}`}
                        color={Colors.warning} />
                      <ParamItem icon="💡" label="Işık (saat)"
                        value={`${PLANTS[selectedPlant.plantType].lightHours} saat`}
                        color={Colors.primary} />
                    </View>
                  </Card>
                </>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>Bitki Eklemediniz</Text>
              <Text style={styles.emptySub}>Büyüme takviminizi görüntülemek için bitki ekleyin</Text>
              <TouchableOpacity
                style={styles.addPlantBtn}
                onPress={() => navigation.navigate('Plants')}
              >
                <Text style={styles.addPlantBtnText}>+ Bitki Ekle</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function GrowthStat({ icon, label, value, color }) {
  return (
    <View style={styles.growthStat}>
      <Text style={styles.growthStatIcon}>{icon}</Text>
      <Text style={[styles.growthStatValue, { color }]}>{value}</Text>
      <Text style={styles.growthStatLabel}>{label}</Text>
    </View>
  );
}

function ParamItem({ icon, label, value, color }) {
  return (
    <View style={styles.paramItem}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={[styles.paramValue, { color }]}>{value}</Text>
      <Text style={styles.paramLabel}>{label}</Text>
    </View>
  );
}

function LegendItem({ color, label }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
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
  scroll: { flex: 1 },
  content: { padding: Spacing.base, gap: Spacing.base },
  plantChip: {
    alignItems: 'center', flexDirection: 'row', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.border, marginRight: 8,
  },
  plantChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow },
  plantChipName: { fontSize: Typography.sm, color: Colors.textSecondary },
  growthCard: { gap: 16 },
  growthHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  plantName: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  plantType: { fontSize: Typography.sm, color: Colors.textSecondary },
  stageBadge: {
    alignItems: 'center', backgroundColor: Colors.primaryGlow,
    borderRadius: BorderRadius.md, padding: Spacing.sm, gap: 2,
    borderWidth: 1, borderColor: Colors.primary + '40',
  },
  stageIcon: { fontSize: 22 },
  stageLabel: { fontSize: 10, color: Colors.primary, fontWeight: Typography.semibold },
  growthProgress: { gap: 6 },
  growthProgressLabel: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabelText: { fontSize: Typography.sm, color: Colors.textSecondary },
  progressLabelVal: { fontSize: Typography.sm, fontWeight: Typography.bold },
  growthStats: { flexDirection: 'row', justifyContent: 'space-between' },
  growthStat: { alignItems: 'center', flex: 1, gap: 2 },
  growthStatIcon: { fontSize: 18 },
  growthStatValue: { fontSize: Typography.sm, fontWeight: Typography.bold },
  growthStatLabel: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: 'row', gap: 12, minHeight: 56 },
  timelineLeft: { alignItems: 'center', width: 32 },
  timelineDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  timelineDotDone: { backgroundColor: Colors.primaryGlow, borderColor: Colors.primary },
  timelineDotActive: { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  timelineLine: { flex: 1, width: 2, backgroundColor: Colors.border, marginVertical: 2 },
  timelineLineDone: { backgroundColor: Colors.primary },
  timelineContent: {
    flex: 1, paddingVertical: 6, paddingBottom: 20,
    paddingHorizontal: 10, borderRadius: BorderRadius.md,
  },
  timelineContentActive: { backgroundColor: Colors.primaryGlow },
  timelineName: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary },
  timelineDays: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  currentBadge: { color: Colors.primary, fontWeight: Typography.medium, fontSize: Typography.xs },
  calHeader: { flexDirection: 'row', marginBottom: 8 },
  calHeaderDay: {
    flex: 1, textAlign: 'center', fontSize: 11,
    color: Colors.textMuted, fontWeight: Typography.semibold,
  },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calDay: {
    width: `${100 / 7}%`, aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, gap: 1,
  },
  calDayToday: { backgroundColor: Colors.primary },
  calDayPlanted: { backgroundColor: Colors.secondary + '30' },
  calDayHarvest: { backgroundColor: Colors.accent + '30' },
  calDayNum: { fontSize: 12, color: Colors.textSecondary },
  legend: { flexDirection: 'row', gap: 16, marginTop: 12, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: Typography.xs, color: Colors.textSecondary },
  paramsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  paramItem: {
    width: (W - Spacing.base * 2 - Spacing.base * 2 - 10) / 2,
    alignItems: 'center', backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md, paddingVertical: 14, gap: 4,
  },
  paramValue: { fontSize: Typography.md, fontWeight: Typography.bold },
  paramLabel: { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
  emptySub: { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center' },
  addPlantBtn: {
    paddingHorizontal: 24, paddingVertical: 12,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
  },
  addPlantBtnText: { color: Colors.textInverse, fontWeight: Typography.bold },
});
