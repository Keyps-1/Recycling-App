import { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { supabase } from "../supabase";

const screenWidth = Dimensions.get("window").width;

type Stats = {
  points: number;
  history: number;
  weight: number;
  streak: number;
  badges: number;
  rewards: number;
};

export default function StatisticsScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pieData, setPieData] = useState<any[]>([]);
  const [barChartData, setBarChartData] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    /* ------------------ AUTH ------------------ */
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData?.user) {
      console.log("AUTH USER YOK");
      return;
    }

    const userId = authData.user.id;

    /* ------------------ SCANNED ITEMS ------------------ */
    const { data: scanned } = await supabase
      .from("scanned_items")
      .select("weight, recycle_type")
      .eq("user_id", userId);
// 🔁 TÜRKÇE → İNGİLİZCE TÜR HARİTASI
const typeMap: Record<string, string> = {
  plastik: "plastic",
  metal: "metal",
  cam: "glass",
  kagit: "paper",
  kağıt: "paper",
};

    const totalWeight =
      scanned?.reduce((s, i) => s + Number(i.weight || 0), 0) || 0;
const pieColors: Record<string, string> = {
  plastic: "#1E88E5",
  metal:   "#757575",
  glass:   "#00ACC1",
  paper:   "#FBC02D",
};

const allowedTypes = ["plastic", "metal", "glass", "paper"];
const grouped: Record<string, number> = {};

scanned
  ?.filter(item => Number(item.weight) > 0)
  .forEach((item) => {
    const raw = item.recycle_type?.trim().toLowerCase();
    if (!raw) return;

    const key = typeMap[raw];
    if (!key) return; // tanımsız türleri at

    grouped[key] = (grouped[key] || 0) + Number(item.weight);
  });

const pie = Object.keys(grouped).map((key) => ({
  name: key.toUpperCase(),
  population: grouped[key],
  color: pieColors[key] ?? "#9CA3AF", // 🔥 ASLA undefined değil
  legendFontColor: "#333",
  legendFontSize: 14,
}));


setPieData(pie);

setBarChartData({
  labels: Object.keys(grouped).map((k) => k.toUpperCase()),
  datasets: [
    {
      data: Object.keys(grouped).map((k) => grouped[k]),
    },
  ],
});

    /* ------------------ DİĞER İSTATİSTİKLER ------------------ */
    const { data: profile } = await supabase
      .from("users_profile")
      .select("total_points")
      .eq("id", userId)
      .maybeSingle();

    const { count: historyCount } = await supabase
      .from("history")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const { count: badgeCount } = await supabase
      .from("user_badges")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const { count: rewardCount } = await supabase
      .from("user_rewards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const { data: streak } = await supabase
      .from("daily_streak")
      .select("streak_days")
      .eq("user_id", userId)
      .maybeSingle();

    setStats({
      points: profile?.total_points || 0,
      history: historyCount || 0,
      weight: totalWeight,
      streak: streak?.streak_days || 0,
      badges: badgeCount || 0,
      rewards: rewardCount || 0,
    });
  }

  if (!stats) {
    return (
      <View style={styles.center}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 İstatistikler</Text>

      {/* ÖZET */}
      <View style={styles.row}>
        <StatCard label="Toplam Puan" value={stats.points} />
        <StatCard label="Günlük Seri" value={`🔥 ${stats.streak}`} />
      </View>

      <View style={styles.row}>
        <StatCard label="Tarama Sayısı" value={stats.history} />
        <StatCard
          label="Toplam Ağırlık"
          value={`${stats.weight.toFixed(1)} kg`}
        />
      </View>

      {pieData.length > 0 && (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>Geri Dönüşüm Dağılımı</Text>
<PieChart
  data={pieData}
  width={screenWidth - 40}
  height={220}
  accessor="population"
  backgroundColor="transparent"
  paddingLeft="10"
  avoidFalseZero
  chartConfig={{
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 2,
    color: () => "transparent",   // 🔥 KRİTİK HİLE
    labelColor: () => "#000000",
  }}
/>



  </View>
)}

      {/* BAR CHART */}
      {barChartData && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Türlere Göre Ağırlık</Text>
          <BarChart
            data={barChartData}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix=" kg"
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: () => "#4CAF50",
              labelColor: () => "#333",
            }}
          />
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* ------------------ COMPONENT ------------------ */
function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F3F4F6",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 3,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#10B981",
  },
  statLabel: {
    marginTop: 6,
    color: "#555",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
