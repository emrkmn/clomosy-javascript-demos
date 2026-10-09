# ⚡ Clomosy WIA Field Operations & Operations Analytics Pro (V2.0)

Clomosy Web-In-App (WIA) ve modern mobil JavaScript çalışma ortamı için deklaratif UI bileşenleriyle geliştirilmiş; **canlı GPS**, **çift kademeli arama/filtreleme**, **yerel veri kalıcılığı (LocalStorage)** ve **interaktif analitik kokpiti** sunan uçtan uca kurumsal saha operasyon yönetim sistemi.

---

## 🌟 Öne Çıkan Mimari Yetenekler

- **%100 Clomosy Uyumlu `ModernButton`:** React Native buton sınırlamalarını aşmak için tasarlanan, varyant destekli (`primary`, `secondary`, `success`, `danger`, `outline`) `Pressable` sarmalayıcısı.
- **Çift Kademeli Dinamik Filtreleme:** Görev durumu (`Planlandı` / `Tamamlandı`) ve ilçe/bölge çiplerinin metin aramasıyla anlık senkronizasyonu.
- **Donanım ve Sensör Köprüsü (Graceful Fallback):**
  - **Canlı GPS:** `Clomosy.Location.getCurrentPosition` ve `navigator.geolocation` üzerinden anlık enlem/boylam tespiti.
  - **Hızlı İletişim & Navigasyon:** Tek tuşla doğrudan telefon arama (`tel:`) ve Google Maps rota motoru (`mapsUrl`).
  - **Haptik & Bildirim:** Eylemlerde titreşim geri bildirimi (`Haptics`) ve otomatik sönen Toast sistemi.
- **Sıfır Veri Kaybı (State Persistence):** `localStorage` entegrasyonu sayesinde uygulama kapandığında veya sayfa yenilendiğinde ziyaret/cari verilerini otomatik koruma.
- **Sıfır Bağımlılıklı Analitik Paneli (Zero-Dependency Charts):** Harici grafik kütüphanelerine ihtiyaç duymadan saf CSS/Flexbox ile render edilen dinamik haftalık sütun grafikler ve bölgesel dağılım barları.

---

## 🏗️ Modül Mimarisi

| Sekme / Modül | Kapsam | Yetenekler |
| :--- | :--- | :--- |
| **🗓️ Ziyaretler** | Günlük Görev Akışı | Arama, durum & ilçe filtreleri, tek tıkla arama, rota ve tamamlandı/sil aksiyonları. |
| **🏢 Cariler** | Müşteri Rehberi | Yeni firma/cari kaydı, koordinat sabitleme, müşteriye özel hızlı ziyaret planlama. |
| **📊 Analitik** | Performans Kokpiti | Dönemlik (Bugün/Hafta/Ay) başarı puanı, tamamlanma yüzdesi, sütun grafik ve görev dağılımı. |

---

## 🛠️ Kullanılan Teknolojiler & API'ler

- **Çalışma Ortamı:** Clomosy Web-In-App (WIA) / React Native Declarative Engine
- **Donanım API:** `Clomosy.Location`, `Clomosy.openURL`, `Haptics`
- **Veri Katmanı:** `localStorage` JSON State Serializer
- **Ekran Güvenliği:** `SafeArea` & `StatusBar` çentik koruması

---

## 🚀 Çalıştırma

1. `App.js` dosyasındaki kod bloğunu kopyalayın.
2. Clomosy IDE üzerinde JavaScript / Web editörüne yapıştırın.
3. Test simülatöründe veya Clomosy mobil uygulamasında çalıştırın.
