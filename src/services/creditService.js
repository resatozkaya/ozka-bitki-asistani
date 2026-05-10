// Özka Bitki Asistanı — Kredi Servisi
// Firestore: users/{uid}.credits, users/{uid}.plan
// Fallback: AsyncStorage (Firebase yoksa)

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  doc,
  getDoc,
  increment,
  runTransaction,
  serverTimestamp,
  updateDoc,
  collection,
  addDoc,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';

const LOCAL_CREDITS_KEY = 'ozka_local_credits';
const LOCAL_PLAN_KEY = 'ozka_local_plan';
const FREE_INITIAL_CREDITS = 10;

export const PLANS = {
  free: { id: 'free', label: 'Ücretsiz', monthlyCredits: 0, features: ['10 kayıt bonusu', '3 bitki kaydı'] },
  standard: { id: 'standard', label: 'Standart', monthlyCredits: 100, features: ['100 teşhis/ay', 'Sınırsız bitki', 'Fotoğraf geçmişi'] },
  pro: { id: 'pro', label: 'Pro', monthlyCredits: -1, features: ['Sınırsız teşhis', 'Öncelikli AI', 'Veri dışa aktarım'] },
};

export const PACKAGES = [
  { id: 'pack_10', label: '10 Teşhis Paketi', credits: 10, price: '₺29', priceInt: 29, popular: false },
  { id: 'pack_30', label: '30 Teşhis Paketi', credits: 30, price: '₺69', priceInt: 69, popular: true },
  { id: 'pack_100', label: '100 Teşhis Paketi', credits: 100, price: '₺179', priceInt: 179, popular: false },
];

function uid() {
  return auth?.currentUser?.uid || null;
}

// ─── Get current credit balance ───────────────────────────────
export async function getCredits() {
  if (isFirebaseConfigured && uid()) {
    try {
      const snap = await getDoc(doc(db, 'users', uid()));
      if (snap.exists()) {
        const data = snap.data();
        return {
          credits: data.credits ?? FREE_INITIAL_CREDITS,
          plan: data.plan ?? 'free',
          planLabel: PLANS[data.plan]?.label ?? 'Ücretsiz',
        };
      }
    } catch (_) {}
  }

  // Local fallback
  const raw = await AsyncStorage.getItem(LOCAL_CREDITS_KEY);
  const plan = await AsyncStorage.getItem(LOCAL_PLAN_KEY);
  const credits = raw !== null ? parseInt(raw, 10) : FREE_INITIAL_CREDITS;
  return { credits, plan: plan || 'free', planLabel: PLANS[plan]?.label ?? 'Ücretsiz' };
}

// ─── Check if user has enough credits ─────────────────────────
export async function hasCredits(required = 1) {
  const { credits, plan } = await getCredits();
  if (plan === 'pro') return true;           // Pro = sınırsız
  return credits >= required;
}

// ─── Deduct 1 credit (call after successful diagnosis) ─────────
export async function deductCredit(diagnosisId = null) {
  if (isFirebaseConfigured && uid()) {
    try {
      await runTransaction(db, async (tx) => {
        const userRef = doc(db, 'users', uid());
        const snap = await tx.get(userRef);
        const data = snap.data() || {};

        if (data.plan === 'pro') return;   // Pro = kredi düşme
        const current = data.credits ?? 0;
        if (current <= 0) throw new Error('no_credits');

        tx.update(userRef, {
          credits: increment(-1),
          updatedAt: serverTimestamp(),
        });
      });

      // Log credit usage
      if (diagnosisId) {
        await addDoc(collection(db, 'users', uid(), 'creditHistory'), {
          type: 'deduct',
          amount: -1,
          reason: 'diagnosis',
          diagnosisId,
          createdAt: serverTimestamp(),
        });
      }
      return { ok: true };
    } catch (err) {
      if (err.message === 'no_credits') return { ok: false, reason: 'no_credits' };
      return { ok: false, reason: 'error' };
    }
  }

  // Local fallback
  const raw = await AsyncStorage.getItem(LOCAL_CREDITS_KEY);
  const current = raw !== null ? parseInt(raw, 10) : FREE_INITIAL_CREDITS;
  if (current <= 0) return { ok: false, reason: 'no_credits' };
  await AsyncStorage.setItem(LOCAL_CREDITS_KEY, String(current - 1));
  return { ok: true };
}

// ─── Add credits (after purchase) ─────────────────────────────
export async function addCredits(amount, packageId = null) {
  if (isFirebaseConfigured && uid()) {
    try {
      await updateDoc(doc(db, 'users', uid()), {
        credits: increment(amount),
        updatedAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'users', uid(), 'creditHistory'), {
        type: 'add',
        amount,
        reason: 'purchase',
        packageId,
        createdAt: serverTimestamp(),
      });
      return { ok: true };
    } catch (_) {
      return { ok: false };
    }
  }

  const raw = await AsyncStorage.getItem(LOCAL_CREDITS_KEY);
  const current = raw !== null ? parseInt(raw, 10) : 0;
  await AsyncStorage.setItem(LOCAL_CREDITS_KEY, String(current + amount));
  return { ok: true };
}

// ─── Get credit history ────────────────────────────────────────
export async function getCreditHistory() {
  if (isFirebaseConfigured && uid()) {
    try {
      const { getDocs, query, orderBy, limit } = await import('firebase/firestore');
      const ref = collection(db, 'users', uid(), 'creditHistory');
      const q = query(ref, orderBy('createdAt', 'desc'), limit(20));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.().toISOString() ?? new Date().toISOString(),
      }));
    } catch (_) {}
  }
  return [];
}

// ─── Upgrade plan (stub — entegre ödeme sistemi sonra eklenebilir) ──
export async function upgradePlan(planId) {
  if (!PLANS[planId]) return { ok: false, reason: 'invalid_plan' };
  if (isFirebaseConfigured && uid()) {
    try {
      await updateDoc(doc(db, 'users', uid()), {
        plan: planId,
        updatedAt: serverTimestamp(),
      });
      return { ok: true };
    } catch (_) {
      return { ok: false };
    }
  }
  await AsyncStorage.setItem(LOCAL_PLAN_KEY, planId);
  return { ok: true };
}

// ─── Credit badge color ────────────────────────────────────────
export function creditBadgeColor(credits) {
  if (credits <= 0) return '#FF5E6C';
  if (credits <= 3) return '#FFA94D';
  if (credits <= 10) return '#F7B731';
  return '#00D4A1';
}
