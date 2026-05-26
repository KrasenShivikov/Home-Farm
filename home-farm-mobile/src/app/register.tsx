import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useAuth } from "@/lib/auth";

export default function RegisterScreen() {
  const { isRegistering, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError("Име, имейл и парола са задължителни.");
      return;
    }

    if (password.length < 6) {
      setError("Паролата трябва да бъде поне 6 символа.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Паролите не съвпадат.");
      return;
    }

    try {
      await register(name, email, password);
    } catch (registerError) {
      setError(
        registerError instanceof Error
          ? registerError.message
          : "Регистрацията не може да бъде завършена."
      );
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Регистрация</Text>
      <Text style={styles.subtitle}>Създайте профил, за да управлявате поръчките си.</Text>

      <Text style={styles.label}>Име</Text>
      <TextInput
        autoCapitalize="words"
        editable={!isRegistering}
        onChangeText={setName}
        placeholder="Вашето име"
        style={styles.input}
        value={name}
      />

      <Text style={styles.label}>Имейл</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isRegistering}
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="you@example.com"
        style={styles.input}
        value={email}
      />

      <Text style={styles.label}>Парола</Text>
      <TextInput
        editable={!isRegistering}
        onChangeText={setPassword}
        placeholder="Минимум 6 символа"
        secureTextEntry
        style={styles.input}
        value={password}
      />

      <Text style={styles.label}>Повтори паролата</Text>
      <TextInput
        editable={!isRegistering}
        onChangeText={setConfirmPassword}
        placeholder="Повтори паролата"
        secureTextEntry
        style={styles.input}
        value={confirmPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable disabled={isRegistering} onPress={handleRegister} style={styles.button}>
        <Text style={styles.buttonText}>
          {isRegistering ? "Регистрация..." : "Създай профил"}
        </Text>
      </Pressable>

      <Pressable disabled={isRegistering} onPress={() => router.replace("/login")} style={styles.linkButton}>
        <Text style={styles.linkText}>Вече имате профил? Вход</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    padding: 24,
  },
  title: {
    color: "#1f2937",
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: "#4b5563",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
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
    marginBottom: 10,
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
  linkButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  linkText: {
    color: "#2f7d32",
    fontSize: 15,
    fontWeight: "700",
  },
  error: {
    color: "#b91c1c",
    fontSize: 14,
    lineHeight: 20,
  },
});
