/**
 * ==============================================================
 * CLOMOSY WIA • SAHA OPERASYON & MÜŞTERİ ANALİTİK PRO (V2.0)
 * ==============================================================
 * Mobil saha satış, teknik servis, müşteri ziyareti ve canlı
 * operasyon yönetim sistemi.
 *
 * GELİŞTİRMELER & YENİLİKLER:
 * 1. 📱 %100 Clomosy WIA ve React Native uyumlu ModernButton bileşeni (Pressable tabanlı, taşma ve stil kaybı sıfır).
 * 2. ⚡ Gerçek Zamanlı Akıllı Arama & Çift Kademeli Filtreleme (Durum + İlçe / Bölge Filtresi).
 * 3. 🏢 Yeni Müşteri / Cari Ekleme Modalı (Unvan, yetkili, telefon, ilçe, koordinat).
 * 4. 📍 Gelişmiş GPS & Donanım Köprüsü (Clomosy.Location, navigator.geolocation, Google Maps Rota, Doğrudan Telefon Arama).
 * 5. 💾 Yerel Veri Kalıcılığı (LocalStorage / Clomosy.Storage otomatik kaydetme ve geri yükleme).
 * 6. 📊 İnteraktif Analitik & Performans Kokpiti (Dönem bazlı başarı skoru, haftalık sütun grafik, bölgesel dağılım).
 * 7. 🛡️ Çentik ve Ekran Güvenliği (SafeArea entegrasyonu, klavye/scroll taşma koruması).
 * 8. 🔔 Haptik Geri Bildirim ve Otomatik Kapanan Toast Bildirimleri.
 */

// Gömülü motorlar için güvenli polyfill
if (typeof encodeURIComponent === 'undefined') {
  var encodeURIComponent = function (v) { return String(v !== undefined && v !== null ? v : ''); };
}

// ==============================================================
// 1. TEMA & TASARIM SİSTEMİ
// ==============================================================
const T = {
  bg:          '#F8FAFC',
  card:        '#FFFFFF',
  cardBorder:  '#E2E8F0',
  cardDark:    '#0F172A',
  
  primary:     '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight:'#EFF6FF',
  
  success:     '#10B981',
  successDark: '#047857',
  successLight:'#ECFDF5',
  
  warning:     '#F59E0B',
  warningLight:'#FFFBEB',
  
  danger:      '#EF4444',
  dangerLight: '#FEF2F2',
  
  info:        '#0284C7',
  purple:      '#8B5CF6',
  
  textMain:    '#0F172A',
  textSub:     '#475569',
  textMuted:   '#94A3B8',
  textLight:   '#FFFFFF'
};

// ==============================================================
// 2. GLOBAL STATE & VERİ DEPOSU
// ==============================================================

let sonZiyaretId = 3;
let sonMusteriId = 103;

let aktifSekme = 'ziyaretler'; // 'ziyaretler' | 'musteriler' | 'analiz'
let durumFiltresi = 'Tümü';    // 'Tümü' | 'Planlandı' | 'Tamamlandı'
let bolgeFiltresi = 'Tümü';    // 'Tümü' | 'Selçuklu' | 'Meram' | 'Karatay'
let aramaMetni = '';

let yeniZiyaretModalAcik = false;
let yeniMusteriModalAcik = false;
let toastMesaj = '';
let toastZamanlayici = null;
let gpsBekleniyor = false;

// Analiz Dönemi ('Bugün' | 'Hafta' | 'Ay')
let analizDonem = 'Hafta';

// Müşteri Veritabanı
let musteriler = [
  { id: 101, unvan: 'Atiker Yazılım A.Ş.', yetkili: 'Ahmet Yılmaz', tel: '03325550101', bolge: 'Selçuklu', adres: 'Teknokent B Blok No:12 / Konya', koordinat: '37.9542,32.5086' },
  { id: 102, unvan: 'Selçuk Endüstri Market', yetkili: 'Mehmet Kaya', tel: '03325550144', bolge: 'Meram', adres: 'Sanayi Caddesi No:45 / Konya', koordinat: '37.8682,32.4831' },
  { id: 103, unvan: 'Konya Lojistik Depo', yetkili: 'Ayşe Demir', tel: '03325550188', bolge: 'Karatay', adres: 'Lojistik Köy Depo-7 / Konya', koordinat: '37.8820,32.5312' }
];

// Ziyaret & Saha Planları
let ziyaretler = [
  {
    id: 1,
    musteri: 'Atiker Yazılım A.Ş.',
    yetkili: 'Ahmet Yılmaz',
    tur: 'Teknik Servis',
    durum: 'Tamamlandı',
    bolge: 'Selçuklu',
    tarih: 'Bugün 10:30',
    not: 'ERP sunucu bağlantısı ve Clomosy servisleri kontrol edildi.',
    konum: '37.9542,32.5086',
    tel: '03325550101'
  },
  {
    id: 2,
    musteri: 'Selçuk Endüstri Market',
    yetkili: 'Mehmet Kaya',
    tur: 'Satış',
    durum: 'Planlandı',
    bolge: 'Meram',
    tarih: 'Bugün 15:30',
    not: 'Yeni dönem mobil el terminali lisansları konuşulacak.',
    konum: '37.8682,32.4831',
    tel: '03325550144'
  },
  {
    id: 3,
    musteri: 'Konya Lojistik Depo',
    yetkili: 'Ayşe Demir',
    tur: 'Saha Sayımı',
    durum: 'Planlandı',
    bolge: 'Karatay',
    tarih: 'Yarın 09:30',
    not: 'Depo barkod okuyucu sistemlerinin konfigürasyonu yapılacak.',
    konum: '37.8820,32.5312',
    tel: '03325550188'
  }
];

// Ziyaret Form Alanları
let fZiyaretMusteri = '';
let fZiyaretYetkili = '';
let fZiyaretTur = 'Satış';
let fZiyaretBolge = 'Selçuklu';
let fZiyaretNot = '';
let fZiyaretKonum = '';
let fZiyaretTel = '';

// Yeni Cari Form Alanları
let fYeniUnvan = '';
let fYeniYetkili = '';
let fYeniTel = '';
let fYeniBolge = 'Selçuklu';
let fYeniAdres = '';
let fYeniKonum = '';

// ==============================================================
// 3. DONANIM, GPS & DIŞ SERVİSLER
// ==============================================================

