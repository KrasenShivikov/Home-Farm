import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { AddOrderLineSection } from "@/components/orders/add-order-line-section";
import { OrderActionsSection } from "@/components/orders/order-actions-section";
import { orderDetailsStyles as styles } from "@/components/orders/order-details-styles";
import { OrderLinesSection } from "@/components/orders/order-lines-section";
import {
  createOrderLine,
  Crop,
  deleteOrder,
  deleteOrderLine,
  getCrops,
  getOrder,
  Order,
  OrderLine,
  updateOrderLine,
  updateOrderStatus,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate, formatOrderStatus } from "@/lib/format";
import {
  clearCreatingOrder,
  isCreatingOrder as isCreatingOrderId,
} from "@/lib/order-create-mode";
import { useProtectedRoute } from "@/lib/use-protected-route";

import LoadingScreen from "../loading";

const statusOptions = ["Pending", "Accepted", "Completed", "Cancelled"];

export default function OrderDetailsScreen() {
  const isLoggedIn = useProtectedRoute();
  const { token, user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [showCrops, setShowCrops] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [lineQuantities, setLineQuantities] = useState<Record<number, string>>({});
  const [editingLineId, setEditingLineId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCrops, setIsLoadingCrops] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(() => isCreatingOrderId(id));
  const isAdmin = user?.role === "admin";
  const canEditOrder = !isAdmin && order?.status === "Pending";
  const canManageStatus = isAdmin && Boolean(order);

  async function loadOrder() {
    if (!token || !id) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getOrder(token, id);
      setOrder(result.order);
      setLineQuantities(
        Object.fromEntries(result.order.items.map((item) => [item.lineId, item.quantity]))
      );
    } catch (orderError) {
      setError(
        orderError instanceof Error ? orderError.message : "Поръчката не може да се зареди."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      void loadOrder();
    }
  }, [isLoggedIn, id, token]);

  useEffect(() => {
    if (!isLoggedIn || !token) return;

    let isActive = true;
    setIsLoadingCrops(true);

    getCrops(token)
      .then((result) => {
        if (isActive) setCrops(result.crops);
      })
      .catch((cropsError) => {
        if (isActive) {
          setError(
            cropsError instanceof Error
              ? cropsError.message
              : "Културите не можаха да се заредят."
          );
        }
      })
      .finally(() => {
        if (isActive) setIsLoadingCrops(false);
      });

    return () => {
      isActive = false;
    };
  }, [isLoggedIn, token]);

  async function handleCancelOrder() {
    if (!token || !id) return;

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      if (isCreatingOrder) {
        await deleteOrder(token, id);
        clearCreatingOrder(id);
        setIsCreatingOrder(false);
        router.replace("/orders");
        return;
      }

      await updateOrderStatus(token, id, "Cancelled");
      setMessage("Поръчката е отказана.");
      await loadOrder();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Поръчката не може да бъде отказана."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleSaveCreatedOrder() {
    clearCreatingOrder(id);
    setIsCreatingOrder(false);
    router.replace("/orders");
  }

  async function handleDeleteOrder() {
    if (!token || !id) return;

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      await deleteOrder(token, id);
      clearCreatingOrder(id);
      setIsCreatingOrder(false);
      router.replace("/orders");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Поръчката не може да бъде изтрита."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddLine() {
    if (!token || !id) return;

    if (!selectedCrop || !quantity.trim()) {
      setError("Култура и количество са задължителни.");
      return;
    }

    if (!selectedCrop.price) {
      setError("Избраната култура няма цена.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      await createOrderLine(token, id, {
        cropId: selectedCrop.id,
        quantity: quantity.trim(),
      });
      setSelectedCrop(null);
      setShowCrops(false);
      setQuantity("");
      setMessage("Редът е добавен.");
      await loadOrder();
    } catch (lineError) {
      setError(lineError instanceof Error ? lineError.message : "Редът не може да бъде добавен.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdateLine(lineId: number) {
    if (!token || !id) return;

    const nextQuantity = lineQuantities[lineId]?.trim();
    if (!nextQuantity || Number(nextQuantity) <= 0) {
      setError("Количеството трябва да е по-голямо от 0.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      await updateOrderLine(token, id, lineId, nextQuantity);
      setMessage("Редът е обновен.");
      setEditingLineId(null);
      await loadOrder();
    } catch (lineError) {
      setError(lineError instanceof Error ? lineError.message : "Редът не може да бъде обновен.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSetStatus(status: string) {
    if (!token || !id || !isAdmin) return;

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      await updateOrderStatus(token, id, status);
      setMessage("Статусът е обновен.");
      await loadOrder();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Статусът не може да бъде обновен.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleEditLine(item: OrderLine) {
    setLineQuantities((current) => ({
      ...current,
      [item.lineId]: current[item.lineId] ?? item.quantity,
    }));
    setEditingLineId(item.lineId);
  }

  function confirmDeleteLine(lineId: number, cropName: string) {
    Alert.alert("Премахване на ред?", `Да премахнем ли ${cropName} от поръчката?`, [
      { text: "Отказ", style: "cancel" },
      {
        text: "Премахни",
        style: "destructive",
        onPress: () => {
          void handleDeleteLine(lineId);
        },
      },
    ]);
  }

  async function handleDeleteLine(lineId: number) {
    if (!token || !id) return;

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      await deleteOrderLine(token, id, lineId);
      setMessage("Редът е премахнат.");
      if (editingLineId === lineId) setEditingLineId(null);
      await loadOrder();
    } catch (lineError) {
      setError(lineError instanceof Error ? lineError.message : "Редът не може да бъде премахнат.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!isLoggedIn) {
    return null;
  }

  if (isLoading && !order) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Поръчка #{id}</Text>
      <Text style={styles.status}>
        {isLoading ? "Зареждане..." : order ? formatOrderStatus(order.status) : "Неизвестна"}
      </Text>
      {order ? <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text> : null}
      {isAdmin && order ? (
        <Text style={styles.meta}>
          {order.userName || "Потребител"}{order.userEmail ? ` · ${order.userEmail}` : ""}
        </Text>
      ) : null}

      {message ? <Text style={styles.message}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {canManageStatus ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Управление на статус</Text>
          <View style={styles.statusActionList}>
            {statusOptions.map((status) => {
              const isCurrent = order?.status === status;
              return (
                <Pressable
                  key={status}
                  disabled={isSaving || isCurrent}
                  onPress={() => handleSetStatus(status)}
                  style={[styles.statusActionButton, isCurrent ? styles.statusActionButtonActive : null]}
                >
                  <Text style={[styles.statusActionButtonText, isCurrent ? styles.statusActionButtonTextActive : null]}>
                    {formatOrderStatus(status)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {order ? (
        <View style={styles.orderTotalCard}>
          <Text style={styles.orderTotalLabel}>Обща стойност</Text>
          <Text style={styles.orderTotalValue}>
            {formatCurrency(Number(order.totalAmount || 0).toFixed(2))}
          </Text>
        </View>
      ) : null}

      {order ? (
        <OrderLinesSection
          canEditOrder={canEditOrder}
          editingLineId={editingLineId}
          isSaving={isSaving}
          lineQuantities={lineQuantities}
          order={order}
          onCancelEdit={() => setEditingLineId(null)}
          onChangeLineQuantity={(lineId, value) =>
            setLineQuantities((current) => ({ ...current, [lineId]: value }))
          }
          onDeleteLine={confirmDeleteLine}
          onEditLine={handleEditLine}
          onUpdateLine={handleUpdateLine}
        />
      ) : null}

      {!isAdmin ? (
        <OrderActionsSection
          canEditOrder={canEditOrder}
          isCreatingOrder={isCreatingOrder}
          isSaving={isSaving}
          onCancelOrder={handleCancelOrder}
          onDeleteOrder={handleDeleteOrder}
          onSaveCreatedOrder={handleSaveCreatedOrder}
        />
      ) : null}

      {canEditOrder ? (
        <AddOrderLineSection
          crops={crops}
          isLoadingCrops={isLoadingCrops}
          isSaving={isSaving}
          quantity={quantity}
          selectedCrop={selectedCrop}
          showCrops={showCrops}
          onAddLine={handleAddLine}
          onQuantityChange={setQuantity}
          onSelectCrop={(crop) => {
            setSelectedCrop(crop);
            setShowCrops(false);
          }}
          onToggleCrops={() => setShowCrops((current) => !current)}
        />
      ) : null}
    </ScrollView>
  );
}
