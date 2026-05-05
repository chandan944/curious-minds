import { BACKEND_URL } from './api';

class ChatService {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.notificationListeners = new Set();
    this.token = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.pingInterval = null;
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
        // Start keepalive ping every 30 seconds
        this.startPing();
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
          // PONG responses are silently ignored
        } catch (err) {
          console.error('❌ Error parsing WS message', err);
        }
      };

      this.ws.onclose = (e) => {
        console.log('🔴 WebSocket closed', e.reason);
        this.isConnected = false;
        this.ws = null;
        this.stopPing();
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

  startPing() {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.isConnected && this.ws) {
        try {
          this.ws.send(JSON.stringify({ type: 'PING' }));
        } catch (_) {
          // Connection is dead — trigger reconnect
          this.isConnected = false;
          this.stopPing();
          this.attemptReconnect();
        }
      }
    }, 30000); // Every 30 seconds
  }

  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('⚠️ Max reconnect attempts reached. Will retry on next user action.');
      return;
    }
    this.reconnectAttempts++;
    // Exponential backoff with jitter (prevents thundering herd)
    const baseDelay = Math.min(2000 * Math.pow(1.5, this.reconnectAttempts - 1), 30000);
    const jitter = Math.random() * 1000;
    const delay = baseDelay + jitter;
    setTimeout(() => {
      console.log(`🔄 Reconnecting WS (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect(this.token);
    }, delay);
  }

  disconnect() {
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  send(target, content, replyTo = null) {
    if (!this.isConnected || !this.ws) {
      // Auto-reconnect on send attempt if disconnected
      if (this.token) {
        this.reconnectAttempts = 0;
        this.connect(this.token);
      }
      console.warn('⚠️ Cannot send message, WS not connected');
      return false;
    }
    const msg = { type: 'SEND', target, content };
    
    if (replyTo) {
      msg.replyToId = replyTo.id;
      msg.replyToContent = replyTo.content;
      msg.replyToSenderName = replyTo.senderName;
    }
    
    this.ws.send(JSON.stringify(msg));
    return true;
  }

  sendGlobal(content, replyTo = null) {
    return this.send('GLOBAL', content, replyTo);
  }

  sendDirect(userId, content, replyTo = null) {
    return this.send(userId.toString(), content, replyTo);
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
