import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';

const KEYS = {
  MY_PLANTS: 'hydrosense_my_plants',
  DISEASE_HISTORY: 'hydrosense_disease_history',
  REMINDERS: 'hydrosense_reminders',
  COMMUNITY_POSTS: 'hydrosense_community_posts',
  USER_PROFILE: 'hydrosense_user_profile',
};

function currentUid() {
  return auth?.currentUser?.uid || null;
}

function userCollection(name) {
  const uid = currentUid();
  if (!uid) return null;
  return collection(db, 'users', uid, name);
}

function userDoc(name, id) {
  const uid = currentUid();
  if (!uid) return null;
  return doc(db, 'users', uid, name, id);
}

function normalizeDoc(snap) {
  const data = snap.data() || {};
  return {
    id: snap.id,
    ...data,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
  };
}

async function getLocalList(key, fallback = []) {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

async function setLocalList(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// ─── Plants: users/{uid}/plants ───────────────────────────
export async function getMyPlants() {
  try {
    const ref = userCollection('plants');
    if (isFirebaseConfigured && ref) {
      const snap = await getDocs(query(ref, orderBy('createdAt', 'desc')));
      return snap.docs.map(normalizeDoc);
    }
    return await getLocalList(KEYS.MY_PLANTS, []);
  } catch (error) {
    console.warn('Bitkiler yüklenemedi:', error?.message);
    return await getLocalList(KEYS.MY_PLANTS, []);
  }
}

export async function savePlant(plant) {
  try {
    const now = new Date().toISOString();
    const payload = { ...plant, updatedAt: serverTimestamp() };
    const ref = userCollection('plants');

    if (isFirebaseConfigured && ref) {
      if (plant.id) {
        await setDoc(userDoc('plants', plant.id), payload, { merge: true });
      } else {
        await addDoc(ref, {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      return true;
    }

    const plants = await getLocalList(KEYS.MY_PLANTS, []);
    const existing = plants.findIndex(p => p.id === plant.id);
    if (existing >= 0) plants[existing] = { ...plants[existing], ...plant, updatedAt: now };
    else plants.push({ ...plant, id: Date.now().toString(), createdAt: now, updatedAt: now });
    await setLocalList(KEYS.MY_PLANTS, plants);
    return true;
  } catch (error) {
    console.warn('Bitki kaydedilemedi:', error?.message);
    return false;
  }
}

export async function deletePlant(plantId) {
  try {
    const ref = userDoc('plants', plantId);
    if (isFirebaseConfigured && ref) {
      await deleteDoc(ref);
      return true;
    }
    const plants = await getLocalList(KEYS.MY_PLANTS, []);
    await setLocalList(KEYS.MY_PLANTS, plants.filter(p => p.id !== plantId));
    return true;
  } catch (error) {
    console.warn('Bitki silinemedi:', error?.message);
    return false;
  }
}

export async function updatePlant(plantId, updates) {
  try {
    const ref = userDoc('plants', plantId);
    if (isFirebaseConfigured && ref) {
      await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
      return true;
    }
    const plants = await getLocalList(KEYS.MY_PLANTS, []);
    const idx = plants.findIndex(p => p.id === plantId);
    if (idx >= 0) {
      plants[idx] = { ...plants[idx], ...updates, updatedAt: new Date().toISOString() };
      await setLocalList(KEYS.MY_PLANTS, plants);
    }
    return true;
  } catch (error) {
    console.warn('Bitki güncellenemedi:', error?.message);
    return false;
  }
}

// ─── Diagnosis: users/{uid}/diagnoses ─────────────────────
export async function getDiseaseHistory() {
  try {
    const ref = userCollection('diagnoses');
    if (isFirebaseConfigured && ref) {
      const snap = await getDocs(query(ref, orderBy('date', 'desc'), limit(100)));
      return snap.docs.map(normalizeDoc);
    }
    return await getLocalList(KEYS.DISEASE_HISTORY, []);
  } catch (error) {
    console.warn('Teşhis geçmişi yüklenemedi:', error?.message);
    return await getLocalList(KEYS.DISEASE_HISTORY, []);
  }
}

export async function saveDiagnosis(diagnosis) {
  try {
    const ref = userCollection('diagnoses');
    if (isFirebaseConfigured && ref) {
      await addDoc(ref, {
        ...diagnosis,
        date: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      return true;
    }

    const history = await getLocalList(KEYS.DISEASE_HISTORY, []);
    history.unshift({ ...diagnosis, id: Date.now().toString(), date: new Date().toISOString() });
    await setLocalList(KEYS.DISEASE_HISTORY, history.slice(0, 100));
    return true;
  } catch (error) {
    console.warn('Teşhis kaydedilemedi:', error?.message);
    return false;
  }
}

// ─── Reminders: users/{uid}/reminders ─────────────────────
export async function getReminders() {
  try {
    const ref = userCollection('reminders');
    if (isFirebaseConfigured && ref) {
      const snap = await getDocs(query(ref, orderBy('createdAt', 'asc')));
      const list = snap.docs.map(normalizeDoc);
      return list.length ? list : getDefaultReminders();
    }
    return await getLocalList(KEYS.REMINDERS, getDefaultReminders());
  } catch (error) {
    console.warn('Hatırlatmalar yüklenemedi:', error?.message);
    return await getLocalList(KEYS.REMINDERS, getDefaultReminders());
  }
}

export async function saveReminder(reminder) {
  try {
    const ref = userCollection('reminders');
    if (isFirebaseConfigured && ref) {
      if (reminder.id) {
        await setDoc(userDoc('reminders', reminder.id), { ...reminder, updatedAt: serverTimestamp() }, { merge: true });
      } else {
        await addDoc(ref, { ...reminder, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
      return true;
    }

    const reminders = await getLocalList(KEYS.REMINDERS, getDefaultReminders());
    const existing = reminders.findIndex(r => r.id === reminder.id);
    if (existing >= 0) reminders[existing] = reminder;
    else reminders.push({ ...reminder, id: Date.now().toString() });
    await setLocalList(KEYS.REMINDERS, reminders);
    return true;
  } catch (error) {
    console.warn('Hatırlatma kaydedilemedi:', error?.message);
    return false;
  }
}

export async function deleteReminder(reminderId) {
  try {
    const ref = userDoc('reminders', reminderId);
    if (isFirebaseConfigured && ref) {
      await deleteDoc(ref);
      return true;
    }
    const reminders = await getLocalList(KEYS.REMINDERS, getDefaultReminders());
    await setLocalList(KEYS.REMINDERS, reminders.filter(r => r.id !== reminderId));
    return true;
  } catch (error) {
    console.warn('Hatırlatma silinemedi:', error?.message);
    return false;
  }
}

function getDefaultReminders() {
  return [
    { id: '1', title: 'pH Ölçümü', description: 'Besin solüsyonu pH değerini kontrol edin', frequency: 'daily', time: '09:00', icon: '🧪', enabled: true, color: '#4FACFE' },
    { id: '2', title: 'EC Ölçümü', description: 'Elektriksel iletkenlik değerini ölçün', frequency: 'every2days', time: '09:00', icon: '⚡', enabled: true, color: '#F7B731' },
    { id: '3', title: 'Rezervuar Kontrolü', description: 'Su seviyesi ve görünümünü kontrol edin', frequency: 'daily', time: '08:00', icon: '💧', enabled: true, color: '#00D4A1' },
    { id: '4', title: 'Besin Solüsyonu Değişimi', description: 'Tüm solüsyonu değiştirme zamanı', frequency: 'weekly', time: '10:00', icon: '🔄', enabled: false, color: '#FF5E6C' },
  ];
}

// ─── Community Posts: şimdilik ortak/lokal örnek alan ─────
export async function getCommunityPosts() {
  try {
    const data = await AsyncStorage.getItem(KEYS.COMMUNITY_POSTS);
    if (data) return JSON.parse(data);
    const samplePosts = getSampleCommunityPosts();
    await AsyncStorage.setItem(KEYS.COMMUNITY_POSTS, JSON.stringify(samplePosts));
    return samplePosts;
  } catch { return getSampleCommunityPosts(); }
}

export async function addCommunityPost(post) {
  try {
    const posts = await getCommunityPosts();
    posts.unshift({ ...post, id: Date.now().toString(), date: new Date().toISOString(), likes: 0, replies: [], author: post.author || 'Anonim Yetiştirici' });
    await AsyncStorage.setItem(KEYS.COMMUNITY_POSTS, JSON.stringify(posts));
    return true;
  } catch { return false; }
}

export async function likePost(postId) {
  try {
    const posts = await getCommunityPosts();
    const idx = posts.findIndex(p => p.id === postId);
    if (idx >= 0) {
      posts[idx].likes = (posts[idx].likes || 0) + 1;
      await AsyncStorage.setItem(KEYS.COMMUNITY_POSTS, JSON.stringify(posts));
    }
    return true;
  } catch { return false; }
}

function getSampleCommunityPosts() {
  return [
    { id: '1001', author: 'MarulUstası_Ahmet', avatar: '🧑‍🌾', plant: 'Marul', title: 'NFT sistemimde harika marul hasadı!', content: 'pH 6.0, EC 1.2 ile 35 günde hasat ettim. Kökleri düzenli kontrol etmek çok işe yaradı.', image: null, likes: 24, replies: [], date: '2025-01-09T10:00:00Z', tags: ['marul', 'NFT', 'hasat'] },
    { id: '1002', author: 'ÇilekÜreticisi', avatar: '👩‍🌾', plant: 'Çilek', title: 'Çilek fidelerinde ilk meyveler geldi', content: 'Dikey sistemde ışık ve EC takibini düzenli yapınca gelişim hızlandı.', image: null, likes: 31, replies: [], date: '2025-01-08T14:30:00Z', tags: ['çilek', 'dikey kule'] },
  ];
}

// ─── User Profile: users/{uid} ────────────────────────────
export async function getUserProfile() {
  try {
    const uid = currentUid();
    if (isFirebaseConfigured && uid) {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) return normalizeDoc(snap);
    }
    return await getLocalList(KEYS.USER_PROFILE, getDefaultProfile());
  } catch {
    return await getLocalList(KEYS.USER_PROFILE, getDefaultProfile());
  }
}

export async function saveUserProfile(profile) {
  try {
    const uid = currentUid();
    if (isFirebaseConfigured && uid) {
      await setDoc(doc(db, 'users', uid), { ...profile, updatedAt: serverTimestamp() }, { merge: true });
      return true;
    }
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    return true;
  } catch { return false; }
}

function getDefaultProfile() {
  return {
    name: 'Hidroponik Üreticisi',
    level: 'Başlangıç',
    plan: 'free',
    credits: 10,
    language: 'tr',
    totalPlants: 0,
    totalDiagnoses: 0,
    joinDate: new Date().toISOString(),
    badges: [],
  };
}
