import React from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, BorderRadius } from '../utils/theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import DiagnoseScreen from '../screens/DiagnoseScreen';
import PlantsScreen from '../screens/PlantsScreen';
import CommunityScreen from '../screens/CommunityScreen';
import EncyclopediaScreen from '../screens/EncyclopediaScreen';
import RemindersScreen from '../screens/RemindersScreen';
import HistoryScreen from '../screens/HistoryScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AuthScreen from '../screens/AuthScreen';
import ProfileScreen from '../screens/ProfileScreen';
import KnowledgeScreen from '../screens/KnowledgeScreen';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ─── Custom Tab Bar ───────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }) {
  const tabs = [
    { key: 'Home', icon: '🏠', label: 'Ana Sayfa' },
    { key: 'Diagnose', icon: '📸', label: 'Teşhis' },
    { key: 'Plants', icon: '🌿', label: 'Bitkiler' },
    { key: 'Community', icon: '🤝', label: 'Topluluk' },
  ];

  return (
    <View style={styles.tabBarWrapper}>
      <LinearGradient
        colors={['rgba(6,17,30,0)', 'rgba(6,17,30,0.98)']}
        style={styles.tabBarGradient}
        pointerEvents="none"
      />
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const tab = tabs[index];
          const isFocused = state.index === index;
          const isDiagnose = route.name === 'Diagnose';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isDiagnose) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.85}
                style={styles.diagnoseTabWrapper}
              >
                <LinearGradient
                  colors={Colors.gradientPrimary}
                  style={styles.diagnoseTab}
                >
                  <Text style={styles.diagnoseTabIcon}>{tab.icon}</Text>
                </LinearGradient>
                <Text style={[styles.tabLabel, { color: isFocused ? Colors.primary : Colors.textMuted }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tabItem}
            >
              <View style={[styles.tabIconWrap, isFocused && styles.tabIconWrapActive]}>
                <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>{tab.icon}</Text>
              </View>
              <Text style={[styles.tabLabel, isFocused && { color: Colors.primary }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Bottom Tab Navigator ─────────────────────────────────────
function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Diagnose" component={DiagnoseScreen} />
      <Tab.Screen name="Plants" component={PlantsScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
    </Tab.Navigator>
  );
}

// ─── Root Stack Navigator ─────────────────────────────────────
export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={Colors.primary} size="large" />
        <Text style={styles.loadingText}>Hesabınız kontrol ediliyor...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: Colors.background },
          cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
              opacity: current.progress.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 0.7, 1],
              }),
            },
          }),
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Encyclopedia" component={EncyclopediaScreen} />
        <Stack.Screen name="Reminders" component={RemindersScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="Knowledge" component={KnowledgeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarGradient: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 40,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 8,
    paddingTop: 8,
    paddingHorizontal: 8,
    alignItems: 'flex-end',
    gap: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  tabIconWrap: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: Colors.primaryGlow,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: Typography.medium,
  },
  diagnoseTabWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    marginTop: -14,
  },
  diagnoseTab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  diagnoseTabIcon: {
    fontSize: 24,
  },
});
