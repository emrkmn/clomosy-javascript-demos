// ==========================================
// BİRİM 2: RouterScreen 
// ==========================================

function RouterScreen(params) {
  if (!params || !params.kullanici) {
    Navigate("MainScreen");
    return Screen({ style: { backgroundColor: "#070B12", flex: 1 } }, []);
  }

  function paneleGec() {
    if (params.kullanici.rol === "YONETICI") {
      Navigate("YoneticiScreen", params);
    } else {
      Navigate("SahaScreen", params);
    }
  }

  return Screen({
    style: {
      backgroundColor: "#070B12",
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24
    }
  }, [
    View({
      style: {
        backgroundColor: "#111827",
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#1E293B",
        alignItems: "center",
        gap: 14,
        maxWidth: 360,
        width: "100%"
      }
    }, [
      View({
        style: {
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: "rgba(2, 132, 199, 0.15)",
          alignItems: "center",
          justifyContent: "center"
        }
      }, [
        Text({ style: { fontSize: 22 } }, [params.kullanici.rol === "YONETICI" ? "👔" : "📍"])
      ]),

      Text({
        style: { color: "#F8FAFC", fontSize: 16, fontWeight: "900", textAlign: "center" }
      }, ["Giriş Doğrulandı"]),

      Text({
        style: { color: "#94A3B8", fontSize: 12, textAlign: "center" }
      }, ["Hoş geldiniz, " + params.kullanici.adSoyad + ".\nPanele bağlanmak için dokunun:"]),

      Pressable({
        onPress: paneleGec,
        style: {
          backgroundColor: params.kullanici.rol === "YONETICI" ? "#0F766E" : "#0284C7",
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 10,
          width: "100%",
          alignItems: "center",
          marginTop: 6
        }
      }, [
        Text({ style: { color: "#FFFFFF", fontWeight: "900", fontSize: 13 } }, ["Panele Devam Et →"])
      ])
    ])
  ]);
}
