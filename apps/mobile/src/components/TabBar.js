import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../lib/theme";

export const TabBar = ({ tabs, activeTab, onChange }) => (
  <View style={styles.container}>
    {tabs.map((tab) => {
      const active = tab.key === activeTab;

      return (
        <Pressable
          key={tab.key}
          onPress={() => onChange(tab.key)}
          style={[styles.button, active && styles.buttonActive]}
        >
          <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 16,
    padding: 8
  },
  button: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  buttonActive: {
    backgroundColor: colors.dark
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  labelActive: {
    color: colors.surface
  }
});