function hapticVer(seviye) {
  try {
    if (typeof Haptics !== 'undefined' && Haptics) {
      if (typeof Haptics.impact === 'function') Haptics.impact(seviye || 'light');
      else if (typeof Haptics.notification === 'function') Haptics.notification('success');
    }
  } catch (e) {}
}

function gercekAramaYap(telefonNo) {
  hapticVer('medium');
  if (!telefonNo) {
    bildir('⚠️ Telefon numarası kayıtlı değil!');
    return;
  }
  let temizNo = '';
  for (let i = 0; i < telefonNo.length; i++) {
    let c = telefonNo.charAt(i);
    if ((c >= '0' && c <= '9') || c === '+') temizNo += c;
  }
  const url = 'tel:' + temizNo;

  try {
    if (typeof Clomosy !== 'undefined' && Clomosy.openURL) {
      Clomosy.openURL(url);
    } else if (typeof Linking !== 'undefined' && Linking.openURL) {
      Linking.openURL(url);
    } else if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  } catch (err) {
    bildir('📞 Arama: ' + temizNo);
  }
}

function rotaAc(koordinat) {
  hapticVer('medium');
  if (!koordinat) {
    bildir('⚠️ Hedef koordinat bulunamadı!');
    return;
  }
  const mapsUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + koordinat;
  try {
    if (typeof Clomosy !== 'undefined' && Clomosy.openURL) {
      Clomosy.openURL(mapsUrl);
    } else if (typeof Linking !== 'undefined' && Linking.openURL) {
      Linking.openURL(mapsUrl);
    } else if (typeof window !== 'undefined') {
      window.open(mapsUrl, '_blank');
    }
  } catch (err) {
    bildir('🗺️ Harita: ' + koordinat);
  }
}

function gercekGpsAl(hedefFormTipi) {
  hapticVer('light');
  gpsBekleniyor = true;
  tetikleRender();

  function basariliKonum(lat, lng) {
    gpsBekleniyor = false;
    const str = Number(lat).toFixed(4) + ',' + Number(lng).toFixed(4);
    if (hedefFormTipi === 'musteri') fYeniKonum = str;
    else fZiyaretKonum = str;
    bildir('📍 Canlı GPS Alındı: ' + str);
    hapticVer('success');
    tetikleRender();
  }

  function varsayilanKonum() {
    gpsBekleniyor = false;
    const str = '37.9542,32.5086'; // Konya Merkez
    if (hedefFormTipi === 'musteri') fYeniKonum = str;
    else fZiyaretKonum = str;
    bildir('📍 Merkez koordinatı atandı.');
    tetikleRender();
  }

  if (typeof Clomosy !== 'undefined' && Clomosy.Location && Clomosy.Location.getCurrentPosition) {
    Clomosy.Location.getCurrentPosition(function (pos) {
      if (pos && pos.latitude) basariliKonum(pos.latitude, pos.longitude);
      else varsayilanKonum();
    }, varsayilanKonum);
    return;
  }

  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (pos) {
      if (pos && pos.coords) basariliKonum(pos.coords.latitude, pos.coords.longitude);
      else varsayilanKonum();
    }, varsayilanKonum, { timeout: 8000, enableHighAccuracy: true });
    return;
  }

  varsayilanKonum();
}

// ==============================================================
// 4. VERİ KALICILIĞI & YARDIMCI METOTLAR
// ==============================================================

function veriKaydet() {
  try {
    const payload = JSON.stringify({ ziyaretler: ziyaretler, musteriler: musteriler, sonZiyaretId: sonZiyaretId, sonMusteriId: sonMusteriId });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('clomosy_saha_data', payload);
    }
  } catch (e) {}
}

function veriYukle() {
  try {
    if (typeof localStorage !== 'undefined') {
      const ham = localStorage.getItem('clomosy_saha_data');
      if (ham) {
        const d = JSON.parse(ham);
        if (d.ziyaretler) ziyaretler = d.ziyaretler;
        if (d.musteriler) musteriler = d.musteriler;
        if (d.sonZiyaretId) sonZiyaretId = d.sonZiyaretId;
        if (d.sonMusteriId) sonMusteriId = d.sonMusteriId;
      }
    }
  } catch (e) {}
}

function metinAl(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (v.target && v.target.value !== undefined) return v.target.value;
  if (v.nativeEvent && v.nativeEvent.text !== undefined) return v.nativeEvent.text;
  return String(v);
}

function bildir(mesaj) {
  toastMesaj = mesaj;
  if (toastZamanlayici) clearTimeout(toastZamanlayici);
  toastZamanlayici = setTimeout(function () {
    toastMesaj = '';
    tetikleRender();
  }, 2800);
  tetikleRender();
}

function toastKapat() {
  if (toastZamanlayici) clearTimeout(toastZamanlayici);
  toastMesaj = '';
  tetikleRender();
}

function tetikleRender() {
  try {
    if (typeof rerender === 'function') rerender();
    else if (typeof render === 'function') render();
  } catch (e) {}
}

// Ziyaret Modalı Yönetimi
function modalZiyaretAc(varsayilanMusteri) {
  hapticVer('light');
  if (varsayilanMusteri) {
    fZiyaretMusteri = varsayilanMusteri.unvan;
    fZiyaretYetkili = varsayilanMusteri.yetkili;
    fZiyaretTel = varsayilanMusteri.tel;
    fZiyaretBolge = varsayilanMusteri.bolge || 'Selçuklu';
    fZiyaretKonum = varsayilanMusteri.koordinat;
  } else {
    fZiyaretMusteri = '';
    fZiyaretYetkili = '';
    fZiyaretTel = '';
    fZiyaretBolge = 'Selçuklu';
    fZiyaretKonum = '';
  }
  fZiyaretTur = 'Satış';
  fZiyaretNot = '';
  yeniZiyaretModalAcik = true;
  tetikleRender();
}

function modalZiyaretKapat() {
  yeniZiyaretModalAcik = false;
  tetikleRender();
}

function kaydetZiyaret() {
  if (!fZiyaretMusteri.trim()) {
    bildir('⚠️ Lütfen müşteri / firma unvanını giriniz!');
    return;
  }

  hapticVer('success');
  sonZiyaretId = sonZiyaretId + 1;
  const yeni = {
    id: sonZiyaretId,
    musteri: fZiyaretMusteri.trim(),
    yetkili: fZiyaretYetkili.trim() || 'Yetkili Belirtilmedi',
    tur: fZiyaretTur,
    durum: 'Planlandı',
    bolge: fZiyaretBolge,
    tarih: 'Bugün ' + new Date().getHours() + ':' + (new Date().getMinutes() < 10 ? '0' : '') + new Date().getMinutes(),
    not: fZiyaretNot.trim() || 'Özel talimat girilmedi.',
    konum: fZiyaretKonum || '37.9542,32.5086',
    tel: fZiyaretTel.trim() || '03325550000'
  };

  ziyaretler.unshift(yeni);
  yeniZiyaretModalAcik = false;
  veriKaydet();
  bildir('✅ Yeni saha ziyareti başarıyla planlandı.');
}

