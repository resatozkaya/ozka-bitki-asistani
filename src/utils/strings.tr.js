// Özka Bitki Asistanı — Merkezi Türkçe Dil Dosyası
// İleride strings.en.js ekleyerek çoklu dil desteği kolayca kurulabilir.

export const APP = {
  name: 'Özka Bitki Asistanı',
  tagline: 'Topraksız Tarım Takip ve Teşhis',
  taglineLong: 'Özka Topraksız Tarım Takip ve Teşhis Uygulaması',
  aiLabel: 'AI Destekli',
  poweredBy: 'Claude AI ile güçlendirilmiştir',
  splashFooter: 'Topraksız üretiminizi akıllıca takip edin 🌱',
};

export const AUTH = {
  login: 'Giriş Yap',
  register: 'Kayıt Ol',
  logout: 'Çıkış Yap',
  logoutConfirmTitle: 'Çıkış yapılsın mı?',
  logoutConfirmMsg: 'Hesabınızdan çıkış yapacaksınız.',
  logoutCancel: 'Vazgeç',
  email: 'E-posta',
  emailPlaceholder: 'ornek@eposta.com',
  password: 'Şifre',
  passwordPlaceholder: 'En az 6 karakter',
  nameSurname: 'Ad Soyad',
  namePlaceholder: 'Örn. Kürşat Özkaya',
  forgotPassword: 'Şifremi unuttum',
  resetPasswordSent: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
  kvkkText: 'KVKK aydınlatma metnini ve kullanıcı sözleşmesini okudum, kabul ediyorum.',
  createAccount: 'Hesap Oluştur',
  loading: 'Lütfen bekleyin...',
  missingFields: 'Eksik bilgi',
  missingNameMsg: 'Lütfen ad soyad alanını doldurun.',
  missingEmailPassword: 'Lütfen e-posta ve şifre alanlarını doldurun.',
  kvkkRequired: 'Onay gerekli',
  kvkkRequiredMsg: 'Devam etmek için KVKK ve kullanıcı sözleşmesi onayını işaretleyin.',
  failed: 'İşlem başarısız',
  info: 'Bilgilendirme',
  demoModeTitle: 'Test modu aktif',
  demoModeMsg: 'Firebase bilgileri girilene kadar giriş sistemi cihaz içinde çalışır.',
};

export const NAV = {
  home: 'Ana Sayfa',
  diagnose: 'Teşhis',
  plants: 'Bitkiler',
  community: 'Topluluk',
  encyclopedia: 'Ansiklopedi',
  reminders: 'Hatırlatıcılar',
  history: 'Geçmiş',
  calendar: 'Takvim',
  knowledge: 'Bilgi Merkezi',
  profile: 'Profil',
};

export const HOME = {
  greetingMorning: 'Günaydın',
  greetingAfternoon: 'İyi Öğleden Sonralar',
  greetingEvening: 'İyi Akşamlar',
  quickActions: 'Hızlı İşlemler',
  todayReminders: 'Bugünün Hatırlatıcıları',
  myPlants: 'Bitkilerim',
  recentDiagnoses: 'Son Teşhisler',
  allBtn: 'Tümü',
  seeAll: 'Tümü Gör',
  totalPlants: 'Bitki',
  healthy: 'Sağlıklı',
  sick: 'Hasta',
  diagnoseCount: 'Teşhis',
  diagnoseSubtitle: 'Fotoğraf çek & analiz et',
  aiPowered: 'AI Destekli',
  calendarSubtitle: 'Büyüme takibi',
  noPlantsTitle: 'Henüz bitki eklemediniz',
  noPlantsSubtitle: 'İlk bitkini ekleyerek büyüme takibine başla',
  addPlant: '+ Bitki Ekle',
  noDiagnosisTitle: 'Henüz teşhis yapılmadı',
  firstDiagnose: 'İlk Teşhisi Yap',
  encyclopediaCta: 'Hastalık Ansiklopedisi',
  encyclopediaCtaSub: 'Tüm hidroponik hastalıklar & tedaviler',
};

