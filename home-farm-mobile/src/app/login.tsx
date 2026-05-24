import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useAuth } from "@/lib/auth";

export default function LoginScreen() {
  const { isLoggingIn, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);

    if (!email.trim() || !password) {
      setError("Имейл и парола са задължителни.");
      return;
    }

    try {
      await login(email, password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Неуспешен вход.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вход</Text>
      <Text style={styles.label}>Имейл</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isLoggingIn}
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="you@example.com"
        style={styles.input}
        value={email}
      />

      <Text style={styles.label}>Парола</Text>
      <TextInput
        editable={!isLoggingIn}
        onChangeText={setPassword}
        placeholder="Парола"
        secureTextEntry
        style={styles.input}
        value={password}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable disabled={isLoggingIn} onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>{isLoggingIn ? "Влизане..." : "Вход"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 10,
  },
  title: {
    color: "#1f2937",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },
  label: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderWidth: 1,
    color: "#111827",
    fontSize: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#2f7d32",
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 14,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  error: {
    color: "#b91c1c",
    fontSize: 14,
    lineHeight: 20,
  },
});
