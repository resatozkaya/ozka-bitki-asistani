import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Alert, Image, Dimensions, Modal, StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../utils/theme';
import { GradientButton, Card, SeverityPill, Tag } from '../components/UIComponents';
import { analyzeImage, getSeverityColor } from '../services/aiDiagnosis';
import { saveDiagnosis } from '../services/storage';
import { hasCredits, deductCredit, getCredits, creditBadgeColor } from '../services/creditService';
import { PLANTS } from '../utils/plantDatabase';

const { width: W, height: H } = Dimensions.get('window');
const PLANT_LIST = Object.values(PLANTS);

export default function DiagnoseScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [showPlantPicker, setShowPlantPicker] = useState(false);
  const [step, setStep] = useState(1); // 1: select plant, 2: capture, 3: result
  const [analysisStep, setAnalysisStep] = useState('');
  const [creditBalance, setCreditBalance] = useState(null);

  const resultAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  };

  const pickImage = async (fromCamera = true) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('İzin Gerekli', fromCamera
        ? 'Kamera erişimi için izin vermeniz gerekiyor.'
        : 'Galeri erişimi için izin vermeniz gerekiyor.');
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          allowsEditing: true,
          aspect: [4, 3],
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          allowsEditing: true,
          aspect: [4, 3],
        });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setStep(2);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const analyze = async () => {
    if (!selectedImage || !selectedPlant) {
      Alert.alert('Eksik Bilgi', 'Lütfen bitki türü seçin ve fotoğraf çekin.');
      return;
    }

    // ── Kredi kontrolü ──────────────────────────────────────
    const creditOk = await hasCredits(1);
    if (!creditOk) {
      const ci = await getCredits();
      Alert.alert(
        '💳 Krediniz Tükendi',
        `Teşhis yapabilmek için kredi satın almanız gerekiyor.\n\nMevcut bakiye: ${ci.credits} kredi`,
        [
          { text: 'Kapat', style: 'cancel' },
          { text: 'Kredi Satın Al →', onPress: () => navigation.navigate('Profile') },
        ]
      );
      return;
    }
    // ────────────────────────────────────────────────────────

    setIsAnalyzing(true);
    setStep(3);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startPulse();

    try {
      setAnalysisStep('Görüntü hazırlanıyor...');
      const base64 = await FileSystem.readAsStringAsync(selectedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setAnalysisStep('Claude AI analiz ediyor...');
      const response = await analyzeImage(
        base64,
        PLANTS[selectedPlant]?.name || selectedPlant,
        ''
      );

      setAnalysisStep('Sonuçlar hazırlanıyor...');

      if (response.success) {
        // ── Kredi düş ──────────────────────────────────────
        await deductCredit();
        const ci = await getCredits();
        setCreditBalance(ci.credits);
        // ───────────────────────────────────────────────────

        setResult(response.data);
        await saveDiagnosis({
          plantType: selectedPlant,
          plantName: PLANTS[selectedPlant]?.name,
          imageUri: selectedImage.uri,
          data: response.data,
        });

        Animated.spring(resultAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }).start();

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert('Analiz Hatası', 'Görüntü analiz edilemedi. Lütfen tekrar deneyin.');
        setStep(2);
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
      setStep(2);
    } finally {
      setIsAnalyzing(false);
      pulseAnim.stopAnimation();
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setResult(null);
    setStep(1);
    resultAnim.setValue(0);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hastalık Teşhisi</Text>
        <TouchableOpacity onPress={reset}>
          <Text style={styles.resetBtn}>Sıfırla</Text>
        </TouchableOpacity>
      </View>

      {/* Step Indicator */}
      <View style={styles.stepRow}>
        {['Bitki Seç', 'Fotoğraf', 'Sonuç'].map((s, i) => (
          <React.Fragment key={i}>
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, step > i && styles.stepDotActive, step === i + 1 && styles.stepDotCurrent]}>
                <Text style={[styles.stepNum, step > i && { color: Colors.textInverse }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepLabel, step === i + 1 && { color: Colors.primary }]}>{s}</Text>
            </View>
            {i < 2 && <View style={[styles.stepLine, step > i + 1 && styles.stepLineActive]} />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* ── Step 1: Plant Selection ── */}
          {step === 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌱 Bitki Türü Seçin</Text>
              <Text style={styles.sectionSub}>Hastalık tespiti için bitki türünü belirtin</Text>
              <View style={styles.plantGrid}>
                {PLANT_LIST.map(plant => (
                  <TouchableOpacity
                    key={plant.id}
                    style={[styles.plantChip, selectedPlant === plant.id && styles.plantChipSelected]}
                    onPress={() => {
                      setSelectedPlant(plant.id);
                      Haptics.selectionAsync();
                    }}
                  >
                    <Text style={styles.plantChipEmoji}>{plant.emoji}</Text>
                    <Text style={[styles.plantChipName, selectedPlant === plant.id && { color: Colors.primary }]}>
                      {plant.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedPlant && (
                <GradientButton
                  title="Devam Et →"
                  onPress={() => setStep(2)}
                  style={styles.continueBtn}
                />
              )}
            </View>
          )}

          {/* ── Step 2: Image Capture ── */}
          {step === 2 && (
            <View style={styles.section}>
              {selectedPlant && (
                <View style={styles.selectedPlantBadge}>
                  <Text style={styles.selectedPlantEmoji}>{PLANTS[selectedPlant]?.emoji}</Text>
                  <Text style={styles.selectedPlantName}>{PLANTS[selectedPlant]?.name}</Text>
                  <TouchableOpacity onPress={() => setStep(1)}>
                    <Text style={styles.changePlant}>Değiştir</Text>
                  </TouchableOpacity>
                </View>
              )}

              {selectedImage ? (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: selectedImage.uri }} style={styles.previewImg} resizeMode="cover" />
                  <View style={styles.imageOverlay}>
                    <TouchableOpacity style={styles.retakeBtn} onPress={() => setSelectedImage(null)}>
                      <Text style={styles.retakeBtnText}>🔄 Yeniden Çek</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <LinearGradient colors={['#0D1F35', '#091828']} style={styles.captureArea}>
                  <Text style={styles.captureIcon}>📷</Text>
                  <Text style={styles.captureTitle}>Bitki Fotoğrafı Çekin</Text>
                  <Text style={styles.captureSub}>
                    Hastalıklı yaprak, kök veya gövdeyi net olarak çerçeveleyin
                  </Text>
                  <View style={styles.captureTips}>
                    <TipItem icon="💡" text="İyi aydınlatma kullanın" />
                    <TipItem icon="🔍" text="Semptomlara yakından odaklanın" />
                    <TipItem icon="📐" text="Kamerayo sabitleyin, bulanık olmasın" />
                  </View>
                </LinearGradient>
              )}

              <View style={styles.captureButtons}>
                <GradientButton
                  icon="📸"
                  title="Kamera"
                  onPress={() => pickImage(true)}
                  colors={Colors.gradientPrimary}
                  style={styles.captureBtn}
                />
                <GradientButton
                  icon="🖼️"
                  title="Galeri"
                  onPress={() => pickImage(false)}
                  colors={['#1A3050', '#122540']}
                  style={styles.captureBtn}
                />
              </View>

              {selectedImage && (
                <GradientButton
                  icon="🔬"
                  title="AI ile Analiz Et"
                  onPress={analyze}
                  style={styles.analyzeBtn}
                />
              )}
            </View>
          )}

          {/* ── Step 3: Analysis & Result ── */}
          {step === 3 && (
            <View style={styles.section}>
              {isAnalyzing ? (
                <View style={styles.analyzingContainer}>
                  <Animated.View style={[styles.analyzingOrb, { transform: [{ scale: pulseAnim }] }]}>
                    <LinearGradient colors={Colors.gradientPrimary} style={styles.orbInner}>
                      <Text style={styles.orbIcon}>🔬</Text>
                    </LinearGradient>
                  </Animated.View>
                  <Text style={styles.analyzingTitle}>AI Analiz Yapıyor...</Text>
                  <Text style={styles.analyzingStep}>{analysisStep}</Text>
                  <View style={styles.analyzingDots}>
                    {[0, 1, 2].map(i => (
                      <View key={i} style={[styles.dot, { backgroundColor: Colors.primary }]} />
                    ))}
                  </View>
                </View>
              ) : result ? (
                <Animated.View style={{
                  opacity: resultAnim,
                  transform: [{ translateY: resultAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
                }}>
                  <DiagnosisResult result={result} image={selectedImage} onReset={reset} />
                </Animated.View>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TipItem({ icon, text }) {
  return (
    <View style={styles.tipItem}>
      <Text style={styles.tipIcon}>{icon}</Text>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

function DiagnosisResult({ result, image, onReset }) {
  const [activeTab, setActiveTab] = useState('overview');
  const severityColor = getSeverityColor(result.severity);

  return (
    <View style={styles.resultContainer}>
      {/* Result Header */}
      <LinearGradient
        colors={result.isHealthy ? ['#0A2A1A', '#051A0E'] : ['#2A0A0A', '#1A0506']}
        style={styles.resultHeader}
      >
        {image && <Image source={{ uri: image.uri }} style={styles.resultImage} />}
        <View style={styles.resultOverlay}>
          <SeverityPill severity={result.severity} />
          <Text style={styles.resultDiagnosis}>{result.diagnosis}</Text>
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>Güven Oranı</Text>
            <Text style={[styles.confidenceValue, { color: severityColor }]}>
              %{result.confidence}
            </Text>
          </View>
          <View style={styles.confidenceBar}>
            <View style={[styles.confidenceFill, {
              width: `${result.confidence}%`,
              backgroundColor: severityColor,
            }]} />
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { id: 'overview', label: 'Genel Bakış' },
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

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <View style={styles.tabContent}>
          {/* Symptoms */}
          <Card style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>🔍 Tespit Edilen Belirtiler</Text>
            {(result.symptoms || []).map((s, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={[styles.bullet, { backgroundColor: Colors.warning }]} />
                <Text style={styles.bulletText}>{s}</Text>
              </View>
            ))}
          </Card>

          {/* Causes */}
          <Card style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>⚡ Olası Nedenler</Text>
            {(result.causes || []).map((c, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={[styles.bullet, { backgroundColor: Colors.danger }]} />
                <Text style={styles.bulletText}>{c}</Text>
              </View>
            ))}
          </Card>

          {/* Recovery */}
          <View style={styles.recoveryRow}>
            <Card style={[styles.recoveryCard, { flex: 1 }]}>
              <Text style={styles.recoveryIcon}>💚</Text>
              <Text style={styles.recoveryValue}>{result.recoveryChance}%</Text>
              <Text style={styles.recoveryLabel}>İyileşme Şansı</Text>
            </Card>
            <Card style={[styles.recoveryCard, { flex: 1 }]}>
              <Text style={styles.recoveryIcon}>⏱️</Text>
              <Text style={styles.recoveryValue}>{result.recoveryTime}</Text>
              <Text style={styles.recoveryLabel}>Süre</Text>
            </Card>
          </View>

          {/* pH/EC Recommendations */}
          {result.phRecommendation && (
            <Card style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>🧪 Parametre Önerileri</Text>
              <View style={styles.paramRow}>
                <View style={styles.paramChip}>
                  <Text style={styles.paramLabel}>Önerilen pH</Text>
                  <Text style={[styles.paramValue, { color: Colors.secondary }]}>
                    {result.phRecommendation}
                  </Text>
                </View>
                <View style={styles.paramChip}>
                  <Text style={styles.paramLabel}>Önerilen EC</Text>
                  <Text style={[styles.paramValue, { color: Colors.accent }]}>
                    {result.ecRecommendation}
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {result.additionalNotes && (
            <Card style={[styles.infoCard, { borderColor: Colors.secondary + '40' }]}>
              <Text style={styles.infoCardTitle}>💬 Ek Notlar</Text>
              <Text style={styles.additionalNotes}>{result.additionalNotes}</Text>
            </Card>
          )}
        </View>
      )}

      {activeTab === 'treatment' && (
        <View style={styles.tabContent}>
          {/* Immediate Actions */}
          <Card style={[styles.infoCard, { borderColor: Colors.danger + '40' }]}>
            <Text style={styles.infoCardTitle}>🚨 Acil Müdahale</Text>
            {(result.immediateActions || []).map((action, i) => (
              <View key={i} style={styles.treatmentStep}>
                <View style={[styles.stepCircle, { backgroundColor: Colors.danger }]}>
                  <Text style={styles.stepCircleText}>{i + 1}</Text>
                </View>
                <Text style={styles.treatmentText}>{action}</Text>
              </View>
            ))}
          </Card>

          {/* Detailed Treatments */}
          {(result.treatments || []).map((t, i) => (
            <Card key={i} style={styles.infoCard}>
              <View style={styles.treatmentHeader}>
                <View style={[styles.stepCircle, { backgroundColor: Colors.primary }]}>
                  <Text style={styles.stepCircleText}>{t.step}</Text>
                </View>
                <Text style={styles.treatmentAction}>{t.action}</Text>
              </View>
              {t.detail && <Text style={styles.treatmentDetail}>{t.detail}</Text>}
            </Card>
          ))}
        </View>
      )}

      {activeTab === 'prevention' && (
        <View style={styles.tabContent}>
          <Card style={[styles.infoCard, { borderColor: Colors.success + '40' }]}>
            <Text style={styles.infoCardTitle}>🛡️ Önleyici Tedbirler</Text>
            {(result.prevention || []).map((p, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.bulletText}>{p}</Text>
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.resultActions}>
        <GradientButton
          title="Yeni Teşhis"
          onPress={onReset}
          colors={Colors.gradientPrimary}
          style={{ flex: 1 }}
        />
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
  headerTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  resetBtn: { color: Colors.textSecondary, fontSize: Typography.sm },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 16,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stepDotCurrent: { borderColor: Colors.primary },
  stepNum: { fontSize: 12, fontWeight: Typography.bold, color: Colors.textMuted },
  stepLabel: { fontSize: 10, color: Colors.textMuted },
  stepLine: { flex: 1, height: 1, backgroundColor: Colors.border, marginTop: -12 },
  stepLineActive: { backgroundColor: Colors.primary },
  scroll: { flex: 1 },
  content: { padding: Spacing.base },
  section: { gap: Spacing.base },
  sectionTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  sectionSub: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  plantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  plantChip: {
    width: (W - Spacing.base * 2 - 30) / 4,
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  plantChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryGlow,
  },
  plantChipEmoji: { fontSize: 28 },
  plantChipName: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: Typography.medium,
  },
  continueBtn: { marginTop: 8 },
  selectedPlantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.full,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.primaryGlow,
    gap: 8,
  },
  selectedPlantEmoji: { fontSize: 20 },
  selectedPlantName: {
    flex: 1,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.primary,
  },
  changePlant: { fontSize: Typography.sm, color: Colors.textSecondary },
  imagePreview: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    height: 250,
  },
  previewImg: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  retakeBtn: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  retakeBtnText: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.semibold },
  captureArea: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    gap: Spacing.md,
  },
  captureIcon: { fontSize: 56 },
  captureTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  captureSub: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  captureTips: { gap: 8, alignSelf: 'stretch' },
  tipItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tipIcon: { fontSize: 16 },
  tipText: { fontSize: Typography.sm, color: Colors.textSecondary },
  captureButtons: { flexDirection: 'row', gap: 10 },
  captureBtn: { flex: 1 },
  analyzeBtn: { marginTop: 4 },
  analyzingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.base,
  },
  analyzingOrb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: Spacing.base,
  },
  orbInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbIcon: { fontSize: 48 },
  analyzingTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  analyzingStep: {
    fontSize: Typography.base,
    color: Colors.primary,
  },
  analyzingDots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
  resultContainer: { gap: Spacing.base },
  resultHeader: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    minHeight: 200,
  },
  resultImage: {
    width: '100%',
    height: 160,
    opacity: 0.4,
  },
  resultOverlay: {
    padding: Spacing.base,
    gap: 6,
  },
  resultDiagnosis: {
    fontSize: Typography.xl,
    fontWeight: Typography.black,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  confidenceLabel: { fontSize: Typography.sm, color: Colors.textSecondary },
  confidenceValue: { fontSize: Typography.lg, fontWeight: Typography.bold },
  confidenceBar: {
    height: 4,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceFill: { height: 4, borderRadius: 2 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  tabActive: { backgroundColor: Colors.primaryGlow },
  tabText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
  },
  tabContent: { gap: Spacing.md },
  infoCard: { gap: 12 },
  infoCardTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  checkmark: {
    color: Colors.success,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  recoveryRow: { flexDirection: 'row', gap: 10 },
  recoveryCard: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.base,
  },
  recoveryIcon: { fontSize: 24 },
  recoveryValue: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  recoveryLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  paramRow: { flexDirection: 'row', gap: 10 },
  paramChip: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  paramLabel: { fontSize: 11, color: Colors.textMuted },
  paramValue: { fontSize: Typography.lg, fontWeight: Typography.bold },
  additionalNotes: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  treatmentStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  treatmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleText: {
    fontSize: 12,
    fontWeight: Typography.bold,
    color: Colors.textInverse,
  },
  treatmentText: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  treatmentAction: {
    flex: 1,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  treatmentDetail: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginLeft: 36,
    lineHeight: 20,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 40,
  },
});
