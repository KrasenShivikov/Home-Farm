import { Pressable, Text, TextInput, View } from "react-native";

import { Order, OrderLine } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

import { orderDetailsStyles as styles } from "./order-details-styles";

interface OrderLinesSectionProps {
  canEditOrder: boolean;
  editingLineId: number | null;
  isSaving: boolean;
  lineQuantities: Record<number, string>;
  order: Order;
  onCancelEdit: () => void;
  onChangeLineQuantity: (lineId: number, value: string) => void;
  onDeleteLine: (lineId: number, cropName: string) => void;
  onEditLine: (item: OrderLine) => void;
  onUpdateLine: (lineId: number) => void;
}

export function OrderLinesSection({
  canEditOrder,
  editingLineId,
  isSaving,
  lineQuantities,
  order,
  onCancelEdit,
  onChangeLineQuantity,
  onDeleteLine,
  onEditLine,
  onUpdateLine,
}: OrderLinesSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Редове</Text>
      {order.items.length === 0 ? (
        <Text style={styles.meta}>Все още няма редове.</Text>
      ) : (
        order.items.map((item) => (
          <View key={item.lineId} style={styles.lineEditor}>
            <View style={styles.lineHeader}>
              <View style={styles.lineInfo}>
                <Text style={styles.cropName}>{item.cropName}</Text>
                <Text style={styles.meta}>
                  {item.quantity} x {formatCurrency(item.price)}
                </Text>
              </View>
              {canEditOrder ? (
                <View style={styles.lineActions}>
                  <Pressable
                    disabled={isSaving}
                    onPress={() => onEditLine(item)}
                    style={styles.editButton}>
                    <Text style={styles.editButtonText}>Редакция</Text>
                  </Pressable>
                  <Pressable
                    disabled={isSaving}
                    onPress={() => onDeleteLine(item.lineId, item.cropName)}
                    style={styles.removeButton}>
                    <Text style={styles.removeButtonText}>Изтрий</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
            {canEditOrder && editingLineId === item.lineId ? (
              <View style={styles.editPanel}>
                <TextInput
                  keyboardType="decimal-pad"
                  onChangeText={(value) => onChangeLineQuantity(item.lineId, value)}
                  placeholder="Количество"
                  style={[styles.input, styles.quantityInput]}
                  value={lineQuantities[item.lineId] ?? item.quantity}
                />
                <View style={styles.editPanelActions}>
                  <Pressable
                    disabled={isSaving}
                    onPress={() => onUpdateLine(item.lineId)}
                    style={styles.saveLineButton}>
                    <Text style={styles.saveLineButtonText}>Запази</Text>
                  </Pressable>
                  <Pressable
                    disabled={isSaving}
                    onPress={onCancelEdit}
                    style={styles.cancelEditButton}>
                    <Text style={styles.cancelEditButtonText}>Отказ</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </View>
        ))
      )}
    </View>
  );
}
