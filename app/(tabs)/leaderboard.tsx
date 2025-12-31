import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "../../supabase";

export default function LeaderboardScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    setLoading(true);
  const tierImages: any = {
  bronze: require("../../assets/tiers/bronze.png"),
  silver: require("../../assets/tiers/silver.png"),
  gold: require("../../assets/tiers/gold.png"),
  master: require("../../assets/tiers/master.png"),
};

  function getTier(points: number) {
  if (points >= 1000) return "master";
  if (points >= 500) return "gold";
  if (points >= 200) return "silver";
  return "bronze";
}

    const { data, error } = await supabase
      .from("leaderboard_view")
      .select("id, full_name, avatar_url, total_points")
      .order("total_points", { ascending: false })
      .limit(20);

    if (!error && data) setUsers(data);
    else setUsers([]);

    setLoading(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10 }}>Yükleniyor...</Text>
      </View>
    );
  }

  if (users.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#777" }}>Henüz liderlik verisi yok.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🏆 Liderlik Tablosu</Text>

      {users.map((u, index) => {
        const rank = index + 1;

        return (
          <View
            key={u.id}
            style={[
              styles.card,
              rank === 1 && styles.first,
              rank === 2 && styles.second,
              rank === 3 && styles.third,
            ]}
          >
            
            <Text style={styles.rank}>{rank}</Text>

            <Image
              source={{
                uri: u.avatar_url || "https://i.pravatar.cc/100",
              }}
              style={styles.avatar}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{u.full_name || "Kullanıcı"}</Text>
              <Text style={styles.points}>{u.total_points} puan</Text>
            </View>

            {rank === 1 && <Text style={styles.emoji}>🥇</Text>}
            {rank === 2 && <Text style={styles.emoji}>🥈</Text>}
            {rank === 3 && <Text style={styles.emoji}>🥉</Text>}
          </View>
        );
      })}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f6f6f6",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 3,
  },

  rank: {
    width: 30,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    marginHorizontal: 10,
  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
  },

  points: {
    color: "#4CAF50",
    marginTop: 2,
    fontWeight: "600",
  },

  emoji: {
    fontSize: 22,   
    marginLeft: 5,
  },

  first: {
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  second: {
    borderWidth: 2,
    borderColor: "#C0C0C0",
  },
  third: {
    borderWidth: 2,
    borderColor: "#CD7F32",
  },
});
