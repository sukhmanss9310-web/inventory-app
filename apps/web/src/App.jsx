import { useEffect, useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { AuthScreen } from "./components/AuthScreen";
import { DashboardSection } from "./components/DashboardSection";
import { DispatchSection } from "./components/DispatchSection";
import { InventorySection } from "./components/InventorySection";
import { LogsSection } from "./components/LogsSection";
import { ProductFormModal } from "./components/ProductFormModal";
import { ReturnsSection } from "./components/ReturnsSection";
import { useAuth } from "./context/AuthContext";
import { api } from "./lib/api";

const sectionsByRole = {
  admin: [
    { key: "dashboard", label: "Dashboard", description: "Metrics and low stock" },
    { key: "inventory", label: "Inventory", description: "Products and thresholds" },
    { key: "dispatch", label: "Dispatch", description: "Reduce stock" },
    { key: "returns", label: "Returns", description: "Add stock back" },
    { key: "logs", label: "Activity", description: "Audit trail" }
  ],
  staff: [
    { key: "inventory", label: "Inventory", description: "Current stock only" },
    { key: "dispatch", label: "Dispatch", description: "Reduce stock" },
    { key: "returns", label: "Returns", description: "Add stock back" }
  ]
};

const initialModalState = {
  open: false,
  mode: "create",
  product: null
};

const initialLogFilters = {
  search: "",
  action: "",
  actorRole: "",
  movementType: "",
  startDate: "",
  endDate: "",
  page: 1,
  limit: 20
};

export default function App() {
  const { user, token, loading, login, signup, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logFilters, setLogFilters] = useState(initialLogFilters);
  const [logPagination, setLogPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });
  const [logsLoading, setLogsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [banner, setBanner] = useState("");
  const [busy, setBusy] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [productModal, setProductModal] = useState(initialModalState);

  const sections = useMemo(
    () => (user ? sectionsByRole[user.role] || sectionsByRole.staff : []),
    [user]
  );

  const visibleProducts = useMemo(() => {
    if (!search.trim()) {
      return products;
    }

    const query = search.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query)
    );
  }, [products, search]);

  const refreshProducts = async () => {
    const response = await api.getProducts(token);
    setProducts(response.products);
  };

  const refreshDashboard = async () => {
    if (user?.role !== "admin") {
      return;
    }

    const response = await api.getDashboard(token);
    setDashboard(response.dashboard);
  };

  const refreshLogs = async (nextFilters = logFilters) => {
    if (user?.role !== "admin") {
      setLogs([]);
      setLogPagination({ page: 1, limit: 20, total: 0, totalPages: 1 });
      return;
    }

    setLogsLoading(true);

    try {
      const response = await api.getLogs(token, nextFilters);
      setLogs(response.logs);
      setLogFilters({
        ...response.filters,
        page: response.pagination.page,
        limit: response.pagination.limit
      });
      setLogPagination(response.pagination);
    } finally {
      setLogsLoading(false);
    }
  };

  const refreshOperationalData = async () => {
    // The web client keeps inventory as the source of truth and refreshes admin views from it.
    await refreshProducts();
    await Promise.all([refreshDashboard(), refreshLogs()]);
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    setActiveSection(user.role === "admin" ? "dashboard" : "dispatch");
    refreshOperationalData().catch((error) => setBanner(error.message));
  }, [user]);

  const handleAction = async (callback, successMessage) => {
    setBusy(true);
    setBanner("");

    try {
      await callback();
      setBanner(successMessage);
      await refreshOperationalData();
    } catch (error) {
      setBanner(error.message);
      throw error;
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async (credentials) => {
    setBusy(true);
    setBanner("");

    try {
      await login(credentials);
    } catch (error) {
      setBanner(error.message);
      throw error;
    } finally {
      setBusy(false);
    }
  };

  const handleBootstrap = async (payload) => {
    setBusy(true);
    setBanner("");

    try {
      await signup(payload);
    } catch (error) {
      setBanner(error.message);
      throw error;
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm font-semibold text-slate-600">
        Loading workspace...
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} onBootstrap={handleBootstrap} busy={busy} />;
  }

  return (
    <>
      <AppShell
        user={user}
        sections={sections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={logout}
        banner={banner}
      >
        {activeSection === "dashboard" && user.role === "admin" ? (
          <DashboardSection
            dashboard={dashboard}
            creatingUser={creatingUser}
            onCreateUser={async (payload) => {
              setCreatingUser(true);

              try {
                await signup(payload);
                setBanner("Team member created successfully.");
                await Promise.all([refreshDashboard(), refreshLogs()]);
              } finally {
                setCreatingUser(false);
              }
            }}
          />
        ) : null}

        {activeSection === "inventory" ? (
          <InventorySection
            user={user}
            products={visibleProducts}
            search={search}
            onSearchChange={setSearch}
            onCreate={() => setProductModal({ open: true, mode: "create", product: null })}
            onEdit={(product) => setProductModal({ open: true, mode: "edit", product })}
            onDelete={(product) =>
              handleAction(
                () => api.deleteProduct(token, product.id),
                `${product.name} deleted successfully.`
              )
            }
          />
        ) : null}

        {activeSection === "dispatch" ? (
          <DispatchSection
            products={products}
            busy={busy}
            onSubmit={(payload) =>
              handleAction(
                () => api.createDispatch(token, payload),
                "Dispatch recorded successfully."
              )
            }
          />
        ) : null}

        {activeSection === "returns" ? (
          <ReturnsSection
            products={products}
            busy={busy}
            onSubmit={(payload) =>
              handleAction(
                () => api.createReturn(token, payload),
                "Return or exchange recorded successfully."
              )
            }
          />
        ) : null}

        {activeSection === "logs" && user.role === "admin" ? (
          <LogsSection
            logs={logs}
            filters={logFilters}
            pagination={logPagination}
            loading={logsLoading}
            onApplyFilters={async (nextFilters) => {
              setLogFilters(nextFilters);
              await refreshLogs(nextFilters);
            }}
            onPageChange={async (page) => {
              const nextFilters = { ...logFilters, page };
              setLogFilters(nextFilters);
              await refreshLogs(nextFilters);
            }}
          />
        ) : null}
      </AppShell>

      <ProductFormModal
        open={productModal.open}
        mode={productModal.mode}
        product={productModal.product}
        busy={busy}
        onClose={() => setProductModal(initialModalState)}
        onSubmit={(payload) =>
          handleAction(
            async () => {
              if (productModal.mode === "create") {
                await api.createProduct(token, payload);
              } else {
                await api.updateProduct(token, productModal.product.id, payload);
              }

              setProductModal(initialModalState);
            },
            productModal.mode === "create"
              ? "Product created successfully."
              : "Product updated successfully."
          )
        }
      />
    </>
  );
}