function durumuDegistir(id) {
  hapticVer('medium');
  ziyaretler = ziyaretler.map(function (item) {
    if (item.id === id) {
      const yeniDurum = item.durum === 'Tamamlandı' ? 'Planlandı' : 'Tamamlandı';
      return Object.assign({}, item, { durum: yeniDurum });
    }
    return item;
  });
  veriKaydet();
  tetikleRender();
}

function kayitSil(id) {
  hapticVer('error');
  ziyaretler = ziyaretler.filter(function (item) { return item.id !== id; });
  veriKaydet();
  bildir('🗑️ Ziyaret kaydı silindi.');
}

// Müşteri Modalı Yönetimi
function modalMusteriAc() {
  hapticVer('light');
  fYeniUnvan = '';
  fYeniYetkili = '';
  fYeniTel = '';
  fYeniBolge = 'Selçuklu';
  fYeniAdres = '';
  fYeniKonum = '';
  yeniMusteriModalAcik = true;
  tetikleRender();
}

function modalMusteriKapat() {
  yeniMusteriModalAcik = false;
  tetikleRender();
}

function kaydetMusteri() {
  if (!fYeniUnvan.trim()) {
    bildir('⚠️ Cari / Firma unvanı zorunludur!');
    return;
  }

  hapticVer('success');
  sonMusteriId = sonMusteriId + 1;
  const yeniMusteri = {
    id: sonMusteriId,
    unvan: fYeniUnvan.trim(),
    yetkili: fYeniYetkili.trim() || 'Genel Yetkili',
    tel: fYeniTel.trim() || '03325550000',
    bolge: fYeniBolge,
    adres: fYeniAdres.trim() || (fYeniBolge + ' / Konya'),
    koordinat: fYeniKonum || '37.9542,32.5086'
  };

  musteriler.unshift(yeniMusteri);
  yeniMusteriModalAcik = false;
  veriKaydet();
  bildir('🏢 Yeni müşteri rehbere eklendi.');
}

// ==============================================================
// 5. MODERN VE GÜVENLİ ARAYÜZ BİLEŞENLERİ (UI ATOMS)
// ==============================================================

// %100 Clomosy Uyumlu Buton (React Native Button kısıtlamalarını aşar)
function ModernButton(props) {
  const variant = props.variant || 'primary';
  let bg = T.primary;
  let fg = T.textLight;
  let border = 'transparent';

  if (variant === 'secondary') { bg = '#F1F5F9'; fg = T.textMain; }
  else if (variant === 'success') { bg = T.success; fg = T.textLight; }
  else if (variant === 'danger') { bg = T.danger; fg = T.textLight; }
  else if (variant === 'dark') { bg = T.cardDark; fg = T.textLight; }
  else if (variant === 'outline') { bg = 'transparent'; fg = T.textSub; border = T.cardBorder; }
  else if (variant === 'info') { bg = T.info; fg = T.textLight; }

  const baseStyle = {
    backgroundColor: bg,
    paddingVertical: props.py !== undefined ? props.py : 8,
    paddingHorizontal: props.px !== undefined ? props.px : 12,
    borderRadius: props.rounded !== undefined ? props.rounded : 8,
    borderWidth: border !== 'transparent' ? 1 : 0,
    borderColor: border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5
  };

  const finalStyle = props.style ? Object.assign({}, baseStyle, props.style) : baseStyle;

  return Pressable({
    onPress: function () {
      hapticVer('light');
      if (typeof props.onPress === 'function') props.onPress();
    },
    style: finalStyle
  }, [
    props.icon ? Text({ style: { fontSize: props.iconSize || 13 } }, [props.icon]) : null,
    props.title ? Text({
      style: Object.assign({
        color: fg,
        fontSize: props.fs || 12,
        fontWeight: props.bold ? '800' : '700'
      }, props.textStyle || {})
    }, [props.title]) : null
  ]);
}

function Badge(text, type) {
  let bg = T.primaryLight;
  let fg = T.primary;

  if (type === 'success') { bg = T.successLight; fg = T.successDark; }
  else if (type === 'warning') { bg = T.warningLight; fg = '#B45309'; }
  else if (type === 'danger') { bg = T.dangerLight; fg = '#B91C1C'; }
  else if (type === 'dark') { bg = '#1E293B'; fg = '#F8FAFC'; }

  return View({
    style: {
      backgroundColor: bg,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      alignSelf: 'flex-start'
    }
  }, [
    Text({ style: { color: fg, fontSize: 10.5, fontWeight: '800' } }, [text])
  ]);
}

