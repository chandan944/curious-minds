// ─────────────────────────────────────────────
//  AuthContext.jsx — Global auth state
//  Provides: user, token, isAuthenticated, isLoading
//  Actions:  handleGoogleAuth, logout, refreshUser
// ─────────────────────────────────────────────
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import {
  saveToken, getToken,
  saveUser, getUser,
  clearAuthStorage,
} from '../utils/authStorage';
import { getXP, getStreak } from '../utils/storage';
import chatService from '../services/chatService';
import { registerForPushNotificationsAsync } from '../services/notificationService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user,            setUser]            = useState(null);
  const [token,           setTokenState]      = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading,       setIsLoading]       = useState(true);

  // ── Restore session on app boot ──────────────
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const savedToken = await getToken();
      const userData   = await getUser();

      if (savedToken && userData) {
        // Set the header first so the validation call has auth
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;

        // ── 1. OPTIMISTIC UI LOADING (Zero-Wait Startup) ──────
        setTokenState(savedToken);
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false); // Stop the loading spinner INSTANTLY
        
        chatService.connect(savedToken);

        // ── 2. BACKGROUND VALIDATION ──────
        api.get('/auth/validate').then(async (res) => {
          if (res.data && res.data.valid) {
            // User exists in DB and token is valid — quietly update fresh server data
            const serverUser = res.data.user;
            const freshUserData = {
              id:       serverUser.id,
              email:    serverUser.email,
              name:     serverUser.name,
              imageUrl: serverUser.imageUrl || '',
              role:     serverUser.role || 'USER',
              points:   serverUser.points || 0,
              streak:   serverUser.streak || 0,
              level:    serverUser.level || 1,
              title:    serverUser.title || 'Curious Kid',
            };
            await saveUser(freshUserData);
            setUser(freshUserData);
            console.log('✅ Session validated in background for:', freshUserData.email);
            
            // Register for push notifications on app startup
            registerForPushNotificationsAsync().then(async (pushToken) => {
              if (pushToken) {
                try {
                  await api.put('/auth/push-token', { expoPushToken: pushToken });
                  console.log('✅ Push token registered on startup');
                } catch (err) {
                  console.warn('⚠️ Failed to register push token:', err.message);
                }
              }
            });
          } else {
            console.warn('⚠️ Token valid but user not found in DB — clearing session');
            await forceLogout();
          }
        }).catch(async (validationError) => {
          const status = validationError?.response?.status;
          if (status === 401 || status === 403 || status === 404) {
            console.warn('⚠️ Token validation failed (HTTP', status, ') — clearing session');
            await forceLogout();
          } else {
            console.warn('⚠️ Cannot reach server, relying on cached session for:', userData.email);
          }
        });
      } else {
        setIsLoading(false);
      }
    } catch (e) {
      console.error('❌ Session restore failed:', e);
      await forceLogout();
      setIsLoading(false);
    }
  };

  // ── Force logout (cleans up stale sessions) ──────────
  const forceLogout = async () => {
    try {
      chatService.disconnect();
      await clearAuthStorage();
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setTokenState(null);
      setIsAuthenticated(false);
    } catch (e) {
      console.error('Force logout error:', e);
    }
  };

  // ── Called from LoginScreen after GoogleSignin ──
  const handleGoogleAuth = async (authData) => {
    if (!authData?.email || !authData?.idToken) {
      return { success: false, message: 'Invalid auth data from Google' };
    }

    try {
      console.log('📤 Sending token to backend for:', authData.email);

      const response = await api.post('/auth/google', {
        idToken:  authData.idToken,
        email:    authData.email,
        name:     authData.name,
        imageUrl: authData.imageUrl
      });

      const { success, token: jwtToken, user: backendUser } = response.data;

      if (!success || !jwtToken) {
        return { success: false, message: 'No token returned from backend' };
      }

      // Persist JWT
      await saveToken(jwtToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
      setTokenState(jwtToken);

      const userData = {
        id:       backendUser.id,
        email:    backendUser.email,
        name:     backendUser.name,
        imageUrl: backendUser.imageUrl || '',
        role:     backendUser.role || 'USER',
        points:   backendUser.points || 0,
        streak:   backendUser.streak || 0,
        level:    backendUser.level || 1,
        title:    backendUser.title || 'Curious Kid',
      };

      await saveUser(userData);
      setUser(userData);
      setIsAuthenticated(true);
      chatService.connect(jwtToken);

      console.log('🎉 Authenticated as:', userData.email, '| Role:', userData.role);
      
      // Register for push notifications after login
      registerForPushNotificationsAsync().then(async (pushToken) => {
        if (pushToken) {
          try {
            await api.put('/auth/push-token', { expoPushToken: pushToken });
            console.log('✅ Push token registered on login');
          } catch (err) {
            console.warn('⚠️ Failed to register push token:', err.message);
          }
        }
      });

      return { success: true };

    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Authentication failed';
      console.error('❌ Auth error:', msg);
      return { success: false, message: msg };
    }
  };

  // ── Refresh user data from backend ───────────────────
  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/validate');
      if (res.data && res.data.valid && res.data.user) {
        const serverUser = res.data.user;
        const freshUserData = {
          id:       serverUser.id,
          email:    serverUser.email,
          name:     serverUser.name,
          imageUrl: serverUser.imageUrl || '',
          role:     serverUser.role || 'USER',
          points:   serverUser.points || 0,
          streak:   serverUser.streak || 0,
          level:    serverUser.level || 1,
          title:    serverUser.title || 'Curious Kid',
        };
        await saveUser(freshUserData);
        setUser(freshUserData);
        return freshUserData;
      }
    } catch (e) {
      console.warn('Refresh user failed:', e?.message);
    }
    return null;
  };

  // ── Logout ────────────────────────────────────
  const logout = async () => {
    try {
      chatService.disconnect();
      await clearAuthStorage();
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setTokenState(null);
      setIsAuthenticated(false);
      console.log('👋 Logged out');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, handleGoogleAuth, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
