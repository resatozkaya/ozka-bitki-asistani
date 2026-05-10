import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, StatusBar, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../utils/theme';
import { Card, Tag } from '../components/UIComponents';
import { KNOWLEDGE } from '../utils/strings.tr';

const { width: W } = Dimensions.get('window');

const CATEGORY_META = {
  basics:    { label: 'Temel Bilgiler', emoji: '📖', color: Colors.secondary },
  nutrients:  { label: 'Besin & Kimya',  emoji: '🧪', color: Colors.primary },
  systems:   { label: 'Sistemler',       emoji: '⚙️', color: Colors.accent },
  diseases:  { label: 'Hastalıklar',     emoji: '🦠', color: Colors.danger },
  plants:    { label: 'Bitkiler',        emoji: '🌱', color: Colors.success },
};

const ARTICLES = Object.values(KNOWLEDGE.articles);

export default function KnowledgeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const filtered = useMemo(() => ARTICLES.filter(a => {
    const matchCat = activeCategory === 'all' || a.category === activeCategory;
    const matchSearch = !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [search, activeCategory]);

  if (selectedArticle) {
    return (
      <ArticleDetail
        article={selectedArticle}
        onBack={() => setSelectedArticle(null)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Geri</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{KNOWLEDGE.title}</Text>
          <Text style={styles.headerSub}>{KNOWLEDGE.subtitle}</Text>
        </View>
        <View style={{ width: 56 }} />
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={KNOWLEDGE.searchPlaceholder}
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: Colors.textMuted, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={{ paddingHorizontal: Spacing.base, gap: 8 }}>
        <CategoryChip
          label="Tümü"
          emoji="📚"
          color={Colors.primary}
          active={activeCategory === 'all'}
          onPress={() => setActiveCategory('all')}
        />
        {Object.entries(CATEGORY_META).map(([key, meta]) => (
          <CategoryChip
            key={key}
            label={meta.label}
            emoji={meta.emoji}
            color={meta.color}
            active={activeCategory === key}
            onPress={() => setActiveCategory(key)}
          />
        ))}
      </ScrollView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Featured hero card */}
        {activeCategory === 'all' && !search && (
          <TouchableOpacity
            style={styles.featuredWrap}
            onPress={() => setSelectedArticle(KNOWLEDGE.articles.ph)}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#0D2540', '#091E38']} style={styles.featuredCard}>
              <View style={styles.featuredTop}>
                <View style={[styles.featuredBadge, { backgroundColor: Colors.primaryGlow, borderColor: Colors.primary + '40' }]}>
                  <Text style={[styles.featuredBadgeText, { color: Colors.primary }]}>Başlangıç İçin</Text>
                </View>
                <Text style={styles.featuredReadTime}>⏱ {KNOWLEDGE.articles.ph.readTime}</Text>
              </View>
              <Text style={styles.featuredEmoji}>{KNOWLEDGE.articles.ph.emoji}</Text>
              <Text style={styles.featuredTitle}>{KNOWLEDGE.articles.ph.title}</Text>
              <Text style={styles.featuredSummary}>{KNOWLEDGE.articles.ph.summary}</Text>
              <View style={styles.featuredFooter}>
                <Text style={styles.featuredCta}>Okumaya Başla →</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.grid}>
          {filtered.map(article => (
            <ArticleCard
              key={article.title}
              article={article}
              onPress={() => setSelectedArticle(article)}
            />
          ))}
        </View>

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Sonuç bulunamadı</Text>
            <Text style={styles.emptySub}>Farklı anahtar kelimeler deneyin</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function CategoryChip({ label, emoji, color, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.catChip, active && { borderColor: color, backgroundColor: color + '18' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={{ fontSize: 14 }}>{emoji}</Text>
      <Text style={[styles.catChipText, active && { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function ArticleCard({ article, onPress }) {
  const cat = CATEGORY_META[article.category] || CATEGORY_META.basics;
  return (
    <TouchableOpacity style={styles.articleCard} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient colors={['#0D1F35', '#091828']} style={styles.articleCardInner}>
        <View style={styles.articleCardTop}>
          <View style={[styles.articleCatDot, { backgroundColor: cat.color + '30', borderColor: cat.color + '50' }]}>
            <Text style={{ fontSize: 16 }}>{article.emoji}</Text>
          </View>
          <Text style={[styles.articleReadTime, { color: cat.color }]}>⏱ {article.readTime}</Text>
        </View>
        <Text style={styles.articleTitle}>{article.title}</Text>
        <Text style={styles.articleSummary} numberOfLines={2}>{article.summary}</Text>
        <View style={[styles.articleCatBadge, { backgroundColor: cat.color + '18' }]}>
          <Text style={[styles.articleCatText, { color: cat.color }]}>{cat.emoji} {cat.label}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function ArticleDetail({ article, onBack }) {
  const cat = CATEGORY_META[article.category] || CATEGORY_META.basics;

  // Split body into paragraphs, bold **text** rendering
  const renderBody = (text) => {
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return <View key={i} style={{ height: 10 }} />;

      // Bold items (lines with **)
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <Text key={i} style={styles.articleBodyText}>
            {parts.map((p, j) =>
              j % 2 === 1
                ? <Text key={j} style={{ fontWeight: Typography.bold, color: Colors.textPrimary }}>{p}</Text>
                : p
            )}
          </Text>
        );
      }
      // Bullet points
      if (line.startsWith('•')) {
        return (
          <View key={i} style={styles.bulletRow}>
            <View style={[styles.bulletDot, { backgroundColor: cat.color }]} />
            <Text style={styles.articleBodyText}>{line.slice(1).trim()}</Text>
          </View>
        );
      }
      // Table header separator
      if (line.startsWith('|---')) return <View key={i} style={styles.tableDivider} />;
      // Table rows
      if (line.startsWith('|')) {
        const cells = line.split('|').filter(c => c.trim());
        return (
          <View key={i} style={styles.tableRow}>
            {cells.map((cell, ci) => (
              <Text key={ci} style={[styles.tableCell, ci === 0 && styles.tableCellBold]}>{cell.trim()}</Text>
            ))}
          </View>
        );
      }
      // Headings (lines ending without special char, after blank line)
      return <Text key={i} style={styles.articleBodyText}>{line}</Text>;
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{KNOWLEDGE.title}</Text>
        <View style={{ width: 56 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Article hero */}
        <LinearGradient colors={[cat.color + '22', Colors.background]} style={styles.detailHero}>
          <View style={[styles.detailEmojiWrap, { backgroundColor: cat.color + '20', borderColor: cat.color + '40' }]}>
            <Text style={styles.detailEmoji}>{article.emoji}</Text>
          </View>
          <View style={[styles.detailCatBadge, { backgroundColor: cat.color + '20', borderColor: cat.color + '40' }]}>
            <Text style={[styles.detailCatText, { color: cat.color }]}>{cat.emoji} {cat.label}</Text>
          </View>
          <Text style={styles.detailTitle}>{article.title}</Text>
          <Text style={styles.detailSummary}>{article.summary}</Text>
          <View style={styles.detailMeta}>
            <Text style={[styles.detailMetaItem, { color: cat.color }]}>⏱ {article.readTime} okuma</Text>
          </View>
        </LinearGradient>

        {/* Body */}
        <View style={styles.articleBody}>
          {renderBody(article.body)}
        </View>

        {/* Pro tips */}
        {article.tips && article.tips.length > 0 && (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Pratik İpuçları</Text>
            {article.tips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={[styles.tipNum, { backgroundColor: cat.color }]}>
                  <Text style={styles.tipNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: 10 },
  backBtn: { color: Colors.primary, fontSize: Typography.base, minWidth: 56 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary },
  headerSub: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 1 },
  searchWrap: { paddingHorizontal: Spacing.base, marginBottom: 10 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, gap: 8 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: Typography.base, paddingVertical: 11 },
  catScroll: { marginBottom: 12, flexGrow: 0 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: Colors.surface, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border },
  catChipText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  scroll: { flex: 1 },
  featuredWrap: { paddingHorizontal: Spacing.base, marginBottom: 16 },
  featuredCard: { borderRadius: BorderRadius.xl, padding: 20, borderWidth: 1, borderColor: Colors.primaryGlow, gap: 10 },
  featuredTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featuredBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full, borderWidth: 1 },
  featuredBadgeText: { fontSize: 11, fontWeight: Typography.bold },
  featuredReadTime: { fontSize: 11, color: Colors.textMuted },
  featuredEmoji: { fontSize: 40 },
  featuredTitle: { fontSize: Typography.xl, fontWeight: Typography.black, color: Colors.textPrimary },
  featuredSummary: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 21 },
  featuredFooter: { flexDirection: 'row', justifyContent: 'flex-end' },
  featuredCta: { fontSize: Typography.base, color: Colors.primary, fontWeight: Typography.bold },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: Spacing.base },
  articleCard: { width: (W - Spacing.base * 2 - 10) / 2 },
  articleCardInner: { borderRadius: BorderRadius.lg, padding: 14, borderWidth: 1, borderColor: Colors.border, gap: 8, minHeight: 160 },
  articleCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  articleCatDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  articleReadTime: { fontSize: 10, fontWeight: Typography.semibold },
  articleTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary, lineHeight: 20 },
  articleSummary: { fontSize: 11, color: Colors.textSecondary, lineHeight: 17, flex: 1 },
  articleCatBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  articleCatText: { fontSize: 10, fontWeight: Typography.semibold },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  emptySub: { fontSize: Typography.base, color: Colors.textSecondary },

  // Article detail
  detailHero: { padding: Spacing.xl, gap: 10 },
  detailEmojiWrap: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  detailEmoji: { fontSize: 38 },
  detailCatBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, borderWidth: 1 },
  detailCatText: { fontSize: 12, fontWeight: Typography.bold },
  detailTitle: { fontSize: Typography.xxl, fontWeight: Typography.black, color: Colors.textPrimary, lineHeight: 34 },
  detailSummary: { fontSize: Typography.base, color: Colors.textSecondary, lineHeight: 24 },
  detailMeta: { flexDirection: 'row', gap: 16 },
  detailMetaItem: { fontSize: Typography.sm, fontWeight: Typography.semibold },
  articleBody: { paddingHorizontal: Spacing.xl, paddingBottom: 20, gap: 4 },
  articleBodyText: { fontSize: Typography.base, color: Colors.textSecondary, lineHeight: 26 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginVertical: 2 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 9, flexShrink: 0 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: 8 },
  tableCell: { flex: 1, fontSize: Typography.sm, color: Colors.textSecondary },
  tableCellBold: { fontWeight: Typography.bold, color: Colors.textPrimary },
  tableDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  tipsCard: { marginHorizontal: Spacing.base, backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.base, borderWidth: 1, borderColor: Colors.primaryGlow, gap: 12 },
  tipsTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  tipNum: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  tipNumText: { fontSize: 11, fontWeight: Typography.bold, color: Colors.textInverse },
  tipText: { flex: 1, fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 22 },
});
