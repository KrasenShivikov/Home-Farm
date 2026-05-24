import { Pressable, Text, TextInput, View } from "react-native";

import { Crop } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

import { orderDetailsStyles as styles } from "./order-details-styles";

interface AddOrderLineSectionProps {
  crops: Crop[];
  isLoadingCrops: boolean;
  isSaving: boolean;
  quantity: string;
  selectedCrop: Crop | null;
  showCrops: boolean;
  onAddLine: () => void;
  onQuantityChange: (value: string) => void;
  onSelectCrop: (crop: Crop) => void;
  onToggleCrops: () => void;
}

export function AddOrderLineSection({
  crops,
  isLoadingCrops,
  isSaving,
  quantity,
  selectedCrop,
  showCrops,
  onAddLine,
  onQuantityChange,
  onSelectCrop,
  onToggleCrops,
}: AddOrderLineSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Добавяне на ред</Text>
      <Pressable disabled={isLoadingCrops} onPress={onToggleCrops} style={styles.selectButton}>
        <Text style={selectedCrop ? styles.selectText : styles.placeholderText}>
          {selectedCrop
            ? `${selectedCrop.name}${selectedCrop.variety ? `, ${selectedCrop.variety}` : ""}`
            : isLoadingCrops
              ? "Зареждане..."
              : "Изберете култура"}
        </Text>
      </Pressable>
      {showCrops ? (
        <View style={styles.cropList}>
          {crops.length === 0 ? (
            <Text style={styles.meta}>Няма култури за продажба.</Text>
          ) : (
            crops.map((crop) => (
              <Pressable key={crop.id} onPress={() => onSelectCrop(crop)} style={styles.cropOption}>
                <View>
                  <Text style={styles.cropName}>
                    {crop.name}
                    {crop.variety ? `, ${crop.variety}` : ""}
                  </Text>
                  <Text style={styles.meta}>#{crop.id}</Text>
                </View>
                <Text style={styles.cropPrice}>
                  {crop.price ? formatCurrency(crop.price) : "Няма цена"}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      ) : null}
      <TextInput
        keyboardType="decimal-pad"
        onChangeText={onQuantityChange}
        placeholder="Количество"
        style={styles.input}
        value={quantity}
      />
      {selectedCrop?.price ? (
        <Text style={styles.meta}>Цена: {formatCurrency(selectedCrop.price)}</Text>
      ) : null}
      <Pressable disabled={isSaving} onPress={onAddLine} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Добави ред</Text>
      </Pressable>
    </View>
  );
}