export const DIAGNOSE = {
  title: 'Hastalık Teşhisi',
  reset: 'Sıfırla',
  step1: 'Bitki Seç',
  step2: 'Fotoğraf',
  step3: 'Sonuç',
  selectPlantTitle: '🌱 Bitki Türü Seçin',
  selectPlantSub: 'Hastalık tespiti için bitki türünü belirtin',
  continueBtn: 'Devam Et →',
  changePlant: 'Değiştir',
  cameraTitle: 'Bitki Fotoğrafı Çekin',
  cameraSub: 'Hastalıklı yaprak, kök veya gövdeyi net olarak çerçeveleyin',
  tip1: 'İyi aydınlatma kullanın',
  tip2: 'Semptomlara yakından odaklanın',
  tip3: 'Kamerayı sabitleyin, bulanık olmasın',
  cameraBtn: '📸 Kamera',
  galleryBtn: '🖼️ Galeri',
  analyzeBtn: '🔬 AI ile Analiz Et',
  analyzing: 'AI Analiz Yapıyor...',
  prepImage: 'Görüntü hazırlanıyor...',
  aiWorking: 'Claude AI analiz ediyor...',
  prepResult: 'Sonuçlar hazırlanıyor...',
  missingInfo: 'Eksik Bilgi',
  missingInfoMsg: 'Lütfen bitki türü seçin ve fotoğraf çekin.',
  newDiagnose: 'Yeni Teşhis',
  retake: '🔄 Yeniden Çek',
  confidenceLabel: 'Güven Oranı',
  overviewTab: 'Genel Bakış',
  treatmentTab: 'Tedavi',
  preventionTab: 'Önleme',
  symptomsTitle: '🔍 Tespit Edilen Belirtiler',
  causesTitle: '⚡ Olası Nedenler',
  recoveryChance: 'İyileşme Şansı',
  recoveryTime: 'Süre',
  paramsTitle: '🧪 Parametre Önerileri',
  recommendedPh: 'Önerilen pH',
  recommendedEc: 'Önerilen EC',
  additionalNotes: '💬 Ek Notlar',
  urgentAction: '🚨 Acil Müdahale',
  detailedTreatment: '🔧 Detaylı Tedavi',
  preventionTitle: '🛡️ Önleyici Tedbirler',
  noCreditsTitle: 'Krediniz tükendi',
  noCreditsMsg: 'AI teşhis yapabilmek için kredi satın alın.',
  buyCredits: 'Kredi Satın Al',
  creditUsed: 'Bu teşhis için 1 kredi kullanıldı.',
  cameraPermission: 'İzin Gerekli',
  cameraPermissionMsg: 'Kamera erişimi için izin vermeniz gerekiyor.',
  galleryPermissionMsg: 'Galeri erişimi için izin vermeniz gerekiyor.',
};

export const PLANTS = {
  title: 'Bitkilerim',
  addPlant: '+ Bitki Ekle',
  newPlantTitle: '🌱 Yeni Bitki Ekle',
  plantName: 'Bitki adı (örn: Balkon Marulum)',
  plantTypeLabel: 'Bitki Türü',
  systemTypeLabel: 'Sistem Tipi',
  notes: 'Notlar (isteğe bağlı)',
  add: 'Ekle',
  cancel: 'İptal',
  total: 'Toplam',
  healthy: 'Sağlıklı',
  sick: 'Hasta',
  filterAll: 'Tümü',
  filterHealthy: '✅ Sağlıklı',
  filterSick: '⚠️ Hasta',
  growthProgress: 'Büyüme İlerlemesi',
  days: 'gün',
  phLabel: 'pH',
  ecLabel: 'EC mS',
  tempLabel: 'Sıcaklık',
  normal: 'Normal',
  attention: 'Dikkat',
  diagnoseAction: '🔬 Teşhis',
  markSick: '⚠️ Hasta İşaretle',
  markHealthy: '✅ İyileşti',
  deleteConfirmTitle: 'Bitkiyi Sil',
  deleteConfirmMsg: 'Bu bitkiyi silmek istediğinizden emin misiniz?',
  deleteBtn: 'Sil',
  missingFields: 'Eksik Bilgi',
  missingFieldsMsg: 'Lütfen bitki adı ve türünü girin.',
  statusHealthy: '✅ Sağlıklı',
  statusSick: '⚠️ Hasta',
  plantedDate: 'Ekim Tarihi',
  systemTypes: ['NFT', 'DWC', 'Dikey Kule', 'Hollanda Kovası', 'Aeroponik', 'Diğer'],
};

