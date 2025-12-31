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

/* 🔥 EMAIL TEMİZLEME – REGISTER İLE AYNI */
function sanitizeEmail(input: string) {
  return input
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^\x20-\x7E]/g, "");
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const cleanEmail = sanitizeEmail(email);

    console.log("LOGIN RAW EMAIL:", email);
    console.log("LOGIN CLEAN EMAIL:", cleanEmail);

    if (!cleanEmail || !password) {
      Alert.alert("Hata", "Email ve şifre girilmelidir.");
      return;
    }

    // 🔐 GİRİŞ
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      Alert.alert("Giriş başarısız", error.message);
      return;
    }

    const userId = data.session.user.id;

    // LOG (hata verse bile login bozulmasın)
    try {
      await supabase.from("logs").insert({
        user_id: userId,
        action: "login",
        details: { email: cleanEmail },
      });
    } catch (e) {
      console.log("Log yazılamadı:", e);
    }

    router.replace("/");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Yap</Text>

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

      <TextInput
        style={styles.input}
        placeholder="Şifre"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Giriş Yap</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={styles.registerText}>Hesabın yok mu? Kayıt ol</Text>
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
    backgroundColor: "green",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  registerText: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 16,
    color: "blue",
    fontWeight: "500",
  },
});
