import { useFocusEffect,router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "../supabase";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function HistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);

  async function loadHistory() {
    <Pressable onPress={() => router.replace("/")}>
  <IconSymbol size={26} name="house.fill" color="#2E7D32" />
</Pressable>
    try {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.log("History error:", error);
      }

      setHistory(data ?? []);
    } catch (e) {
      console.log("History genel hata:", e);
    }

    setLoading(false);
  }

  // 👇 EKRAN HER ODAKLANDIĞINDA ÇALIŞIR
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  /* ================= UI STATES ================= */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10 }}>Geçmiş yükleniyor...</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Henüz tarama yok</Text>
        <Text style={styles.emptySub}>
          QR kod ile ilk taramanı yaptığında burada listelenecek.
        </Text>
      </View>
    );
  }

  /* ================= MAIN UI ================= */

  return (
    
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tarama Geçmişi</Text>

      {history.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.category}>
            {item.category ?? "Geri Dönüşüm"}
          </Text>

          <View style={styles.row}>
            {item.weight != null && (
              <Text style={styles.detail}>⚖️ {item.weight} kg</Text>
            )}

            {item.points != null && (
              <Text style={styles.detail}>⭐ {item.points} puan</Text>
            )}
          </View>

          <Text style={styles.date}>
            {new Date(item.created_at).toLocaleString("tr-TR", {
              timeZone: "Europe/Istanbul",
            })}
          </Text>
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },

  emptySub: {
    color: "#666",
    textAlign: "center",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
  },

  category: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  detail: {
    fontSize: 14,
    color: "#444",
  },

  date: {
    marginTop: 8,
    fontSize: 12,
    color: "#888",
  },
});
 