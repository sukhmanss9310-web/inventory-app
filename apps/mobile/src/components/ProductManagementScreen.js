import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { colors } from "../lib/theme";

const emptyFormState = {
  name: "",
  sku: "",
  stock: "0",
  lowStockThreshold: "5"
};

const ProductCard = ({ item, onEdit, onDelete }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSub}>{item.sku}</Text>
      </View>
      <View style={[styles.statusBadge, item.isLowStock ? styles.statusLow : styles.statusHealthy]}>
        <Text style={[styles.statusText, item.isLowStock ? styles.statusTextLow : styles.statusTextHealthy]}>
          {item.isLowStock ? "Low stock" : "Healthy"}
        </Text>
      </View>
    </View>

    <View style={styles.metricRow}>
      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>Stock</Text>
        <Text style={styles.metricValue}>{item.stock}</Text>
      </View>
      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>Threshold</Text>
        <Text style={styles.metricValue}>{item.lowStockThreshold}</Text>
      </View>
    </View>

    <View style={styles.actionRow}>
      <Pressable style={styles.secondaryButton} onPress={() => onEdit(item)}>
        <Text style={styles.secondaryButtonText}>Edit</Text>
      </Pressable>
      <Pressable style={styles.dangerButton} onPress={() => onDelete(item)}>
        <Text style={styles.dangerButtonText}>Delete</Text>
      </Pressable>
    </View>
  </View>
);

export const ProductManagementScreen = ({ products, busy, onCreate, onUpdate, onDelete }) => {
  const [modalState, setModalState] = useState({ open: false, mode: "create", product: null });
  const [formState, setFormState] = useState(emptyFormState);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!modalState.open) {
      setFormState(emptyFormState);
      return;
    }

    if (!modalState.product) {
      setFormState(emptyFormState);
      return;
    }

    setFormState({
      name: modalState.product.name,
      sku: modalState.product.sku,
      stock: String(modalState.product.stock),
      lowStockThreshold: String(modalState.product.lowStockThreshold)
    });
  }, [modalState]);

  const closeModal = () => {
    setModalState({ open: false, mode: "create", product: null });
    setMessage("");
  };

  const handleDelete = (product) => {
    Alert.alert("Delete product", `Remove ${product.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await onDelete(product);
          } catch (error) {
            setMessage(error.message);
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerPanel}>
        <View>
          <Text style={styles.kicker}>Admin inventory</Text>
          <Text style={styles.title}>Manage products</Text>
          <Text style={styles.subtitle}>
            Create, edit, and remove stock items directly from the mobile app.
          </Text>
        </View>
        <Pressable
          style={[styles.primaryButton, busy && styles.buttonDisabled]}
          disabled={busy}
          onPress={() => setModalState({ open: true, mode: "create", product: null })}
        >
          <Text style={styles.primaryButtonText}>Add product</Text>
        </Pressable>
      </View>

      {message ? (
        <View style={styles.messageBanner}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onEdit={(product) =>
              setModalState({ open: true, mode: "edit", product })
            }
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No products available yet.</Text>
          </View>
        }
      />

      <Modal animationType="slide" transparent visible={modalState.open} onRequestClose={closeModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {modalState.mode === "create" ? "Add product" : "Edit product"}
                </Text>
                <Text style={styles.modalSub}>Keep stock and SKU details accurate.</Text>
              </View>
              <Pressable onPress={closeModal} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>Close</Text>
              </Pressable>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Product name"
                placeholderTextColor={colors.muted}
                value={formState.name}
                onChangeText={(value) =>
                  setFormState((current) => ({ ...current, name: value }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="SKU"
                placeholderTextColor={colors.muted}
                autoCapitalize="characters"
                value={formState.sku}
                onChangeText={(value) =>
                  setFormState((current) => ({ ...current, sku: value.toUpperCase() }))
                }
              />
              <View style={styles.formRow}>
                <TextInput
                  style={[styles.input, styles.rowInput]}
                  placeholder="Stock"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  value={formState.stock}
                  onChangeText={(value) =>
                    setFormState((current) => ({ ...current, stock: value }))
                  }
                />
                <TextInput
                  style={[styles.input, styles.rowInput]}
                  placeholder="Threshold"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  value={formState.lowStockThreshold}
                  onChangeText={(value) =>
                    setFormState((current) => ({ ...current, lowStockThreshold: value }))
                  }
                />
              </View>

              <Pressable
                style={[styles.primaryButton, busy && styles.buttonDisabled]}
                disabled={busy}
                onPress={async () => {
                  try {
                    const payload = {
                      name: formState.name,
                      sku: formState.sku,
                      stock: Number(formState.stock),
                      lowStockThreshold: Number(formState.lowStockThreshold)
                    };

                    if (modalState.mode === "create") {
                      await onCreate(payload);
                    } else {
                      await onUpdate(modalState.product, payload);
                    }

                    closeModal();
                  } catch (error) {
                    setMessage(error.message);
                  }
                }}
              >
                <Text style={styles.primaryButtonText}>
                  {busy ? "Saving..." : modalState.mode === "create" ? "Create product" : "Save changes"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14
  },
  headerPanel: {
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: colors.surface,
    padding: 18
  },
  kicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  title: {
    color: colors.dark,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 8
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 16
  },
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  cardTitle: {
    color: colors.dark,
    fontSize: 18,
    fontWeight: "800"
  },
  cardSub: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  statusLow: {
    backgroundColor: colors.warningSoft
  },
  statusHealthy: {
    backgroundColor: colors.primarySoft
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800"
  },
  statusTextLow: {
    color: colors.warning
  },
  statusTextHealthy: {
    color: colors.primary
  },
  metricRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  metricCard: {
    flex: 1,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: colors.surfaceMuted,
    padding: 14
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  metricValue: {
    color: colors.dark,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 8
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  primaryButton: {
    borderRadius: 20,
    backgroundColor: colors.dark,
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center"
  },
  secondaryButton: {
    flex: 1,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 14
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center"
  },
  dangerButton: {
    flex: 1,
    borderColor: "#FECACA",
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: "#FEF2F2",
    paddingVertical: 14
  },
  dangerButtonText: {
    color: "#B91C1C",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center"
  },
  messageBanner: {
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: colors.primarySoft,
    padding: 14
  },
  messageText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700"
  },
  emptyState: {
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    backgroundColor: colors.surface,
    padding: 24
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center"
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.35)"
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.surface,
    padding: 20
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  modalTitle: {
    color: colors.dark,
    fontSize: 22,
    fontWeight: "800"
  },
  modalSub: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 6
  },
  modalClose: {
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  modalCloseText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  form: {
    gap: 12,
    marginTop: 20,
    paddingBottom: 18
  },
  formRow: {
    flexDirection: "row",
    gap: 10
  },
  input: {
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 15
  },
  rowInput: {
    flex: 1
  },
  buttonDisabled: {
    opacity: 0.6
  }
});
