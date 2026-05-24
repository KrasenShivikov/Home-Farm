import { Stack } from "expo-router";

import { AuthProvider } from "@/lib/auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#ffffff" },
          headerTitleStyle: { color: "#1f2937", fontWeight: "600" },
          headerTintColor: "#2f7d32",
          contentStyle: { backgroundColor: "#f7f8f5" },
        }}>
        <Stack.Screen name="index" options={{ title: "Home Farm" }} />
        <Stack.Screen name="login" options={{ title: "Вход" }} />
        <Stack.Screen name="orders" options={{ title: "Поръчки" }} />
        <Stack.Screen name="orders/[id]" options={{ title: "Детайли" }} />
      </Stack>
    </AuthProvider>
  );
}
