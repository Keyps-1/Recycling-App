import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { supabase } from "../supabase";

export default function BadgesScreen() {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [earned, setEarned] = useState<number[]>([]);           

  useEffect(() => {
    loadBadges();
  }, []);

  async function loadBadges() {
    setLoading(true);

    // --- 1) Kullanıcı bilgisi ---
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      setBadges([]);
      setLoading(false);
      return;
    }

    // --- 2) Kullanıcının sahip olduğu rozetler ---
    const { data: userBadgeRows } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", userId);

    const owned = userBadgeRows?.map((b) => b.badge_id) || [];
    setEarned(owned);

    // --- 3) Tüm rozetlerin listesi ---
    const { data: badgeRows, error } = await supabase.from("badges").select("*");

    if (!error) {
      setBadges(badgeRows || []);
    } else {
      setBadges([]);
    }

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

  if (badges.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16, color: "#777" }}>
          Henüz tanımlı bir rozet yok.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Rozetler</Text>

      {badges.map((badge) => {
        const hasBadge = earned.includes(badge.id);

        return (
          <View
            key={badge.id}
            style={[styles.badgeItem, !hasBadge && styles.lockedBadge]}
          >
            <Image
              source={{ uri: badge.icon_url }}
              style={[styles.icon, !hasBadge && styles.iconLocked]}
            />

            <View style={{ flex: 1 }}>
              <Text style={[styles.badgeName, !hasBadge && styles.textLocked]}>
                {badge.name}
              </Text>

              <Text style={[styles.badgeDesc, !hasBadge && styles.textLocked]}>
                {badge.description}
              </Text>
            </View>

            {!hasBadge && <Text style={styles.lockedText}>🔒</Text>}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f6f6f6" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, color: "#333" },

  badgeItem: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    elevation: 3,
    marginBottom: 15,
    alignItems: "center",
  },

  lockedBadge: {
    opacity: 0.45,
  },

  icon: { width: 60, height: 60, marginRight: 15 },
  iconLocked: { tintColor: "#999" },

  badgeName: { fontSize: 18, fontWeight: "bold", color: "#222" },
  badgeDesc: { fontSize: 14, color: "#666", marginTop: 2 },

  lockedText: { fontSize: 22, marginLeft: 10 },

  textLocked: { color: "#777" },
});
