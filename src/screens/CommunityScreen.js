import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius } from '../utils/theme';
import { Card, GradientButton, Tag } from '../components/UIComponents';
import { getCommunityPosts, addCommunityPost, likePost } from '../services/storage';
import { PLANTS } from '../utils/plantDatabase';

const PLANT_OPTIONS = ['Tümü', ...Object.values(PLANTS).map(p => p.name)];

export default function CommunityScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('Tümü');
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', plant: '', author: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPosts();
    const unsub = navigation.addListener('focus', loadPosts);
    return unsub;
  }, [navigation]);

  async function loadPosts() {
    const data = await getCommunityPosts();
    setPosts(data);
  }

  const filteredPosts = posts.filter(p =>
    filter === 'Tümü' || p.plant === filter
  );

  async function handleLike(postId) {
    await likePost(postId);
    await loadPosts();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function handlePost() {
    if (!newPost.title || !newPost.content) {
      Alert.alert('Eksik Bilgi', 'Başlık ve içerik zorunludur.');
      return;
    }
    setLoading(true);
    await addCommunityPost(newPost);
    await loadPosts();
    setShowModal(false);
    setNewPost({ title: '', content: '', plant: '', author: '' });
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  const timeAgo = (dateStr) => {
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d) / 60000);
    if (diff < 60) return `${diff}dk önce`;
    if (diff < 1440) return `${Math.floor(diff / 60)}sa önce`;
    return `${Math.floor(diff / 1440)}g önce`;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Topluluk</Text>
        <TouchableOpacity style={styles.postBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.postBtnText}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <LinearGradient colors={['#0A2340', '#061828']} style={styles.banner}>
        <Text style={styles.bannerEmoji}>🤝</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Hidroponik Topluluğu</Text>
          <Text style={styles.bannerSub}>Deneyim paylaş · Soru sor · Uzmanlaş</Text>
        </View>
        <View style={styles.bannerStat}>
          <Text style={[styles.bannerStatVal, { color: Colors.primary }]}>{posts.length}</Text>
          <Text style={styles.bannerStatLabel}>Gönderi</Text>
        </View>
      </LinearGradient>

      {/* Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {PLANT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.filterChip, filter === opt && styles.filterChipActive]}
            onPress={() => setFilter(opt)}
          >
            <Text style={[styles.filterText, filter === opt && { color: Colors.primary }]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {filteredPosts.map(post => (
            <Card key={post.id} style={styles.postCard}>
              {/* Post Header */}
              <View style={styles.postHeader}>
                <View style={styles.authorAvatar}>
                  <Text style={{ fontSize: 22 }}>{post.avatar || '🧑‍🌾'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.authorName}>{post.author}</Text>
                  <View style={styles.postMeta}>
                    {post.plant ? <Tag label={post.plant} color={Colors.primary} small /> : null}
                    <Text style={styles.postDate}>{timeAgo(post.date)}</Text>
                  </View>
                </View>
              </View>

              {/* Content */}
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postContent}>{post.content}</Text>

              {/* Tags */}
              {post.tags?.length > 0 && (
                <View style={styles.tagsRow}>
                  {post.tags.map(t => (
                    <Tag key={t} label={`#${t}`} color={Colors.secondary} small />
                  ))}
                </View>
              )}

              {/* Actions */}
              <View style={styles.postActions}>
                <TouchableOpacity style={styles.likeBtn} onPress={() => handleLike(post.id)}>
                  <Text style={styles.likeIcon}>❤️</Text>
                  <Text style={styles.likeCount}>{post.likes || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.commentBtn}>
                  <Text style={styles.commentIcon}>💬</Text>
                  <Text style={styles.commentCount}>{post.replies?.length || 0} yorum</Text>
                </TouchableOpacity>
              </View>

              {/* Replies */}
              {post.replies?.length > 0 && (
                <View style={styles.replies}>
                  {post.replies.slice(0, 2).map((r, i) => (
                    <View key={i} style={styles.reply}>
                      <Text style={styles.replyAuthor}>{r.author}</Text>
                      <Text style={styles.replyText}>{r.text}</Text>
                    </View>
                  ))}
                  {post.replies.length > 2 && (
                    <Text style={styles.moreReplies}>+{post.replies.length - 2} yorum daha</Text>
                  )}
                </View>
              )}
            </Card>
          ))}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* New Post Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✏️ Yeni Gönderi</Text>

            <TextInput
              style={styles.input}
              placeholder="Kullanıcı adı"
              placeholderTextColor={Colors.textMuted}
              value={newPost.author}
              onChangeText={t => setNewPost(p => ({ ...p, author: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Başlık"
              placeholderTextColor={Colors.textMuted}
              value={newPost.title}
              onChangeText={t => setNewPost(p => ({ ...p, title: t }))}
            />
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Deneyimini, sorununu veya önerini paylaş..."
              placeholderTextColor={Colors.textMuted}
              value={newPost.content}
              onChangeText={t => setNewPost(p => ({ ...p, content: t }))}
              multiline
            />

            <Text style={styles.label}>Bitki Türü (opsiyonel)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Object.values(PLANTS).map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.plantChip, newPost.plant === p.name && styles.plantChipActive]}
                  onPress={() => setNewPost(prev => ({ ...prev, plant: prev.plant === p.name ? '' : p.name }))}
                >
                  <Text>{p.emoji} {p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>İptal</Text>
              </TouchableOpacity>
              <GradientButton title="Paylaş" onPress={handlePost} loading={loading} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  postBtn: { padding: 8 },
  postBtnText: { fontSize: 22 },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: Spacing.base, marginBottom: 12,
    borderRadius: BorderRadius.lg, padding: Spacing.base,
  },
  bannerEmoji: { fontSize: 32 },
  bannerTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  bannerSub: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  bannerStat: { alignItems: 'center' },
  bannerStatVal: { fontSize: Typography.xl, fontWeight: Typography.bold },
  bannerStatLabel: { fontSize: 10, color: Colors.textMuted },
  filterScroll: { paddingHorizontal: Spacing.base, marginBottom: 12 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.border, marginRight: 8,
  },
  filterChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow },
  filterText: { fontSize: Typography.sm, color: Colors.textSecondary },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, gap: 12 },
  postCard: { gap: 12 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  authorAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center',
  },
  authorName: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  postDate: { fontSize: Typography.xs, color: Colors.textMuted },
  postTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary },
  postContent: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 22 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  postActions: { flexDirection: 'row', gap: 16 },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  likeIcon: { fontSize: 18 },
  likeCount: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.semibold },
  commentBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  commentIcon: { fontSize: 18 },
  commentCount: { fontSize: Typography.sm, color: Colors.textSecondary },
  replies: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md, padding: Spacing.md, gap: 8,
  },
  reply: { gap: 2 },
  replyAuthor: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.primary },
  replyText: { fontSize: Typography.xs, color: Colors.textSecondary },
  moreReplies: { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.semibold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.xl, gap: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  modalTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary, textAlign: 'center' },
  input: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base, paddingVertical: 12,
    color: Colors.textPrimary, fontSize: Typography.base,
    borderWidth: 1, borderColor: Colors.border,
  },
  label: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.semibold },
  plantChip: {
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.border, marginRight: 8,
  },
  plantChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 0.6, paddingVertical: 14, backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.full, alignItems: 'center',
  },
  cancelText: { color: Colors.textSecondary, fontWeight: Typography.semibold },
});