export const CREDIT = {
  balance: 'Kredi Bakiyesi',
  remaining: 'kalan teşhis hakkı',
  plan: 'Aktif Plan',
  freePlan: 'Ücretsiz',
  standardPlan: 'Standart',
  proPlan: 'Pro',
  buyTitle: 'Kredi Satın Al',
  buySubtitle: 'Teşhis yapmak için kredi satın alın',
  perDiagnose: 'teşhis başına 1 kredi',
  package10: '10 Teşhis Paketi',
  package10Price: '₺29',
  package30: '30 Teşhis Paketi',
  package30Price: '₺69',
  package100: '100 Teşhis Paketi',
  package100Price: '₺179',
  monthlyStandard: 'Standart Abonelik',
  monthlyStandardPrice: '₺49/ay',
  monthlyPro: 'Pro Abonelik',
  monthlyProPrice: '₺149/ay',
  unlimited: 'Sınırsız teşhis',
  popular: 'En Popüler',
  buyCta: 'Satın Al',
  lowCreditWarning: 'Son {n} teşhis hakkınız kaldı.',
  noCredit: 'Teşhis krediniz tükendi.',
  freeBonus: 'Kayıt bonusu: 10 teşhis',
  historyTitle: 'Kredi Kullanım Geçmişi',
  used: 'kullanıldı',
  added: 'eklendi',
};

