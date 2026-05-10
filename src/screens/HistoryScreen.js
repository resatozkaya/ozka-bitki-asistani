import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../utils/theme';
import { Card, SeverityPill, EmptyState } from '../components/UIComponents';
import { getDiseaseHistory } from '../services/storage';
import { PLANTS } from '../utils/plantDatabase';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadHistory();
    const unsub = navigation.addListener('focus', loadHistory);
    return unsub;
  }, [navigation]);

  async function loadHistory() {
    const data = await getDiseaseHistory();
    setHistory(data);
  }

  const filtered = history.filter(h => {
    if (filter === 'all') return true;
    if (filter === 'healthy') return h.data?.isHealthy;
    if (filter === 'sick') return !h.data?.isHealthy;
    return true;
  });

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Teşhis Geçmişi</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryVal, { color: Colors.primary }]}>{history.length}</Text>
          <Text style={styles.summaryLabel}>Toplam Teşhis</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryVal, { color: Colors.danger }]}>
            {history.filter(h => h.data?.severity === 'critical').length}
          </Text>
          <Text style={styles.summaryLabel}>Kritik</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryVal, { color: Colors.success }]}>
            {history.filter(h => h.data?.isHealthy).length}
          </Text>
          <Text style={styles.summaryLabel}>Sağlıklı</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {[{ id: 'all', label: 'Tümü' }, { id: 'sick', label: '⚠️ Hastalık' }, { id: 'healthy', label: '✅ Sağlıklı' }].map(f => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterChip, filter === f.id && styles.filterActive]}
            onPress={() => setFilter(f.id)}
          >
            <Text style={[styles.filterText, filter === f.id && { color: Colors.primary }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {filtered.length === 0 ? (
            <EmptyState
              icon="🔬"
              title="Geçmiş teşhis yok"
              subtitle="Kamera ile bitki tarayarak teşhis geçmişi oluşturun"
              action="Teşhis Yap"
              onAction={() => navigation.navigate('Diagnose')}
            />
          ) : (
            filtered.map(item => (
              <HistoryCard key={item.id} item={item} formatDate={formatDate} />
            ))
          )}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HistoryCard({ item, formatDate }) {
  const [expanded, setExpanded] = useState(false);
  const plant = PLANTS[item.plantType];
  const data = item.data;
  const severityColors = {
    low: Colors.success,
    medium: Colors.accent,
    high: Colors.warning,
    critical: Colors.danger,
  };
  const borderColor = severityColors[data?.severity] || Colors.border;

  return (
    <Card style={[styles.histCard, { borderLeftColor: borderColor, borderLeftWidth: 3 }]}>
      <TouchableOpacity onPress={() => setExpanded(e => !e)} activeOpacity={0.8}>
        <View style={styles.histHeader}>
          <Text style={styles.plantEmoji}>{plant?.emoji || '🌱'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.histDiagnosis} numberOfLines={1}>
              {data?.diagnosis || 'Teşhis'}
            </Text>
            <Text style={styles.histPlant}>{plant?.name || item.plantType}</Text>
            <Text style={styles.histDate}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.histRight}>
            <SeverityPill severity={data?.severity} />
            <Text style={styles.histConf}>%{data?.confidence || 0}</Text>
            <Text style={[styles.expandIcon, { color: Colors.textMuted }]}>
              {expanded ? '▲' : '▼'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {expanded && data && (
        <View style={styles.histExpanded}>
          <View style={styles.divider} />
          {data.symptoms?.length > 0 && (
            <View style={styles.histSection}>
              <Text style={styles.histSectionTitle}>🔍 Belirtiler</Text>
              {data.symptoms.map((s, i) => (
                <Text key={i} style={styles.histItem}>• {s}</Text>
              ))}
            </View>
          )}
          {data.immediateActions?.length > 0 && (
            <View style={styles.histSection}>
              <Text style={styles.histSectionTitle}>🚨 Acil Adımlar</Text>
              {data.immediateActions.slice(0, 3).map((a, i) => (
                <Text key={i} style={styles.histItem}>{i + 1}. {a}</Text>
              ))}
            </View>
          )}
          <View style={styles.histStats}>
            <View style={styles.histStat}>
              <Text style={[styles.histStatVal, { color: Colors.success }]}>%{data.recoveryChance}</Text>
              <Text style={styles.histStatLabel}>İyileşme</Text>
            </View>
            <View style={styles.histStat}>
              <Text style={[styles.histStatVal, { color: Colors.secondary }]}>{data.recoveryTime}</Text>
              <Text style={styles.histStatLabel}>Süre</Text>
            </View>
          </View>
        </View>
      )}
    </Card>
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
  summaryRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: Spacing.base, marginBottom: 12,
  },
  summaryCard: {
    flex: 1, alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  summaryVal: { fontSize: Typography.xxl, fontWeight: Typography.bold },
  summaryLabel: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  filterRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: Spacing.base, marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow },
  filterText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, gap: 10 },
  histCard: { gap: 0 },
  histHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  plantEmoji: { fontSize: 32 },
  histDiagnosis: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  histPlant: { fontSize: Typography.sm, color: Colors.textSecondary },
  histDate: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  histRight: { alignItems: 'flex-end', gap: 4 },
  histConf: { fontSize: Typography.xs, color: Colors.textMuted },
  expandIcon: { fontSize: 12, marginTop: 2 },
  histExpanded: { marginTop: 12, gap: 12 },
  divider: { height: 1, backgroundColor: Colors.border },
  histSection: { gap: 6 },
  histSectionTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary },
  histItem: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20 },
  histStats: { flexDirection: 'row', gap: 10 },
  histStat: {
    flex: 1, alignItems: 'center', backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md, paddingVertical: 8,
  },
  histStatVal: { fontSize: Typography.md, fontWeight: Typography.bold },
  histStatLabel: { fontSize: 10, color: Colors.textMuted },
});
