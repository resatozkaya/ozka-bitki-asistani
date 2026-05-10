import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Animated, Dimensions, RefreshControl, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../utils/theme';
import { Card, SectionHeader, GradientButton, Tag, EmptyState } from '../components/UIComponents';
import { getMyPlants, getDiseaseHistory, getReminders } from '../services/storage';
import { PLANTS } from '../utils/plantDatabase';

const { width: W } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [myPlants, setMyPlants] = useState([]);
  const [recentDiagnoses, setRecentDiagnoses] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Günaydın');
    else if (h < 18) setGreeting('İyi Öğleden Sonralar');
    else setGreeting('İyi Akşamlar');

    loadData();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  async function loadData() {
    const [plants, history, rems] = await Promise.all([
      getMyPlants(),
      getDiseaseHistory(),
      getReminders(),
    ]);
    setMyPlants(plants);
    setRecentDiagnoses(history.slice(0, 3));
    setReminders(rems.filter(r => r.enabled).slice(0, 3));
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const healthyCount = myPlants.filter(p => p.status === 'healthy').length;
  const sickCount = myPlants.filter(p => p.status === 'sick').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* ── Hero Header ── */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <LinearGradient
            colors={['#0A2340', '#061828']}
            style={styles.heroHeader}
          >
            {/* Decorative circles */}
            <View style={styles.heroDeco1} />
            <View style={styles.heroDeco2} />

            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>{greeting} 👋</Text>
                <Text style={styles.heroTitle}>Özka Bitki Asistanı</Text>
                <Text style={styles.heroSubtitle}>Özka Topraksız Tarım Takip ve Teşhis Uygulaması</Text>
              </View>
              <TouchableOpacity
                style={styles.profileBtn}
                onPress={() => navigation.navigate('Profile')}
              >
                <Text style={styles.profileEmoji}>🧑‍🌾</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <StatChip icon="🌱" value={myPlants.length} label="Bitki" color={Colors.primary} />
              <StatChip icon="✅" value={healthyCount} label="Sağlıklı" color={Colors.success} />
              <StatChip icon="⚠️" value={sickCount} label="Hasta" color={Colors.warning} />
              <StatChip icon="🔬" value={recentDiagnoses.length} label="Teşhis" color={Colors.secondary} />
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.content}>
          {/* ── Quick Actions ── */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <SectionHeader title="Hızlı İşlemler" />
            <View style={styles.quickActions}>
              <QuickAction
                icon="📸"
                label="Hastalık Teşhisi"
                subtitle="Fotoğraf çek & analiz et"
                gradient={['#00D4A1', '#0099CC']}
                onPress={() => navigation.navigate('Diagnose')}
                featured
              />
              <View style={styles.quickActionsCol}>
                <QuickAction
                  icon="🌿"
                  label="Bitkilerim"
                  subtitle={`${myPlants.length} bitki`}
                  gradient={['#1A3050', '#122540']}
                  onPress={() => navigation.navigate('Plants')}
                />
                <QuickAction
                  icon="📊"
                  label="Büyüme Takvimi"
                  subtitle="Takip et"
                  gradient={['#1A3050', '#122540']}
                  onPress={() => navigation.navigate('Calendar')}
                />
              </View>
            </View>
          </Animated.View>

          {/* ── Today's Reminders ── */}
          {reminders.length > 0 && (
            <Animated.View style={{ opacity: fadeAnim }}>
              <SectionHeader
                title="Bugünün Hatırlatıcıları"
                action="Tümü"
                onAction={() => navigation.navigate('Reminders')}
              />
              {reminders.map((rem, i) => (
                <ReminderCard key={rem.id} reminder={rem} index={i} />
              ))}
            </Animated.View>
          )}

          {/* ── My Plants ── */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <SectionHeader
              title="Bitkilerim"
              subtitle={`${myPlants.length} aktif bitki`}
              action="Tümü Gör"
              onAction={() => navigation.navigate('Plants')}
            />
            {myPlants.length === 0 ? (
              <EmptyState
                icon="🪴"
                title="Henüz bitki eklemediniz"
                subtitle="İlk bitkini ekleyerek büyüme takibine başla"
                action="+ Bitki Ekle"
                onAction={() => navigation.navigate('Plants')}
              />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plantsScroll}>
                {myPlants.map(plant => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    onPress={() => navigation.navigate('PlantDetail', { plantId: plant.id })}
                  />
                ))}
              </ScrollView>
            )}
          </Animated.View>

          {/* ── Recent Diagnoses ── */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <SectionHeader
              title="Son Teşhisler"
              action="Geçmiş"
              onAction={() => navigation.navigate('History')}
            />
            {recentDiagnoses.length === 0 ? (
              <Card style={styles.emptyDiag}>
                <Text style={styles.emptyDiagIcon}>🔬</Text>
                <Text style={styles.emptyDiagText}>Henüz teşhis yapılmadı</Text>
                <GradientButton
                  title="İlk Teşhisi Yap"
                  onPress={() => navigation.navigate('Diagnose')}
                  style={{ marginTop: 12, paddingVertical: 10 }}
                />
              </Card>
            ) : (
              recentDiagnoses.map(diag => (
                <DiagnosisCard key={diag.id} diagnosis={diag} />
              ))
            )}
          </Animated.View>

          {/* ── Disease Encyclopedia CTA ── */}
          <TouchableOpacity onPress={() => navigation.navigate('Encyclopedia')}>
            <LinearGradient
              colors={['#0D2540', '#162E4A']}
              style={styles.encyCta}
            >
              <Text style={styles.encycIcon}>📚</Text>
              <View style={styles.encycText}>
                <Text style={styles.encycTitle}>Hastalık Ansiklopedisi</Text>
                <Text style={styles.encycSub}>Tüm hidroponik hastalıklar & tedaviler</Text>
              </View>
              <Text style={styles.encycArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* ── Knowledge Center CTA ── */}
          <TouchableOpacity onPress={() => navigation.navigate('Knowledge')}>
            <LinearGradient
              colors={['#0A1E35', '#122540']}
              style={styles.encyCta}
            >
              <Text style={styles.encycIcon}>🎓</Text>
              <View style={styles.encycText}>
                <Text style={styles.encycTitle}>Bilgi Merkezi</Text>
                <Text style={styles.encycSub}>pH, EC, sistem tipleri, hasat rehberi</Text>
              </View>
              <Text style={styles.encycArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatChip({ icon, value, label, color }) {
  return (
    <View style={[styles.statChip, { borderColor: color + '30' }]}>
      <Text style={styles.statChipIcon}>{icon}</Text>
      <Text style={[styles.statChipValue, { color }]}>{value}</Text>
      <Text style={styles.statChipLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, subtitle, gradient, onPress, featured }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={featured ? styles.qaFeatured : styles.qaSmall}
    >
      <LinearGradient colors={gradient} style={[styles.qaGradient, featured && styles.qaGradientFeatured]}>
        <Text style={[styles.qaIcon, featured && { fontSize: 36 }]}>{icon}</Text>
        <Text style={[styles.qaLabel, featured && { fontSize: Typography.lg }]}>{label}</Text>
        <Text style={styles.qaSubtitle}>{subtitle}</Text>
        {featured && (
          <View style={styles.qaChip}>
            <Text style={styles.qaChipText}>AI Destekli</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

function ReminderCard({ reminder, index }) {
  return (
    <Card style={[styles.reminderCard, { borderLeftColor: reminder.color, borderLeftWidth: 3 }]}>
      <View style={styles.reminderRow}>
        <View style={[styles.reminderIcon, { backgroundColor: reminder.color + '20' }]}>
          <Text style={{ fontSize: 20 }}>{reminder.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.reminderTitle}>{reminder.title}</Text>
          <Text style={styles.reminderDesc}>{reminder.description}</Text>
        </View>
        <Text style={[styles.reminderTime, { color: reminder.color }]}>{reminder.time}</Text>
      </View>
    </Card>
  );
}

function PlantCard({ plant, onPress }) {
  const plantData = PLANTS[plant.plantType] || {};
  const daysOld = plant.plantedDate
    ? Math.floor((Date.now() - new Date(plant.plantedDate)) / 86400000)
    : 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={plant.status === 'sick' ? ['#2A1A1A', '#1E1010'] : ['#0D2540', '#122540']}
        style={styles.plantCard}
      >
        <Text style={styles.plantEmoji}>{plantData.emoji || '🌱'}</Text>
        <Text style={styles.plantName} numberOfLines={1}>{plant.name}</Text>
        <Text style={styles.plantType}>{plantData.name || plant.plantType}</Text>
        <View style={[styles.plantStatus, {
          backgroundColor: plant.status === 'sick' ? Colors.danger + '20' : Colors.success + '20'
        }]}>
          <Text style={[styles.plantStatusText, {
            color: plant.status === 'sick' ? Colors.danger : Colors.success
          }]}>
            {plant.status === 'sick' ? '⚠️ Hasta' : '✅ Sağlıklı'}
          </Text>
        </View>
        <Text style={styles.plantDays}>{daysOld} gün</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function DiagnosisCard({ diagnosis }) {
  const severityColors = {
    low: Colors.success,
    medium: Colors.accent,
    high: Colors.warning,
    critical: Colors.danger,
  };
  const color = severityColors[diagnosis.data?.severity] || Colors.textSecondary;
  const date = new Date(diagnosis.date);
  const dateStr = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

  return (
    <Card style={styles.diagCard}>
      <View style={styles.diagRow}>
        <View style={[styles.diagDot, { backgroundColor: color }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.diagTitle} numberOfLines={1}>
            {diagnosis.data?.diagnosis || 'Teşhis'}
          </Text>
          <Text style={styles.diagPlant}>{diagnosis.plantName} · {dateStr}</Text>
        </View>
        <View style={[styles.diagConf, { backgroundColor: color + '20' }]}>
          <Text style={[styles.diagConfText, { color }]}>
            {diagnosis.data?.confidence || 0}%
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  heroHeader: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: Spacing.base,
    overflow: 'hidden',
  },
  heroDeco1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primary + '08',
    top: -60,
    right: -60,
  },
  heroDeco2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.secondary + '06',
    bottom: -30,
    left: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: Typography.xxxl,
    fontWeight: Typography.black,
    color: Colors.primary,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileEmoji: { fontSize: 24 },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    borderWidth: 1,
  },
  statChipIcon: { fontSize: 16, marginBottom: 2 },
  statChipValue: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  statChipLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  content: { padding: Spacing.base, gap: Spacing.xl },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    height: 200,
  },
  qaFeatured: { flex: 1.6 },
  qaSmall: { flex: 1 },
  qaGradient: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qaGradientFeatured: {
    borderColor: Colors.primaryGlow,
  },
  qaIcon: { fontSize: 28, marginBottom: 4 },
  qaLabel: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  qaSubtitle: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  qaChip: {
    marginTop: 8,
    backgroundColor: Colors.primary + '30',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '50',
  },
  qaChipText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: Typography.semibold,
  },
  reminderCard: {
    marginBottom: 8,
    borderRadius: BorderRadius.md,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reminderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  reminderDesc: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  reminderTime: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
  plantsScroll: { marginHorizontal: -Spacing.base, paddingHorizontal: Spacing.base },
  plantCard: {
    width: 130,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  plantEmoji: { fontSize: 36, marginBottom: 8 },
  plantName: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  plantType: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  plantStatus: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  plantStatusText: { fontSize: 11, fontWeight: Typography.semibold },
  plantDays: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  emptyDiag: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyDiagIcon: { fontSize: 40, marginBottom: 8 },
  emptyDiagText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  diagCard: {
    marginBottom: 8,
    padding: Spacing.md,
  },
  diagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  diagDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  diagTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  diagPlant: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  diagConf: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  diagConfText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
  encyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  encycIcon: { fontSize: 32 },
  encycText: { flex: 1 },
  encycTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  encycSub: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  encycArrow: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: Typography.bold,
  },
});
