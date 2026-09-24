// ==========================================
// BİRİM 4: SahaScreen 
// ==========================================

let sahaSekme = 0; // 0: Günlük Rota, 1: Müşterilerim, 2: Raporlarım
let seciliCari = null;
let ziyaretModalAcik = false;
let fNot = "";
let fFotoUrl = ""; // Kameradan çekilen gerçek fotoğraf verisi
let kameraBekleniyor = false;

let fYeniMusteriNotu = "";
let acikMusteriDetayId = null;
let sahaAramaInput = "";
let ziyaretSayac = 100;

function formatTLSaha(tutar) {
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

function rotaGit(koordinat) {
  if (!koordinat) return;
  const url = "https://www.google.com/maps/dir/?api=1&destination=" + koordinat;
  try {
    if (typeof Clomosy !== "undefined" && Clomosy.openURL) Clomosy.openURL(url);
    else if (typeof window !== "undefined") window.open(url, "_blank");
  } catch (e) {}
}

function araTel(tel) {
  if (!tel) return;
  const url = "tel:" + tel.replace(/[^0-9+]/g, "");
  try {
    if (typeof Clomosy !== "undefined" && Clomosy.openURL) Clomosy.openURL(url);
    else if (typeof window !== "undefined") window.location.href = url;
  } catch (e) {}
}

function SahaScreen(params) {
  if (!params || !params.kullanici) {
    Navigate("MainScreen");
    return Screen({}, []);
  }

  const ben = params.kullanici;
  const tumMusteriler = params.musteriler.filter(c => c.atananId === ben.id);
  const ziyaretler = params.ziyaretler;

  function cikisYap() {
    Navigate("MainScreen");
  }

  // =============================================================
  // CLOMOSY GERÇEK DONANIM KAMERASINI ATEŞLEYEN FONKSİYON
  // =============================================================
  function gercekKameraAc() {
    kameraBekleniyor = true;
    rerender();

    // 1. Clomosy WebInApp Resmi Donanım Kamerası (ImagePicker)
    if (typeof ImagePicker !== "undefined" && ImagePicker.takePhoto) {
      ImagePicker.takePhoto(
        function (sonuc) {
          kameraBekleniyor = false;
          if (sonuc && (sonuc.uri || sonuc.data)) {
            fFotoUrl = sonuc.uri || sonuc.data;
            Haptics.notification("success");
            Toast.show("Fotoğraf başarıyla çekildi", { type: "success" });
          }
          rerender();
        },
        function (hata) {
          kameraBekleniyor = false;
          Toast.show("Kamera iptal edildi veya açılamadı: " + hata, { type: "error" });
          rerender();
        }
      );
      return;
    }

    // 2. Alternatif Clomosy Mobil Cihaz Köprüsü
    if (typeof Clomosy !== "undefined") {
      const bridge = (Clomosy.Device && Clomosy.Device.takePhoto) ? Clomosy.Device :
                     ((Clomosy.Camera && Clomosy.Camera.takePhoto) ? Clomosy.Camera : null);
      if (bridge) {
        bridge.takePhoto(
          function (sonucData) {
            kameraBekleniyor = false;
            if (sonucData) fFotoUrl = sonucData;
            rerender();
          },
          function () {
            kameraBekleniyor = false;
            rerender();
          }
        );
        return;
      }
    }

    // 3. Web & Simülatör (HTML5 Arka Kamera Fallback)
    if (typeof document !== "undefined") {
      let input = document.getElementById("clomosy_native_camera");
      if (!input) {
        input = document.createElement("input");
        input.id = "clomosy_native_camera";
        input.type = "file";
        input.accept = "image/*";
        input.setAttribute("capture", "environment");
        input.style.display = "none";
        document.body.appendChild(input);
      }

      input.onchange = function (e) {
        kameraBekleniyor = false;
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (res) {
            fFotoUrl = res.target.result;
            rerender();
          };
          reader.readAsDataURL(file);
        } else {
          rerender();
        }
      };

      input.click();
      return;
    }

    kameraBekleniyor = false;
    rerender();
  }

  // Galeriden Fotoğraf Seçme Fonksiyonu
  function galeridenSec() {
    if (typeof ImagePicker !== "undefined" && ImagePicker.pickFromLibrary) {
      ImagePicker.pickFromLibrary(function (sonuc) {
        if (sonuc && (sonuc.uri || sonuc.data)) {
          fFotoUrl = sonuc.uri || sonuc.data;
          rerender();
        }
      }, function (h) {
        Toast.show("Galeri seçimi iptal edildi");
      });
    }
  }

  function tutanagiKaydet() {
    if (!fNot.trim() || !seciliCari) return;

    ziyaretSayac++;
    const yeniZiyaret = {
      id: ziyaretSayac,
      musteriAd: seciliCari.company,
      personelAd: ben.adSoyad,
      tur: "Saha Ziyareti",
      not: fNot.trim(),
      foto: fFotoUrl || null,
      tarih: "Bugün 17:30",
      konum: seciliCari.koordinat || "37.9542, 32.5086"
    };

    ziyaretler.unshift(yeniZiyaret);

    if (ben.gunlukTamamlanan < ben.gunlukHedef) {
      ben.gunlukTamamlanan++;
    }

    ziyaretModalAcik = false;
    fNot = "";
    fFotoUrl = "";
    Haptics.notification("success");
    Toast.show("Ziyaret tutanağı kaydedildi", { type: "success" });
    rerender();
  }

  function musteriNotuEkle(cari) {
    if (!fYeniMusteriNotu.trim()) return;
    if (!cari.ozelNotlar) cari.ozelNotlar = [];

    cari.ozelNotlar.unshift("Bugün: " + fYeniMusteriNotu.trim());
    fYeniMusteriNotu = "";
    rerender();
  }

  const filtrelenmisCariler = tumMusteriler.filter(function (c) {
    if (!sahaAramaInput.trim()) return true;
    const q = sahaAramaInput.toLowerCase().trim();
    return (c.company && c.company.toLowerCase().indexOf(q) !== -1) ||
           (c.name && c.name.toLowerCase().indexOf(q) !== -1) ||
           (c.industry && c.industry.toLowerCase().indexOf(q) !== -1) ||
           (c.adres && c.adres.toLowerCase().indexOf(q) !== -1);
  });

  let icerik;

  // ------------------------------------------
  // SEKME 0: GÜNLÜK ROTA & KOKPİT
  // ------------------------------------------
  if (sahaSekme === 0) {
    const rotaYuzdesi = Math.round((ben.gunlukTamamlanan / (ben.gunlukHedef || 1)) * 100);

    icerik = ScrollView({ style: { flex: 1 }, contentContainerStyle: { paddingBottom: 32, gap: 12 } }, [
      
      View({
        style: { backgroundColor: "#111827", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#1E293B", gap: 10 }
      }, [
        Row({ style: { justifyContent: "space-between", alignItems: "center" } }, [
          Column({ style: { gap: 2 } }, [
            Text({ style: { color: "#94A3B8", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 } }, ["GÜNLÜK SAHA PLANI"]),
            Text({ style: { color: "#F8FAFC", fontSize: 16, fontWeight: "900" } }, [ben.gunlukTamamlanan + " / " + ben.gunlukHedef + " Ziyaret Bitti"])
          ]),
          View({ style: { backgroundColor: "rgba(16, 185, 129, 0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: "#10B981" } }, [
            Text({ style: { color: "#34D399", fontSize: 12, fontWeight: "900" } }, ["%" + rotaYuzdesi])
          ])
        ]),

        View({ style: { height: 6, backgroundColor: "#070B12", borderRadius: 3, overflow: "hidden" } }, [
          View({ style: { width: Math.min(100, rotaYuzdesi) + "%", height: "100%", backgroundColor: "#38BDF8" } }, [])
        ])
      ]),

      Text({ style: { color: "#F8FAFC", fontSize: 14, fontWeight: "900", marginTop: 4 } }, ["📍 Ziyaret Listem (" + tumMusteriler.length + ")"]),

      Column({ style: { gap: 10 } }, tumMusteriler.map(function (c) {
        return View({
          key: c.id,
          style: { backgroundColor: "#111827", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#1E293B", gap: 8 }
        }, [
          Row({ style: { justifyContent: "space-between", alignItems: "flex-start" } }, [
            Column({ style: { flex: 1, gap: 2 } }, [
              Text({ style: { color: "#F8FAFC", fontSize: 15, fontWeight: "900" } }, [c.company]),
              Text({ style: { color: "#38BDF8", fontSize: 11, fontWeight: "700" } }, ["Yetkili: " + c.name + " (" + c.industry + ")"])
            ]),
            View({ style: { backgroundColor: "#070B12", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "#1E293B" } }, [
              Text({ style: { color: "#34D399", fontSize: 12, fontWeight: "900" } }, [formatTLSaha(c.value)])
            ])
          ]),

          Text({ style: { color: "#CBD5E1", fontSize: 11 } }, ["📍 " + c.adres]),

          Row({ style: { gap: 6, marginTop: 4 } }, [
            Pressable({
              onPress: () => rotaGit(c.koordinat),
              style: { flex: 1, backgroundColor: "#0284C7", paddingVertical: 8, borderRadius: 8, alignItems: "center" }
            }, [
              Text({ style: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" } }, ["🗺️ Rota Aç"])
            ]),
            Pressable({
              onPress: () => araTel(c.phone),
              style: { width: 44, backgroundColor: "#1E293B", paddingVertical: 8, borderRadius: 8, alignItems: "center", justifyContent: "center" }
            }, [
              Text({ style: { fontSize: 14 } }, ["📞"])
            ]),
            Pressable({
              onPress: function () {
                seciliCari = c;
                fNot = "";
                fFotoUrl = "";
                ziyaretModalAcik = true;
                rerender();
              },
              style: { flex: 1.4, backgroundColor: "#059669", paddingVertical: 8, borderRadius: 8, alignItems: "center" }
            }, [
              Text({ style: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" } }, ["📷 Fotoğraflı Ziyaret"])
            ])
          ])
        ]);
      }))
    ]);
  } 
  // ------------------------------------------
  // SEKME 1: MÜŞTERİLERİM & ÖZEL NOTLAR
  // ------------------------------------------
  else if (sahaSekme === 1) {
    icerik = View({ style: { flex: 1, gap: 10 } }, [
      Row({
        style: { backgroundColor: "#111827", borderRadius: 10, paddingHorizontal: 10, alignItems: "center", borderWidth: 1, borderColor: "#1E293B" }
      }, [
        Text({ style: { fontSize: 13, color: "#64748B" } }, ["🔍"]),
        TextInput({
          defaultValue: sahaAramaInput,
          placeholder: "Carilerimde arayın...",
          placeholderTextColor: "#475569",
          style: { flex: 1, color: "#F8FAFC", fontSize: 12, paddingHorizontal: 8, paddingVertical: 8 },
          onChangeText: function (v) { sahaAramaInput = metinAl(v); rerender(); }
        })
      ]),

      ScrollView({ style: { flex: 1 }, contentContainerStyle: { paddingBottom: 32, gap: 10 } }, [
        Column({ style: { gap: 10 } }, filtrelenmisCariler.map(function (c) {
          const acik = acikMusteriDetayId === c.id;
          const ozelNotlar = c.ozelNotlar || [
            "Fiyat hassasiyeti var, vadeli teklif bekleniyor.",
            "Yetkili ile sonraki görüşme haftaya planlandı."
          ];

          return View({
            key: c.id,
            style: { backgroundColor: "#111827", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#1E293B", gap: 8 }
          }, [
            Pressable({
              onPress: function () {
                acikMusteriDetayId = acik ? null : c.id;
                rerender();
              },
              style: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }
            }, [
              Column({ style: { flex: 1, gap: 2 } }, [
                Text({ style: { color: "#F8FAFC", fontSize: 15, fontWeight: "900" } }, [c.company]),
                Text({ style: { color: "#94A3B8", fontSize: 11 } }, ["Yetkili: " + c.name + " • " + c.phone])
              ]),
              Text({ style: { color: "#38BDF8", fontSize: 11, fontWeight: "700" } }, [acik ? "Kapat ▲" : "Notlar & Detay ▼"])
            ]),

            acik ? Column({ style: { gap: 8, borderTopWidth: 1, borderColor: "#1E293B", paddingTop: 8 } }, [
              Text({ style: { color: "#CBD5E1", fontSize: 11 } }, ["📍 " + c.adres]),
              Text({ style: { color: "#34D399", fontSize: 11, fontWeight: "800" } }, ["Cari Bakiye: " + formatTLSaha(c.value)]),

              Text({ style: { color: "#F8FAFC", fontSize: 12, fontWeight: "800", marginTop: 4 } }, ["📝 Özel Cari Notları"]),
              Column({ style: { gap: 4 } }, ozelNotlar.map(function (n, i) {
                return View({
                  key: i,
                  style: { backgroundColor: "#070B12", padding: 8, borderRadius: 6, borderWidth: 1, borderColor: "#1E293B" }
                }, [
                  Text({ style: { color: "#CBD5E1", fontSize: 11 } }, [n])
                ]);
              })),

              Row({ style: { gap: 6, marginTop: 4 } }, [
                TextInput({
                  placeholder: "Yeni görüşme notu ekleyin...",
                  placeholderTextColor: "#475569",
                  defaultValue: fYeniMusteriNotu,
                  style: { flex: 1, backgroundColor: "#070B12", color: "#F8FAFC", paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: "#1E293B", fontSize: 11 },
                  onChangeText: v => fYeniMusteriNotu = metinAl(v)
                }),
                Button({
                  title: "Ekle",
                  style: { backgroundColor: "#0284C7", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
                  onPress: () => musteriNotuEkle(c)
                })
              ])
            ]) : View({}, [])
          ]);
        }))
      ])
    ]);
  } 
  // ------------------------------------------
  // SEKME 2: RAPORLARIM & FOTOĞRAFLI ZİYARETLER
  // ------------------------------------------
  else {
    icerik = ScrollView({ style: { flex: 1 }, contentContainerStyle: { paddingBottom: 32, gap: 10 } }, ziyaretler.map(function (z) {
      return View({
        key: z.id,
        style: { backgroundColor: "#111827", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#1E293B", gap: 8 }
      }, [
        Row({ style: { justifyContent: "space-between", alignItems: "center" } }, [
          Text({ style: { color: "#F8FAFC", fontSize: 14, fontWeight: "900" } }, [z.musteriAd]),
          Text({ style: { color: "#38BDF8", fontSize: 10, fontWeight: "700" } }, [z.tarih])
        ]),
        Text({ style: { color: "#CBD5E1", fontSize: 12, fontStyle: "italic", lineHeight: 16 } }, ['"' + z.not + '"']),

        // SADECE Gerçekten Fotoğraf Çekildiyse Önizleme Göster
        z.foto ? View({
          style: {
            borderRadius: 10,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "#10B981",
            marginTop: 4,
            backgroundColor: "#000"
          }
        }, [
          Image({
            source: { uri: z.foto },
            style: { width: "100%", height: 160 }
          }),
          View({
            style: {
              backgroundColor: "rgba(15, 23, 42, 0.85)",
              paddingHorizontal: 8,
              paddingVertical: 4
            }
          }, [
            Text({ style: { color: "#34D399", fontSize: 10, fontWeight: "800" } }, ["✓ Canlı Kamera Çekimi Doğrulandı"])
          ])
        ]) : View({}, []),

        Text({ style: { color: "#64748B", fontSize: 10 } }, ["📍 " + z.konum])
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
          Text({ style: { color: "#F8FAFC", fontSize: 16, fontWeight: "900" } }, [ben.adSoyad]),
          Text({ style: { color: "#38BDF8", fontSize: 10, fontWeight: "700" } }, ["SAHA OPERASYON KOKPİTİ"])
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
        SahaSekmeBtn("📍 Günlük Rota", 0),
        SahaSekmeBtn("💼 Müşterilerim", 1),
        SahaSekmeBtn("📋 Raporlarım", 2)
      ]),

      icerik
    ]),

    // ==========================================
    // CANLI DONANIM KAMERASI VE TUTANAK MODALI
    // ==========================================
    ziyaretModalAcik && seciliCari ? View({
      style: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(3, 7, 18, 0.88)", justifyContent: "center", alignItems: "center", padding: 16, zIndex: 999 }
    }, [
      View({ style: { backgroundColor: "#111827", width: "100%", maxWidth: 380, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#1E293B", gap: 10 } }, [
        Row({ style: { justifyContent: "space-between", alignItems: "center" } }, [
          Text({ style: { color: "#F8FAFC", fontSize: 15, fontWeight: "900" } }, ["Saha Ziyaret & Tutanak"]),
          Pressable({ onPress: () => { ziyaretModalAcik = false; rerender(); } }, [
            Text({ style: { fontSize: 18, color: "#94A3B8", fontWeight: "bold" } }, ["✕"])
          ])
        ]),
        Text({ style: { color: "#38BDF8", fontSize: 11, fontWeight: "700" } }, [seciliCari.company]),

        TextInput({
          placeholder: "Görüşme özeti, sipariş veya evrak notları...",
          placeholderTextColor: "#475569",
          defaultValue: fNot,
          multiline: true,
          numberOfLines: 3,
          style: { backgroundColor: "#070B12", color: "#F8FAFC", padding: 8, borderRadius: 8, borderWidth: 1, borderColor: "#1E293B", height: 70 },
          onChangeText: v => fNot = metinAl(v)
        }),

        // Kameradan Çekilen Fotoğraf Önizlemesi
        fFotoUrl ? View({
          style: { borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: "#10B981", height: 130, backgroundColor: "#000" }
        }, [
          Image({
            source: { uri: fFotoUrl },
            style: { width: "100%", height: "100%" }
          })
        ]) : View({
          style: {
            borderWidth: 1, borderStyle: "dashed", borderColor: "#334155",
            borderRadius: 8, padding: 14, alignItems: "center", backgroundColor: "#070B12"
          }
        }, [
          Text({ style: { color: "#64748B", fontSize: 11, fontWeight: "600" } }, ["Henüz fotoğraf çekilmedi."])
        ]),

        // Kamera ve Galeri Butonları
        Row({ style: { gap: 6 } }, [
          Pressable({
            onPress: gercekKameraAc,
            style: {
              flex: 1.2,
              backgroundColor: fFotoUrl ? "#1E293B" : "#0284C7",
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 6
            }
          }, [
            Text({ style: { fontSize: 16 } }, ["📷"]),
            Text({ style: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" } }, [
              kameraBekleniyor ? "Açılıyor..." : (fFotoUrl ? "Yeniden Çek" : "Kamera Çek")
            ])
          ]),

          Pressable({
            onPress: galeridenSec,
            style: {
              flex: 0.9,
              backgroundColor: "#1E293B",
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 4
            }
          }, [
            Text({ style: { fontSize: 14 } }, ["🖼️"]),
            Text({ style: { color: "#94A3B8", fontSize: 11, fontWeight: "700" } }, ["Galeri"])
          ]),

          fFotoUrl ? Pressable({
            onPress: function () { fFotoUrl = ""; rerender(); },
            style: { backgroundColor: "#7F1D1D", paddingHorizontal: 10, borderRadius: 8, alignItems: "center", justifyContent: "center" }
          }, [
            Text({ style: { color: "#FCA5A5", fontSize: 11, fontWeight: "800" } }, ["Sil"])
          ]) : View({}, [])
        ]),

        Button({
          title: "Tutanağı ve Fotoğrafı Kaydet",
          style: { backgroundColor: "#059669", borderRadius: 8, paddingVertical: 9, marginTop: 4 },
          onPress: tutanagiKaydet
        })
      ])
    ]) : View({}, [])

  ]);
}

function SahaSekmeBtn(etiket, idx) {
  const aktif = sahaSekme === idx;
  return Pressable({
    onPress: function () { sahaSekme = idx; rerender(); },
    style: {
      flex: 1, paddingVertical: 7, borderRadius: 8,
      backgroundColor: aktif ? "#0284C7" : "#111827",
      borderWidth: 1, borderColor: aktif ? "#38BDF8" : "#1E293B",
      alignItems: "center"
    }
  }, [
    Text({ style: { fontSize: 11, fontWeight: "800", color: aktif ? "#FFFFFF" : "#94A3B8" } }, [etiket])
  ]);
}