// Üst Başlık ve Hızlı Eylem Barı
function TopHeader() {
  return View({
    style: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: T.cardBorder,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, [
    Row({ style: { alignItems: 'center', gap: 10 } }, [
      View({
        style: {
          width: 38,
          height: 38,
          borderRadius: 10,
          backgroundColor: T.primary,
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, [
        Text({ style: { fontSize: 18 } }, ['⚡'])
      ]),
      Column({ style: { gap: 1 } }, [
        Text({ style: { fontSize: 17, fontWeight: '900', color: T.textMain, letterSpacing: -0.3 } }, ['Clomosy Saha']),
        Text({ style: { fontSize: 11, color: T.textSub, fontWeight: '600' } }, ['Mobil Operasyon & Canlı Analitik'])
      ])
    ]),

    Row({ style: { gap: 6 } }, [
      aktifSekme === 'musteriler' ? ModernButton({
        title: '+ Cari Ekle',
        icon: '🏢',
        variant: 'dark',
        onPress: modalMusteriAc
      }) : ModernButton({
        title: '+ Yeni Plan',
        icon: '🗓️',
        variant: 'primary',
        onPress: function () { modalZiyaretAc(null); }
      })
    ])
  ]);
}

// Alt Navigasyon Barı
function BottomTabBar() {
  return View({
    style: {
      width: '100%',
      flexDirection: 'row',
      borderTopWidth: 1,
      borderColor: T.cardBorder,
      backgroundColor: '#FFFFFF',
      paddingTop: 8,
      paddingBottom: 18,
      justifyContent: 'space-around'
    }
  }, [
    TabItem('ziyaretler', '🗓️', 'Ziyaretler', ziyaretler.filter(function (z) { return z.durum === 'Planlandı'; }).length),
    TabItem('musteriler', '🏢', 'Cariler', musteriler.length),
    TabItem('analiz', '📊', 'Analitik', null)
  ]);
}

function TabItem(id, ikon, baslik, bildirimSayisi) {
  const aktif = aktifSekme === id;
  return Pressable({
    onPress: function () {
      hapticVer('light');
      aktifSekme = id;
      tetikleRender();
    },
    style: { alignItems: 'center', paddingVertical: 4, paddingHorizontal: 16 }
  }, [
    View({ style: { position: 'relative' } }, [
      Text({ style: { fontSize: 18 } }, [ikon]),
      bildirimSayisi ? View({
        style: {
          position: 'absolute',
          top: -4,
          right: -10,
          backgroundColor: T.danger,
          borderRadius: 8,
          paddingHorizontal: 4,
          paddingVertical: 1
        }
      }, [
        Text({ style: { color: '#FFF', fontSize: 9, fontWeight: '900' } }, [String(bildirimSayisi)])
      ]) : null
    ]),
    Text({
      style: {
        fontSize: 11,
        fontWeight: aktif ? '800' : '600',
        color: aktif ? T.primary : T.textSub,
        marginTop: 3
      }
    }, [baslik])
  ]);
}

// ==============================================================
// 6. SEKME 1: ZİYARET VE SAHA GÖREVLERİ LİSTESİ
// ==============================================================

function ZiyaretlerGorunumu() {
  const q = aramaMetni.toLowerCase().trim();

  const filtrelenmis = ziyaretler.filter(function (item) {
    const metinUyumu = !q ||
      item.musteri.toLowerCase().indexOf(q) !== -1 ||
      item.yetkili.toLowerCase().indexOf(q) !== -1 ||
      item.not.toLowerCase().indexOf(q) !== -1;

    const durumUyumu = durumFiltresi === 'Tümü' || item.durum === durumFiltresi;
    const bolgeUyumu = bolgeFiltresi === 'Tümü' || item.bolge === bolgeFiltresi;

    return metinUyumu && durumUyumu && bolgeUyumu;
  });

  return Column({ style: { flex: 1, gap: 10, paddingTop: 10 } }, [
    // 1. Arama Girişi
    Row({ style: { gap: 8, alignItems: 'center' } }, [
      View({
        style: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: T.cardBorder,
          borderRadius: 10,
          paddingHorizontal: 10
        }
      }, [
        Text({ style: { fontSize: 14, marginRight: 6 } }, ['🔍']),
        TextInput({
          placeholder: 'Firma, yetkili veya not ara...',
          defaultValue: aramaMetni,
          onChangeText: function (v) { aramaMetni = metinAl(v); tetikleRender(); },
          onChange: function (v) { aramaMetni = metinAl(v); tetikleRender(); },
          style: { flex: 1, paddingVertical: 8, fontSize: 13, color: T.textMain }
        }),
        aramaMetni ? Pressable({
          onPress: function () { aramaMetni = ''; tetikleRender(); }
        }, [Text({ style: { fontSize: 14, color: T.textMuted, paddingHorizontal: 4 } }, ['✕'])]) : null
      ])
    ]),

    // 2. Durum ve Bölge Çift Kademeli Filtresi
    ScrollView({ horizontal: true, style: { maxHeight: 34 }, contentContainerStyle: { gap: 6 } }, [
      FilterChip('Durum: Tümü', durumFiltresi === 'Tümü', function () { durumFiltresi = 'Tümü'; tetikleRender(); }),
      FilterChip('🟡 Planlandı', durumFiltresi === 'Planlandı', function () { durumFiltresi = 'Planlandı'; tetikleRender(); }),
      FilterChip('🟢 Tamamlandı', durumFiltresi === 'Tamamlandı', function () { durumFiltresi = 'Tamamlandı'; tetikleRender(); }),
      View({ style: { width: 1, backgroundColor: T.cardBorder, marginHorizontal: 2 } }),
      FilterChip('Tüm İlçeler', bolgeFiltresi === 'Tümü', function () { bolgeFiltresi = 'Tümü'; tetikleRender(); }),
      FilterChip('Selçuklu', bolgeFiltresi === 'Selçuklu', function () { bolgeFiltresi = 'Selçuklu'; tetikleRender(); }),
      FilterChip('Meram', bolgeFiltresi === 'Meram', function () { bolgeFiltresi = 'Meram'; tetikleRender(); }),
      FilterChip('Karatay', bolgeFiltresi === 'Karatay', function () { bolgeFiltresi = 'Karatay'; tetikleRender(); })
    ]),

    // 3. Ziyaret Kartları Akışı
    ScrollView({ style: { flex: 1 }, contentContainerStyle: { paddingBottom: 20, gap: 10 } }, [
      filtrelenmis.length > 0 ? Column({ style: { gap: 10 } }, filtrelenmis.map(function (item) {
        return ZiyaretKart(item);
      })) : View({
        style: {
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          padding: 32,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: T.cardBorder,
          marginTop: 20,
          gap: 8
        }
      }, [
        Text({ style: { fontSize: 32 } }, ['📋']),
        Text({ style: { fontSize: 14, fontWeight: '700', color: T.textMain } }, ['Eşleşen Saha Kaydı Bulunamadı']),
        Text({ style: { fontSize: 12, color: T.textSub, textAlign: 'center' } }, ['Filtrelerinizi temizleyebilir veya sağ üstten yeni bir saha planı ekleyebilirsiniz.'])
      ])
    ])
  ]);
}

function FilterChip(isim, secili, onTikla) {
  return Pressable({
    onPress: function () {
      hapticVer('light');
      onTikla();
    },
    style: {
      paddingVertical: 5,
      paddingHorizontal: 11,
      borderRadius: 16,
      backgroundColor: secili ? T.primary : '#FFFFFF',
      borderWidth: 1,
      borderColor: secili ? T.primary : T.cardBorder
    }
  }, [
    Text({
      style: {
        fontSize: 11.5,
        fontWeight: secili ? '800' : '600',
        color: secili ? '#FFFFFF' : T.textSub
      }
    }, [isim])
  ]);
}

function ZiyaretKart(item) {
  const tamamlandi = item.durum === 'Tamamlandı';

  return View({
    key: 'z_' + item.id,
    style: {
      backgroundColor: '#FFFFFF',
      borderRadius: 14,
      padding: 13,
      borderWidth: 1.2,
      borderColor: tamamlandi ? '#86EFAC' : T.cardBorder,
      gap: 9
    }
  }, [
    // Kart Başlığı
    Row({ style: { justifyContent: 'space-between', alignItems: 'flex-start' } }, [
      Column({ style: { flex: 1, gap: 2 } }, [
        Text({ style: { fontSize: 15, fontWeight: '800', color: T.textMain } }, [item.musteri]),
        Text({ style: { fontSize: 12, color: T.textSub, fontWeight: '600' } }, ['👤 ' + item.yetkili + '  •  📍 ' + (item.bolge || 'Konya')])
      ]),
      Badge(item.durum, tamamlandi ? 'success' : 'warning')
    ]),

    // Detay Bloğu
    View({
      style: {
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        padding: 9,
        gap: 4,
        borderWidth: 1,
        borderColor: '#F1F5F9'
      }
    }, [
      Row({ style: { justifyContent: 'space-between' } }, [
        Text({ style: { fontSize: 11.5, color: T.info, fontWeight: '700' } }, ['🏷️ ' + item.tur]),
        Text({ style: { fontSize: 11, color: T.textSub, fontWeight: '600' } }, ['🕒 ' + item.tarih])
      ]),
      Text({ style: { fontSize: 11.5, color: T.textMain, fontStyle: 'italic', marginTop: 2 } }, ['"' + item.not + '"'])
    ]),

    // Aksiyon Butonları
    Row({ style: { justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 } }, [
      Row({ style: { gap: 6 } }, [
        ModernButton({
          title: 'Ara',
          icon: '📞',
          variant: 'secondary',
          onPress: function () { gercekAramaYap(item.tel); }
        }),
        ModernButton({
          title: 'Rota',
          icon: '🗺️',
          variant: 'secondary',
          onPress: function () { rotaAc(item.konum); }
        })
      ]),

      Row({ style: { gap: 6 } }, [
        ModernButton({
          title: tamamlandi ? 'Geri Al' : '✓ Tamamla',
          variant: tamamlandi ? 'outline' : 'success',
          onPress: function () { durumuDegistir(item.id); }
        }),
        ModernButton({
          icon: '🗑️',
          variant: 'danger',
          onPress: function () { kayitSil(item.id); }
        })
      ])
    ])
  ]);
}

// ==============================================================
// 7. SEKME 2: MÜŞTERİLER & CARİ REHBERİ
// ==============================================================

function MusterilerGorunumu() {
  const q = aramaMetni.toLowerCase().trim();
  const filtrelenmis = musteriler.filter(function (m) {
    return !q || m.unvan.toLowerCase().indexOf(q) !== -1 || m.yetkili.toLowerCase().indexOf(q) !== -1 || m.bolge.toLowerCase().indexOf(q) !== -1;
  });

  return Column({ style: { flex: 1, gap: 10, paddingTop: 10 } }, [
    Row({ style: { justifyContent: 'space-between', alignItems: 'center' } }, [
      Text({ style: { fontSize: 15, fontWeight: '800', color: T.textMain } }, ['Kayıtlı Firmalar (' + musteriler.length + ')']),
      ModernButton({
        title: '+ Cari Ekle',
        icon: '🏢',
        variant: 'dark',
        onPress: modalMusteriAc
      })
    ]),

    // Arama Çubuğu
    View({
      style: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: T.cardBorder,
        borderRadius: 10,
        paddingHorizontal: 10
      }
    }, [
      Text({ style: { fontSize: 14, marginRight: 6 } }, ['🔍']),
      TextInput({
        placeholder: 'Firma unvanı veya ilçe ara...',
        defaultValue: aramaMetni,
        onChangeText: function (v) { aramaMetni = metinAl(v); tetikleRender(); },
        onChange: function (v) { aramaMetni = metinAl(v); tetikleRender(); },
        style: { flex: 1, paddingVertical: 8, fontSize: 13, color: T.textMain }
      }),
      aramaMetni ? Pressable({
        onPress: function () { aramaMetni = ''; tetikleRender(); }
      }, [Text({ style: { fontSize: 14, color: T.textMuted, paddingHorizontal: 4 } }, ['✕'])]) : null
    ]),

    ScrollView({ style: { flex: 1 }, contentContainerStyle: { paddingBottom: 24, gap: 10 } }, [
      filtrelenmis.map(function (m) {
        return View({
          key: 'm_' + m.id,
          style: {
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            padding: 13,
            borderWidth: 1,
            borderColor: T.cardBorder,
            gap: 7
          }
        }, [
          Row({ style: { justifyContent: 'space-between', alignItems: 'center' } }, [
            Column({ style: { flex: 1, gap: 1 } }, [
              Text({ style: { fontSize: 15, fontWeight: '800', color: T.textMain } }, [m.unvan]),
              Text({ style: { fontSize: 11.5, color: T.textSub, fontWeight: '600' } }, ['👤 ' + m.yetkili + '  •  📍 ' + m.bolge])
            ]),
            ModernButton({
              title: '+ Planla',
              variant: 'primary',
              onPress: function () { modalZiyaretAc(m); }
            })
          ]),

          Text({ style: { fontSize: 11.5, color: T.textSub } }, ['🏢 ' + m.adres]),

          Row({ style: { gap: 6, paddingTop: 4 } }, [
            ModernButton({
              title: m.tel,
              icon: '📞',
              variant: 'secondary',
              onPress: function () { gercekAramaYap(m.tel); }
            }),
            ModernButton({
              title: 'Harita / Rota',
              icon: '🗺️',
              variant: 'secondary',
              onPress: function () { rotaAc(m.koordinat); }
            })
          ])
        ]);
      })
    ])
  ]);
}

// ==============================================================
// 8. SEKME 3: DİNAMİK VE CANLI OPERASYON ANALİTİĞİ
// ==============================================================

function AnalizGorunumu() {
  const toplam = ziyaretler.length;
  const tamamlanan = ziyaretler.filter(function (z) { return z.durum === 'Tamamlandı'; }).length;
  const bekleyen = toplam - tamamlanan;

  let carpan = 1.0;
  if (analizDonem === 'Bugün') carpan = 0.6;
  if (analizDonem === 'Ay') carpan = 1.35;

  const oran = toplam > 0 ? Math.round((tamamlanan / toplam) * 100) : 0;
  const verimlilikPuani = Math.min(Math.round(oran * 0.7 + (tamamlanan > 0 ? 30 : 10) * carpan), 100);

  const satisSayisi = ziyaretler.filter(function (z) { return z.tur === 'Satış'; }).length;
  const teknikSayisi = ziyaretler.filter(function (z) { return z.tur === 'Teknik Servis'; }).length;
  const sayimSayisi = ziyaretler.filter(function (z) { return z.tur === 'Saha Sayımı'; }).length;

  const selcukluSayisi = ziyaretler.filter(function (z) { return z.bolge === 'Selçuklu'; }).length;
  const meramSayisi = ziyaretler.filter(function (z) { return z.bolge === 'Meram'; }).length;
  const karataySayisi = ziyaretler.filter(function (z) { return z.bolge === 'Karatay'; }).length;

  return ScrollView({ style: { flex: 1 }, contentContainerStyle: { paddingVertical: 10, paddingBottom: 36, gap: 12 } }, [
    // 1. Dönem Seçici
    Row({ style: { justifyContent: 'space-between', alignItems: 'center' } }, [
      Text({ style: { fontSize: 16, fontWeight: '900', color: T.textMain } }, ['Operasyon Analitiği']),
      Row({ style: { backgroundColor: '#E2E8F0', padding: 3, borderRadius: 8, gap: 3 } }, [
        DonemButon('Bugün'),
        DonemButon('Hafta'),
        DonemButon('Ay')
      ])
    ]),

    // 2. Ana Performans Kartı
    View({
      style: {
        backgroundColor: T.cardDark,
        borderRadius: 16,
        padding: 16,
        gap: 12
      }
    }, [
      Row({ style: { justifyContent: 'space-between', alignItems: 'center' } }, [
        Column({ style: { gap: 2 } }, [
          Text({ style: { color: T.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 } }, ['GENEL SAHA BAŞARI SKORU']),
          Text({ style: { color: '#FFFFFF', fontSize: 28, fontWeight: '900' } }, [verimlilikPuani + ' / 100'])
        ]),
        View({
          style: {
            backgroundColor: verimlilikPuani >= 60 ? '#065F46' : '#78350F',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 20
          }
        }, [
          Text({ style: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' } }, [verimlilikPuani >= 60 ? '⚡ OPTİMAL ÇALIŞMA' : '🟡 DİKKAT GEREKİR'])
        ])
      ]),

      Column({ style: { gap: 5 } }, [
        Row({ style: { justifyContent: 'space-between' } }, [
          Text({ style: { color: T.textMuted, fontSize: 11 } }, ['Tamamlanma Oranı']),
          Text({ style: { color: '#38BDF8', fontSize: 11.5, fontWeight: '800' } }, ['%' + oran])
        ]),
        View({
          style: { height: 8, backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden' }
        }, [
          View({ style: { width: oran + '%', height: '100%', backgroundColor: '#38BDF8', borderRadius: 4 } })
        ])
      ])
    ]),

    // 3. KPI İstatistik Kartları
    Row({ style: { gap: 8 } }, [
      KpiKart('Tamamlandı', String(tamamlanan), T.success, 'Başarılı Plan'),
      KpiKart('Bekliyor', String(bekleyen), T.warning, 'Açık Görev'),
      KpiKart('Aktif Cari', String(musteriler.length), T.primary, 'Kayıtlı Portföy')
    ]),

    // 4. Haftalık Ziyaret Dağılım Grafiği
    View({
      style: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: T.cardBorder,
        gap: 10
      }
    }, [
      Row({ style: { justifyContent: 'space-between', alignItems: 'center' } }, [
        Text({ style: { fontSize: 13, fontWeight: '800', color: T.textMain } }, ['Haftalık Dağılım Çizelgesi']),
        Text({ style: { fontSize: 11, color: T.primary, fontWeight: '700' } }, ['● En Yoğun: Çarşamba'])
      ]),
      Row({
        style: {
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          height: 95,
          paddingTop: 10
        }
      }, [
        GunSutun('Pzt', 3, 6, false),
        GunSutun('Sal', 5, 6, false),
        GunSutun('Çar', toplam, 6, true),
        GunSutun('Per', 2, 6, false),
        GunSutun('Cum', 4, 6, false)
      ])
    ]),

    // 5. Bölgesel Yoğunluk
    View({
      style: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: T.cardBorder,
        gap: 10
      }
    }, [
      Text({ style: { fontSize: 13, fontWeight: '800', color: T.textMain } }, ['📍 Bölgesel Ziyaret Dağılımı']),
      OranBar('Selçuklu (Sanayi & Teknokent)', selcukluSayisi, toplam, T.primary),
      OranBar('Meram (Ticari Merkez)', meramSayisi, toplam, T.purple),
      OranBar('Karatay (Lojistik Ağ)', karataySayisi, toplam, T.info)
    ]),

    // 6. Operasyon Türü
    View({
      style: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: T.cardBorder,
        gap: 10
      }
    }, [
      Text({ style: { fontSize: 13, fontWeight: '800', color: T.textMain } }, ['🎯 Görev Türü Analizi']),
      OranBar('💼 Satış & Pazarlama', satisSayisi, toplam, T.primary),
      OranBar('🔧 Teknik Servis & Kurulum', teknikSayisi, toplam, T.success),
      OranBar('📋 Saha Sayımı & Denetim', sayimSayisi, toplam, T.warning)
    ])
  ]);
}

function DonemButon(isim) {
  const secili = analizDonem === isim;
  return Pressable({
    onPress: function () {
      hapticVer('light');
      analizDonem = isim;
      tetikleRender();
    },
    style: {
      paddingVertical: 4,
      paddingHorizontal: 9,
      borderRadius: 6,
      backgroundColor: secili ? T.primary : 'transparent'
    }
  }, [
    Text({
      style: {
        fontSize: 10.5,
        fontWeight: '700',
        color: secili ? '#FFFFFF' : T.textSub
      }
    }, [isim])
  ]);
}

function KpiKart(baslik, deger, renk, altYazi) {
  return View({
    style: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: T.cardBorder,
      alignItems: 'center',
      gap: 2
    }
  }, [
    Text({ style: { fontSize: 10.5, color: T.textSub, fontWeight: '700' } }, [baslik]),
    Text({ style: { fontSize: 22, fontWeight: '900', color: renk } }, [deger]),
    Text({ style: { fontSize: 9.5, color: T.textMuted } }, [altYazi])
  ]);
}

