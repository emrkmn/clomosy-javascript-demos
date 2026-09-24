# 📍 Enterprise Field Operations & Management CRM

Bu modül, Clomosy JavaScript katmanında deklaratif arayüz elemanları kullanılarak geliştirilmiş, **4 bağımsız birimden (modülden)** oluşan kurumsal bir saha ve yönetim CRM çözümüdür.

---

## 📁 Modül Mimarisi

| Birim / Dosya | Modül Adı | İşlev ve Yetenekler |
| :--- | :--- | :--- |
| **`01-MainCode.js`** | Giriş & Doğrulama | Personel/Yönetici rol ayrımı, şifreli giriş ve `BarcodeScanner` vizörü ile anında personel kartı okuma. |
| **`02-RouterScreen.js`** | Yönlendirici (RBAC) | Oturum parametrelerini denetleyen, oturum kaçaklarını önleyen ve kullanıcıyı yetkisine ait ekrana yönlendiren güvenlik köprüsü. |
| **`03-YoneticiScreen.js`** | Yönetici Konsolu | Şirket konsolide cirosu, ekip satış kotaları güncelleme, yeni cari oluşturma ve müşterileri personele zimmetleme. |
| **`04-SahaScreen.js`** | Saha Operasyonu | Günlük ziyaret rota takibi, tek dokunuşla rota & arama, cariye özel not defteri ve yerel kamera ile fotoğraflı tutanak. |

---

## 🌟 Öne Çıkan Donanım Özellikleri
- **Barkod / QR Vizörü:** Yaka kartı tarama ile şifresiz hızlı giriş.
- **Canlı Cihaz Kamerası (`ImagePicker`):** Ziyaret tutanaklarına doğrudan cihaz donanım kamerasından fotoğraf iliştirme.
- **Harita & İletişim Entegrasyonları:** Google Maps navigasyon (`openURL`) ve cihaz çeviricisi (`tel:`).
