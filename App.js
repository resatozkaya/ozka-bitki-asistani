import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { Colors, Typography } from './src/utils/theme';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── Splash Screen ────────────────────────────────────────────
function SplashScreen({ onFinish }) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(onFinish);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.splash, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#06111E', '#0A1E35', '#061828']}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Glow orbs */}
      <View style={styles.splashOrb1} />
      <View style={styles.splashOrb2} />

      <Animated.View
        style={[styles.splashContent, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={styles.splashLogo}>
          <Text style={styles.splashLogoIcon}>🌿</Text>
        </View>
        <Text style={styles.splashTitle}>Özka Bitki Asistanı</Text>
        <Text style={styles.splashSubtitle}>Özka Topraksız Tarım Takip ve Teşhis Uygulaması</Text>
        <View style={styles.splashBadge}>
          <Text style={styles.splashBadgeText}>AI Destekli</Text>
        </View>
      </Animated.View>

      <Animated.Text style={[styles.splashBottom, { opacity: fadeAnim }]}>
Topraksız üretiminizi akıllıca takip edin 🌱
      </Animated.Text>
    </Animated.View>
  );
}

// ─── Root App ─────────────────────────────────────────────────
export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  async function registerForPushNotifications() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
    } catch (_) {}
  }

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  splashOrb1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary + '08',
    top: -80,
    right: -80,
  },
  splashOrb2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.secondary + '06',
    bottom: 60,
    left: -60,
  },
  splashContent: {
    alignItems: 'center',
    gap: 12,
  },
  splashLogo: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary + '50',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
    marginBottom: 8,
  },
  splashLogoIcon: {
    fontSize: 52,
  },
  splashTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -1.5,
  },
  splashSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  splashBadge: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: Colors.primaryGlow,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.primary + '50',
  },
  splashBadgeText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  splashBottom: {
    position: 'absolute',
    bottom: 60,
    fontSize: 13,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
});
