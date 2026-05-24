import { Pressable, Text, View } from "react-native";

import { orderDetailsStyles as styles } from "./order-details-styles";

interface OrderActionsSectionProps {
  canEditOrder: boolean;
  isCreatingOrder: boolean;
  isSaving: boolean;
  onCancelOrder: () => void;
  onDeleteOrder: () => void;
  onSaveCreatedOrder: () => void;
}

export function OrderActionsSection({
  canEditOrder,
  isCreatingOrder,
  isSaving,
  onCancelOrder,
  onDeleteOrder,
  onSaveCreatedOrder,
}: OrderActionsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Действия</Text>
      {canEditOrder ? (
        isCreatingOrder ? (
          <View style={styles.createActions}>
            <Pressable disabled={isSaving} onPress={onSaveCreatedOrder} style={styles.saveOrderButton}>
              <Text style={styles.saveOrderButtonText}>Запази поръчка</Text>
            </Pressable>
            <CancelOrderButton isSaving={isSaving} onPress={onCancelOrder} />
          </View>
        ) : (
          <CancelOrderButton isSaving={isSaving} onPress={onCancelOrder} />
        )
      ) : null}
      {!isCreatingOrder ? (
        <Pressable disabled={isSaving} onPress={onDeleteOrder} style={styles.deleteOrderButton}>
          <Text style={styles.deleteOrderButtonText}>
            {isSaving ? "Изтриване..." : "Изтрий поръчка"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function CancelOrderButton({ isSaving, onPress }: { isSaving: boolean; onPress: () => void }) {
  return (
    <Pressable disabled={isSaving} onPress={onPress} style={styles.cancelButton}>
      <Text style={styles.cancelButtonText}>
        {isSaving ? "Отказване..." : "Откажи поръчка"}
      </Text>
    </Pressable>
  );
}
