  import { LinearGradient } from "expo-linear-gradient";
  import { router, useFocusEffect } from "expo-router";
  import { useCallback, useState } from "react";
  import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
  } from "react-native";
  import { supabase } from "../supabase";

  export default function HomeScreen() {
    const DEFAULT_AVATAR = "https://i.pravatar.cc/200";

    const [stats, setStats] = useState({
      name: "Kullanıcı",
      avatar: DEFAULT_AVATAR,
      level: 1,
      points: 0,
      totalItems: 0,
      totalWeight: 0,
      streak: 0,
    });

    useFocusEffect(
      useCallback(() => {
        loadUser();
      }, [])
    );

    async function handleLogout() {
      await supabase.auth.signOut();
      router.replace("/login"); // kendi login path’in
    }

    async function loadUser() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) return;

      /* === USER PROFILE === */
      const { data: profile } = await supabase
        .from("users_profile")
        .select("full_name, avatar_url, total_points")
        .eq("id", user.id)
        .single();

      /* === HISTORY (TEK GERÇEK KAYNAK) === */
      // HISTORY'DEN TOPLAM PUAN
const { data: history } = await supabase
  .from("history")
  .select("*")
  .eq("user_id", user.id);

console.log("HISTORY FROM HOME:", history);


const totalItems = history?.length || 0;

const totalWeight =
  history?.reduce((sum, h) => sum + (h.weight || 0), 0) || 0;

const totalPoints =
  history?.reduce((sum, h) => sum + (h.points || 0), 0) || 0;


      /* === STREAK HESABI === */
