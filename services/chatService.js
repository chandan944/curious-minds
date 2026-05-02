import { BACKEND_URL } from './api';

class ChatService {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.notificationListeners = new Set();
    this.token = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  // Convert http://192.168.x.x:8080 to ws://192.168.x.x:8080
  getWsUrl() {
    return BACKEND_URL.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws/chat';
  }

  connect(token) {
    if (!token) {
      console.warn('⚠️ Cannot connect WS — no token');
      return;
    }
    if (this.ws && this.isConnected) return;
    // Clean up stale socket if it exists
    if (this.ws) {
      try { this.ws.close(); } catch(_) {}
      this.ws = null;
    }
    this.token = token;

    try {
      this.ws = new WebSocket(this.getWsUrl());

      this.ws.onopen = () => {
        console.log('🟢 WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        // Authenticate immediately
        this.ws.send(JSON.stringify({ type: 'AUTH', token: this.token }));
      };

      this.ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'MESSAGE') {
            this.notifyListeners(data);
          } else if (data.type === 'READ_RECEIPT') {
            this.notifyListeners(data);
          } else if (data.type === 'NOTIFICATION') {
            this.notifyNotificationListeners(data);
          } else if (data.type === 'AUTH_SUCCESS') {
            console.log('✅ WebSocket authenticated for User:', data.userId);
          }
        } catch (err) {
          console.error('❌ Error parsing WS message', err);
        }
      };

      this.ws.onclose = (e) => {
        console.log('🔴 WebSocket closed', e.reason);
        this.isConnected = false;
        this.ws = null;
        this.attemptReconnect();
      };

      this.ws.onerror = (e) => {
        console.error('❌ WebSocket error', e.message);
      };
    } catch (e) {
      console.error('❌ Failed to create WebSocket', e);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts > 5) return; // Give up after 5 tries
    this.reconnectAttempts++;
    setTimeout(() => {
      console.log(`🔄 Reconnecting WS (Attempt ${this.reconnectAttempts})...`);
      this.connect(this.token);
    }, 2000 * this.reconnectAttempts);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  send(target, content) {
    if (!this.isConnected || !this.ws) {
      console.warn('⚠️ Cannot send message, WS not connected');
      return false;
    }
    const msg = { type: 'SEND', target, content };
    this.ws.send(JSON.stringify(msg));
    return true;
  }

  sendGlobal(content) {
    return this.send('GLOBAL', content);
  }

  sendDirect(userId, content) {
    return this.send(userId.toString(), content);
  }

  markAsRead(messageId) {
    if (!this.isConnected || !this.ws) return false;
    const msg = { type: 'MARK_READ', messageId };
    this.ws.send(JSON.stringify(msg));
    return true;
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(message) {
    this.listeners.forEach(cb => cb(message));
  }

  // ── Notification Listeners ──────────────────────────────────────────────
  addNotificationListener(callback) {
    this.notificationListeners.add(callback);
    return () => this.notificationListeners.delete(callback);
  }

  notifyNotificationListeners(notification) {
    this.notificationListeners.forEach(cb => cb(notification));
  }
}

export default new ChatService();