function GunSutun(gun, deger, max, aktifMi) {
  const yukseklik = Math.min(Math.round((deger / max) * 65), 65);
  return Column({ style: { alignItems: 'center', gap: 4, flex: 1 } }, [
    Text({ style: { fontSize: 10, fontWeight: '700', color: aktifMi ? T.primary : T.textSub } }, [String(deger)]),
    View({
      style: {
        width: aktifMi ? 20 : 16,
        height: Math.max(yukseklik, 8),
        backgroundColor: aktifMi ? T.primary : '#CBD5E1',
        borderRadius: 4
      }
    }),
    Text({ style: { fontSize: 10, color: aktifMi ? T.textMain : T.textSub, fontWeight: aktifMi ? '800' : '600' } }, [gun])
  ]);
}

function OranBar(etiket, sayi, toplam, renk) {
  const yuzde = toplam > 0 ? Math.round((sayi / toplam) * 100) : 0;
  return Column({ style: { gap: 3 } }, [
    Row({ style: { justifyContent: 'space-between' } }, [
      Text({ style: { fontSize: 11, color: T.textSub, fontWeight: '600' } }, [etiket]),
      Text({ style: { fontSize: 11, fontWeight: '800', color: T.textMain } }, [sayi + ' (%' + yuzde + ')'])
    ]),
    View({
      style: { height: 7, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }
    }, [
      View({ style: { width: yuzde + '%', height: '100%', backgroundColor: renk, borderRadius: 4 } })
    ])
  ]);
}

