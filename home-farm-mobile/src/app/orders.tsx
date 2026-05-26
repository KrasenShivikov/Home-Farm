import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { createOrder, getOrders, Order } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate, formatOrderStatus } from "@/lib/format";
import { markCreatingOrder } from "@/lib/order-create-mode";
import { useProtectedRoute } from "@/lib/use-protected-route";

import LoadingScreen from "./loading";

export default function OrdersScreen() {
  const isLoggedIn = useProtectedRoute();
  const { logout, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await getOrders(token);
      setOrders(result.orders);
    } catch (ordersError) {
      setError(ordersError instanceof Error ? ordersError.message : "Поръчките не можаха да се заредят.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
    if (!isLoggedIn || !token) return;

    void loadOrders();
    }, [isLoggedIn, loadOrders, token])
  );

  async function handleCreateOrder() {
    if (!token) return;

    setIsCreating(true);
    setError(null);

    try {
      const result = await createOrder(token);
      markCreatingOrder(String(result.order.id));
      router.push({
        pathname: "/orders/[id]",
        params: { id: String(result.order.id) },
      });
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Поръчката не можа да се създаде.");
    } finally {
      setIsCreating(false);
    }
  }

  if (!isLoggedIn) {
    return null;
  }

  if (isLoading && orders.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topActions}>
        <Pressable onPress={() => router.push("/profile")} style={styles.topActionButton}>
          <Text style={styles.topActionButtonText}>Профил</Text>
        </Pressable>
        <Pressable onPress={logout} style={styles.topActionButton}>
          <Text style={styles.topActionButtonText}>Изход</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Поръчки</Text>
            {isLoading ? <Text style={styles.meta}>Зареждане...</Text> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
          <View style={styles.headerActions}>
            <Pressable disabled={isCreating} onPress={handleCreateOrder} style={styles.createButton}>
              <Text style={styles.createButtonText}>
                {isCreating ? "Създаване..." : "Нова поръчка"}
              </Text>
            </Pressable>
          </View>
        </View>

        {!isLoading && !error && orders.length === 0 ? (
          <Text style={styles.meta}>Няма намерени поръчки.</Text>
        ) : null}

        {orders.map((item) => (
          <Pressable
            key={item.id}
            onPress={() =>
              router.push({
                pathname: "/orders/[id]",
                params: { id: String(item.id) },
              })
            }
            style={styles.row}
          >
            <View>
              <Text style={styles.orderId}>Поръчка #{item.id}</Text>
              <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              <Text style={styles.meta}>{item.shippingCity || "Няма град"}</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.status}>{formatOrderStatus(item.status)}</Text>
              <Text style={styles.total}>{formatCurrency(item.totalAmount)}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topActions: {
    flexDirection: "row",
    gap: 16,
    position: "absolute",
    right: 24,
    top: 18,
    zIndex: 1,
  },
  topActionButton: {
    paddingVertical: 4,
  },
  topActionButtonText: {
    color: "#2f7d32",
    fontSize: 15,
    fontWeight: "700",
  },
  list: {
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 60,
  },
  title: {
    color: "#1f2937",
    fontSize: 28,
    fontWeight: "700",
  },
  header: {
    gap: 12,
    marginBottom: 8,
  },
  createButton: {
    alignItems: "center",
    backgroundColor: "#2f7d32",
    borderRadius: 8,
    paddingVertical: 12,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  headerActions: {
    gap: 10,
  },
  row: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  orderId: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  meta: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 4,
  },
  date: {
    color: "#4b5563",
    fontSize: 13,
    marginTop: 4,
  },
  right: {
    alignItems: "flex-end",
  },
  status: {
    color: "#2f7d32",
    fontSize: 14,
    fontWeight: "700",
  },
  total: {
    color: "#374151",
    fontSize: 14,
    marginTop: 4,
  },
  error: {
    color: "#b91c1c",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
});
