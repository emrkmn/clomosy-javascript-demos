// ==========================================
// BİRİM 1: MainCode (Giriş & Kimlik Doğrulama - Kamera Destekli)
// ==========================================

let loginRolSecim = "SAHA_PERSONELI"; // 'SAHA_PERSONELI' | 'YONETICI'
let loginKullanici = "ali.emre";
let loginSifre = "123456";
let loginHata = "";
let kameraAcik = false; // Kamera tarayıcı görünürlük durumu

// Sistem Personel & Kullanıcı Havuzu
const SISTEM_PERSONELLER = [
  { id: 101, kullaniciAdi: "ali.emre", sifre: "123456", adSoyad: "Ali Emre ATA", rol: "SAHA_PERSONELI", unvan: "Kıdemli Saha Sorumlusu", bolge: "Konya / Merkez", aylikHedef: 500000, tamamlanan: 380000, gunlukHedef: 6, gunlukTamamlanan: 4 },
  { id: 102, kullaniciAdi: "selin.celik", sifre: "123456", adSoyad: "Selin Çelik", rol: "SAHA_PERSONELI", unvan: "Saha Satış Temsilcisi", bolge: "Konya / Sanayi", aylikHedef: 400000, tamamlanan: 240000, gunlukHedef: 5, gunlukTamamlanan: 2 },
  { id: 103, kullaniciAdi: "ahmet.yonetici", sifre: "admin123", adSoyad: "Ahmet Yılmaz", rol: "YONETICI", unvan: "Satış Direktörü & Genel Müdür", bolge: "Genel Merkez", aylikHedef: 1500000, tamamlanan: 1040000, gunlukHedef: 0, gunlukTamamlanan: 0 }
];

// Müşteri / Cari Portföyü
const SISTEM_MUSTERILER = [
  { id: 1, name: "Elif Öztürk", company: "Zirve Holding", phone: "05321112233", email: "elif@zirve.com", industry: "Finans & Yatırım", value: 620000, state: 0, atananId: 101, adres: "Teknoloji Vadisi No:12, Selçuklu", koordinat: "37.9542,32.5086" },
  { id: 2, name: "Dr. Selim Kaya", company: "Medikal Tıp Ltd.", phone: "05442223344", email: "selim@medikal.com", industry: "Sağlık & Donanım", value: 310000, state: 2, atananId: 101, adres: "Sanayi Cad. 4. Blok No:8, Meram", koordinat: "37.8682,32.4831" },
  { id: 3, name: "Bora Demir", company: "Demir Mimarlık A.Ş.", phone: "05553334455", email: "bora@demirmim.com", industry: "Yapı & Proje", value: 450000, state: 3, atananId: 102, adres: "Karatay İş Merkezi B-4", koordinat: "37.8820,32.5312" },
  { id: 4, name: "Ahmet Kaya", company: "Kaya Lojistik Depo", phone: "05334445566", email: "ahmet@kayaloj.com", industry: "Lojistik / Filo", value: 460000, state: 3, atananId: 101, adres: "Organize Sanayi 12. Sokak", koordinat: "37.9810,32.5520" }
];

// Canlı Ziyaret Akışı
const SISTEM_ZIYARETLER = [
  { id: 1, musteriAd: "Zirve Holding", personelAd: "Ali Emre ATA", tur: "Saha Sunumu", not: "El terminali donanım paketi için demo yapıldı.", tarih: "Bugün 11:30", konum: "37.9542, 32.5086 (GPS)" }
];

function metinAl(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (v.target && v.target.value !== undefined) return v.target.value;
  if (v.nativeEvent && v.nativeEvent.text !== undefined) return v.nativeEvent.text;
  return String(v);
}

