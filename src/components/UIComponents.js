import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── GradientButton ──────────────────────────────────────────
export function GradientButton({ onPress, title, icon, colors, style, textStyle, disabled, loading }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    if (!disabled && !loading) onPress?.();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPress={handlePress} disabled={disabled || loading} activeOpacity={0.9}>
        <LinearGradient
          colors={disabled ? ['#2A3F55', '#1E3048'] : (colors || Colors.gradientPrimary)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradientButton, style]}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textInverse} size="small" />
          ) : (
            <>
              {icon && <Text style={styles.btnIcon}>{icon}</Text>}
              <Text style={[styles.btnText, textStyle, disabled && { color: Colors.textMuted }]}>
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Card ────────────────────────────────────────────────────
export function Card({ children, style, onPress, glow }) {
  const content = (
    <View style={[styles.card, glow && styles.cardGlow, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

// ─── StatBadge ───────────────────────────────────────────────
export function StatBadge({ label, value, unit, color, icon }) {
  return (
    <View style={[styles.statBadge, { borderColor: color + '40' }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Text style={styles.statIconText}>{icon}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {unit && <Text style={styles.statUnit}>{unit}</Text>}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── SectionHeader ───────────────────────────────────────────
export function SectionHeader({ title, subtitle, action, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color, height = 6, animated: anim = true }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (anim) {
      Animated.timing(progress, {
        toValue: value / max,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }
  }, [value]);

  return (
    <View style={[styles.progressTrack, { height }]}>
      <Animated.View
        style={[
          styles.progressFill,
          {
            height,
            backgroundColor: color || Colors.primary,
            width: anim ? progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }) : `${(value / max) * 100}%`,
          },
        ]}
      />
    </View>
  );
}

// ─── Tag ─────────────────────────────────────────────────────
export function Tag({ label, color, small }) {
  return (
    <View style={[styles.tag, { backgroundColor: (color || Colors.primary) + '20', borderColor: (color || Colors.primary) + '40' }]}>
      <Text style={[styles.tagText, { color: color || Colors.primary }, small && { fontSize: 10 }]}>
        {label}
      </Text>
    </View>
  );
}

// ─── EmptyState ──────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle, action, onAction }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon || '🌱'}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
      {action && (
        <GradientButton
          title={action}
          onPress={onAction}
          style={{ marginTop: Spacing.lg, paddingHorizontal: Spacing.xl }}
        />
      )}
    </View>
  );
}

// ─── Severity Pill ───────────────────────────────────────────
export function SeverityPill({ severity }) {
  const map = {
    low: { label: 'Düşük', color: Colors.success },
    medium: { label: 'Orta', color: Colors.accent },
    high: { label: 'Yüksek', color: Colors.warning },
    critical: { label: 'KRİTİK', color: Colors.danger },
  };
  const { label, color } = map[severity] || map.medium;

  return (
    <View style={[styles.severityPill, { backgroundColor: color + '25', borderColor: color }]}>
      <View style={[styles.severityDot, { backgroundColor: color }]} />
      <Text style={[styles.severityLabel, { color }]}>{label}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.full,
    gap: 8,
  },
  btnText: {
    color: Colors.textInverse,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    letterSpacing: 0.3,
  },
  btnIcon: {
    fontSize: 18,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardGlow: {
    borderColor: Colors.primaryGlow,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  statBadge: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    minWidth: 80,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statIconText: { fontSize: 16 },
  statValue: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  statUnit: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: -2,
  },
  statLabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionAction: {
    fontSize: Typography.sm,
    color: Colors.primary,
    fontWeight: Typography.semibold,
  },
  progressTrack: {
    width: '100%',
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 100,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  tagText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: Spacing.base,
  },
  emptyTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  severityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 5,
    alignSelf: 'flex-start',
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  severityLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    letterSpacing: 0.5,
  },
});
