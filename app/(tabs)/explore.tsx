import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../supabase";

export default function ExploreScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExploreItems();
  }, []);

  async function loadExploreItems() {
    setLoading(true);

    const { data, error } = await supabase.from("explore_articles").select("*");

    if (!error && data) setItems(data);
    else setItems([]);

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

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16, color: "#777" }}>
          Keşfetilecek içerik bulunamadı.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Keşfet</Text>

      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => item.link && Linking.openURL(item.link)}
        >
          <Image
            source={{ uri: item.image_url }}
            style={styles.image}
            resizeMode="cover"
          />

          <View style={styles.content}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },

  card: {
    backgroundColor: "white",
    marginBottom: 20,
    borderRadius: 15,
    elevation: 4,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 180,
  },

  content: {
    padding: 15,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#222",
  },

  cardDesc: {
    fontSize: 14,
    color: "#555",
  },
});
