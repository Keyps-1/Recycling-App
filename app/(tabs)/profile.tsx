import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../supabase";


export default function ProfileScreen() {
  const DEFAULT_AVATAR = "https://i.pravatar.cc/200";
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [badgeCount, setBadgeCount] = useState(0);
  const [loading, setLoading] = useState(true);


useFocusEffect(
  useCallback(() => {
    loadData();
  }, [])
);
  async function saveName() {
  const trimmed = newName.trim();

  if (!trimmed) {
    Alert.alert("Hata", "Kullanıcı adı boş olamaz.");
    return;
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return;

  const { error } = await supabase
    .from("users_profile")
    .update({ full_name: trimmed })
    .eq("id", user.id);

  if (error) {
    Alert.alert("Hata", "Kullanıcı adı güncellenemedi.");
    console.log(error);
    return;
  }

  // UI güncelle
  setProfile({ ...profile, full_name: trimmed });
  setEditingName(false);

  Alert.alert("Başarılı", "Kullanıcı adı güncellendi.");
}

  async function changeAvatar() {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return;

  // 1) İzin iste
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert("İzin Gerekli", "Galeriye erişmek için izin vermen gerekiyor.");
    return;
  }

  // 2) Galeriyi aç
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) {
    return; // kullanıcı seçmeden kapattı
  }

  const picked = result.assets[0];

  // 3) Fotoğraf blob olarak alınır
  const file = await fetch(picked.uri);
  const blob = await file.blob();

  const filePath = `avatars/${user.id}-${Date.now()}.jpg`;

  // 4) Storage'a foto yükle
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, blob, {
      upsert: true,
      contentType: "image/jpeg",
    });

  if (uploadError) {
    Alert.alert("Hata", "Fotoğraf yüklenemedi.");
    console.log(uploadError);
    return;
  }

  // 5) public url al
  const { data: publicURL } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  const avatarUrl = publicURL.publicUrl;

  // 6) profil update
  await supabase
    .from("users_profile")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  // 7) UI güncelle
  setProfile({ ...profile, avatar_url: avatarUrl });

  Alert.alert("Başarılı", "Profil fotoğrafın güncellendi!");
}

  async function loadData() {
    setLoading(true);

    // 1) Kullanıcı bilgisi
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setProfile({});
      setLoading(false);
      return;
    }

    setEmail(user.email ?? "");

    // 2) Log kaydı (error olsa bile uygulama çökmemeli)
    try {
  await supabase.from("logs").insert({
    user_id: user.id,
    action: "profile_view",
    details: { email: user.email },
    });
    } catch (e) {
    console.log("Log eklenemedi:", e);
    }

    // 3) Profili çek (.maybeSingle güvenli)
    const { data: profileData } = await supabase
      .from("users_profile")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    setProfile(profileData || {}); 

    // 4) Rozet sayısı
    const { data: badges } = await supabase
      .from("user_badges")
      .select("id")
      .eq("user_id", user.id);

    setBadgeCount(badges?.length ?? 0);
    setProfile(profileData || {});
    setNewName(profileData?.full_name || "");

    setLoading(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 20 }}>Yükleniyor...</Text>
      </View>
    );
  }

  // Default güvenli değerler
  const p = {
    full_name: profile?.full_name || "Kullanıcı",
    avatar_url: profile?.avatar_url || DEFAULT_AVATAR,
    total_points: Number(profile?.total_points || 0),
    total_items: Number(profile?.total_items || 0),
    total_weight: Number(profile?.total_weight || 0),
  };

  const level = Math.floor(p.total_points / 100);

  return (
    <ScrollView style={styles.container}>

      {/* ----- HEADER ----- */}
      <View style={styles.header}>
        <Image
          source={{ uri: p.avatar_url }}
          style={styles.avatar}
        />

        {editingName ? (
  <>
    <TextInput
      value={newName}
      onChangeText={setNewName}
      style={{
        backgroundColor: "white",
        padding: 8,
        borderRadius: 8,
        width: 200,
        textAlign: "center",
      }}
    />

    <TouchableOpacity onPress={saveName} style={{ marginTop: 6 }}>
      <Text style={{ color: "white", fontWeight: "600" }}>Kaydet</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => {
        setEditingName(false);
        setNewName(p.full_name);
      }}
    >
      <Text style={{ color: "#eee", fontSize: 12 }}>İptal</Text>
    </TouchableOpacity>
  </>
) : (
  <>
    <Text style={styles.name}>{p.full_name}</Text>

    <TouchableOpacity onPress={() => setEditingName(true)}>
      <Text style={{ color: "#e0e0e0", fontSize: 13 }}>Düzenle</Text>
    </TouchableOpacity>
  </>
)}

        <Text style={styles.email}>{email}</Text>
          <TouchableOpacity
      onPress={changeAvatar}
      style={{
        backgroundColor: "white",
        paddingVertical: 8,
       paddingHorizontal: 15,
        borderRadius: 20,
        marginTop: 10,
      }}
    >
     <Text style={{ color: "#4CAF50", fontWeight: "600" }}>
        Fotoğrafı Değiştir
     </Text>
    </TouchableOpacity>
        <Text style={styles.level}>Seviye {level}</Text>
        <Text style={styles.points}>{p.total_points} Puan</Text>
  </View>

      {/* ----- STAT BOXES ----- */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{p.total_items}</Text>
          <Text style={styles.statLabel}>Taranan Ürün</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{p.total_weight} kg</Text>
          <Text style={styles.statLabel}>Toplam Ağırlık</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{badgeCount}</Text>
          <Text style={styles.statLabel}>Rozet</Text>
        </View>
      </View>

    </ScrollView>
  );
  
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#4CAF50",
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    marginBottom: 25,
  },

  avatar: {
    width: 115,
    height: 115,
    borderRadius: 58,
    borderWidth: 3,
    borderColor: "white",
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginTop: 10,
  },

  email: {
    fontSize: 14,
    color: "#f1f1f1",
    marginBottom: 5,
  },

  level: {
    fontSize: 18,
    color: "white",
    marginTop: 5,
  },

  points: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginTop: 4,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },

  statBox: {
    backgroundColor: "white",
    width: "28%",
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    elevation: 4,
  },

  statNumber: { fontSize: 22, fontWeight: "bold", color: "#333" },

  statLabel: { fontSize: 12, marginTop: 6, color: "#777" },
});
