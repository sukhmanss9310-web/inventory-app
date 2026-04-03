import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable
} from "react-native";
import { DashboardScreen } from "./src/components/DashboardScreen";
import { DispatchScreen } from "./src/components/DispatchScreen";
import { InventoryScreen } from "./src/components/InventoryScreen";
import { LoginScreen } from "./src/components/LoginScreen";
import { ProductManagementScreen } from "./src/components/ProductManagementScreen";
import { ReturnScreen } from "./src/components/ReturnScreen";
import { TabBar } from "./src/components/TabBar";
import { api } from "./src/lib/api";
import { storage } from "./src/lib/storage";
import { colors } from "./src/lib/theme";

const tabsByRole = {
  admin: [
    { key: "dashboard", label: "Dashboard" },
    { key: "inventory", label: "Inventory" },
    { key: "manage", label: "Manage" },
    { key: "dispatch", label: "Dispatch" },
    { key: "returns", label: "Returns" }
  ],
  staff: [
    { key: "inventory", label: "Inventory" },
    { key: "dispatch", label: "Dispatch" },
    { key: "returns", label: "Returns" }
  ]
};

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState("dispatch");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const tabs = useMemo(() => (user ? tabsByRole[user.role] || tabsByRole.staff : []), [user]);

  const resetSession = async () => {
    setToken(null);
    setUser(null);
    setProducts([]);
    setDashboard(null);
    setMessage("");
    await storage.clearToken();
  };

  const refreshProducts = async (authToken) => {
    const response = await api.getProducts(authToken);
    setProducts(response.products);
  };

  const refreshDashboard = async (authToken, nextUser = user) => {
    if (nextUser?.role !== "admin") {
      setDashboard(null);
      return;
    }

    const response = await api.getDashboard(authToken);
    setDashboard(response.dashboard);
  };

  const refreshData = async (authToken = token, nextUser = user) => {
    await refreshProducts(authToken);
    await refreshDashboard(authToken, nextUser);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = await storage.getToken();

        if (!storedToken) {
          return;
        }

        const response = await api.me(storedToken);
        setToken(storedToken);
        setUser(response.user);
        setActiveTab(response.user.role === "admin" ? "dashboard" : "dispatch");
        await refreshData(storedToken, response.user);
      } catch (error) {
        await storage.clearToken();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const handleLogin = async (credentials) => {
    setBusy(true);
    setMessage("");

    try {
      const response = await api.login(credentials);
      await storage.setToken(response.token);
      setToken(response.token);
      setUser(response.user);
      setActiveTab(response.user.role === "admin" ? "dashboard" : "dispatch");
      await refreshData(response.token, response.user);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
      setLoading(false);
    }
  };

  const handleBootstrap = async (payload) => {
    setBusy(true);
    setMessage("");

    try {
      const response = await api.signup(payload);
      if (response.token) {
        await storage.setToken(response.token);
        setToken(response.token);
        setUser(response.user);
        setActiveTab("dashboard");
        await refreshData(response.token, response.user);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
      setLoading(false);
    }
  };

  const handleStockAction = async (callback, successMessage) => {
    setBusy(true);
    setMessage("");

    try {
      await callback();
      await refreshData();
      setMessage(successMessage);
    } catch (error) {
      Alert.alert("Action failed", error.message);
      throw error;
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <StatusBar style="dark" />
        <Text style={styles.loadingText}>Loading company...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <>
        <StatusBar style="dark" />
        <LoginScreen
          onLogin={handleLogin}
          onBootstrap={handleBootstrap}
          busy={busy}
          message={message}
        />
      </>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.headerCard}>
          <View>
            <Text style={styles.kicker}>Ops Inventory</Text>
            <Text style={styles.companyName}>{user.companyName || "Workspace"}</Text>
            <Text style={styles.companyCode}>{user.companyCode || "company-code"}</Text>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userSub}>
              {user.role} • {user.email}
            </Text>
          </View>
          <Pressable style={styles.logoutButton} onPress={resetSession}>
            <Text style={styles.logoutText}>Sign out</Text>
          </Pressable>
        </View>

        {message ? (
          <View style={styles.messageBanner}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        ) : null}

        <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <View style={styles.screenBody}>
          {activeTab === "dashboard" && user.role === "admin" ? (
            <DashboardScreen
              dashboard={dashboard}
              companyCode={user.companyCode}
              busy={busy}
              onResetCompany={(payload) =>
                handleStockAction(
                  () => api.resetCompanyInventory(token, payload),
                  "Company inventory reset successfully."
                )
              }
            />
          ) : null}

          {activeTab === "inventory" ? <InventoryScreen products={products} /> : null}

          {activeTab === "manage" && user.role === "admin" ? (
            <ProductManagementScreen
              products={products}
              busy={busy}
              onCreate={(payload) =>
                handleStockAction(
                  () => api.createProduct(token, payload),
                  "Product created successfully."
                )
              }
              onUpdate={(product, payload) =>
                handleStockAction(
                  () => api.updateProduct(token, product.id, payload),
                  "Product updated successfully."
                )
              }
              onDelete={(product) =>
                handleStockAction(
                  () => api.deleteProduct(token, product.id),
                  "Product deleted successfully."
                )
              }
              onReset={(product, payload) =>
                handleStockAction(
                  () => api.adjustInventory(token, { productId: product.id, ...payload }),
                  `Stock corrected for ${product.name}.`
                )
              }
            />
          ) : null}

          {activeTab === "dispatch" ? (
            <DispatchScreen
              products={products}
              busy={busy}
              onSubmit={(payload) =>
                handleStockAction(
                  () => api.createDispatch(token, payload),
                  "Dispatch recorded successfully."
                )
              }
            />
          ) : null}

          {activeTab === "returns" ? (
            <ReturnScreen
              products={products}
              busy={busy}
              onSubmit={(payload) =>
                handleStockAction(
                  () => api.createReturn(token, payload),
                  "Return or exchange recorded successfully."
                )
              }
            />
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flex: 1,
    padding: 18,
    paddingBottom: 28
  },
  screenBody: {
    flex: 1,
    marginTop: 16
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background
  },
  loadingText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "700"
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderColor: colors.border,
    borderRadius: 26,
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
  companyName: {
    color: colors.dark,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 10
  },
  companyCode: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
    textTransform: "lowercase"
  },
  userName: {
    color: colors.dark,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 6
  },
  userSub: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4
  },
  logoutButton: {
    borderRadius: 16,
    backgroundColor: colors.dark,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  logoutText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "800"
  },
  messageBanner: {
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: colors.primarySoft,
    marginTop: 14,
    padding: 14
  },
  messageText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700"
  }
});
