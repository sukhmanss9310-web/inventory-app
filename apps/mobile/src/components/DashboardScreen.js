import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../lib/theme";

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));

const metricOrder = [
  { key: "totalStock", label: "Total stock" },
  { key: "totalProducts", label: "Products" },
  { key: "lowStockItemsCount", label: "Low stock" },
  { key: "dispatchedAllTime", label: "Dispatch total" },
  { key: "dispatchedToday", label: "Dispatch today" },
  { key: "dispatchedLast7Days", label: "Dispatch 7d" },
  { key: "returnsAllTime", label: "Returns total" },
  { key: "returnsToday", label: "Returns today" },
  { key: "returnsLast7Days", label: "Returns 7d" }
];

export const DashboardScreen = ({ dashboard, companyCode, onResetCompany, busy }) => {
  const [resetState, setResetState] = useState({
    confirmation: "",
    reason: ""
  });
  const [message, setMessage] = useState("");

  if (!dashboard) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Admin dashboard</Text>
        <Text style={styles.sectionTitle}>Today’s operating picture</Text>
        <View style={styles.metricGrid}>
          {metricOrder.map((metric) => (
            <View key={metric.key} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricValue}>{dashboard.metrics[metric.key]}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Low stock items</Text>
        {dashboard.lowStockItems.length === 0 ? (
          <Text style={styles.emptyText}>No low stock items right now.</Text>
        ) : (
          dashboard.lowStockItems.map((product) => (
            <View key={product.id} style={styles.listItem}>
              <View>
                <Text style={styles.listTitle}>{product.name}</Text>
                <Text style={styles.listSub}>{product.sku}</Text>
              </View>
              <View>
                <Text style={styles.listTitle}>Stock {product.stock}</Text>
                <Text style={styles.listSub}>Threshold {product.lowStockThreshold}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent activity</Text>
        {dashboard.recentActivity.map((item) => (
          <View key={item.id} style={styles.activityItem}>
            <Text style={styles.listTitle}>{item.message}</Text>
            <Text style={styles.listSub}>{formatDate(item.createdAt)}</Text>
          </View>
        ))}
      </View>

      {companyCode && onResetCompany ? (
        <View style={[styles.card, styles.dangerCard]}>
          <Text style={styles.sectionTitle}>Danger zone</Text>
          <Text style={styles.emptyText}>
            Reset this company’s inventory workspace. Users and products stay, but stock is reset to 0,
            dispatch and return history is deleted, old logs are cleared, and one reset log is written.
          </Text>

          <TextInput
            style={[styles.input, styles.dangerInput]}
            placeholder={`Type ${companyCode} to confirm`}
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            value={resetState.confirmation}
            onChangeText={(value) =>
              setResetState((current) => ({ ...current, confirmation: value }))
            }
          />
          <TextInput
            style={[styles.input, styles.textArea, styles.dangerInput]}
            placeholder="Reason for company reset"
            placeholderTextColor={colors.muted}
            multiline
            textAlignVertical="top"
            value={resetState.reason}
            onChangeText={(value) =>
              setResetState((current) => ({ ...current, reason: value }))
            }
          />
          <Pressable
            style={[styles.dangerButton, busy && styles.buttonDisabled]}
            disabled={busy}
            onPress={async () => {
              setMessage("");

              try {
                await onResetCompany(resetState);
                setResetState({ confirmation: "", reason: "" });
                setMessage("Company inventory reset successfully.");
              } catch (error) {
                setMessage(error.message);
              }
            }}
          >
            <Text style={styles.dangerButtonText}>
              {busy ? "Resetting..." : "Reset company inventory"}
            </Text>
          </Pressable>

          {message ? <Text style={styles.dangerMessage}>{message}</Text> : null}
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 24
  },
  placeholder: {
    paddingVertical: 24
  },
  placeholderText: {
    color: colors.muted,
    fontSize: 14
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
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 14
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  metricCard: {
    minWidth: "47%",
    flexGrow: 1,
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
    fontSize: 24,
    fontWeight: "800",
    marginTop: 8
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: colors.surfaceMuted,
    marginTop: 10,
    padding: 14
  },
  listTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700"
  },
  listSub: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4
  },
  activityItem: {
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: colors.surfaceMuted,
    marginTop: 10,
    padding: 14
  },
  dangerCard: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2"
  },
  input: {
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  dangerInput: {
    borderColor: "#FECACA"
  },
  textArea: {
    minHeight: 110
  },
  dangerButton: {
    borderRadius: 18,
    backgroundColor: "#DC2626",
    marginTop: 14,
    paddingVertical: 15
  },
  dangerButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center"
  },
  dangerMessage: {
    color: "#7F1D1D",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12
  },
  buttonDisabled: {
    opacity: 0.6
  }
});
