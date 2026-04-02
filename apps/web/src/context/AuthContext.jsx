import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const TOKEN_KEY = "ops-console-token";
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const persistToken = (nextToken) => {
    setToken(nextToken);

    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  const logout = () => {
    persistToken(null);
    setUser(null);
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.getCurrentUser(token);
        setUser(response.user);
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      logout,
      async login(credentials) {
        const response = await api.login(credentials);
        persistToken(response.token);
        setUser(response.user);
        return response.user;
      },
      async signup(payload) {
        const response = await api.signup(payload, token);

        if (response.token) {
          persistToken(response.token);
          setUser(response.user);
        }

        return response;
      }
    }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
};
