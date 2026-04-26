import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authAPI, adminAuthAPI } from "../services/api";

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = "smartmess_auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if stored auth is still valid
  const isAuthValid = useCallback((authData) => {
    if (!authData || !authData.token || !authData.expiresAt) {
      return false;
    }
    const expiryDate = new Date(authData.expiresAt);
    return expiryDate > new Date();
  }, []);

  // Load auth from localStorage on mount
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          if (isAuthValid(authData)) {
            setUser(authData.user);
            setToken(authData.token);
          } else {
            // Clear expired auth
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error("Error loading auth:", error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, [isAuthValid]);

  // Save auth to localStorage
  const saveAuth = useCallback((authData) => {
    const dataToStore = {
      token: authData.token,
      expiresAt: authData.expiresAt,
      user: authData.user,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(dataToStore));
    localStorage.setItem("token", authData.token); // For API interceptor
  }, []);

  // Login function
  const login = useCallback(
    async (email, password) => {
      const response = await authAPI.login({ email, password });

      if (response.data.success) {
        const authData = {
          token: response.data.token,
          expiresAt: response.data.expiresAt,
          user: response.data.user,
        };

        saveAuth(authData);
        setToken(authData.token);
        setUser(authData.user);
      }

      return response;
    },
    [saveAuth],
  );

  // Admin Login function
  const adminLogin = useCallback(
    async (email, password) => {
      const response = await adminAuthAPI.login({ email, password });

      if (response.data.success) {
        const authData = {
          token: response.data.token,
          expiresAt: response.data.expiresAt,
          user: response.data.user,
        };

        saveAuth(authData);
        setToken(authData.token);
        setUser(authData.user);
      }

      return response;
    },
    [saveAuth],
  );

  // Register function
  const register = useCallback(
    async (userData) => {
      const response = await authAPI.register(userData);

      if (response.data.success) {
        const authData = {
          token: response.data.token,
          expiresAt: response.data.expiresAt,
          user: response.data.user,
        };

        saveAuth(authData);
        setToken(authData.token);
        setUser(authData.user);
      }

      return response;
    },
    [saveAuth],
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      if (import.meta.env.DEV) console.error("Logout error:", error);
    } finally {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
    }
  }, []);

  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;

  // Update user/profile
  const updateUser = useCallback(async (data) => {
    try {
      // Call backend to update profile
      const response = await authAPI.updateProfile(data);
      if (response.data.success) {
        const updatedUser = response.data.user;

        // Update stored auth wrapper if exists
        try {
          const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
          if (storedAuth) {
            const authData = JSON.parse(storedAuth);
            authData.user = updatedUser;
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
            localStorage.setItem('token', authData.token || '');
          }
        } catch (e) {
          if (import.meta.env.DEV) console.error('Error updating stored auth:', e);
        }

        setUser(updatedUser);
      }
      return response;
    } catch (error) {
      if (import.meta.env.DEV) console.error('updateUser error:', error);
      throw error;
    }
  }, []);

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    adminLogin,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
