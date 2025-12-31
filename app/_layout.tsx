import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import * as Font from "expo-font";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        ...Ionicons.font,
        ...MaterialIcons.font,
      });
      setReady(true);
    }

    loadFonts();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="index" />
      <Stack.Screen name="scanner" />
      <Stack.Screen name="history" />
      <Stack.Screen name="statistics" />
      <Stack.Screen name="badges" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
