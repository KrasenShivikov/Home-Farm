import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { createOrder, getOrdersWithFilters, Order, OrderFilters } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate, formatOrderStatus } from "@/lib/format";
import { markCreatingOrder } from "@/lib/order-create-mode";
import { useProtectedRoute } from "@/lib/use-protected-route";

import LoadingScreen from "./loading";

const statusOptions = ["", "Pending", "Accepted", "Completed", "Cancelled"];
const PAGE_SIZE = 10;

export default function OrdersScreen() {
  const isLoggedIn = useProtectedRoute();
  const { logout, token, user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [orders, setOrders] = useState<Order[]>([]);
  const [filters, setFilters] = useState<OrderFilters>({});
  const [draftFilters, setDraftFilters] = useState<OrderFilters>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await getOrdersWithFilters(token, { ...filters, page, limit: PAGE_SIZE });
      setOrders(result.orders);
      setHasMore(Boolean(result.pagination?.hasMore));
    } catch (ordersError) {
      setError(ordersError instanceof Error ? ordersError.message : "Поръчките не можаха да се заредят.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, token]);

  useFocusEffect(
    useCallback(() => {
      if (!isLoggedIn || !token) return;

      void loadOrders();
    }, [isLoggedIn, loadOrders, token])
  );

  async function handleCreateOrder() {
    if (!token || isAdmin) return;

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

  function applyFilters() {
    setPage(1);
    setFilters(draftFilters);
  }

  function clearFilters() {
    setDraftFilters({});
    setPage(1);
    setFilters({});
  }

  if (!isLoggedIn) {
    return null;
  }

  if (isLoading && orders.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.list}>
        <View style={styles.topActions}>
          <Pressable onPress={() => router.push("/profile")} style={styles.topActionButton}>
            <Text style={styles.topActionButtonText}>Профил</Text>
          </Pressable>
          <Pressable onPress={logout} style={styles.topActionButton}>
            <Text style={styles.topActionButtonText}>Изход</Text>
          </Pressable>
        </View>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{isAdmin ? "Клиентски поръчки" : "Поръчки"}</Text>
            {isLoading ? <Text style={styles.meta}>Зареждане...</Text> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
          {!isAdmin ? (
            <View style={styles.headerActions}>
              <Pressable disabled={isCreating} onPress={handleCreateOrder} style={styles.createButton}>
                <Text style={styles.createButtonText}>
                  {isCreating ? "Създаване..." : "Нова поръчка"}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {isAdmin ? (
          <View style={styles.filterPanel}>
            <Pressable onPress={() => setIsFilterOpen((current) => !current)} style={styles.filterHeader}>
              <View>
                <Text style={styles.filterEyebrow}>Филтри</Text>
                <Text style={styles.filterTitle}>{isFilterOpen ? "Търсене на поръчки" : "Покажи филтрите"}</Text>
              </View>
              <View style={styles.filterHeaderRight}>
                <Text style={styles.expandIcon}>{isFilterOpen ? "−" : "+"}</Text>
              </View>
            </Pressable>
            {isFilterOpen ? (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Потребител</Text>
                  <TextInput
                    onChangeText={(value) => setDraftFilters((current) => ({ ...current, user: value }))}
                    placeholder="Име или имейл"
                    style={styles.input}
                    value={draftFilters.user ?? ""}
                  />
                </View>
                <View style={styles.filterRow}>
                  <View style={styles.filterHalf}>
                    <Text style={styles.fieldLabel}>От дата</Text>
                    <TextInput
                      onChangeText={(value) => setDraftFilters((current) => ({ ...current, startDate: value }))}
                      placeholder="YYYY-MM-DD"
                      style={styles.input}
                      value={draftFilters.startDate ?? ""}
                    />
                  </View>
                  <View style={styles.filterHalf}>
                    <Text style={styles.fieldLabel}>До дата</Text>
                    <TextInput
                      onChangeText={(value) => setDraftFilters((current) => ({ ...current, endDate: value }))}
                      placeholder="YYYY-MM-DD"
                      style={styles.input}
                      value={draftFilters.endDate ?? ""}
                    />
                  </View>
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Статус</Text>
                  <View style={styles.statusFilterList}>
                    {statusOptions.map((status) => {
                      const isSelected = (draftFilters.status ?? "") === status;
                      return (
                        <Pressable
                          key={status || "all"}
                          onPress={() => setDraftFilters((current) => ({ ...current, status }))}
                          style={[styles.statusFilterButton, isSelected ? styles.statusFilterButtonActive : null]}
                        >
                          <Text style={[styles.statusFilterButtonText, isSelected ? styles.statusFilterButtonTextActive : null]}>
                            {status ? formatOrderStatus(status) : "Всички"}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                <View style={styles.filterActions}>
                  <Pressable onPress={applyFilters} style={[styles.createButton, styles.filterActionButton]}>
                    <Text style={styles.createButtonText}>Търси</Text>
                  </Pressable>
                  <Pressable onPress={clearFilters} style={[styles.clearButton, styles.filterActionButton]}>
                    <Text style={styles.clearButtonText}>Изчисти</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </View>
        ) : null}

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
            <View style={styles.rowMain}>
              <Text style={styles.orderId}>Поръчка #{item.id}</Text>
              {isAdmin ? (
                <Text style={styles.customer}>
                  {item.userName || "Потребител"}{item.userEmail ? ` · ${item.userEmail}` : ""}
                </Text>
              ) : null}
              <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              <Text style={styles.meta}>{item.shippingCity || "Няма град"}</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.status}>{formatOrderStatus(item.status)}</Text>
              <Text style={styles.total}>{formatCurrency(item.totalAmount)}</Text>
            </View>
          </Pressable>
        ))}

        {isAdmin && (page > 1 || hasMore) ? (
          <View style={styles.pagination}>
            <Pressable
              disabled={page <= 1 || isLoading}
              onPress={() => setPage((current) => Math.max(1, current - 1))}
              style={[styles.pageButton, page <= 1 || isLoading ? styles.pageButtonDisabled : null]}
            >
              <Text style={styles.pageButtonText}>Назад</Text>
            </Pressable>
            <Text style={styles.pageText}>Страница {page}</Text>
            <Pressable
              disabled={!hasMore || isLoading}
              onPress={() => setPage((current) => current + 1)}
              style={[styles.pageButton, !hasMore || isLoading ? styles.pageButtonDisabled : null]}
            >
              <Text style={styles.pageButtonText}>Напред</Text>
            </Pressable>
          </View>
        ) : null}
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
    justifyContent: "flex-end",
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
    paddingTop: 20,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  clearButton: {
    alignItems: "center",
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  clearButtonText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "700",
  },
  headerActions: {
    gap: 10,
  },
  filterPanel: {
    backgroundColor: "#ffffff",
    borderColor: "#dfe7e2",
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
    padding: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
  },
  filterHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterHeaderRight: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  filterEyebrow: {
    color: "#8a9ab3",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  filterTitle: {
    color: "#111827",
    fontSize: 19,
    fontWeight: "800",
    marginTop: 2,
  },
  expandIcon: {
    color: "#166534",
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 28,
    minWidth: 20,
    textAlign: "center",
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
    borderRadius: 10,
    borderWidth: 1,
    color: "#111827",
    fontSize: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
  },
  filterHalf: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  statusFilterList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusFilterButton: {
    borderColor: "#d1d5db",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  statusFilterButtonActive: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
  },
  statusFilterButtonText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "700",
  },
  statusFilterButtonTextActive: {
    color: "#166534",
  },
  filterActions: {
    flexDirection: "row",
    gap: 10,
  },
  filterActionButton: {
    flex: 1,
  },
  row: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    padding: 16,
  },
  rowMain: {
    flex: 1,
  },
  orderId: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  customer: {
    color: "#1f2937",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
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
  pagination: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    paddingVertical: 8,
  },
  pageButton: {
    borderColor: "#2f7d32",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pageButtonDisabled: {
    borderColor: "#d1d5db",
    opacity: 0.5,
  },
  pageButtonText: {
    color: "#2f7d32",
    fontSize: 14,
    fontWeight: "700",
  },
  pageText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "700",
  },
});
