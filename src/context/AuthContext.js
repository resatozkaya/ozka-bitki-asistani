import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../services/firebase';

const LOCAL_USER_KEY = 'ozka_local_user_session';
const AuthContext = createContext(null);

function mapFirebaseError(error) {
  const code = error?.code || '';
  if (code.includes('invalid-email')) return 'E-posta adresi geçersiz görünüyor.';
  if (code.includes('user-not-found')) return 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.';
  if (code.includes('wrong-password') || code.includes('invalid-credential')) return 'E-posta veya şifre hatalı.';
  if (code.includes('email-already-in-use')) return 'Bu e-posta adresi zaten kayıtlı.';
  if (code.includes('weak-password')) return 'Şifre en az 6 karakter olmalıdır.';
  return 'İşlem tamamlanamadı. Lütfen bilgileri kontrol edip tekrar deneyin.';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;

    async function boot() {
      if (isFirebaseConfigured && auth) {
        unsubscribe = onAuthStateChanged(auth, firebaseUser => {
          setUser(firebaseUser);
          setLoading(false);
        });
        return;
      }

      const raw = await AsyncStorage.getItem(LOCAL_USER_KEY);
      setUser(raw ? JSON.parse(raw) : null);
      setLoading(false);
    }

    boot();
    return () => unsubscribe?.();
  }, []);

  const login = async ({ email, password }) => {
    if (isFirebaseConfigured && auth) {
      try {
        const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
        return { ok: true, user: credential.user };
      } catch (error) {
        return { ok: false, message: mapFirebaseError(error) };
      }
    }

    const localUser = {
      uid: `local-${Date.now()}`,
      email: email.trim(),
      displayName: 'Özka Kullanıcısı',
      isLocal: true,
    };
    await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
    setUser(localUser);
    return { ok: true, user: localUser };
  };

  const register = async ({ name, email, password }) => {
    if (isFirebaseConfigured && auth) {
      try {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name?.trim()) await updateProfile(credential.user, { displayName: name.trim() });
        await setDoc(doc(db, 'users', credential.user.uid), {
          uid: credential.user.uid,
          name: name?.trim() || 'Özka Kullanıcısı',
          email: email.trim(),
          plan: 'free',
          credits: 10,
          language: 'tr',
          appName: 'Özka Bitki Asistanı',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
        return { ok: true, user: credential.user };
      } catch (error) {
        return { ok: false, message: mapFirebaseError(error) };
      }
    }

    const localUser = {
      uid: `local-${Date.now()}`,
      email: email.trim(),
      displayName: name?.trim() || 'Özka Kullanıcısı',
      isLocal: true,
    };
    await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
    setUser(localUser);
    return { ok: true, user: localUser };
  };

  const resetPassword = async (email) => {
    if (!email?.trim()) return { ok: false, message: 'Lütfen e-posta adresinizi yazın.' };
    if (isFirebaseConfigured && auth) {
      try {
        await sendPasswordResetEmail(auth, email.trim());
        return { ok: true, message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' };
      } catch (error) {
        return { ok: false, message: mapFirebaseError(error) };
      }
    }
    return { ok: true, message: 'Firebase ayarı yapılınca şifre sıfırlama aktif olacak.' };
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) await signOut(auth);
    await AsyncStorage.removeItem(LOCAL_USER_KEY);
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout, resetPassword }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth AuthProvider içinde kullanılmalıdır.');
  return value;
}
