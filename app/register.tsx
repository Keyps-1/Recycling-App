import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../supabase";

/* 🔥 EMAIL TEMİZLEME FONKSİYONU */
function sanitizeEmail(input: string) {
  return input
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^\x20-\x7E]/g, "");
}

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  async function handleRegister() {
    const cleanEmail = sanitizeEmail(email);

    console.log("RAW EMAIL:", email);
    console.log("SANITIZED EMAIL:", cleanEmail);
    console.log(
      "CHAR CODES:",
      [...email].map((c) => c.charCodeAt(0))
    );

    // 1️⃣ Zorunlu alanlar
    if (!cleanEmail || !username || !password) {
      Alert.alert("Hata", "Email, kullanıcı adı ve şifre zorunludur.");
      return;
    }

    // 2️⃣ Email format kontrolü
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      Alert.alert("Hata", "Geçerli bir email adresi giriniz.");
      return;
    }

    // 3️⃣ Supabase sign up
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
    });

    if (error) {
      Alert.alert("Kayıt başarısız", error.message);
      return;
    }

    Alert.alert("Başarılı", "Kayıt tamamlandı!");
    router.replace("/login");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>

      {/* KULLANICI ADI */}
      <TextInput
        style={styles.input}
        placeholder="Kullanıcı Adı"
        value={username}
        onChangeText={setUsername}
        autoCorrect={false}
      />

      {/* EMAIL – SADECE BİR TANE */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
      />

      {/* ŞİFRE */}
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Kayıt Ol</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.loginText}>Zaten hesabın var mı? Giriş yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  loginText: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 16,
    color: "blue",
    fontWeight: "500",
  },
});
