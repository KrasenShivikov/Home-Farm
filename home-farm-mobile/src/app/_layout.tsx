import { Stack } from "expo-router";

import { AuthProvider } from "@/lib/auth";

const screenOptions = {
  headerStyle: { backgroundColor: "#ffffff" },
  headerTitleStyle: { color: "#1f2937", fontFamily: undefined, fontSize: 17, fontWeight: "600" as const },
  headerTintColor: "#2f7d32",
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="index" options={{ title: "Home Farm" }} />
        <Stack.Screen name="login" options={{ title: "Вход" }} />
        <Stack.Screen name="register" options={{ title: "Регистрация" }} />
        <Stack.Screen name="profile" options={{ title: "Профил" }} />
        <Stack.Screen name="orders" options={{ title: "Поръчки" }} />
        <Stack.Screen name="orders/[id]" options={{ title: "Детайли" }} />
      </Stack>
    </AuthProvider>
  );
}
