import { FlatList, StyleSheet, Text, View } from "react-native";
import { colors } from "../lib/theme";

const ProductCard = ({ item }) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.sub}>{item.sku}</Text>
      </View>
      <View
        style={[
          styles.badge,
          item.isLowStock ? styles.badgeWarning : styles.badgeHealthy
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            item.isLowStock ? styles.badgeTextWarning : styles.badgeTextHealthy
          ]}
        >
          {item.isLowStock ? "Low" : "OK"}
        </Text>
      </View>
    </View>

    <View style={styles.metaRow}>
      <View style={styles.metaCard}>
        <Text style={styles.metaLabel}>Stock</Text>
        <Text style={styles.metaValue}>{item.stock}</Text>
      </View>
      <View style={styles.metaCard}>
        <Text style={styles.metaLabel}>Threshold</Text>
        <Text style={styles.metaValue}>{item.lowStockThreshold}</Text>
      </View>
    </View>
  </View>
);

export const InventoryScreen = ({ products }) => (
  <FlatList
    data={products}
    keyExtractor={(item) => item.id}
    contentContainerStyle={styles.list}
    renderItem={({ item }) => <ProductCard item={item} />}
  />
);

const styles = StyleSheet.create({
  list: {
    gap: 14,
    paddingBottom: 24
  },
  card: {
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: colors.surface,
    padding: 18
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14
  },
  title: {
    color: colors.dark,
    fontSize: 18,
    fontWeight: "800"
  },
  sub: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  badgeWarning: {
    backgroundColor: colors.warningSoft
  },
  badgeHealthy: {
    backgroundColor: colors.primarySoft
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800"
  },
  badgeTextWarning: {
    color: colors.warning
  },
  badgeTextHealthy: {
    color: colors.primary
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  metaCard: {
    flex: 1,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: colors.surfaceMuted,
    padding: 14
  },
  metaLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  metaValue: {
    color: colors.dark,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 8
  }
});
