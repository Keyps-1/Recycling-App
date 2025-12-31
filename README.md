# ♻️ Geri Dönüşüm Mobil Uygulaması

Bu proje, **çevre bilincini artırmak**, **geri dönüşümü günlük alışkanlık haline getirmek** ve kullanıcıları **oyunlaştırma (gamification)** yaklaşımıyla motive etmek amacıyla geliştirilmiş bir **mobil geri dönüşüm uygulamasıdır**.

Uygulama; kullanıcıların geri dönüştürdüğü ürünleri taramasını, puan kazanmasını, rozetler elde etmesini, istatistiklerini görmesini ve geri dönüşüm sürecini somut verilerle takip etmesini sağlar.

---

## 🚀 Projenin Amacı

Geri dönüşüm konusunda bireysel farkındalık çoğu zaman sürdürülebilir değildir. Bu proje;

* Kullanıcıyı **aktif katılımcı** haline getirmeyi,
* Geri dönüşümü **ölçülebilir** ve **ödüllendirilebilir** bir sürece dönüştürmeyi,
* Çevresel katkıyı (geri dönüştürülen ürün sayısı, kazanılan puan, rozetler vb.) **görselleştirmeyi** hedefler.

---

## 🧩 Temel Özellikler

### 👤 Kullanıcı Yönetimi

* Kayıt olma ve giriş yapma (Authentication)
* Kullanıcıya özel profil bilgileri
* Profil fotoğrafı (avatar) yükleme

### 📷 Ürün Tarama (Scanner)

* Kamera erişimi ile ürün tarama
* Geri dönüştürülen ürünlerin kayıt altına alınması
* Tarama sonrası puan kazanımı

### 🎯 Görev & Rozet Sistemi

* Belirli hedeflere dayalı görevler (ilk geri dönüşüm, 5 ürün, 10 ürün vb.)
* Otomatik rozet kazanımı
* Rozet sayısına göre kullanıcı ilerlemesi

### 🔥 Streak Sistemi

* Günlük geri dönüşüm alışkanlığını teşvik eden seri (streak)
* Gün atlanması durumunda streak sıfırlama

### 📊 İstatistikler

* Toplam puan
* Geri dönüştürülen ürün sayısı
* Günlük / toplam ilerleme
* Grafiklerle görselleştirilmiş veriler

### 🗂️ Geçmiş (History)

* Kullanıcının yaptığı tüm geri dönüşüm işlemlerinin listesi
* Tarih bazlı kayıt

---

## 🏗️ Kullanılan Teknolojiler

### 📱 Mobil

* **React Native**
* **Expo** (expo-router dahil)
* TypeScript

### 🔐 Backend / Veri Yönetimi

* **Supabase**

  * Authentication
  * PostgreSQL veritabanı
  * Row Level Security (RLS)

### 📈 Grafik & Görselleştirme

* react-native-chart-kit
* victory-native

---

## 📂 Proje Klasör Yapısı 

```
app/
 ├─ (tabs)/
 │   ├─ _layout.tsx      → Bottom Tab yapılandırması
 │   ├─ index.tsx        → Ana ekran (Home)
 │   ├─ statistics.tsx   → İstatistikler
 │   ├─ profile.tsx      → Profil
 │   ├─ missions.tsx     → Görevler
 │   ├─ badges.tsx       → Rozetler
 │   ├─ history.tsx      → Geri dönüşüm geçmişi
 │   └─ leaderboard.tsx  → Sıralama
 │
 ├─ login.tsx            → Giriş ekranı
 ├─ register.tsx         → Kayıt ekranı
 ├─ scanner.tsx          → Kamera & tarama
 ├─ modal.tsx            → Modal ekran
 └─ _layout.tsx          → Root navigation

```

---

## 🗄️ Veritabanı Yapısı (Özet)

* **users_profile**

  * id (auth.users ile ilişkili)
  * name
  * avatar_url
  * total_points

* **recycling_history**

  * user_id
  * product_type
  * points
  * created_at

* **badges**

  * title
  * description
  * required_count

---

## 🔒 Güvenlik

* Her kullanıcı yalnızca **kendi verilerine** erişebilir
* Supabase Row Level Security (RLS) aktif
* Kullanıcı ID’leri `auth.users` tablosu ile ilişkilidir

---

## 🎮 Oyunlaştırma Yaklaşımı

Bu proje klasik bir geri dönüşüm uygulaması değil;

* Puan sistemi
* Rozetler
* Streak
* Görsel geri bildirimler

ile kullanıcıyı **davranışsal olarak motive etmeyi** amaçlar.

Kısacası: *Geri dönüşüm ama sıkıcı değil.*

---

## 🧪 Geliştirme Durumu

* ✅ Temel kullanıcı akışları tamamlandı
* ✅ Puanlama & rozet sistemi aktif
* 🔄 Geliştirmeye açık alanlar:

  * Ürün türüne göre CO₂ tasarrufu hesaplama
  * Harita tabanlı geri dönüşüm noktaları
  * Sosyal karşılaştırma (leaderboard)

---

## 📌 Kurulum

```bash
npm install
npx expo start
```

Expo Go veya Android Emulator üzerinden çalıştırılabilir.

---

## 👨‍💻 Geliştirici

Bu proje, **çevre sorunlarıyla teknoloji yoluyla mücadele etmeyi hedefleyen** bir bilgisayar mühendisliği çalışmasıdır.

Akademik projeler (TÜBİTAK 2209-A) ve sürdürülebilirlik temelli uygulamalar için örnek bir altyapı sunar.

---

## 🌍 Son Söz

> Küçük bir geri dönüşüm, büyük bir etki yaratır.

Bu uygulama, bu fikri kodla hayata geçirme denemesidir.