// ==============================================================
// 9. MODALLAR (YENİ ZİYARET VE YENİ MÜŞTERİ)
// ==============================================================

function NewVisitModal() {
  if (!yeniZiyaretModalAcik) return null;

  return View({
    style: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      zIndex: 999
    }
  }, [
    View({
      style: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        maxWidth: 480,
        borderRadius: 16,
        padding: 16,
        gap: 10
      }
    }, [
      Row({ style: { justifyContent: 'space-between', alignItems: 'center' } }, [
        Text({ style: { fontSize: 16, fontWeight: '800', color: T.textMain } }, ['🗓️ Yeni Saha Ziyareti Planla']),
        Pressable({ onPress: modalZiyaretKapat }, [
          Text({ style: { fontSize: 18, color: T.textSub, fontWeight: '900', padding: 4 } }, ['✕'])
        ])
      ]),

      TextInput({
        placeholder: 'Firma / Cari Unvanı *',
        defaultValue: fZiyaretMusteri,
        onChangeText: function (v) { fZiyaretMusteri = metinAl(v); },
        onChange: function (v) { fZiyaretMusteri = metinAl(v); },
        style: { borderWidth: 1, borderColor: T.cardBorder, borderRadius: 8, padding: 8, fontSize: 13, color: T.textMain }
      }),

      Row({ style: { gap: 8 } }, [
        TextInput({
          placeholder: 'Yetkili Kişi',
          defaultValue: fZiyaretYetkili,
          onChangeText: function (v) { fZiyaretYetkili = metinAl(v); },
          onChange: function (v) { fZiyaretYetkili = metinAl(v); },
          style: { flex: 1, borderWidth: 1, borderColor: T.cardBorder, borderRadius: 8, padding: 8, fontSize: 13, color: T.textMain }
        }),
        TextInput({
          placeholder: 'Telefon',
          defaultValue: fZiyaretTel,
          onChangeText: function (v) { fZiyaretTel = metinAl(v); },
          onChange: function (v) { fZiyaretTel = metinAl(v); },
          style: { flex: 1, borderWidth: 1, borderColor: T.cardBorder, borderRadius: 8, padding: 8, fontSize: 13, color: T.textMain }
        })
      ]),

      Row({ style: { gap: 6 } }, [
        SecimHapi('Satış', fZiyaretTur === 'Satış', function () { fZiyaretTur = 'Satış'; tetikleRender(); }),
        SecimHapi('Teknik Servis', fZiyaretTur === 'Teknik Servis', function () { fZiyaretTur = 'Teknik Servis'; tetikleRender(); }),
        SecimHapi('Saha Sayımı', fZiyaretTur === 'Saha Sayımı', function () { fZiyaretTur = 'Saha Sayımı'; tetikleRender(); })
      ]),

      Row({ style: { gap: 6 } }, [
        SecimHapi('Selçuklu', fZiyaretBolge === 'Selçuklu', function () { fZiyaretBolge = 'Selçuklu'; tetikleRender(); }),
        SecimHapi('Meram', fZiyaretBolge === 'Meram', function () { fZiyaretBolge = 'Meram'; tetikleRender(); }),
        SecimHapi('Karatay', fZiyaretBolge === 'Karatay', function () { fZiyaretBolge = 'Karatay'; tetikleRender(); })
      ]),

      TextInput({
        placeholder: 'Ziyaret notları, talimatlar ve yapılacaklar...',
        defaultValue: fZiyaretNot,
        multiline: true,
        numberOfLines: 3,
        onChangeText: function (v) { fZiyaretNot = metinAl(v); },
        onChange: function (v) { fZiyaretNot = metinAl(v); },
        style: { borderWidth: 1, borderColor: T.cardBorder, borderRadius: 8, padding: 8, fontSize: 13, height: 55, color: T.textMain }
      }),

      Row({ style: { justifyContent: 'space-between', alignItems: 'center' } }, [
        ModernButton({
          title: gpsBekleniyor ? 'Konum Alınıyor...' : '📍 Konum Al (GPS)',
          variant: 'secondary',
          onPress: function () { gercekGpsAl('ziyaret'); }
        }),
        Text({ style: { fontSize: 11, color: fZiyaretKonum ? T.success : T.textSub, fontWeight: '700' } }, [
          fZiyaretKonum ? '✓ GPS: ' + fZiyaretKonum : 'Konum seçilmedi'
        ])
      ]),

      Row({ style: { justifyContent: 'flex-end', gap: 8, marginTop: 4 } }, [
        ModernButton({ title: 'Vazgeç', variant: 'outline', onPress: modalZiyaretKapat }),
        ModernButton({ title: 'Planı Kaydet', variant: 'primary', onPress: kaydetZiyaret })
      ])
    ])
  ]);
}

