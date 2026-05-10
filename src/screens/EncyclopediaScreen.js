import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Dimensions, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../utils/theme';
import { Card, SeverityPill, Tag } from '../components/UIComponents';
import { DISEASES, PLANTS } from '../utils/plantDatabase';

const DISEASE_LIST = Object.values(DISEASES);

export default function EncyclopediaScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedDisease, setSelectedDisease] = useState(null);

  const filtered = DISEASE_LIST.filter(d => {
    const matchSearch = !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      d.pathogen.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = selectedSeverity === 'all' || d.severity === selectedSeverity;
    return matchSearch && matchSeverity;
  });

  if (selectedDisease) {
    return (
      <DiseaseDetail
        disease={selectedDisease}
        onBack={() => setSelectedDisease(null)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Hastalık Ansiklopedisi</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Hastalık veya semptom ara..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Severity Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {[
          { id: 'all', label: 'Tümü' },
          { id: 'critical', label: '🔴 Kritik' },
          { id: 'high', label: '🟠 Yüksek' },
          { id: 'medium', label: '🟡 Orta' },
          { id: 'low', label: '🟢 Düşük' },
        ].map(f => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterChip, selectedSeverity === f.id && styles.filterChipActive]}
            onPress={() => setSelectedSeverity(f.id)}
          >
            <Text style={[styles.filterText, selectedSeverity === f.id && { color: Colors.primary }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.resultCount}>{filtered.length} hastalık listeleniyor</Text>
          {filtered.map(disease => (
            <DiseaseCard
              key={disease.id}
              disease={disease}
              onPress={() => setSelectedDisease(disease)}
            />
          ))}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DiseaseCard({ disease, onPress }) {
  const severityColors = {
    low: Colors.success,
    medium: Colors.accent,
    high: Colors.warning,
    critical: Colors.danger,
  };
  const color = severityColors[disease.severity];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card style={[styles.diseaseCard, { borderLeftColor: color, borderLeftWidth: 3 }]}>
        <View style={styles.diseaseHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.diseaseName}>{disease.name}</Text>
            <Text style={styles.diseaseNameEn}>{disease.nameEn} — {disease.pathogen}</Text>
          </View>
          <SeverityPill severity={disease.severity} />
        </View>

        <View style={styles.diseasePlants}>
          {disease.affectedPlants.slice(0, 4).map(pId => (
            <Text key={pId} style={styles.plantEmoji}>{PLANTS[pId]?.emoji}</Text>
          ))}
          {disease.affectedPlants.length > 4 && (
            <Text style={styles.morePlants}>+{disease.affectedPlants.length - 4}</Text>
          )}
        </View>

        <View style={styles.diseaseSymptoms}>
          <Text style={styles.symptomsLabel}>Belirtiler:</Text>
          <Text style={styles.symptomsText} numberOfLines={2}>
            {disease.visualSymptoms.leaves}
          </Text>
        </View>

        <View style={styles.diseaseFooter}>
          <View style={[styles.recoveryBadge, { backgroundColor: Colors.success + '20' }]}>
            <Text style={[styles.recoveryText, { color: Colors.success }]}>
              💚 %{disease.recoveryChance} iyileşme
            </Text>
          </View>
          <Text style={styles.viewMore}>Detay →</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function DiseaseDetail({ disease, onBack }) {
  const [activeTab, setActiveTab] = useState('info');
  const severityColors = {
    low: Colors.success,
    medium: Colors.accent,
    high: Colors.warning,
    critical: Colors.danger,
  };
  const color = severityColors[disease.severity];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{disease.name}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={[color + '20', Colors.background]}
          style={styles.detailHero}
        >
          <SeverityPill severity={disease.severity} />
          <Text style={styles.detailName}>{disease.name}</Text>
          <Text style={styles.detailNameEn}>{disease.nameEn}</Text>
          <Text style={styles.detailPathogen}>🦠 {disease.pathogen}</Text>

          <View style={styles.detailStats}>
            <View style={styles.detailStat}>
              <Text style={[styles.detailStatVal, { color: Colors.success }]}>%{disease.recoveryChance}</Text>
              <Text style={styles.detailStatLabel}>İyileşme Şansı</Text>
            </View>
            <View style={styles.detailStatDivider} />
            <View style={styles.detailStat}>
              <Text style={[styles.detailStatVal, { color: Colors.secondary }]}>{disease.recoveryTime}</Text>
              <Text style={styles.detailStatLabel}>İyileşme Süresi</Text>
            </View>
          </View>

          <Text style={styles.affectedLabel}>Etkilenen Bitkiler:</Text>
          <View style={styles.affectedPlants}>
            {disease.affectedPlants.map(pId => (
              <View key={pId} style={styles.affectedPlant}>
                <Text style={{ fontSize: 20 }}>{PLANTS[pId]?.emoji}</Text>
                <Text style={styles.affectedPlantName}>{PLANTS[pId]?.name}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={[styles.tabsRow, { marginHorizontal: Spacing.base }]}>
          {[
            { id: 'info', label: 'Bilgi' },
            { id: 'treatment', label: 'Tedavi' },
            { id: 'prevention', label: 'Önleme' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && { color: Colors.primary }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ padding: Spacing.base, gap: 12 }}>
          {activeTab === 'info' && (
            <>
              <Card>
                <Text style={styles.cardTitle}>👁️ Görsel Belirtiler</Text>
                {Object.entries(disease.visualSymptoms).map(([part, desc]) => (
                  <View key={part} style={styles.symptomItem}>
                    <Text style={styles.symptomPart}>
                      {part === 'roots' ? '🌱 Kökler' : part === 'leaves' ? '🍃 Yapraklar' : '🌿 Gövde'}:
                    </Text>
                    <Text style={styles.symptomDesc}>{desc}</Text>
                  </View>
                ))}
              </Card>
              <Card>
                <Text style={styles.cardTitle}>⚡ Nedenler</Text>
                {disease.causes.map((cause, i) => (
                  <View key={i} style={styles.listItem}>
                    <View style={[styles.bullet, { backgroundColor: Colors.danger }]} />
                    <Text style={styles.listText}>{cause}</Text>
                  </View>
                ))}
              </Card>
            </>
          )}

          {activeTab === 'treatment' && (
            <>
              {disease.treatments.map((treatment, i) => (
                <Card key={i} style={[{ gap: 12 }, {
                  borderColor: treatment.type === 'immediate' ? Colors.danger + '40' : Colors.primary + '30'
                }]}>
                  <Text style={styles.cardTitle}>
                    {treatment.type === 'immediate' ? '🚨' : treatment.type === 'biological' ? '🐛' : '🔧'} {treatment.title}
                  </Text>
                  {treatment.steps.map((step, j) => (
                    <View key={j} style={styles.treatStep}>
                      <View style={[styles.stepNum, { backgroundColor: treatment.type === 'immediate' ? Colors.danger : Colors.primary }]}>
                        <Text style={styles.stepNumText}>{j + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </Card>
              ))}
            </>
          )}

          {activeTab === 'prevention' && (
            <Card style={[{ gap: 12 }, { borderColor: Colors.success + '40' }]}>
              <Text style={styles.cardTitle}>🛡️ Önleyici Tedbirler</Text>
              {disease.prevention.map((p, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.check}>✓</Text>
                  <Text style={styles.listText}>{p}</Text>
                </View>
              ))}
            </Card>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
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
  title: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary, flex: 1, textAlign: 'center' },
  searchRow: { paddingHorizontal: Spacing.base, marginBottom: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.base,
    paddingVertical: 12,
  },
  filterScroll: { paddingHorizontal: Spacing.base, marginBottom: 12 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  filterChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow },
  filterText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, gap: 12 },
  resultCount: { fontSize: Typography.sm, color: Colors.textMuted },
  diseaseCard: { gap: 12 },
  diseaseHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  diseaseName: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary },
  diseaseNameEn: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  diseasePlants: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  plantEmoji: { fontSize: 20 },
  morePlants: { fontSize: Typography.sm, color: Colors.textMuted, marginLeft: 4 },
  diseaseSymptoms: { gap: 4 },
  symptomsLabel: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textSecondary },
  symptomsText: { fontSize: Typography.sm, color: Colors.textMuted, lineHeight: 20 },
  diseaseFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recoveryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  recoveryText: { fontSize: Typography.xs, fontWeight: Typography.semibold },
  viewMore: { fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.semibold },
  detailHero: {
    padding: Spacing.xl,
    gap: 10,
  },
  detailName: { fontSize: Typography.xxl, fontWeight: Typography.black, color: Colors.textPrimary },
  detailNameEn: { fontSize: Typography.base, color: Colors.textSecondary },
  detailPathogen: { fontSize: Typography.sm, color: Colors.textMuted },
  detailStats: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    marginTop: 8,
  },
  detailStat: { flex: 1, alignItems: 'center' },
  detailStatVal: { fontSize: Typography.lg, fontWeight: Typography.bold },
  detailStatLabel: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  detailStatDivider: { width: 1, height: 36, backgroundColor: Colors.border },
  affectedLabel: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.semibold },
  affectedPlants: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  affectedPlant: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  affectedPlantName: { fontSize: 11, color: Colors.textSecondary },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  tabActive: { backgroundColor: Colors.primaryGlow },
  tabText: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textSecondary },
  cardTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 4 },
  symptomItem: { gap: 2 },
  symptomPart: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textSecondary },
  symptomDesc: { fontSize: Typography.sm, color: Colors.textMuted, lineHeight: 20, marginLeft: 8 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  listText: { flex: 1, fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20 },
  check: { color: Colors.success, fontSize: Typography.base, fontWeight: Typography.bold },
  treatStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumText: { fontSize: 11, fontWeight: Typography.bold, color: Colors.textInverse },
  stepText: { flex: 1, fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20 },
});