export const KNOWLEDGE = {
  title: 'Bilgi Merkezi',
  subtitle: 'Hidroponik tarım rehberi',
  searchPlaceholder: 'Konu ara...',
  categories: {
    basics: 'Temel Bilgiler',
    nutrients: 'Besin & Kimya',
    systems: 'Sistemler',
    diseases: 'Hastalıklar',
    plants: 'Bitkiler',
  },
  articles: {
    ph: {
      title: 'pH Nedir?',
      emoji: '🧪',
      category: 'basics',
      readTime: '3 dk',
      summary: 'pH, besin çözeltisinin asitlik-bazlık dengesidir. Hidroponik sistemlerde en kritik parametrelerden biridir.',
      body: `pH (Hidrojen potansiyeli), 0-14 arasında bir ölçektir. 7 nötr, altı asit, üstü bazdır.

Hidroponik sistemlerde ideal pH aralığı genellikle **5.5 – 6.5** arasındadır. Bu aralık, bitkilerin besinleri en verimli şekilde alabildiği bölgedir.

**pH neden önemli?**
• pH yanlış olduğunda besinler kilitlenir — bitki yeterli mineral olsa bile alamaz
• 4.5 altı: demir, mangan toksisitesi
• 7.5 üstü: demir, çinko, mangan emilimi durur
• Her 0.5 birim sapma verimde %15–25 düşüşe yol açabilir

**pH nasıl ayarlanır?**
• Düşürmek için: pH Down (fosforik asit veya nitrik asit)
• Yükseltmek için: pH Up (potasyum hidroksit)
• Günlük ölçüm öneririz. Dijital pH metre en doğru sonucu verir.

**Bitki türüne göre ideal pH:**
• Marul, fesleğen, ıspanak: 5.5 – 6.5
• Domates, biber, salatalık: 5.5 – 6.5
• Çilek: 5.5 – 6.5
• Safran: 6.0 – 7.0`,
      tips: ['Günde en az 1 kez ölçün', 'Sabah ölçümü en kararlıdır', 'Besin değişiminden sonra mutlaka kontrol edin'],
    },
    ec: {
      title: 'EC (Elektriksel İletkenlik) Nedir?',
      emoji: '⚡',
      category: 'nutrients',
      readTime: '4 dk',
      summary: 'EC, besin solüsyonundaki mineral miktarını gösterir. Çok düşük olursa bitki aç kalır, çok yüksek olursa yanar.',
      body: `EC (Electrical Conductivity — Elektriksel İletkenlik), sudaki çözünmüş mineral/tuz miktarını mS/cm cinsinden ölçer.

**Neden önemli?**
Besin solüsyonunuzdaki gübre miktarını doğrudan yansıtır. EC olmadan bitkinin aç mı tok mu olduğunu bilemezsiniz.

**Genel EC rehberi:**
• 0 – 0.4: Saf su (besin yok)
• 0.8 – 1.6: Fide ve yaprak sebzeler
• 1.6 – 2.5: Orta gereksinimli bitkiler
• 2.5 – 3.5: Domates, biber, salatalık gibi meyve sebzeler
• 3.5+: Tehlikeli — kök yanması riski

**EC nasıl artırılır?**
Daha fazla gübre ekleyin. Ancak yavaş ekleyin — ani artış kök yakabilir.

**EC nasıl düşürülür?**
Temiz (saf) su ekleyin. Rezervuar büyükse bir miktarını boşaltıp yerine saf su koyun.

**Dikkat:** EC ölçer kalibrasyonu önemlidir. 3 ayda bir kalibrasyon çözeltisiyle kontrol edin.`,
      tips: ['Gün içinde EC yükselirse bitki su içiyor', 'EC düşüyorsa bitki besin tüketiyor', '2 haftada bir tam solüsyon değişimi yapın'],
    },
    yellowLeaves: {
      title: 'Yaprak Sararması Nedenleri',
      emoji: '🍋',
      category: 'diseases',
      readTime: '5 dk',
      summary: 'Sararma birçok farklı sorunun belirtisidir. Hangi yaprakların sarardığı tanı için kritiktir.',
      body: `Sararma (kloroz), hidroponikteki en sık görülen sorunlardan biridir. Ancak sebebi her zaman farklıdır.

**Alt yapraklar sarıyorsa → Azot eksikliği**
Azot bitkide hareketli bir elementtir. Bitki genç yapraklara öncelik verir, yaşlı yapraklardan azot çeker.
Çözüm: EC değerini artırın, kalsiyum nitrat ekleyin.

**Genç yapraklar sarıyorsa (damarlar yeşil) → Demir eksikliği**
pH 6.5 üzerine çıkınca demir çözünmez hale gelir.
Çözüm: pH'ı 5.5–6.0'a düşürün, Fe-EDTA şelat ekleyin.

**Tüm yaprak eşit sarıyorsa → Magnezyum eksikliği**
Özellikle domates ve biberde yaygındır.
Çözüm: Epsom tuzu (MgSO₄) ekleyin — 1 çay kaşığı / 4 litre.

**Yaprak kenarları sarıyorsa → Potasyum eksikliği**
Meyve döneminde K ihtiyacı artar.
Çözüm: Potasyum nitrat veya mono potasyum fosfat ekleyin.

**Hızlı tüm bitki soluyorsa → Kök çürüklüğü**
Kökler kahverengi ve sümüksüyse kök çürüklüğü var demektir.
Çözüm: Acil H₂O₂ uygulaması, sistem temizliği.`,
      tips: ['Fotoğraf çekip AI teşhis yapın', 'pH ve EC\'yi önce kontrol edin', 'Hangi yaprakların etkilendiğini not alın'],
    },
    rootRot: {
      title: 'Kök Çürümesi Nedir? Nasıl Önlenir?',
      emoji: '🦠',
      category: 'diseases',
      readTime: '5 dk',
      summary: 'Kök çürüklüğü hidroponikteki en tehlikeli hastalıktır. Erken müdahale hayat kurtarır.',
      body: `Kök çürüklüğü (Root Rot), genellikle Pythium mantarının neden olduğu ciddi bir hastalıktır. Sağlıklı kökler beyaz ve tüylüdür; hasta kökler kahverengi, siyah ve sümüksüdür.

**Belirtiler:**
• Kökler kahverengi/siyah renk
• Bitki yaprakları solar ve sararmaya başlar
• Kötü koku
• Yavaş büyüme

**Neden oluşur?**
• Su sıcaklığı 24°C üzeri (oksijen azalır)
• Yetersiz havalandırma (hava pompası yetersiz)
• Kirli rezervuar
• Yoğun dikim

**Acil tedavi:**
1. Etkilenen bitkiyi izole edin
2. Çürümüş kökleri steril makasla kesin
3. Kökleri %3 H₂O₂ solüsyonunda 30 saniye bekletin
4. Temiz suyla durulayın
5. Trichoderma veya Bacillus subtilis uygulayın

**Önleme:**
• Su sıcaklığını 18–22°C tutun
• Güçlü hava pompası kullanın
• Rezervuarı haftada bir temizleyin
• UV sterilizatör takın
• Besin solüsyonunu 2 haftada bir tamamen değiştirin`,
      tips: ['İlk belirtide hemen müdahale edin', 'Su sıcaklığı en kritik faktördür', 'Bakır iyonu solüsyonu koruyucudur'],
    },
    nft: {
      title: 'NFT Sistemi Nedir?',
      emoji: '🌊',
      category: 'systems',
      readTime: '4 dk',
      summary: 'Nutrient Film Technique — ince besin filmi akan kanallar. Marul ve otlar için mükemmeldir.',
      body: `NFT (Nutrient Film Technique — Besin Filmi Tekniği), besin solüsyonunun ince bir film halinde kanallar içinde sürekli aktığı sistemdir.

**Nasıl çalışır?**
• Bitki kökleri kanal içinde asılı kalır
• İnce besin filmi köklerin altından geçer
• Köklerin üstü havada kalır → bol oksijen alır
• Solüsyon rezervuara döner, pompa tekrar iter

**Avantajları:**
✓ Az su ve besin tüketir
✓ Kök oksijenlenmesi mükemmel
✓ Dikey kuruluma uygun
✓ Marul, fesleğen, nane, ıspanak için ideal
✓ Hızlı büyüme

**Dezavantajları:**
✗ Pompa dursa 2–4 saatte kökler kurur
✗ Büyük (ağır) bitkiler için uygun değil
✗ Kök çürüklüğü hızla yayılabilir

**Tavsiye edilen bitkiler:**
Marul, fesleğen, nane, roka, ıspanak, maydanoz`,
      tips: ['Kanal eğimini %2–3 tutun', 'Film kalınlığı 2–3mm ideal', 'Yedek pompa bulundurun'],
    },
    dwc: {
      title: 'DWC Sistemi Nedir?',
      emoji: '💧',
      category: 'systems',
      readTime: '3 dk',
      summary: 'Deep Water Culture — kökler doğrudan besin suyunda asılı durur. En basit ve etkili sistem.',
      body: `DWC (Deep Water Culture — Derin Su Kültürü), bitki köklerinin doğrudan besin solüsyonunda asılı kaldığı, en basit hidroponik sistemdir.

**Nasıl çalışır?**
• Bitkiler köpük veya net pot içinde kapağa yerleştirilir
• Kökler besin solüsyonuna sarkar
• Hava pompası oksijen sağlar
• Kökler hem besin hem oksijen alır

**Avantajları:**
✓ Kurulumu çok kolay
✓ Az hareketli parça → az arıza
✓ Büyük bitkiler için uygun (domates, salatalık)
✓ Yüksek verim
✓ Düşük maliyet

**Dezavantajları:**
✗ Sık su sıcaklığı kontrolü gerekir
✗ Kök çürüklüğüne dikkat
✗ Büyük rezervuar hacmi gerekir

**Tavsiye edilen bitkiler:**
Marul, domates, salatalık, biber, çilek`,
      tips: ['Rezervuarı karanlık tutun — yosun önler', 'Su sıcaklığı 18–22°C ideal', 'Hava taşı köklere yakın olsun'],
    },
    harvestTime: {
      title: 'Bitkiler Ne Zaman Hasat Edilir?',
      emoji: '🌾',
      category: 'plants',
      readTime: '3 dk',
      summary: 'Her bitkinin hasat süresi farklıdır. Doğru zamanlama hem lezzeti hem de verimi etkiler.',
      body: `Hidroponik sistemlerde bitkiler toprağa göre %30–50 daha hızlı büyür. Ancak hasat zamanı bitki türüne göre değişir.

**Tahmini büyüme süreleri:**

| Bitki | Ekimden Hasada |
|-------|---------------|
| Marul | 30–45 gün |
| Fesleğen | 25–35 gün |
| Roka | 25–35 gün |
| Ispanak | 25–40 gün |
| Nane | 30–40 gün |
| Domates | 60–80 gün |
| Salatalık | 50–70 gün |
| Biber | 70–90 gün |
| Çilek | 60–90 gün |
| Safran | 90–120 gün |

**Hasat ipuçları:**
• Marul: Yapraklar tam açıldığında, çiçeklenmeden önce
• Domates: Renk tam oluştuğunda
• Fesleğen: Çiçeklenmeden önce — düzenli budama verimi artırır
• Salatalık: Küçükken daha lezzetli

**Kademeli hasat:** Yaprak sebzeleri tek seferde değil, dıştan içe doğru alarak hasata devam edebilirsiniz.`,
      tips: ['Sabah erken hasat lezzeti artırır', 'Hasat sonrası pH ve EC ayarlayın', 'Çiçeklenme başlarsa hemen hasat edin'],
    },
    nutrients: {
      title: 'Besin Eksikliği Nasıl Tanınır?',
      emoji: '🧬',
      category: 'nutrients',
      readTime: '5 dk',
      summary: 'Her besin eksikliğinin kendine özgü görsel belirtisi vardır. Doğru tanı = doğru çözüm.',
      body: `Hidroponik sistemlerde bitki ihtiyacı olan her şeyi sizden alır. Besin eksiklikleri genellikle görsel belirtilerle kendini gösterir.

**Ana (Makro) Besin Eksiklikleri:**

**Azot (N) eksikliği:**
• Belirti: Alt yapraklardan yukarı sararma
• Sebep: Düşük EC, pH sorunu
• Çözüm: Kalsiyum nitrat ekle, EC artır

**Fosfor (P) eksikliği:**
• Belirti: Yaprak altı mor/kırmızımsı renk
• Sebep: Düşük sıcaklık, yüksek pH
• Çözüm: pH 5.8–6.2'ye düşür, monoamonyum fosfat ekle

**Potasyum (K) eksikliği:**
• Belirti: Yaprak kenarları sarı/kahverengi
• Sebep: Dengesiz gübre, meyve döneminde artan ihtiyaç
• Çözüm: Potasyum nitrat artır

**Mikro Besin Eksiklikleri:**

**Demir (Fe) eksikliği:**
• Belirti: Genç yapraklarda damarlar arası sararma
• Sebep: pH 6.5 üzeri
• Çözüm: pH düşür, Fe-EDTA şelat ekle

**Kalsiyum (Ca) eksikliği:**
• Belirti: Genç yaprak kenarları yanar, domates/biberde BER
• Çözüm: Kalsiyum nitrat, pH 6.0–6.5

**Magnezyum (Mg) eksikliği:**
• Belirti: Ortadaki yapraklarda damarlar arası sararma
• Çözüm: Epsom tuzu (MgSO₄)`,
      tips: ['Fotoğraflı teşhis en hızlı yöntemdir', 'pH her zaman ilk kontrol edilmeli', 'Birden fazla eksiklik aynı anda olabilir'],
    },
  },
};

