import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  Pressable,
  View,
} from "react-native";
import { supabase } from "../supabase";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraActive, setCameraActive] = useState(true);
  const [scanned, setScanned] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!permission) requestPermission();
  }, []);

  function parseQrPayload(data: string) {
    try {
      const parsed = JSON.parse(data);
      if (
        typeof parsed.device_id !== "string" ||
        typeof parsed.category !== "string" ||
        typeof parsed.weight !== "number" ||
        typeof parsed.points !== "number"
      ) {
        throw new Error("Invalid QR");
      }
      return parsed;
    } catch {
      return null;
    }
  }

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Kamera izni gerekiyor.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>İzin Ver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ======================
  // GÖREV GÜNCELLEME
  // ======================
  async function updateMissionProgress(userId: string) {
    const { data: missions } = await supabase.from("missions").select("*");
    const { data: userMissions } = await supabase
      .from("user_missions")
      .select("*")
      .eq("user_id", userId);

    if (!missions) return;

    for (const mission of missions) {
      const um = userMissions?.find(
        (m) => m.mission_id === mission.id
      );

      if (!um) {
        await supabase.from("user_missions").insert({
          user_id: userId,
          mission_id: mission.id,
          progress: 1,
          completed: mission.required_count === 1,
        });
        continue;
      }

      if (um.completed) continue;

      const newProgress = um.progress + 1;
      const completed = newProgress >= mission.required_count;

      await supabase
        .from("user_missions")
        .update({ progress: newProgress, completed })
        .eq("id", um.id);
    }
  }

  // ======================
  // QR OKUTULDUĞU AN
  // ======================
  async function handleBarCodeScanned(result: any) {
    if (scanned) return;

    setScanned(true);
    setCameraActive(false);

    const payload = parseQrPayload(result.data);
    if (!payload) {
      Alert.alert("Geçersiz QR", "QR formatı hatalı.");
      setScanned(false);
      setCameraActive(true);
      return;
    }

    const { device_id, category, weight, points } = payload;

    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) return;

    const userId = user.id;

    // 1️⃣ HISTORY
    await supabase.from("history").insert({
      user_id: userId,
      device_id,
      category,
      weight,
      points,
    });

    // 2️⃣ SCANNED ITEMS (İSTATİSTİK İÇİN ASIL GEREKEN)
    const recycleType =
      category === "Plastik" ? "plastic" :
      category === "Cam" ? "glass" :
      category === "Kağıt" ? "paper" :
      category === "Metal" ? "metal" :
      category.toLowerCase();

   const { error: scannedError } = await supabase
  .from("scanned_items")
  .insert({
    user_id: userId,
    barcode: device_id,
    name: "QR Ürün",
    brand: "Bilinmiyor",
    weight,
    recycle_type: category.trim().toLowerCase(),
    recyclable: true,
  });

console.log("SCANNED_ITEMS INSERT ERROR:", scannedError);


    // 3️⃣ PUAN EKLE
    const { data: profile } = await supabase
      .from("users_profile")
      .select("total_points")
      .eq("id", userId)
      .single();

    const currentPoints = profile?.total_points || 0;

   await supabase.from("users_profile").upsert({
  id: userId,
  total_points: (currentPoints || 0) + points,
});


    // 4️⃣ GÖREVLER
    await updateMissionProgress(userId);

    Alert.alert(
      "QR Okundu",
      `${category} • ${weight} kg • +${points} puan`
    );

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      setScanned(false);
      setCameraActive(true);
    }, 2000);
  }

  return (
    <View style={styles.container}>
      <View style={{ padding: 16, position: "absolute", top: 0, left: 0, zIndex: 10 }}>
        <Pressable onPress={() => router.replace("/")}>
          <Ionicons name="home" size={26} color="#2E7D32" />
        </Pressable>
      </View>

      {cameraActive && (
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={handleBarCodeScanned}
        />
      )}

      <View style={styles.overlay}>
        <Text style={styles.scanText}>Barkodu Kareye Getir</Text>
      </View>

      <Animated.View style={[styles.successBox, { opacity: fadeAnim }]}>
        <Text style={styles.successText}>✔ Kaydedildi!</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  camera: { flex: 1 },
  overlay: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    alignItems: "center",
  },
  scanText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  successBox: {
    position: "absolute",
    top: "40%",
    width: "100%",
    alignItems: "center",
  },
  successText: {
    fontSize: 32,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  button: {
    marginTop: 20,
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
  },
  buttonText: { color: "white", fontWeight: "bold" },
});
