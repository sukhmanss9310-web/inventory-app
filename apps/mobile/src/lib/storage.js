import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "ops-mobile-token";

export const storage = {
  getToken: () => AsyncStorage.getItem(TOKEN_KEY),
  setToken: (value) => AsyncStorage.setItem(TOKEN_KEY, value),
  clearToken: () => AsyncStorage.removeItem(TOKEN_KEY)
};
