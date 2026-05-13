/**
 * Safe date parsing utility to handle inconsistency between environments
 * and the Spring Boot backend's LocalDateTime (which lacks timezone info).
 */
export const parseSafe = (isoString) => {
  if (!isoString) return new Date();

  // 1. If it already has Z or offset (+/-XX:XX), the engine will parse it correctly as UTC/Offset.
  if (isoString.includes('Z') || isoString.includes('+')) {
    return new Date(isoString);
  }

  // 2. Handle strings with '-' that might be interpreted as UTC by some engines (e.g., Hermes).
  // We check if it looks like an ISO string but lacks a timezone.
  // Example: "2026-05-12T14:16:44"
  if (isoString.includes('-') && isoString.includes('T')) {
    try {
      // Split into parts to avoid engine-specific ISO parsing quirks
      const parts = isoString.split(/[-T:.Z+]/);
      // Date(year, monthIndex, day, hour, minute, second) -> always Local
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      const day = parseInt(parts[2], 10);
      const hour = parseInt(parts[3] || 0, 10);
      const minute = parseInt(parts[4] || 0, 10);
      const second = parseInt(parts[5] || 0, 10);
      
      const d = new Date(year, month, day, hour, minute, second);
      if (!isNaN(d.getTime())) return d;
    } catch (e) {
      console.warn('Failed to parse date parts:', isoString, e);
    }
  }

  // Fallback to default constructor
  return new Date(isoString);
};

/**
 * Returns a human-readable relative time string (e.g., "2m ago", "Just now").
 */
export const formatTimeAgo = (isoString) => {
  if (!isoString) return '';
  const now = new Date();
  const then = parseSafe(isoString);
  const diffMs = now - then;
  
  // Cap at 0 to avoid "In the future" if clocks are slightly out of sync
  const diffMin = Math.max(0, Math.floor(diffMs / 60000));
  
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return then.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
};

/**
 * Formats time for chat bubbles (e.g., "10:30 AM").
 */
export const formatChatTime = (isoString) => {
  if (!isoString) return '';
  const date = parseSafe(isoString);
  return date.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true });
};
