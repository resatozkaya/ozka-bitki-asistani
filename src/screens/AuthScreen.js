import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../utils/theme';
import { GradientButton } from '../components/UIComponents';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../services/firebase';

export default function AuthScreen() {
  const { login, register, resetPassword } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  async function handleSubmit() {
    if (isRegister && !name.trim()) {
      Alert.alert('Eksik bilgi', 'Lütfen ad soyad alanını doldurun.');
      return;
    }
    if (!email.trim() || !password) {
      Alert.alert('Eksik bilgi', 'Lütfen e-posta ve şifre alanlarını doldurun.');
      return;
    }
    if (isRegister && !kvkkAccepted) {
      Alert.alert('Onay gerekli', 'Devam etmek için KVKK ve kullanıcı sözleşmesi onayını işaretleyin.');
      return;
    }

    setLoading(true);
    const result = isRegister
      ? await register({ name, email, password })
      : await login({ email, password });
    setLoading(false);

    if (!result.ok) Alert.alert('İşlem başarısız', result.message);
  }

  async function handleResetPassword() {
    const result = await resetPassword(email);
    Alert.alert(result.ok ? 'Bilgilendirme' : 'İşlem başarısız', result.message);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <LinearGradient colors={['#06111E', '#0A2340', '#06111E']} style={StyleSheet.absoluteFillObject} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.brandCard}>
            <View style={styles.logoBox}>
              <Text style={styles.logoIcon}>🌿</Text>
            </View>
            <Text style={styles.title}>Özka Bitki Asistanı</Text>
            <Text style={styles.subtitle}>Özka Topraksız Tarım Takip ve Teşhis Uygulaması</Text>
            <Text style={styles.description}>
              Bitkilerinizi kaydedin, pH/EC takibi yapın, fotoğrafla teşhis alın ve üretim sürecinizi tek ekrandan yönetin.
            </Text>
          </View>

          {!isFirebaseConfigured && (
            <View style={styles.demoBox}>
              <Text style={styles.demoTitle}>Test modu aktif</Text>
              <Text style={styles.demoText}>Firebase bilgileri girilene kadar giriş sistemi cihaz içinde çalışır. Canlı kullanımda Firebase aktif edilecek.</Text>
            </View>
          )}

          <View style={styles.formCard}>
            <View style={styles.modeSwitch}>
              <TouchableOpacity style={[styles.modeBtn, !isRegister && styles.modeBtnActive]} onPress={() => setMode('login')}>
                <Text style={[styles.modeText, !isRegister && styles.modeTextActive]}>Giriş Yap</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modeBtn, isRegister && styles.modeBtnActive]} onPress={() => setMode('register')}>
                <Text style={[styles.modeText, isRegister && styles.modeTextActive]}>Kayıt Ol</Text>
              </TouchableOpacity>
            </View>

            {isRegister && (
              <LabeledInput label="Ad Soyad" value={name} onChangeText={setName} placeholder="Örn. Kürşat Özkaya" />
            )}
            <LabeledInput label="E-posta" value={email} onChangeText={setEmail} placeholder="ornek@eposta.com" keyboardType="email-address" autoCapitalize="none" />
            <LabeledInput label="Şifre" value={password} onChangeText={setPassword} placeholder="En az 6 karakter" secureTextEntry />

            {isRegister && (
              <TouchableOpacity style={styles.checkRow} onPress={() => setKvkkAccepted(v => !v)} activeOpacity={0.8}>
                <View style={[styles.checkBox, kvkkAccepted && styles.checkBoxActive]}>
                  {kvkkAccepted && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={styles.checkText}>KVKK aydınlatma metnini ve kullanıcı sözleşmesini okudum, kabul ediyorum.</Text>
              </TouchableOpacity>
            )}

            <GradientButton
              title={loading ? 'Lütfen bekleyin...' : isRegister ? 'Hesap Oluştur' : 'Giriş Yap'}
              icon={isRegister ? '✨' : '🔐'}
              onPress={handleSubmit}
              disabled={loading}
            />

            {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 12 }} />}

            {!isRegister && (
              <TouchableOpacity style={styles.forgotBtn} onPress={handleResetPassword}>
                <Text style={styles.forgotText}>Şifremi unuttum</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function LabeledInput({ label, ...props }) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={Colors.textMuted}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 40, gap: 18 },
  brandCard: { alignItems: 'center', paddingTop: 26, paddingBottom: 10 },
  logoBox: {
    width: 88, height: 88, borderRadius: 28, backgroundColor: Colors.primaryGlow,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.primary + '50', marginBottom: 16,
  },
  logoIcon: { fontSize: 46 },
  title: { fontSize: 34, color: Colors.textPrimary, fontWeight: Typography.black, textAlign: 'center', letterSpacing: -1 },
  subtitle: { marginTop: 8, fontSize: 15, color: Colors.primary, fontWeight: Typography.semibold, textAlign: 'center', lineHeight: 22 },
  description: { marginTop: 12, fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  demoBox: { backgroundColor: Colors.warningGlow, borderWidth: 1, borderColor: Colors.warning + '40', borderRadius: BorderRadius.lg, padding: 14 },
  demoTitle: { color: Colors.warning, fontWeight: Typography.bold, marginBottom: 4 },
  demoText: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
  formCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: 18, borderWidth: 1, borderColor: Colors.border, gap: 14 },
  modeSwitch: { flexDirection: 'row', backgroundColor: Colors.background, borderRadius: 999, padding: 4, marginBottom: 4 },
  modeBtn: { flex: 1, paddingVertical: 11, borderRadius: 999, alignItems: 'center' },
  modeBtnActive: { backgroundColor: Colors.primaryGlow, borderWidth: 1, borderColor: Colors.primary + '40' },
  modeText: { color: Colors.textMuted, fontWeight: Typography.semibold },
  modeTextActive: { color: Colors.primary },
  inputWrap: { gap: 7 },
  inputLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: Typography.semibold },
  input: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, paddingHorizontal: 14, paddingVertical: 13, color: Colors.textPrimary, fontSize: 15 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginVertical: 2 },
  checkBox: { width: 22, height: 22, borderRadius: 7, borderWidth: 1, borderColor: Colors.borderActive, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkBoxActive: { backgroundColor: Colors.primary },
  checkMark: { color: Colors.textInverse, fontWeight: Typography.black },
  checkText: { flex: 1, color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
  forgotBtn: { alignItems: 'center', paddingVertical: 4 },
  forgotText: { color: Colors.secondary, fontWeight: Typography.semibold },
});