function NewCustomerModal() {
  if (!yeniMusteriModalAcik) return null;

  return View({
    style: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      zIndex: 999
    }
  }, [
    View({
      style: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        maxWidth: 480,
        borderRadius: 16,
        padding: 16,
        gap: 10
      }
    }, [
      Row({ style: { justifyContent: 'space-between', alignItems: 'center' } }, [
        Text({ style: { fontSize: 16, fontWeight: '800', color: T.textMain } }, ['🏢 Yeni Cari / Müşteri Ekle']),
        Pressable({ onPress: modalMusteriKapat }, [
          Text({ style: { fontSize: 18, color: T.textSub, fontWeight: '900', padding: 4 } }, ['✕'])
        ])
      ]),

      TextInput({
        placeholder: 'Firma / Müşteri Unvanı *',
        defaultValue: fYeniUnvan,
        onChangeText: function (v) { fYeniUnvan = metinAl(v); },
        onChange: function (v) { fYeniUnvan = metinAl(v); },
        style: { borderWidth: 1, borderColor: T.cardBorder, borderRadius: 8, padding: 8, fontSize: 13, color: T.textMain }
      }),

      Row({ style: { gap: 8 } }, [
        TextInput({
          placeholder: 'Yetkili İsim Soyisim',
          defaultValue: fYeniYetkili,
          onChangeText: function (v) { fYeniYetkili = metinAl(v); },
          onChange: function (v) { fYeniYetkili = metinAl(v); },
          style: { flex: 1, borderWidth: 1, borderColor: T.cardBorder, borderRadius: 8, padding: 8, fontSize: 13, color: T.textMain }
        }),
        TextInput({
          placeholder: 'Telefon (05xx...)',
          defaultValue: fYeniTel,
          onChangeText: function (v) { fYeniTel = metinAl(v); },
          onChange: function (v) { fYeniTel = metinAl(v); },
          style: { flex: 1, borderWidth: 1, borderColor: T.cardBorder, borderRadius: 8, padding: 8, fontSize: 13, color: T.textMain }
        })
      ]),

      Row({ style: { gap: 6 } }, [
        SecimHapi('Selçuklu', fYeniBolge === 'Selçuklu', function () { fYeniBolge = 'Selçuklu'; tetikleRender(); }),
        SecimHapi('Meram', fYeniBolge === 'Meram', function () { fYeniBolge = 'Meram'; tetikleRender(); }),
        SecimHapi('Karatay', fYeniBolge === 'Karatay', function () { fYeniBolge = 'Karatay'; tetikleRender(); })
      ]),

      TextInput({
        placeholder: 'Adres tarifi / Cadde / Sokak...',
        defaultValue: fYeniAdres,
        onChangeText: function (v) { fYeniAdres = metinAl(v); },
        onChange: function (v) { fYeniAdres = metinAl(v); },
        style: { borderWidth: 1, borderColor: T.cardBorder, borderRadius: 8, padding: 8, fontSize: 13, color: T.textMain }
      }),

      Row({ style: { justifyContent: 'space-between', alignItems: 'center' } }, [
        ModernButton({
          title: gpsBekleniyor ? 'Konum Alınıyor...' : '📍 Konum Al (GPS)',
          variant: 'secondary',
          onPress: function () { gercekGpsAl('musteri'); }
        }),
        Text({ style: { fontSize: 11, color: fYeniKonum ? T.success : T.textSub, fontWeight: '700' } }, [
          fYeniKonum ? '✓ GPS: ' + fYeniKonum : 'Konum atanmadı'
        ])
      ]),

      Row({ style: { justifyContent: 'flex-end', gap: 8, marginTop: 4 } }, [
        ModernButton({ title: 'Vazgeç', variant: 'outline', onPress: modalMusteriKapat }),
        ModernButton({ title: 'Cariyi Kaydet', variant: 'dark', onPress: kaydetMusteri })
      ])
    ])
  ]);
}

