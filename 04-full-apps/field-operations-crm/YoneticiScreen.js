// ==========================================
// BİRİM 3: YoneticiScreen (Yönetici Kontrol Merkezi)
// ==========================================

let yoneticiSekme = 0; // 0: Genel Bakış, 1: Portföy & Arama, 2: Saha Akışı, 3: Ekip & Kotalar
let seciliMusteri = null;
let seciliPersonel = null;

// Modallar
let ataModalAcik = false;
let hedefModalAcik = false;
let yeniCariModalAcik = false;
let yeniPersonelModalAcik = false;

// Arama Filtreleri
let cariAramaInput = "";

// Form Değişkenleri
let fYeniHedef = "";

// Yeni Cari Formu
let fCariUnvan = "";
let fCariYetkili = "";
let fCariTel = "";
let fCariSektor = "Teknoloji";
let fCariAdres = "";
let fCariBakiye = "";

// Yeni Personel Formu
let fPerAd = "";
let fPerKullanici = "";
let fPerSifre = "123456";
let fPerBolge = "Konya / Selçuklu";
let fPerHedef = "400000";
let fPerGunlukHedef = "5";

let idSayacYonetici = 600;

function formatTL(tutar) {
  if (!tutar || isNaN(tutar)) return "₺0";
  let s = Math.round(tutar).toString();
  let res = "";
  let say = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    res = s.charAt(i) + res;
    say++;
    if (say % 3 === 0 && i !== 0) res = "." + res;
  }
  return "₺" + res;
}

function metinAl(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (v.target && v.target.value !== undefined) return v.target.value;
  if (v.nativeEvent && v.nativeEvent.text !== undefined) return v.nativeEvent.text;
  return String(v);
}

