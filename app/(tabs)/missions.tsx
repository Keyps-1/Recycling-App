import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../supabase";

export default function MissionsScreen() {
  const [missions, setMissions] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
  setLoading(true);

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  // missions çek (order type KALDIRILDI)
  const { data: missionsData, error: mErr } = await supabase
    .from("missions")
    .select("*")
    .order("id");

  console.log("MISSIONS:", missionsData, mErr);

  let progressData: any[] = [];

  if (userId) {
    const { data } = await supabase
      .from("user_missions")
      .select("*")
      .eq("user_id", userId);

    progressData = data || [];
  }
if (userId && missionsData) {
  for (const m of missionsData) {
    const exists = userProgress.find(
      (x) => x.mission_id === m.id
    );

    if (!exists) {
     await supabase.from("user_missions").insert({
     user_id: userId,
     mission_id: m.id,
     progress: 0,
     completed: false,
  });

    }
  }
}

  setMissions(missionsData || []);
  setUserProgress(progressData);
  setLoading(false);
}


  // kullanıcı görev ilerlemesi
 function getProgress(missionId: number) {
  const m = userProgress.find(x => x.mission_id === missionId);
  return m ? m.progress : 0;
}



  function isCompleted(missionId: number) {
    const m = userProgress.find((x) => x.mission_id === missionId);
    return m ? m.completed : false;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Görevler</Text>

{missions.map((m) => {
  const progress = getProgress(m.id);
  const done = isCompleted(m.id);

  const safeProgress = Math.min(progress, m.required_count);
  const percent =
    m.required_count > 0
      ? (safeProgress / m.required_count) * 100
      : 0;

  return (
    <View key={m.id} style={styles.card}>
      <Text style={styles.missionTitle}>{m.title}</Text>
      <Text style={styles.missionDesc}>{m.description}</Text>

      <View style={styles.progressBg}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percent}%`,
              backgroundColor: done ? "#2E7D32" : "#4CAF50",
            },
          ]}
        />
      </View>

      <Text style={styles.progressText}>
        {progress}/{m.required_count}
      </Text>

      <Text style={styles.reward}>
        Ödül: {m.reward_points} puan
      </Text>

      {done && <Text style={styles.completed}>✔ Tamamlandı</Text>}
    </View>
  );
})}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f6f6f6" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },

  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
  },

  missionTitle: { fontSize: 20, fontWeight: "bold" },
  missionDesc: { color: "#666", marginTop: 4 },
  
  progressBg: {
    marginTop: 15,
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 10,
  },
  progressFill: {
    height: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
  },
  progressText: { marginTop: 8, color: "#444", fontWeight: "600" },
  reward: { marginTop: 6, fontWeight: "bold", color: "#333" },
  completed: { marginTop: 10, color: "green", fontWeight: "bold" },
  
});
