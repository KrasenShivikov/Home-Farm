import { StyleSheet, View } from "react-native";

function SkeletonBlock({ style }: { style?: object }) {
  return <View style={[styles.block, style]} />;
}

function SkeletonRow() {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <SkeletonBlock style={styles.titleLine} />
        <SkeletonBlock style={styles.shortLine} />
        <SkeletonBlock style={styles.metaLine} />
      </View>
      <View style={styles.rowRight}>
        <SkeletonBlock style={styles.pill} />
        <SkeletonBlock style={styles.amountLine} />
      </View>
    </View>
  );
}

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SkeletonBlock style={styles.eyebrow} />
        <SkeletonBlock style={styles.heading} />
        <SkeletonBlock style={styles.subheading} />
      </View>

      <View style={styles.filterCard}>
        <SkeletonBlock style={styles.filterTitle} />
        <View style={styles.filterGrid}>
          <SkeletonBlock style={styles.filterInput} />
          <SkeletonBlock style={styles.filterInput} />
        </View>
      </View>

      <View style={styles.list}>
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  amountLine: {
    height: 14,
    width: 58,
  },
  block: {
    backgroundColor: "#d7e1dc",
    borderRadius: 999,
    opacity: 0.9,
  },
  container: {
    backgroundColor: "#f7f8f5",
    flex: 1,
    padding: 24,
    paddingTop: 44,
  },
  eyebrow: {
    height: 12,
    width: 110,
  },
  filterCard: {
    backgroundColor: "#ffffff",
    borderColor: "#dcebe4",
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 24,
    padding: 16,
  },
  filterGrid: {
    gap: 10,
    marginTop: 14,
  },
  filterInput: {
    height: 44,
    width: "100%",
  },
  filterTitle: {
    height: 14,
    width: 120,
  },
  header: {
    gap: 12,
  },
  heading: {
    height: 34,
    width: "72%",
  },
  list: {
    gap: 12,
    marginTop: 18,
  },
  metaLine: {
    height: 12,
    width: 90,
  },
  pill: {
    height: 28,
    width: 74,
  },
  row: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  rowLeft: {
    flex: 1,
    gap: 9,
    paddingRight: 14,
  },
  rowRight: {
    alignItems: "flex-end",
    gap: 10,
  },
  shortLine: {
    height: 14,
    width: "48%",
  },
  subheading: {
    height: 16,
    width: "86%",
  },
  titleLine: {
    height: 18,
    width: "70%",
  },
});
