import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { colors } from "../lib/theme";

export const LoginScreen = ({ onLogin, onBootstrap, busy, message }) => {
  const [mode, setMode] = useState("login");
  const [loginState, setLoginState] = useState({ companyCode: "", email: "", password: "" });
  const [setupState, setSetupState] = useState({
    companyName: "",
    companyCode: "",
    name: "",
    email: "",
    password: ""
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.wrapper}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Internal ops</Text>
          <Text style={styles.title}>Inventory updates without stock mismatch.</Text>
          <Text style={styles.subtitle}>
            Dispatches reduce stock, returns add it back, and admins keep full visibility.
          </Text>

          <View style={styles.credentialCard}>
            <Text style={styles.credentialLabel}>Seeded admin</Text>
            <Text style={styles.credentialText}>atlas-retail • owner@ops.local / Admin@123456</Text>
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.segmentedControl}>
            <Pressable
              onPress={() => setMode("login")}
              style={[styles.segmentButton, mode === "login" && styles.segmentButtonActive]}
            >
              <Text style={[styles.segmentText, mode === "login" && styles.segmentTextActive]}>
                Sign in
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode("setup")}
              style={[styles.segmentButton, mode === "setup" && styles.segmentButtonActive]}
            >
              <Text style={[styles.segmentText, mode === "setup" && styles.segmentTextActive]}>
                New company
              </Text>
            </Pressable>
          </View>

          {mode === "login" ? (
            <View style={styles.form}>
              <TextInput
                placeholder="Company code"
                placeholderTextColor={colors.muted}
                style={styles.input}
                autoCapitalize="none"
                value={loginState.companyCode}
                onChangeText={(value) =>
                  setLoginState((current) => ({ ...current, companyCode: value }))
                }
              />
              <TextInput
                placeholder="Email"
                placeholderTextColor={colors.muted}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                value={loginState.email}
                onChangeText={(value) => setLoginState((current) => ({ ...current, email: value }))}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor={colors.muted}
                style={styles.input}
                secureTextEntry
                value={loginState.password}
                onChangeText={(value) =>
                  setLoginState((current) => ({ ...current, password: value }))
                }
              />
              <Pressable
                style={[styles.primaryButton, busy && styles.buttonDisabled]}
                disabled={busy}
                onPress={() => onLogin(loginState)}
              >
                <Text style={styles.primaryButtonText}>{busy ? "Signing in..." : "Sign in"}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.form}>
              <TextInput
                placeholder="Company name"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={setupState.companyName}
                onChangeText={(value) =>
                  setSetupState((current) => ({ ...current, companyName: value }))
                }
              />
              <TextInput
                placeholder="Company code"
                placeholderTextColor={colors.muted}
                style={styles.input}
                autoCapitalize="none"
                value={setupState.companyCode}
                onChangeText={(value) =>
                  setSetupState((current) => ({ ...current, companyCode: value }))
                }
              />
              <TextInput
                placeholder="Full name"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={setupState.name}
                onChangeText={(value) => setSetupState((current) => ({ ...current, name: value }))}
              />
              <TextInput
                placeholder="Email"
                placeholderTextColor={colors.muted}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                value={setupState.email}
                onChangeText={(value) => setSetupState((current) => ({ ...current, email: value }))}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor={colors.muted}
                style={styles.input}
                secureTextEntry
                value={setupState.password}
                onChangeText={(value) =>
                  setSetupState((current) => ({ ...current, password: value }))
                }
              />
              <Pressable
                style={[styles.secondaryButton, busy && styles.buttonDisabled]}
                disabled={busy}
                onPress={() => onBootstrap(setupState)}
              >
                <Text style={styles.secondaryButtonText}>
                  {busy ? "Creating..." : "Create company admin"}
                </Text>
              </Pressable>
            </View>
          )}

          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 20,
    gap: 18
  },
  hero: {
    paddingTop: 48,
    gap: 14
  },
  kicker: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 7,
    textTransform: "uppercase"
  },
  title: {
    color: colors.dark,
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 42
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24
  },
  credentialCard: {
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: colors.surface,
    padding: 18
  },
  credentialLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1
  },
  credentialText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8
  },
  panel: {
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    backgroundColor: colors.surface,
    padding: 18
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    padding: 4
  },
  segmentButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12
  },
  segmentButtonActive: {
    backgroundColor: colors.surface
  },
  segmentText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center"
  },
  segmentTextActive: {
    color: colors.dark
  },
  form: {
    gap: 12,
    marginTop: 18
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
  primaryButton: {
    borderRadius: 20,
    backgroundColor: colors.dark,
    paddingVertical: 16
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center"
  },
  secondaryButton: {
    borderRadius: 20,
    backgroundColor: colors.primary,
    paddingVertical: 16
  },
  secondaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center"
  },
  buttonDisabled: {
    opacity: 0.6
  },
  message: {
    color: colors.warning,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 14
  }
});
