// Firebase yapılandırması - Özka Bitki Asistanı
// Authentication: Email/Password
// Firestore veri yolu: users/{uid}/plants, users/{uid}/diagnoses, users/{uid}/reminders, users/{uid}/settings

import { initializeApp, getApps } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: 'AIzaSyBEH9QzMjNqckxogzKSARfuVmbZLXpligM',
  authDomain: 'ozka-bitki-asistan.firebaseapp.com',
  projectId: 'ozka-bitki-asistan',
  storageBucket: 'ozka-bitki-asistan.firebasestorage.app',
  messagingSenderId: '109467260302',
  appId: '1:109467260302:web:a418712d4e61fae1ec80df',
};

export const isFirebaseConfigured = true;

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
