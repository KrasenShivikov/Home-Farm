import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from "react-native";

import { getProfile, updateProfile } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useProtectedRoute } from "@/lib/use-protected-route";

export default function ProfileScreen() {
  const isLoggedIn = useProtectedRoute();
  const { setUser, token, user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [shippingCity, setShippingCity] = useState(user?.shippingCity ?? "");
  const [shippingStreet, setShippingStreet] = useState(user?.shippingStreet ?? "");
  const [shippingPostalCode, setShippingPostalCode] = useState(user?.shippingPostalCode ?? "");
  const [shippingCountry, setShippingCountry] = useState(user?.shippingCountry ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !token) return;

    let isActive = true;
    setIsLoading(true);
    setError(null);

    getProfile(token)
      .then((result) => {
        if (!isActive) return;

        setUser(result.user);
        setName(result.user.name);
        setEmail(result.user.email);
        setShippingCity(result.user.shippingCity);
        setShippingStreet(result.user.shippingStreet);
        setShippingPostalCode(result.user.shippingPostalCode);
        setShippingCountry(result.user.shippingCountry);
      })
      .catch((profileError) => {
        if (isActive) {
          setError(
            profileError instanceof Error
              ? profileError.message
              : "Профилът не може да бъде зареден."
          );
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [isLoggedIn, setUser, token]);

  async function handleSave() {
    if (!token) return;

    setError(null);
    setMessage(null);

    if (!name.trim()) {
      setError("Име е задължително.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Въведете валиден имейл.");
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateProfile(token, {
        name,
        email,
        shippingCity,
        shippingStreet,
        shippingPostalCode,
        shippingCountry,
      });

      setUser(result.user);
      setMessage("Профилът е обновен.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Профилът не може да бъде обновен.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Профил</Text>
      <Text style={styles.subtitle}>Попълнете или обновете вашите потребителски данни.</Text>

      {isLoading ? <Text style={styles.message}>Зареждане...</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.label}>Име</Text>
      <TextInput editable={!isSaving} onChangeText={setName} style={styles.input} value={name} />

      <Text style={styles.label}>Имейл</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isSaving}
        keyboardType="email-address"
        onChangeText={setEmail}
        style={styles.input}
        value={email}
      />

      <Text style={styles.label}>Град</Text>
      <TextInput
        editable={!isSaving}
        onChangeText={setShippingCity}
        style={styles.input}
        value={shippingCity}
      />

      <Text style={styles.label}>Улица / Адрес</Text>
      <TextInput
        editable={!isSaving}
        onChangeText={setShippingStreet}
        style={styles.input}
        value={shippingStreet}
      />

      <Text style={styles.label}>Пощенски код</Text>
      <TextInput
        editable={!isSaving}
        onChangeText={setShippingPostalCode}
        style={styles.input}
        value={shippingPostalCode}
      />

      <Text style={styles.label}>Държава</Text>
      <TextInput
        editable={!isSaving}
        onChangeText={setShippingCountry}
        style={styles.input}
        value={shippingCountry}
      />

      <Pressable disabled={isSaving} onPress={handleSave} style={styles.button}>
        <Text style={styles.buttonText}>{isSaving ? "Запазване..." : "Запази профил"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    padding: 24,
    paddingBottom: 36,
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
  message: {
    color: "#166534",
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    color: "#b91c1c",
    fontSize: 14,
    lineHeight: 20,
  },
});
