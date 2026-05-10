import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert, ScrollView, StatusBar, StyleSheet, Text,
  TouchableOpacity, View, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../utils/theme';
import { Card, GradientButton, SectionHeader } from '../components/UIComponents';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../services/firebase';
import {
  getCredits, addCredits, upgradePlan,
  creditBadgeColor, PACKAGES, PLANS,
} from '../services/creditService';
import { getDiseaseHistory, getMyPlants } from '../services/storage';
import { PROFILE, CREDIT, APP } from '../utils/strings.tr';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [creditInfo, setCreditInfo] = useState({ credits: 0, plan: 'free', planLabel: 'Ücretsiz' });
  const [stats, setStats] = useState({ diagnoses: 0, plants: 0 });
  const [showPackages, setShowPackages] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [ci, history, plants] = await Promise.all([
      getCredits(),
      getDiseaseHistory(),
      getMyPlants(),
    ]);
    setCreditInfo(ci);
    setStats({ diagnoses: history.length, plants: plants.length });
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Çıkış', 'Hesabınızdan çıkış yapacaksınız.', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: PROFILE.logoutBtn, style: 'destructive', onPress: logout },
    ]);
  };

  const handleBuyPackage = async (pkg) => {
    Alert.alert(
      CREDIT.buyTitle,
      `${pkg.label} — ${pkg.price}\n\nDemo sürümünde ödeme sistemi simüle edilmektedir.\n${pkg.credits} kredi hesabınıza eklensin mi?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Ekle (Demo)',
          onPress: async () => {
            await addCredits(pkg.credits, pkg.id);
            await load();
            Alert.alert('Başarılı', `${pkg.credits} kredi hesabınıza eklendi.`);
          },
        },
      ]
    );
  };

  const handleUpgradePlan = async (planId) => {
    const plan = PLANS[planId];
    Alert.alert(`${plan.label} Plana Geç`, `Demo sürümünde abonelik simüle edilmektedir.`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Geç (Demo)',
        onPress: async () => {
          await upgradePlan(planId);
          await load();
          Alert.alert('Başarılı', `${plan.label} planına geçtiniz.`);
        },
      },
    ]);
  };

  const creditColor = creditBadgeColor(creditInfo.credits);
  const isPro = creditInfo.plan === 'pro';
  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <LinearGradient colors={Colors.gradientHero} style={styles.hero}>
          <View style={styles.avatar}><Text style={styles.avatarText}>🧑‍🌾</Text></View>
          <Text style={styles.name}>{user?.displayName || PROFILE.defaultUser}</Text>
          <Text style={styles.email}>{user?.email || '—'}</Text>
          <View style={[styles.planBadge, { backgroundColor: isPro ? Colors.accentGlow : Colors.primaryGlow, borderColor: isPro ? Colors.accent + '60' : Colors.primary + '60' }]}>
            <Text style={[styles.planBadgeText, { color: isPro ? Colors.accent : Colors.primary }]}>
              {isPro ? '⭐ Pro Kullanıcı' : isFirebaseConfigured ? '🔗 Canlı Hesap' : '🧪 Test Modu'}
            </Text>
          </View>
        </LinearGradient>

        <SectionHeader title={CREDIT.balance} subtitle={CREDIT.perDiagnose} />
        <Card style={styles.creditCard}>
          <View style={styles.creditTop}>
            <View>
              <View style={styles.creditAmountRow}>
                <Text style={[styles.creditAmount, { color: creditColor }]}>{isPro ? '∞' : creditInfo.credits}</Text>
                <Text style={styles.creditUnit}>kredi</Text>
              </View>
              <Text style={styles.creditPlan}>{isPro ? 'Sınırsız teşhis hakkı' : `${creditInfo.planLabel} plan`}</Text>
            </View>
            <View style={[styles.creditOrb, { backgroundColor: creditColor + '20', borderColor: creditColor + '40' }]}>
              <Text style={{ fontSize: 28 }}>💳</Text>
            </View>
          </View>
          {!isPro && (
            <>
              <View style={styles.creditBarTrack}>
                <View style={[styles.creditBarFill, { width: `${Math.min(100, (creditInfo.credits / 10) * 100)}%`, backgroundColor: creditColor }]} />
              </View>
              {creditInfo.credits <= 3 && creditInfo.credits > 0 && (
                <Text style={styles.lowCreditWarn}>⚠️ Son {creditInfo.credits} teşhis hakkınız kaldı.</Text>
              )}
              {creditInfo.credits <= 0 && (
                <Text style={styles.noCreditWarn}>🚫 Teşhis krediniz tükendi. Lütfen kredi satın alın.</Text>
              )}
            </>
          )}
          <TouchableOpacity style={styles.buyBtn} onPress={() => setShowPackages(v => !v)}>
            <LinearGradient colors={Colors.gradientPrimary} style={styles.buyBtnGrad}>
              <Text style={styles.buyBtnText}>💳 {showPackages ? 'Paketleri Gizle' : 'Kredi / Paket Satın Al'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Card>

        {showPackages && (
          <>
            <SectionHeader title="Kredi Paketleri" />
            <View style={styles.packageRow}>
              {PACKAGES.map(pkg => (
                <TouchableOpacity key={pkg.id} style={[styles.packageCard, pkg.popular && styles.packageCardPopular]} onPress={() => handleBuyPackage(pkg)} activeOpacity={0.85}>
                  {pkg.popular && <View style={styles.popularBadge}><Text style={styles.popularBadgeText}>En Popüler</Text></View>}
                  <Text style={styles.packageCredits}>{pkg.credits}</Text>
                  <Text style={styles.packageUnit}>teşhis</Text>
                  <Text style={styles.packagePrice}>{pkg.price}</Text>
                  <Text style={styles.packagePer}>{(pkg.priceInt / pkg.credits).toFixed(1)}₺/teşhis</Text>
                </TouchableOpacity>
              ))}
            </View>

            <SectionHeader title="Abonelik Planları" />
            <View style={styles.planRow}>
              <TouchableOpacity style={[styles.planCard, creditInfo.plan === 'standard' && styles.planCardActive]} onPress={() => handleUpgradePlan('standard')} activeOpacity={0.85}>
                <Text style={styles.planCardName}>Standart</Text>
                <Text style={styles.planCardPrice}>₺49</Text>
                <Text style={styles.planCardPer}>/ay · 100 teşhis</Text>
                <View style={styles.planFeatures}>
                  {PLANS.standard.features.map((f, i) => <Text key={i} style={styles.planFeatureText}>✓ {f}</Text>)}
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.planCard, styles.planCardPro, creditInfo.plan === 'pro' && styles.planCardActive]} onPress={() => handleUpgradePlan('pro')} activeOpacity={0.85}>
                <View style={styles.proBadge}><Text style={styles.proBadgeText}>⭐ PRO</Text></View>
                <Text style={[styles.planCardName, { color: Colors.accent }]}>Pro</Text>
                <Text style={[styles.planCardPrice, { color: Colors.accent }]}>₺149</Text>
                <Text style={styles.planCardPer}>/ay · Sınırsız</Text>
                <View style={styles.planFeatures}>
                  {PLANS.pro.features.map((f, i) => <Text key={i} style={[styles.planFeatureText, { color: Colors.accent }]}>✓ {f}</Text>)}
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}

        <SectionHeader title={PROFILE.usageStats} />
        <View style={styles.statsRow}>
          <Card style={styles.statCard}><Text style={styles.statEmoji}>🔬</Text><Text style={styles.statValue}>{stats.diagnoses}</Text><Text style={styles.statLabel}>Teşhis</Text></Card>
          <Card style={styles.statCard}><Text style={styles.statEmoji}>🌱</Text><Text style={styles.statValue}>{stats.plants}</Text><Text style={styles.statLabel}>Bitki</Text></Card>
          <Card style={styles.statCard}><Text style={styles.statEmoji}>📅</Text><Text style={[styles.statValue, { fontSize: 12 }]}>{memberSince}</Text><Text style={styles.statLabel}>Üyelik</Text></Card>
        </View>

        <SectionHeader title={PROFILE.myAccount} />
        <Card style={[styles.infoCard]}>
          <InfoRow label="Uygulama" value={APP.name} />
          <InfoRow label="Hesap Tipi" value={isFirebaseConfigured ? 'Firebase Auth' : 'Lokal Test'} />
          <InfoRow label="Plan" value={`${creditInfo.planLabel}${isPro ? ' ⭐' : ''}`} />
          <InfoRow label="Kullanıcı ID" value={(user?.uid || '—').substring(0, 14) + '...'} last />
        </Card>

        <SectionHeader title="Ayarlar" />
        <Card style={[styles.infoCard]}>
          <SettingRow icon="🔔" label="Bildirimler" value="Açık" />
          <SettingRow icon="🌍" label="Dil" value="Türkçe" />
          <SettingRow icon="🔒" label="KVKK & Gizlilik" />
          <SettingRow icon="🆘" label="Destek" last />
        </Card>

        <GradientButton title={PROFILE.logoutBtn} icon="🚪" colors={Colors.gradientDanger} onPress={handleLogout} style={{ marginTop: 8 }} />
        <Text style={styles.version}>{APP.name} v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, last }) {
  return (
    <View style={[styles.infoRow, !last && { borderBottomWidth: 1, borderBottomColor: Colors.border }]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function SettingRow({ icon, label, value, last }) {
  return (
    <TouchableOpacity style={[styles.settingRow, !last && { borderBottomWidth: 1, borderBottomColor: Colors.border }]} activeOpacity={0.7}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value || '→'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, paddingBottom: 20, gap: 14 },
  hero: { alignItems: 'center', borderRadius: BorderRadius.xl, padding: 24, borderWidth: 1, borderColor: Colors.border },
  avatar: { width: 86, height: 86, borderRadius: 28, backgroundColor: Colors.primaryGlow, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.primary + '50', marginBottom: 12 },
  avatarText: { fontSize: 42 },
  name: { color: Colors.textPrimary, fontSize: 22, fontWeight: Typography.black, textAlign: 'center' },
  email: { color: Colors.textSecondary, marginTop: 4, fontSize: Typography.sm, textAlign: 'center' },
  planBadge: { marginTop: 12, borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  planBadgeText: { fontSize: 12, fontWeight: Typography.bold },
  creditCard: { gap: 14 },
  creditTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  creditAmountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  creditAmount: { fontSize: 48, fontWeight: Typography.black, lineHeight: 56 },
  creditUnit: { fontSize: Typography.base, color: Colors.textSecondary, fontWeight: Typography.semibold },
  creditPlan: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 2 },
  creditOrb: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  creditBarTrack: { height: 6, backgroundColor: Colors.surfaceHigh, borderRadius: 3, overflow: 'hidden' },
  creditBarFill: { height: 6, borderRadius: 3 },
  lowCreditWarn: { fontSize: Typography.sm, color: Colors.warning, fontWeight: Typography.semibold },
  noCreditWarn: { fontSize: Typography.sm, color: Colors.danger, fontWeight: Typography.semibold },
  buyBtn: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  buyBtnGrad: { paddingVertical: 13, alignItems: 'center', borderRadius: BorderRadius.full },
  buyBtnText: { color: Colors.textInverse, fontSize: Typography.base, fontWeight: Typography.bold },
  packageRow: { flexDirection: 'row', gap: 10 },
  packageCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, gap: 3 },
  packageCardPopular: { borderColor: Colors.primary, borderWidth: 2 },
  popularBadge: { backgroundColor: Colors.primaryGlow, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2, marginBottom: 4 },
  popularBadgeText: { fontSize: 9, color: Colors.primary, fontWeight: Typography.bold },
  packageCredits: { fontSize: 26, fontWeight: Typography.black, color: Colors.textPrimary },
  packageUnit: { fontSize: 10, color: Colors.textMuted },
  packagePrice: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.primary, marginTop: 4 },
  packagePer: { fontSize: 10, color: Colors.textMuted },
  planRow: { flexDirection: 'row', gap: 10 },
  planCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: 14, borderWidth: 1, borderColor: Colors.border, gap: 4 },
  planCardPro: { borderColor: Colors.accent + '50', backgroundColor: Colors.accentGlow },
  planCardActive: { borderWidth: 2, borderColor: Colors.primary },
  planCardName: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  planCardPrice: { fontSize: Typography.xxl, fontWeight: Typography.black, color: Colors.textPrimary },
  planCardPer: { fontSize: 11, color: Colors.textMuted },
  planFeatures: { marginTop: 8, gap: 4 },
  planFeatureText: { fontSize: 11, color: Colors.textSecondary, lineHeight: 18 },
  proBadge: { backgroundColor: Colors.accentGlow, alignSelf: 'flex-start', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 },
  proBadgeText: { fontSize: 10, color: Colors.accent, fontWeight: Typography.bold },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 16, gap: 4 },
  statEmoji: { fontSize: 24 },
  statValue: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary, textAlign: 'center' },
  statLabel: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
  infoCard: { gap: 0, padding: 0, overflow: 'hidden' },
  infoRow: { padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { color: Colors.textMuted, fontSize: 12 },
  infoValue: { color: Colors.textPrimary, fontSize: 13, fontWeight: Typography.semibold, flex: 1, textAlign: 'right' },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  settingIcon: { fontSize: 20 },
  settingLabel: { flex: 1, fontSize: Typography.base, color: Colors.textPrimary },
  settingValue: { fontSize: Typography.sm, color: Colors.textSecondary },
  version: { textAlign: 'center', fontSize: 11, color: Colors.textMuted, marginTop: 8 },
});
