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

export const ReturnScreen = ({ products, onSubmit, busy }) => {
  const [formState, setFormState] = useState({
    productId: "",
    quantity: "1",
    type: "return",
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
        type: formState.type,
        note: formState.note
      });
      setFormState({ productId: "", quantity: "1", type: "return", note: "" });
      setMessage("Return or exchange recorded.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Returns</Text>
        <Text style={styles.sectionTitle}>Add stock back</Text>

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

        <View style={styles.typeRow}>
          {["return", "exchange"].map((type) => {
            const active = type === formState.type;
            return (
              <Pressable
                key={type}
                onPress={() => setFormState((current) => ({ ...current, type }))}
                style={[styles.typeButton, active && styles.typeButtonActive]}
              >
                <Text style={[styles.typeText, active && styles.typeTextActive]}>{type}</Text>
              </Pressable>
            );
          })}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Quantity"
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
          <Text style={styles.primaryButtonText}>
            {busy ? "Saving..." : "Record return / exchange"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Stock preview</Text>
        {selectedProduct ? (
          <>
            <Text style={styles.productTitle}>{selectedProduct.name}</Text>
            <Text style={styles.productSub}>{selectedProduct.sku}</Text>
            <View style={styles.counterCard}>
              <Text style={styles.counterLabel}>Current stock</Text>
              <Text style={styles.counterValue}>{selectedProduct.stock}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.productSub}>Select a product to confirm current stock.</Text>
        )}
        {message ? <Text style={styles.infoMessage}>{message}</Text> : null}
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
    backgroundColor: colors.amber,
    borderColor: colors.amber
  },
  selectorTitle: {
    color: colors.dark,
    fontSize: 15,
    fontWeight: "800"
  },
  selectorTitleActive: {
    color: colors.dark
  },
  selectorSub: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 6
  },
  selectorSubActive: {
    color: "#6B4400"
  },
  typeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  typeButton: {
    flex: 1,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 14
  },
  typeButtonActive: {
    backgroundColor: colors.amberSoft,
    borderColor: colors.amber
  },
  typeText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
    textTransform: "capitalize"
  },
  typeTextActive: {
    color: "#7C5200"
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
    backgroundColor: colors.amber,
    marginTop: 16,
    paddingVertical: 18
  },
  primaryButtonText: {
    color: colors.dark,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center"
  },
  buttonDisabled: {
    opacity: 0.6
  },
  infoCard: {
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: colors.surface,
    padding: 18
  },
  infoTitle: {
    color: colors.dark,
    fontSize: 22,
    fontWeight: "800"
  },
  productTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 14
  },
  productSub: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 6
  },
  counterCard: {
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: colors.amberSoft,
    marginTop: 16,
    padding: 16
  },
  counterLabel: {
    color: "#8A5A00",
    fontSize: 12,
    fontWeight: "700"
  },
  counterValue: {
    color: colors.dark,
    fontSize: 30,
    fontWeight: "800",
    marginTop: 8
  },
  infoMessage: {
    color: "#8A5A00",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 16
  }
});
