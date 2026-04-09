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

export const LoginScreen = ({ onLogin, busy, message }) => {
  const [loginState, setLoginState] = useState({ companyCode: "", email: "", password: "" });

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
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Sign in</Text>
          <Text style={styles.panelSubtitle}>
            New companies cannot self-register. Access is provisioned only by the platform owner.
          </Text>

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
  panel: {
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    backgroundColor: colors.surface,
    padding: 18
  },
  panelTitle: {
    color: colors.dark,
    fontSize: 24,
    fontWeight: "800"
  },
  panelSubtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8
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