function calculateStreak(history: any[]) {
  if (!history || history.length === 0) return 0;

  const days = Array.from(
    new Set(
      history.map(h =>
        new Date(h.created_at).toISOString().slice(0, 10)
      )
    )
  ).sort((a, b) => (a < b ? 1 : -1)); // DESC

  let streak = 0;

  // bugün UTC
  let cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);

  const dayStrings = days;

  // bugün yoksa dünü dene
  if (!dayStrings.includes(cursor.toISOString().slice(0, 10))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);

    if (!dayStrings.includes(cursor.toISOString().slice(0, 10))) {
      return 0;
    }
  }

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (dayStrings.includes(key)) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

      const streak = calculateStreak(history || []);

      /* === SET STATS === */
      setStats({
  name: profile?.full_name || "Kullanıcı",
  avatar: profile?.avatar_url || DEFAULT_AVATAR,
  level: Math.floor(totalPoints / 100),
  points: totalPoints,
  totalItems,
  totalWeight: Number(totalWeight.toFixed(2)),
  streak,
});

    }

    return (
      <ScrollView style={styles.container}>
        {/* === HEADER === */}
        <LinearGradient
          colors={["#4CAF50", "#2E7D32"]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <Image source={{ uri: stats.avatar }} style={styles.avatar} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.name}>{stats.name}</Text>
              <Text style={styles.level}>Seviye {stats.level}</Text>
            </View>
          </View>

          {/* LOGOUT */}
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutBtn}
          >
            <Text style={{ fontWeight: "bold" }}>⎋</Text>
          </TouchableOpacity>

          {/* EXPLORE */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/explore")}
            style={styles.exploreBtn}
          >
            <Image
              source={require("../assets/icons/explore.jpg")}
              style={styles.exploreIcon}
            />
          </TouchableOpacity>

          <View style={styles.pointsBox}>
            <Text style={styles.pointsTitle}>Toplam Puan</Text>
            <Text style={styles.pointsValue}>{stats.points}</Text>
          </View>

          <View style={styles.progressBox}>
            <Text style={styles.progressTitle}>Günlük Hedef</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      Math.min(stats.points % 100, 100)
                    }%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressDetail}>
              {stats.points % 100}/100
            </Text>
          </View>
        </LinearGradient>

        {/* === STATS === */}
        <View style={styles.smallCardsRow}>
          <StatCard
            icon={require("../assets/icons/box.png")}
            value={stats.totalItems}
            label="Ürün"
          />
          <StatCard
            icon={require("../assets/icons/scale.png")}
            value={`${stats.totalWeight} kg`}
            label="Ağırlık"
          />
          <StatCard
            icon={require("../assets/icons/fire.jpeg")}
            value={stats.streak}
            label="Günlük Seri"
          />
        </View>

        {/* === GRID === */}
        <View style={styles.grid}>
          <GridButton
            color="#0A8754"
            icon={require("../assets/icons/camera.png")}
            label="Tara"
            onPress={() => router.push("/scanner")}
          />
          <GridButton
            color="#0077C8"
            icon={require("../assets/icons/history.png")}
            label="Geçmiş"
            onPress={() => router.push("/history")}
          />
          <GridButton
            color="#8E44AD"
            icon={require("../assets/icons/stats.png")}
            label="İstatistik"
            onPress={() => router.push("/statistics")}
          />
          <GridButton
            color="#FF8C00"
            icon={require("../assets/icons/trophy.png")}
            label="Rozetler"
            onPress={() => router.push("/badges")}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  /* === SMALL COMPONENTS === */

  function StatCard({ icon, value, label }: any) {
    return (
      <View style={styles.smallCard}>
        <Image source={icon} style={styles.smallIcon} />
        <Text style={styles.smallValue}>{value}</Text>
        <Text style={styles.smallLabel}>{label}</Text>
      </View>
    );
  }

  function GridButton({ color, icon, label, onPress }: any) {
    return (
      <TouchableOpacity
        style={[styles.bigCard, { backgroundColor: color }]}
        onPress={onPress}
      >
        <Image source={icon} style={styles.bigIcon} />
        <Text style={styles.bigLabel}>{label}</Text>
      </TouchableOpacity>
    );
  }

  /* === STYLES === */

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F4F5" },

    header: {
      padding: 25,
      borderBottomLeftRadius: 35,
      borderBottomRightRadius: 35,
    },
    headerTop: { flexDirection: "row", alignItems: "center" },

    avatar: {
      width: 75,
      height: 75,
      borderRadius: 40,
      borderWidth: 2,
      borderColor: "white",
    },

    name: { fontSize: 22, color: "white", fontWeight: "bold" },
    level: { fontSize: 15, color: "#f5fcf6ff" },

    logoutBtn: {
      position: "absolute",
      top: 50,
      left: 280,
      backgroundColor: "white",
      padding: 8,
      borderRadius: 20,
    },

    exploreBtn: {
      position: "absolute",
      top: 50,
      right: 20,
    },

    exploreIcon: { width: 28, height: 28, borderRadius: 14 },

    pointsBox: {
      backgroundColor: "white",
      padding: 15,
      borderRadius: 18,
      marginTop: 15,
    },

    pointsTitle: { color: "#4CAF50", fontWeight: "600" },
    pointsValue: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#2E7D32",
    },

    progressBox: { marginTop: 15 },
    progressTitle: { color: "white" },

    progressBar: {
      height: 10,
      backgroundColor: "#A5D6A7",
      borderRadius: 10,
      marginTop: 6,
    },
    progressFill: {
      height: "100%",
      backgroundColor: "white",
      borderRadius: 10,
    },
    progressDetail: { color: "white", marginTop: 5 },

    smallCardsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: -20,
    },

    smallCard: {
      backgroundColor: "white",
      width: "28%",
      padding: 15,
      borderRadius: 18,
      alignItems: "center",
      elevation: 4,
    },

    smallIcon: { width: 40, height: 40, marginBottom: 8 },
    smallValue: { fontSize: 20, fontWeight: "bold" },
    smallLabel: { color: "#555" },

    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginTop: 25,
      paddingHorizontal: 20,
    },

    bigCard: {
      width: "48%",
      height: 150,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      elevation: 5,
    },

    bigIcon: { width: 50, height: 50, tintColor: "white" },
    bigLabel: {
      color: "white",
      marginTop: 10,
      fontSize: 18,
      fontWeight: "bold",
    },
  });
