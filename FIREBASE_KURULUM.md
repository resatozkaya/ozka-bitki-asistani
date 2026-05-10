# Özka Bitki Asistanı - Firebase Kurulum Notları

Bu sürümde Firebase gerçek proje bilgileri eklenmiştir.

## Aktif Yapı

- Authentication: Email/Password
- Firestore: kullanıcıya özel veri alanları
- Storage: sonraki aşamada fotoğraf yükleme için hazır

## Firestore Veri Yolu

```txt
users/{uid}
users/{uid}/plants/{plantId}
users/{uid}/diagnoses/{diagnosisId}
users/{uid}/reminders/{reminderId}
```

## Firestore Rules

Firebase Console > Firestore > Rules alanına aşağıdaki kuralları yapıştırabilirsiniz:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, create, update, delete: if request.auth != null && request.auth.uid == userId;

      match /{subCollection}/{documentId} {
        allow read, create, update, delete: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Storage Rules

Firebase Console > Storage > Rules alanına aşağıdaki kuralları yapıştırabilirsiniz:

```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Test Akışı

1. Uygulamayı açın.
2. E-posta/şifre ile kayıt olun.
3. Bitkilerim ekranından yeni bitki ekleyin.
4. Firebase Console > Firestore içinde `users/{uid}/plants` altında kayıt oluştuğunu kontrol edin.
5. Çıkış yapıp tekrar giriş yapınca aynı bitkilerin geldiğini kontrol edin.