function MainScreen() {
  
  // Şifreyle Normal Giriş
  function girisDene() {
    loginHata = "";
    const kAd = loginKullanici.trim().toLowerCase();
    const sif = loginSifre.trim();

    let bulunan = SISTEM_PERSONELLER.find(p => p.kullaniciAdi.toLowerCase() === kAd && p.sifre === sif);

    if (!bulunan) {
      loginHata = "Kullanıcı adı veya şifre hatalı!";
      rerender();
      return;
    }

    if (bulunan.rol !== loginRolSecim) {
      loginHata = "Seçilen giriş türü bu kullanıcı yetkisi ile uyuşmuyor!";
      rerender();
      return;
    }

    // Birim 2'ye (RouterScreen) çalışma paketini devret
    Navigate("RouterScreen", {
      kullanici: bulunan,
      personeller: SISTEM_PERSONELLER,
      musteriler: SISTEM_MUSTERILER,
      ziyaretler: SISTEM_ZIYARETLER
    });
  }

  // Kamera ile QR / Barkod Okunduğunda Otomatik Giriş
  function onKameraOkundu(sonuc) {
    const kod = sonuc && sonuc.data ? String(sonuc.data).trim() : "";
    if (!kod) return;

    // Kod, personelin kullanıcı adı veya sicil ID'si ile eşleşiyor mu?
    let bulunan = SISTEM_PERSONELLER.find(p => 
      p.kullaniciAdi.toLowerCase() === kod.toLowerCase() || 
      String(p.id) === kod
    );

    if (bulunan) {
      kameraAcik = false;
      Haptics.notification("success");
      Toast.show("Hoş geldiniz, " + bulunan.adSoyad, { type: "success" });
      
      Navigate("RouterScreen", {
        kullanici: bulunan,
        personeller: SISTEM_PERSONELLER,
        musteriler: SISTEM_MUSTERILER,
        ziyaretler: SISTEM_ZIYARETLER
      });
    } else {
      Haptics.notification("error");
      loginHata = "Geçersiz veya yetkisiz personel kartı! (" + kod + ")";
      kameraAcik = false;
      rerender();
    }
  }

  function demoSec(rol) {
    loginRolSecim = rol;
    if (rol === "YONETICI") {
      loginKullanici = "ahmet.yonetici";
      loginSifre = "admin123";
    } else {
      loginKullanici = "ali.emre";
      loginSifre = "123456";
    }
    loginHata = "";
    rerender();
  }

  // -------------------------------------------------------------
  // KAMERA AÇIKSA: VİZÖR VE BARKOD TARAYICI GÖSTERİMİ
  // -------------------------------------------------------------
  if (kameraAcik) {
    return Screen({ style: { backgroundColor: "#000000", flex: 1 } }, [
      SafeArea({ edges: ["top", "bottom"], style: { flex: 1 } }, [
        Column({ style: { flex: 1 } }, [
          
          // Kamera Üst Başlığı
          Row({
            style: {
              backgroundColor: "rgba(15, 23, 42, 0.85)",
              paddingHorizontal: 16,
              paddingVertical: 14,
              justifyContent: "space-between",
              alignItems: "center"
            }
          }, [
            Text({ style: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" } }, ["Personel Kartı Okutun"]),
            Pressable({
              style: { backgroundColor: "#EF4444", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
              onPress: function () { kameraAcik = false; rerender(); }
            }, [
              Text({ style: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" } }, ["✕ Kapat"])
            ])
          ]),

          // Barkod / QR Kamera Penceresi
          BarcodeScanner({
            active: kameraAcik,
            barcodeTypes: ["qr", "code128", "code39", "ean13"],
            onScanned: onKameraOkundu,
            style: { flex: 1, backgroundColor: "#000000" }
          }),

          // Alt Bilgi Paneli
          Column({
            style: {
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              padding: 20,
              gap: 8,
              alignItems: "center"
            }
          }, [
            Text({ style: { color: "#38BDF8", fontSize: 13, fontWeight: "700" } }, [
              "Kamerayı personel yaka kartına veya QR koda hizalayın"
            ]),
            Text({ style: { color: "#94A3B8", fontSize: 11, textAlign: "center" } }, [
              "Kartınız tanımlandığında şifreye gerek kalmadan sisteme otomatik giriş yapılacaktır."
            ])
          ])

        ])
      ])
    ]);
  }

  // -------------------------------------------------------------
  // NORMAL GİRİŞ EKRANI (ŞİFRELİ & BUTONLU)
  // -------------------------------------------------------------
  return Screen({
    style: { backgroundColor: "#070B12", flex: 1 }
  }, [
    SafeArea({ edges: ["top", "bottom"], style: { flex: 1 } }, [
      ScrollView({
        style: { flex: 1 },
        contentContainerStyle: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 }
      }, [
        Column({ style: { maxWidth: 420, width: "100%", gap: 18 } }, [

          Column({ style: { alignItems: "center", gap: 6 } }, [
            View({
              style: {
                width: 58, height: 58, borderRadius: 16,
                backgroundColor: "rgba(2, 132, 199, 0.15)", borderWidth: 1, borderColor: "rgba(56, 189, 248, 0.3)",
                alignItems: "center", justifyContent: "center", marginBottom: 4
              }
            }, [
              Text({ style: { fontSize: 26 } }, [loginRolSecim === "YONETICI" ? "👔" : "📍"])
            ]),
            Text({ style: { fontSize: 24, fontWeight: "900", color: "#F8FAFC", letterSpacing: 0.5 } }, ["CLOMOSY CRM"]),
            Text({ style: { fontSize: 12, color: "#94A3B8" } }, ["Kurumsal Saha ve Satış Yönetim Ağı"])
          ]),

          Row({
            style: { backgroundColor: "#111827", padding: 4, borderRadius: 12, borderWidth: 1, borderColor: "#1E293B", gap: 4 }
          }, [
            RolSecimTab("🏃 Saha Girişi", "SAHA_PERSONELI", loginRolSecim, demoSec),
            RolSecimTab("👔 Yönetici Girişi", "YONETICI", loginRolSecim, demoSec)
          ]),

          Column({
            style: { backgroundColor: "#111827", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#1E293B", gap: 12 }
          }, [

            loginHata ? View({
              style: { backgroundColor: "rgba(239, 68, 68, 0.15)", borderWidth: 1, borderColor: "#EF4444", padding: 10, borderRadius: 8 }
            }, [
              Text({ style: { color: "#FCA5A5", fontSize: 11, fontWeight: "700", textAlign: "center" } }, [loginHata])
            ]) : View({}, []),

            Column({ style: { gap: 4 } }, [
              Text({ style: { color: "#94A3B8", fontSize: 10, fontWeight: "800" } }, ["KULLANICI ADI / SİCİL"]),
              TextInput({
                defaultValue: loginKullanici,
                placeholder: "Kullanıcı adı...",
                placeholderTextColor: "#475569",
                style: { backgroundColor: "#070B12", color: "#F8FAFC", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#1E293B", fontSize: 13 },
                onChangeText: v => loginKullanici = metinAl(v)
              })
            ]),

            Column({ style: { gap: 4 } }, [
              Text({ style: { color: "#94A3B8", fontSize: 10, fontWeight: "800" } }, ["GÜVENLİK ŞİFRESİ"]),
              TextInput({
                defaultValue: loginSifre,
                secureTextEntry: true,
                placeholder: "••••••",
                placeholderTextColor: "#475569",
                style: { backgroundColor: "#070B12", color: "#F8FAFC", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#1E293B", fontSize: 13 },
                onChangeText: v => loginSifre = metinAl(v)
              })
            ]),

            // Şifreli Giriş Butonu
            Pressable({
              onPress: girisDene,
              style: { backgroundColor: loginRolSecim === "YONETICI" ? "#0F766E" : "#0284C7", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 4 }
            }, [
              Text({ style: { color: "#FFFFFF", fontWeight: "900", fontSize: 14 } }, ["Sisteme Bağlan →"])
            ]),

            // YENİ: Kamera ile Hızlı Kart / QR Tarama Butonu
            Pressable({
              onPress: function () {
                loginHata = "";
                kameraAcik = true;
                rerender();
              },
              style: {
                backgroundColor: "rgba(56, 189, 248, 0.1)",
                borderWidth: 1,
                borderColor: "rgba(56, 189, 248, 0.4)",
                paddingVertical: 11,
                borderRadius: 10,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
                marginTop: 2
              }
            }, [
              Text({ style: { fontSize: 16 } }, ["📷"]),
              Text({ style: { color: "#38BDF8", fontWeight: "800", fontSize: 13 } }, ["Kart / QR ile Hızlı Giriş"])
            ])

          ])

        ])
      ])
    ])
  ]);
}

function RolSecimTab(etiket, rol, aktifRol, onSec) {
  const aktif = aktifRol === rol;
  return Pressable({
    onPress: () => onSec(rol),
    style: {
      flex: 1, paddingVertical: 8, borderRadius: 8,
      backgroundColor: aktif ? (rol === "YONETICI" ? "#0F766E" : "#0284C7") : "transparent",
      alignItems: "center"
    }
  }, [
    Text({ style: { fontSize: 11, fontWeight: "800", color: aktif ? "#FFFFFF" : "#94A3B8" } }, [etiket])
  ]);
}
