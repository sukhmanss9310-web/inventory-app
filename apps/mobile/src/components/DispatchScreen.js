import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { colors } from "../lib/theme";

export const DispatchScreen = ({ products, onSubmit, busy }) => {
  const [formState, setFormState] = useState({
    productId: "",
    quantity: "1",
    note: ""
  });
  const [message, setMessage] = useState("");

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === formState.productId),
    [formState.productId, products]
  );

  const handleSubmit = async () => {
    try {
      await onSubmit({
        productId: formState.productId,
        quantity: Number(formState.quantity),
        note: formState.note
      });
      setFormState({ productId: "", quantity: "1", note: "" });
      setMessage("Dispatch recorded.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Dispatch</Text>
        <Text style={styles.sectionTitle}>Reduce stock safely</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorRow}>
          {products.map((product) => {
            const active = product.id === formState.productId;

            return (
              <Pressable
                key={product.id}
                onPress={() => setFormState((current) => ({ ...current, productId: product.id }))}
                style={[styles.selectorChip, active && styles.selectorChipActive]}
              >
                <Text style={[styles.selectorTitle, active && styles.selectorTitleActive]}>
                  {product.name}
                </Text>
                <Text style={[styles.selectorSub, active && styles.selectorSubActive]}>
                  {product.sku} • {product.stock}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <TextInput
          style={styles.input}
          placeholder="Quantity dispatched"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          value={formState.quantity}
          onChangeText={(value) => setFormState((current) => ({ ...current, quantity: value }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Optional note"
          placeholderTextColor={colors.muted}
          value={formState.note}
          onChangeText={(value) => setFormState((current) => ({ ...current, note: value }))}
        />

        <Pressable
          onPress={handleSubmit}
          disabled={busy || !formState.productId}
          style={[styles.primaryButton, (busy || !formState.productId) && styles.buttonDisabled]}
        >
          <Text style={styles.primaryButtonText}>{busy ? "Saving..." : "Record dispatch"}</Text>
        </Pressable>
      </View>

      <View style={[styles.card, styles.darkCard]}>
        <Text style={styles.darkLabel}>Selected item</Text>
        {selectedProduct ? (
          <>
            <Text style={styles.darkTitle}>{selectedProduct.name}</Text>
            <Text style={styles.darkSub}>{selectedProduct.sku}</Text>
            <View style={styles.stockBadge}>
              <Text style={styles.stockBadgeLabel}>Current stock</Text>
              <Text style={styles.stockBadgeValue}>{selectedProduct.stock}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.darkSub}>Choose a product to preview current stock.</Text>
        )}
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
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
  sectionLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  sectionTitle: {
    color: colors.dark,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 14
  },
  selectorRow: {
    gap: 10,
    paddingBottom: 4
  },
  selectorChip: {
    width: 220,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: colors.surfaceMuted,
    padding: 14
  },
  selectorChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  selectorTitle: {
    color: colors.dark,
    fontSize: 15,
    fontWeight: "800"
  },
  selectorTitleActive: {
    color: colors.surface
  },
  selectorSub: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 6
  },
  selectorSubActive: {
    color: "#C7F8F0"
  },
  input: {
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    fontSize: 16,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 15
  },
  primaryButton: {
    borderRadius: 22,
    backgroundColor: colors.primary,
    marginTop: 16,
    paddingVertical: 18
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center"
  },
  buttonDisabled: {
    opacity: 0.6
  },
  darkCard: {
    backgroundColor: colors.dark,
    borderColor: colors.dark
  },
  darkLabel: {
    color: "#8FA3B6",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  darkTitle: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 10
  },
  darkSub: {
    color: "#CBD5E1",
    fontSize: 14,
    marginTop: 6
  },
  stockBadge: {
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginTop: 18,
    padding: 16
  },
  stockBadgeLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700"
  },
  stockBadgeValue: {
    color: colors.surface,
    fontSize: 30,
    fontWeight: "800",
    marginTop: 8
  },
  message: {
    color: "#D7F1ED",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 16
  }
});
