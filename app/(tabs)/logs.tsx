import { useEffect, useState } from "react";
import { StyleSheet, View, Text, FlatList } from "react-native";
import { supabase } from "../../supabase";

export default function LogsScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLogs() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Log çekilirken hata:", error);
      setLogs([]);  // hata olsa bile UI çökmemeli
    } else {
      setLogs(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadLogs();
  }, []);

  // Yükleniyor ekranı
  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Yükleniyor...</Text>
      </View>
    );
  }

  // Boş ekran
  if (logs.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Henüz bir işlem kaydı yok.</Text>
      </View>
    );
  }

  // Details'i JSON/text fark etmeksizin düzgün gösteren fonksiyon
  const parseDetails = (details: any) => {
    if (!details) return "Detay yok";

    try {
      // Eğer JSON string ise parse et
      if (typeof details === "string" && details.startsWith("{")) {
        const parsed = JSON.parse(details);
        return JSON.stringify(parsed, null, 2);
      }

      // JSON değilse direkt göster
      return typeof details === "string" ? details : JSON.stringify(details, null, 2);
    } catch {
      // Parse edilemezse direkt göster
      return String(details);
    }
  };

  const safeDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "Tarih yok" : d.toLocaleString("tr-TR");
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : `log-${index}`)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.action}>📌 {item.action || "Bilinmeyen İşlem"}</Text>

            <Text style={styles.details}>{parseDetails(item.details)}</Text>

            <Text style={styles.date}>{safeDate(item.created_at)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f7f7f7" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loading: { fontSize: 18, fontWeight: "bold" },
  empty: { fontSize: 16, color: "#777" },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  action: { fontSize: 18, fontWeight: "bold" },
  details: { marginTop: 5, color: "#444", fontFamily: "monospace" },
  date: { marginTop: 5, fontSize: 12, color: "#666" },
});
 