export const PROFILE = {
  title: 'Profil',
  myAccount: 'Hesabım',
  appName: 'Uygulama',
  accountType: 'Hesap Tipi',
  userId: 'Kullanıcı ID',
  firebaseAccount: 'Firebase Auth',
  localTest: 'Lokal Test',
  liveAccount: 'Canlı kullanıcı hesabı',
  testAccount: 'Test kullanıcı modu',
  multiUserNote: 'Çok kullanıcılı yapıya hazır',
  multiUserNoteText: 'Firebase bilgileri girildiğinde kullanıcı kayıtları, bitki verileri, teşhis geçmişi ve fotoğraflar kullanıcı hesabına bağlı şekilde yönetilebilir.',
  creditSection: 'Kredi & Paket',
  usageStats: 'Kullanım İstatistikleri',
  totalDiagnoses: 'Toplam Teşhis',
  totalPlants: 'Toplam Bitki',
  memberSince: 'Üyelik Tarihi',
  settings: 'Ayarlar',
  notifications: 'Bildirimler',
  language: 'Dil',
  turkish: 'Türkçe',
  kvkkTitle: 'KVKK & Gizlilik',
  supportTitle: 'Destek',
  version: 'Uygulama Versiyonu',
  logoutBtn: 'Çıkış Yap',
  defaultUser: 'Özka Kullanıcısı',
};

export const ERRORS = {
  generic: 'Bir hata oluştu. Lütfen tekrar deneyin.',
  noInternet: 'İnternet bağlantısı yok.',
  analysisError: 'Görüntü analiz edilemedi. Lütfen tekrar deneyin.',
  saveError: 'Kayıt sırasında bir hata oluştu.',
};