function YoneticiScreen(params) {
  if (!params || !params.kullanici || params.kullanici.rol !== "YONETICI") {
    Navigate("MainScreen");
    return Screen({}, []);
  }

  const personeller = params.personeller;
  const musteriler = params.musteriler;
  const ziyaretler = params.ziyaretler;

  let toplamCiro = 0;
  let toplamHedef = 0;
  for (let i = 0; i < personeller.length; i++) {
    toplamCiro += personeller[i].tamamlanan;
    toplamHedef += personeller[i].aylikHedef;
  }
  const basari = Math.round((toplamCiro / (toplamHedef || 1)) * 100);

  function cikisYap() {
    Navigate("MainScreen");
  }

  // Yeni Cari Kaydetme
  function cariKaydet() {
    if (!fCariUnvan.trim() || !fCariYetkili.trim()) return;
    idSayacYonetici++;

    const yeni = {
      id: idSayacYonetici,
      company: fCariUnvan.trim(),
      name: fCariYetkili.trim(),
      phone: fCariTel.trim() || "03325550000",
      email: "info@firma.com",
      industry: fCariSektor.trim() || "Genel Ticaret",
      value: parseFloat(fCariBakiye.replace(/[^0-9]/g, "")) || 50000,
      state: 0,
      atananId: 101, // Varsayılan ilk personele ata
      adres: fCariAdres.trim() || "Konya / Sanayi",
      koordinat: "37.9542,32.5086",
      sonZiyaret: "Bugün Eklendi"
    };

    musteriler.unshift(yeni);
    yeniCariModalAcik = false;
    fCariUnvan = ""; fCariYetkili = ""; fCariTel = ""; fCariAdres = ""; fCariBakiye = "";
    rerender();
  }

  // Yeni Saha Personeli Ekleme
  function personelKaydet() {
    if (!fPerAd.trim() || !fPerKullanici.trim()) return;
    idSayacYonetici++;

    const yeniPersonel = {
      id: idSayacYonetici,
      kullaniciAdi: fPerKullanici.trim().toLowerCase(),
      sifre: fPerSifre.trim() || "123456",
      adSoyad: fPerAd.trim(),
      rol: "SAHA_PERSONELI",
      unvan: "Saha Satış Sorumlusu",
      bolge: fPerBolge.trim() || "Konya / Merkez",
      aylikHedef: parseFloat(fPerHedef.replace(/[^0-9]/g, "")) || 400000,
      tamamlanan: 0,
      gunlukHedef: parseInt(fPerGunlukHedef, 10) || 5,
      gunlukTamamlanan: 0
    };

    personeller.push(yeniPersonel);
    yeniPersonelModalAcik = false;
    fPerAd = ""; fPerKullanici = "";
    rerender();
  }

  let icerik;

  // ------------------------------------------
  // SEKME 0: GENEL BAKIŞ & EKİP PERFORMANSI
  // ------------------------------------------
  if (yoneticiSekme === 0) {
    icerik = ScrollView({ style: { flex: 1 }, contentContainerStyle: { paddingBottom: 32, gap: 12 } }, [
      View({
        style: { backgroundColor: "#111827", borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "#0F766E", gap: 8 }
      }, [
        Row({ style: { justifyContent: "space-between" } }, [
          Text({ style: { color: "#94A3B8", fontSize: 10, fontWeight: "900", letterSpacing: 0.8 } }, ["KONSOLİDE ŞİRKET CİROSU"]),
          Text({ style: { color: "#34D399", fontSize: 11, fontWeight: "900" } }, ["%" + basari + " Hedefe Ulaşıldı"])
        ]),
        Text({ style: { color: "#F8FAFC", fontSize: 26, fontWeight: "900" } }, [formatTL(toplamCiro)]),
        Text({ style: { color: "#64748B", fontSize: 11 } }, ["Toplam Satış Hedefi: " + formatTL(toplamHedef)])
      ]),

      Row({ style: { justifyContent: "space-between", alignItems: "center", marginTop: 4 } }, [
        Text({ style: { color: "#F8FAFC", fontSize: 14, fontWeight: "900" } }, ["👥 Saha Ekip Durumu (" + personeller.filter(p => p.rol === "SAHA_PERSONELI").length + ")"]),
        Button({
          title: "+ Yeni Personel",
          style: { backgroundColor: "#0F766E", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
          onPress: function() { yeniPersonelModalAcik = true; rerender(); }
        })
      ]),

      Column({ style: { gap: 10 } }, personeller.filter(p => p.id !== 103).map(function(p) {
        const y = Math.round((p.tamamlanan / (p.aylikHedef || 1)) * 100);
        return View({
          key: p.id,
          style: { backgroundColor: "#111827", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#1E293B", gap: 8 }
        }, [
          Row({ style: { justifyContent: "space-between" } }, [
            Column({}, [
              Text({ style: { color: "#F8FAFC", fontSize: 14, fontWeight: "800" } }, [p.adSoyad]),
              Text({ style: { color: "#94A3B8", fontSize: 11 } }, [p.unvan + " (" + p.bolge + ")"])
            ]),
            Text({ style: { color: y >= 75 ? "#34D399" : "#FBBF24", fontSize: 14, fontWeight: "900" } }, ["%" + y])
          ]),
          View({ style: { height: 5, backgroundColor: "#070B12", borderRadius: 3, overflow: "hidden" } }, [
            View({ style: { width: Math.min(100, y) + "%", height: "100%", backgroundColor: y >= 75 ? "#10B981" : "#F59E0B" } }, [])
          ]),
          Row({ style: { justifyContent: "space-between", alignItems: "center" } }, [
            Text({ style: { color: "#64748B", fontSize: 10 } }, ["Günlük Rota: " + p.gunlukTamamlanan + " / " + p.gunlukHedef]),
            Text({ style: { color: "#38BDF8", fontSize: 12, fontWeight: "800" } }, [formatTL(p.tamamlanan)])
          ])
        ]);
      }))
    ]);
  } 
  // ------------------------------------------
  // SEKME 1: GELİŞMİŞ CARİ ARAMA & ATAMA
  // ------------------------------------------
  else if (yoneticiSekme === 1) {
    const filtrelenenCariler = musteriler.filter(function(c) {
      if (!cariAramaInput.trim()) return true;
      const q = cariAramaInput.toLowerCase().trim();
      return (c.company && c.company.toLowerCase().indexOf(q) !== -1) ||
             (c.name && c.name.toLowerCase().indexOf(q) !== -1) ||
             (c.industry && c.industry.toLowerCase().indexOf(q) !== -1) ||
             (c.adres && c.adres.toLowerCase().indexOf(q) !== -1);
    });

    icerik = View({ style: { flex: 1, gap: 10 } }, [
      // Arama & Yeni Cari Çubuğu
      Row({ style: { gap: 8 } }, [
        Row({
          style: { flex: 1, backgroundColor: "#111827", borderRadius: 10, paddingHorizontal: 10, alignItems: "center", borderWidth: 1, borderColor: "#1E293B" }
        }, [
          Text({ style: { fontSize: 13, color: "#64748B" } }, ["🔍"]),
          TextInput({
            defaultValue: cariAramaInput,
            placeholder: "Firma, yetkili, sektör veya adres ara...",
            placeholderTextColor: "#475569",
            style: { flex: 1, color: "#F8FAFC", fontSize: 12, paddingHorizontal: 8, paddingVertical: 8 },
            onChangeText: function(v) { cariAramaInput = metinAl(v); rerender(); }
          }),
          cariAramaInput ? Pressable({ onPress: function() { cariAramaInput = ""; rerender(); } }, [
            Text({ style: { color: "#94A3B8", fontSize: 13, padding: 4 } }, ["✕"])
          ]) : View({}, [])
        ]),
        Button({
          title: "+ Yeni Cari",
          style: { backgroundColor: "#0284C7", borderRadius: 10, paddingHorizontal: 12 },
          onPress: function() { yeniCariModalAcik = true; rerender(); }
        })
      ]),

      // Cari Liste Sonuçları
      ScrollView({ style: { flex: 1 }, contentContainerStyle: { paddingBottom: 32, gap: 10 } }, [
        filtrelenenCariler.length === 0 ? View({ style: { padding: 30, alignItems: "center" } }, [
          Text({ style: { color: "#64748B", fontSize: 13, fontWeight: "700" } }, ["Aranan kriterde cari bulunamadı."])
        ]) : Column({ style: { gap: 10 } }, filtrelenenCariler.map(function(c) {
          const sorumlu = personeller.find(p => p.id === c.atananId);
          return View({
            key: c.id,
            style: { backgroundColor: "#111827", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#1E293B", gap: 6 }
          }, [
            Row({ style: { justifyContent: "space-between", alignItems: "flex-start" } }, [
              Column({ style: { flex: 1, gap: 2 } }, [
                Text({ style: { color: "#F8FAFC", fontSize: 14, fontWeight: "900" } }, [c.company]),
                Text({ style: { color: "#94A3B8", fontSize: 11 } }, [c.name + " • " + c.industry]),
                Text({ style: { color: "#38BDF8", fontSize: 10, fontWeight: "700" } }, ["Zimmetli: " + (sorumlu ? sorumlu.adSoyad : "Boşta")])
              ]),
              Text({ style: { color: "#34D399", fontSize: 13, fontWeight: "900" } }, [formatTL(c.value)])
            ]),
            Text({ style: { color: "#64748B", fontSize: 11 } }, ["📍 " + c.adres]),
            Pressable({
              onPress: function() {
                seciliMusteri = c;
                ataModalAcik = true;
                rerender();
              },
              style: { backgroundColor: "#1E293B", paddingVertical: 7, borderRadius: 6, alignItems: "center", marginTop: 4 }
            }, [
              Text({ style: { color: "#38BDF8", fontSize: 11, fontWeight: "800" } }, ["👤 Personele Ata / Değiştir"])
            ])
          ]);
        }))
      ])
    ]);
  } 
  // ------------------------------------------
  // SEKME 2: CANLI SAHA AKIŞI
  // ------------------------------------------
  else if (yoneticiSekme === 2) {
    icerik = ScrollView({ style: { flex: 1 }, contentContainerStyle: { paddingBottom: 32, gap: 10 } }, ziyaretler.map(function(z) {
      return View({
        key: z.id,
        style: { backgroundColor: "#111827", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#1E293B", gap: 6 }
      }, [
        Row({ style: { justifyContent: "space-between" } }, [
          Text({ style: { color: "#F8FAFC", fontSize: 14, fontWeight: "800" } }, [z.musteriAd]),
          Text({ style: { color: "#38BDF8", fontSize: 10, fontWeight: "700" } }, [z.personelAd])
        ]),
        Text({ style: { color: "#CBD5E1", fontSize: 12, fontStyle: "italic" } }, ['"' + z.not + '"']),
        Text({ style: { color: "#64748B", fontSize: 10 } }, ["🕒 " + z.tarih + "  •  " + z.konum])
      ]);
    }));
  } 
  // ------------------------------------------
  // SEKME 3: HEDEF VE KOTALAR
  // ------------------------------------------
  else {
    icerik = ScrollView({ style: { flex: 1 }, contentContainerStyle: { paddingBottom: 32, gap: 10 } }, personeller.filter(p => p.id !== 103).map(function(p) {
      return View({
        key: p.id,
        style: { backgroundColor: "#111827", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#1E293B", gap: 8 }
      }, [
        Row({ style: { justifyContent: "space-between", alignItems: "center" } }, [
          Column({}, [
            Text({ style: { color: "#F8FAFC", fontSize: 14, fontWeight: "800" } }, [p.adSoyad]),
            Text({ style: { color: "#94A3B8", fontSize: 11 } }, ["Aylık Satış Kotası: " + formatTL(p.aylikHedef)])
          ]),
          Button({
            title: "Kota Güncelle",
            style: { backgroundColor: "#0284C7", paddingVertical: 5, paddingHorizontal: 10, borderRadius: 6 },
            onPress: function() {
              seciliPersonel = p;
              fYeniHedef = String(p.aylikHedef);
              hedefModalAcik = true;
              rerender();
            }
          })
        ])
      ]);
    }));
  }

  return Screen({
    style: { backgroundColor: "#070B12", flex: 1, paddingTop: 52, alignItems: "center" }
  }, [
    View({ style: { flex: 1, width: "100%", maxWidth: 640, paddingHorizontal: 14 } }, [
      
      // Üst Bar
      Row({ style: { justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottomWidth: 1, borderColor: "#1E293B" } }, [
        Column({}, [
          Text({ style: { color: "#F8FAFC", fontSize: 16, fontWeight: "900" } }, [params.kullanici.adSoyad]),
          Text({ style: { color: "#34D399", fontSize: 10, fontWeight: "700" } }, ["YÖNETİM KONTROL MERKEZİ"])
        ]),
        Pressable({
          onPress: cikisYap,
          style: { backgroundColor: "#1E293B", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }
        }, [
          Text({ style: { color: "#EF4444", fontSize: 11, fontWeight: "800" } }, ["Çıkış ⎋"])
        ])
      ]),

      // Sekmeler
      Row({ style: { paddingVertical: 10, gap: 6 } }, [
        YoneticiSekmeBtn("Genel Bakış", 0),
        YoneticiSekmeBtn("Portföy & Arama", 1),
        YoneticiSekmeBtn("Saha Akışı", 2),
        YoneticiSekmeBtn("Kotalar", 3)
      ]),

      icerik
    ]),

    // 1. Personele Atama Modalı
    ataModalAcik && seciliMusteri ? View({
      style: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(3, 7, 18, 0.8)", justifyContent: "center", alignItems: "center", padding: 16, zIndex: 999 }
    }, [
      View({ style: { backgroundColor: "#111827", width: "100%", maxWidth: 360, borderRadius: 16, padding: 16, gap: 10 } }, [
        Text({ style: { color: "#F8FAFC", fontSize: 14, fontWeight: "900" } }, ["Sorumlu Personel Seçin"]),
        Column({ style: { gap: 6 } }, personeller.filter(p => p.id !== 103).map(function(p) {
          return Pressable({
            onPress: function() {
              seciliMusteri.atananId = p.id;
              ataModalAcik = false;
              rerender();
            },
            style: { backgroundColor: "#070B12", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#1E293B" }
          }, [
            Text({ style: { color: "#F8FAFC", fontSize: 12, fontWeight: "800" } }, [p.adSoyad + " (" + p.bolge + ")"])
          ]);
        })),
        Button({
          title: "Vazgeç",
          style: { backgroundColor: "#1E293B", borderRadius: 8, paddingVertical: 6 },
          onPress: () => { ataModalAcik = false; rerender(); }
        })
      ])
    ]) : View({}, []),

    // 2. Kota Güncelleme Modalı
    hedefModalAcik && seciliPersonel ? View({
      style: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(3, 7, 18, 0.8)", justifyContent: "center", alignItems: "center", padding: 16, zIndex: 999 }
    }, [
      View({ style: { backgroundColor: "#111827", width: "100%", maxWidth: 340, borderRadius: 16, padding: 16, gap: 10 } }, [
        Text({ style: { color: "#F8FAFC", fontSize: 14, fontWeight: "900" } }, ["Yeni Ciro Hedefi"]),
        TextInput({
          defaultValue: fYeniHedef,
          style: { backgroundColor: "#070B12", color: "#F8FAFC", padding: 8, borderRadius: 8, borderWidth: 1, borderColor: "#1E293B" },
          onChangeText: v => fYeniHedef = metinAl(v)
        }),
        Button({
          title: "Hedefi Onayla",
          style: { backgroundColor: "#0284C7", borderRadius: 8, paddingVertical: 8 },
          onPress: function() {
            seciliPersonel.aylikHedef = parseFloat(fYeniHedef.replace(/[^0-9]/g, "")) || seciliPersonel.aylikHedef;
            hedefModalAcik = false;
            rerender();
          }
        })
      ])
    ]) : View({}, []),

    // 3. Yeni Cari Ekleme Modalı
    yeniCariModalAcik ? View({
      style: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(3, 7, 18, 0.8)", justifyContent: "center", alignItems: "center", padding: 16, zIndex: 999 }
    }, [
      View({ style: { backgroundColor: "#111827", width: "100%", maxWidth: 360, borderRadius: 16, padding: 16, gap: 8 } }, [
        Text({ style: { color: "#F8FAFC", fontSize: 15, fontWeight: "900" } }, ["Yeni Cari Kartı Oluştur"]),
        FormEdit("Firma / Cari Unvanı *", fCariUnvan, v => fCariUnvan = v),
        FormEdit("Görüşülen Yetkili Adı *", fCariYetkili, v => fCariYetkili = v),
        FormEdit("Telefon Numarası", fCariTel, v => fCariTel = v),
        FormEdit("Sektör (Örn: Donanım, Lojistik)", fCariSektor, v => fCariSektor = v),
        FormEdit("Açık Adres (İlçe/Şehir)", fCariAdres, v => fCariAdres = v),
        FormEdit("Tahmini Potansiyel Bütçe (₺)", fCariBakiye, v => fCariBakiye = v),
        Button({
          title: "Cariyi Portföye Ekle",
          style: { backgroundColor: "#0284C7", paddingVertical: 9, borderRadius: 8, marginTop: 4 },
          onPress: cariKaydet
        }),
        Button({
          title: "İptal",
          style: { backgroundColor: "#1E293B", paddingVertical: 6, borderRadius: 8 },
          onPress: () => { yeniCariModalAcik = false; rerender(); }
        })
      ])
    ]) : View({}, []),

    // 4. Yeni Saha Personeli Ekleme Modalı
    yeniPersonelModalAcik ? View({
      style: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(3, 7, 18, 0.8)", justifyContent: "center", alignItems: "center", padding: 16, zIndex: 999 }
    }, [
      View({ style: { backgroundColor: "#111827", width: "100%", maxWidth: 360, borderRadius: 16, padding: 16, gap: 8 } }, [
        Text({ style: { color: "#F8FAFC", fontSize: 15, fontWeight: "900" } }, ["Yeni Saha Personeli Tanımla"]),
        FormEdit("Personel Adı Soyadı *", fPerAd, v => fPerAd = v),
        FormEdit("Sistem Kullanıcı Adı (Örn: burak.kaya) *", fPerKullanici, v => fPerKullanici = v),
        FormEdit("Giriş Şifresi", fPerSifre, v => fPerSifre = v),
        FormEdit("Sorumlu Olduğu Bölge (Örn: Konya / Selçuklu)", fPerBolge, v => fPerBolge = v),
        FormEdit("Aylık Satış Kotası (₺)", fPerHedef, v => fPerHedef = v),
        FormEdit("Günlük Ziyaret Kotası (Adet)", fPerGunlukHedef, v => fPerGunlukHedef = v),
        Button({
          title: "Personeli Sisteme Kaydet",
          style: { backgroundColor: "#0F766E", paddingVertical: 9, borderRadius: 8, marginTop: 4 },
          onPress: personelKaydet
        }),
        Button({
          title: "İptal",
          style: { backgroundColor: "#1E293B", paddingVertical: 6, borderRadius: 8 },
          onPress: () => { yeniPersonelModalAcik = false; rerender(); }
        })
      ])
    ]) : View({}, [])

  ]);
}

function FormEdit(placeholder, deger, onChange) {
  return TextInput({
    placeholder: placeholder,
    defaultValue: deger,
    placeholderTextColor: "#475569",
    style: { backgroundColor: "#070B12", borderWidth: 1, borderColor: "#1E293B", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, fontSize: 12, color: "#F8FAFC" },
    onChangeText: v => onChange(metinAl(v))
  });
}

function YoneticiSekmeBtn(etiket, idx) {
  const aktif = yoneticiSekme === idx;
  return Pressable({
    onPress: function() { yoneticiSekme = idx; rerender(); },
    style: {
      flex: 1, paddingVertical: 7, borderRadius: 8,
      backgroundColor: aktif ? "#0F766E" : "#111827",
      borderWidth: 1, borderColor: aktif ? "#34D399" : "#1E293B",
      alignItems: "center"
    }
  }, [
    Text({ style: { fontSize: 10, fontWeight: "800", color: aktif ? "#FFFFFF" : "#94A3B8" } }, [etiket])
  ]);
}