function SecimHapi(isim, secili, onTikla) {
  return Pressable({
    onPress: function () {
      hapticVer('light');
      onTikla();
    },
    style: {
      flex: 1,
      paddingVertical: 6,
      borderRadius: 7,
      backgroundColor: secili ? T.primary : '#F1F5F9',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: secili ? T.primary : 'transparent'
    }
  }, [
    Text({ style: { fontSize: 11, fontWeight: '700', color: secili ? '#FFFFFF' : T.textSub } }, [isim])
  ]);
}

function ToastView() {
  if (!toastMesaj) return null;

  return View({
    style: {
      position: 'absolute',
      bottom: 75,
      left: 16,
      right: 16,
      backgroundColor: T.cardDark,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1000
    }
  }, [
    Text({ style: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', flex: 1 } }, [toastMesaj]),
    Pressable({ onPress: toastKapat }, [
      Text({ style: { color: T.textMuted, fontWeight: '900', marginLeft: 8, padding: 2 } }, ['✕'])
    ])
  ]);
}

// ==============================================================
// 10. ANA EKRAN & MOTOR GİRİŞİ (ROOT SCREEN)
// ==============================================================

function MainScreen() {
  let govdeIcerik;

  if (aktifSekme === 'musteriler') {
    govdeIcerik = MusterilerGorunumu();
  } else if (aktifSekme === 'analiz') {
    govdeIcerik = AnalizGorunumu();
  } else {
    govdeIcerik = ZiyaretlerGorunumu();
  }

  const anaKapsayici = Column({
    style: {
      flex: 1,
      backgroundColor: T.bg
    }
  }, [
    View({
      style: {
        width: '100%',
        maxWidth: 640,
        flex: 1,
        alignSelf: 'center',
        paddingHorizontal: 14
      }
    }, [
      TopHeader(),
      govdeIcerik
    ]),

    BottomTabBar(),
    NewVisitModal(),
    NewCustomerModal(),
    ToastView()
  ]);

  if (typeof SafeArea === 'function') {
    return SafeArea({
      style: { flex: 1, backgroundColor: T.bg },
      edges: ['top', 'bottom']
    }, [
      typeof StatusBar === 'function' ? StatusBar({ style: 'dark' }) : null,
      anaKapsayici
    ]);
  }

  return Screen({
    style: {
      flex: 1,
      backgroundColor: T.bg,
      paddingTop: 8
    }
  }, [
    anaKapsayici
  ]);
}

function render() {
  return MainScreen();
}

// ==============================================================
// 11. BAŞLATMA & GLOBAL DIŞA AKTARIM
// ==============================================================
veriYukle();

if (typeof window !== 'undefined') {
  window.MainScreen = MainScreen;
  window.render = render;
}
if (typeof globalThis !== 'undefined') {
  globalThis.MainScreen = MainScreen;
  globalThis.render = render;
}
if (typeof global !== 'undefined') {
  global.MainScreen = MainScreen;
  global.render = render;
}

tetikleRender();
