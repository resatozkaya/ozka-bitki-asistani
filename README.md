# 🌿 Özka Bitki Asistanı

**Alt başlık:** Özka Topraksız Tarım Takip ve Teşhis Uygulaması

Bu mobil uygulama; Türkiye’deki topraksız tarım kullanıcıları için bitki takibi, pH/EC kayıtları, hatırlatıcılar, fotoğraflı teşhis geçmişi ve ileride AI destekli bitki analizi amacıyla hazırlanmıştır.

## Bu sürümde yapılanlar

- Türkçe giriş/kayıt ekranı eklendi.
- Kullanıcı girişi zorunlu hale getirildi.
- Firebase Authentication uyumlu altyapı hazırlandı.
- Firebase ayarı girilene kadar uygulamayı kırmayan lokal test modu eklendi.
- Profil ekranı eklendi.
- Marka adı “Özka Bitki Asistanı” olarak güncellendi.
- Alt başlık “Özka Topraksız Tarım Takip ve Teşhis Uygulaması” olarak güncellendi.

## Kurulum

```bash
npm install
npm start
```

## Firebase’i canlıya alma

`src/services/firebase.js` dosyasındaki alanları Firebase Console’dan aldığınız bilgilerle doldurun:

```js
apiKey: '...',
authDomain: '...',
projectId: '...',
storageBucket: '...',
messagingSenderId: '...',
appId: '...',
```

Firebase Console’da şu bölümü aktif edin:

- Authentication > Sign-in method > Email/Password

## Önerilen sonraki geliştirme sırası

1. Bitki kayıtlarını kullanıcı bazlı Firestore’a taşıma
2. Teşhis geçmişini Firestore + Firebase Storage ile kaydetme
3. AI teşhis API’sini Cloud Functions arkasına alma
4. KVKK ve kullanıcı sözleşmesi sayfalarını ekleme
5. Paket/kredi sistemi hazırlığı
6. Yönetici paneli
