import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/lib/auth";

export default function HomeScreen() {
  const { isLoggedIn, logout, user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Home Farm</Text>
        <Text style={styles.title}>
          {user ? `Добре дошли, ${user.name}.` : "Добре дошли във вашите поръчки."}
        </Text>
        <Text style={styles.subtitle}>
          Влезте, за да преглеждате поръчки, да ги редактирате и да добавяте редове.
        </Text>

        {isLoggedIn ? (
          <View style={styles.actions}>
            <Pressable onPress={() => router.push("/orders")} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Поръчки</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/profile")} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Профил</Text>
            </Pressable>
            <Pressable onPress={logout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Изход</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.actions}>
            <Pressable onPress={() => router.push("/login")} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Вход</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/register")} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Регистрация</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  content: {
    gap: 14,
  },
  eyebrow: {
    color: "#2f7d32",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    color: "#1f2937",
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 36,
  },
  subtitle: {
    color: "#4b5563",
    fontSize: 16,
    lineHeight: 24,
  },
  primaryButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#2f7d32",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  actions: {
    alignItems: "flex-start",
    gap: 10,
    marginTop: 12,
  },
  logoutButton: {
    borderColor: "#2f7d32",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  logoutText: {
    color: "#2f7d32",
    fontSize: 16,
    fontWeight: "700",
  },
});
