// ─────────────────────────────────────────────
//  Icons — SVG icon components, no emojis
//  Usage: <Icon name="home" size={24} color="#fff" />
// ─────────────────────────────────────────────

import React from 'react';
import Svg, {
  Path, Circle, Rect, Line, Polygon, Polyline, Ellipse,
  G, Defs, ClipPath, LinearGradient, Stop,
} from 'react-native-svg';

const iconMap = {
  // ── Navigation ────────────────────────────────
  home: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9.5L12 3L21 9.5V21H15V15H9V21H3V9.5Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  ),
  back: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 5L5 12L12 19" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  forward: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12H19M12 5L19 12L12 19" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  settings: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" />
      <Path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  close: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),

  // ── Gamification ─────────────────────────────
  star: ({ size, color, filled }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
      <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  ),
  trophy: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 21H16M12 17V21M6 3H18V11C18 14.31 15.31 17 12 17C8.69 17 6 14.31 6 11V3Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <Path d="M6 7H3C3 10 5.5 12 6 12M18 7H21C21 10 18.5 12 18 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  badge: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L14.4 8.1L21 9.27L16.5 14.14L17.81 21L12 17.77L6.19 21L7.5 14.14L3 9.27L9.6 8.1L12 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  ),
  zap: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  ),
  flame: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22C8.69 22 6 19.31 6 16C6 11 10 8 10 8C10 8 8 11 12 13C12 13 10.5 10 14 8C14 8 18 11 18 16C18 19.31 15.31 22 12 22Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <Path d="M12 22C10.34 22 9 20.66 9 19C9 17 11 16 12 16C13 16 15 17 15 19C15 20.66 13.66 22 12 22Z" fill={color} />
    </Svg>
  ),
  lock: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="1.5" />
      <Path d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="12" cy="16" r="1.5" fill={color} />
    </Svg>
  ),
  unlock: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="1.5" />
      <Path d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="12" cy="16" r="1.5" fill={color} />
    </Svg>
  ),
  xp: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
      <Path d="M8 15L12 9L16 15M9.5 13H14.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),

  // ── Learning & Science ─────────────────────────
  brain: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9.5 2C8.12 2 7 3.12 7 4.5C7 5.19 7.29 5.82 7.76 6.27C6.73 6.57 6 7.5 6 8.6C6 9.2 6.23 9.74 6.62 10.16C5.66 10.58 5 11.51 5 12.6C5 13.88 5.88 14.97 7.09 15.28C6.95 15.55 6.87 15.86 6.87 16.19C6.87 17.27 7.69 18.16 8.74 18.24C8.9 18.44 9.08 18.62 9.28 18.77C9.63 19.03 10.05 19.2 10.5 19.2C11.33 19.2 12.05 18.74 12.44 18.06C12.83 18.74 13.55 19.2 14.38 19.2C14.83 19.2 15.25 19.03 15.6 18.77C15.8 18.62 15.98 18.44 16.14 18.24C17.19 18.16 18.01 17.27 18.01 16.19C18.01 15.86 17.93 15.55 17.79 15.28C19 14.97 19.88 13.88 19.88 12.6C19.88 11.51 19.22 10.58 18.26 10.16C18.65 9.74 18.88 9.2 18.88 8.6C18.88 7.5 18.15 6.57 17.12 6.27C17.59 5.82 17.88 5.19 17.88 4.5C17.88 3.12 16.76 2 15.38 2C14.83 2 14.33 2.18 13.93 2.49C13.38 2.18 12.72 2 12 2C11.28 2 10.62 2.18 10.07 2.49C9.67 2.18 9.17 2 8.62 2L9.5 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  ),
  book: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 19.5C4 18.12 5.12 17 6.5 17H20M4 19.5V4C4 2.9 4.9 2 6 2H18C19.1 2 20 2.9 20 4V17H6.5C5.12 17 4 18.12 4 19.5ZM4 19.5C4 20.88 5.12 22 6.5 22H20V17" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  ),
  flask: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 3H15M9 3V8L4.5 16.5C3.84 17.74 4.74 19.25 6.14 19.25H17.86C19.26 19.25 20.16 17.74 19.5 16.5L15 8V3M9 3H15" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <Path d="M6.5 14H17.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  telescope: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 7L10 4L14 11L7 14L3 7Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <Path d="M14 11L19 9M10 4L14 2M7 14L5 19M10.5 16L12 19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  atom: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="1.5" fill={color} />
      <Ellipse cx="12" cy="12" rx="10" ry="4" stroke={color} strokeWidth="1.5" />
      <Ellipse cx="12" cy="12" rx="10" ry="4" stroke={color} strokeWidth="1.5" transform="rotate(60 12 12)" />
      <Ellipse cx="12" cy="12" rx="10" ry="4" stroke={color} strokeWidth="1.5" transform="rotate(120 12 12)" />
    </Svg>
  ),
  planet: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.5" />
      <Path d="M2.5 17C4 14.5 8 12 12 12C16 12 20 9.5 21.5 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  dna: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 4C7 4 8.5 6 12 6C15.5 6 17 4 17 4M7 20C7 20 8.5 18 12 18C15.5 18 17 20 17 20M7 4C7 4 6 7.5 8 10.5M17 4C17 4 18 7.5 16 10.5M7 20C7 20 6 16.5 8 13.5M17 20C17 20 18 16.5 16 13.5M8 10.5C8 10.5 10 12 12 12C14 12 16 10.5 16 10.5M8 13.5C8 13.5 10 12 12 12C14 12 16 13.5 16 13.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  microscope: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 21H18M9 21V17M15 21V17M9 17H15M10 6H14M12 6V3M10 3H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="9" y="6" width="6" height="11" rx="1" stroke={color} strokeWidth="1.5" />
      <Circle cx="12" cy="10" r="2" stroke={color} strokeWidth="1.5" />
    </Svg>
  ),
  ruler: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="6" width="20" height="12" rx="2" stroke={color} strokeWidth="1.5" />
      <Path d="M6 6V10M10 6V8M14 6V10M18 6V8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  snowflake: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2V22M12 2L9 5M12 2L15 5M12 22L9 19M12 22L15 19" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2 12H22M2 12L5 9M2 12L5 15M22 12L19 9M22 12L19 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5.64 5.64L18.36 18.36M5.64 5.64L7.5 8.5M5.64 5.64L8.5 7.5M18.36 18.36L15.5 15.5M18.36 18.36L16.5 15.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M18.36 5.64L5.64 18.36M18.36 5.64L15.5 8.5M18.36 5.64L16.5 7.5M5.64 18.36L7.5 15.5M5.64 18.36L8.5 16.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  beaker: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 3H16M8 3V10L3 19C2.5 20 3.2 21 4.4 21H19.6C20.8 21 21.5 20 21 19L16 10V3M8 3H16" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="9" cy="17" r="1" fill={color} />
      <Circle cx="13" cy="15" r="1" fill={color} />
      <Circle cx="16" cy="18" r="1" fill={color} />
    </Svg>
  ),
  heart: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  shield: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22C12 22 4 18 4 12V5L12 2L20 5V12C20 18 12 22 12 22Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 12L11 14L15 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  leaf: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 8C17 8 20 10 20 15C20 18 17.5 20.5 15 21C12.5 21.5 9 20 8 17C7 14 8 11 10 9C12 7 15 6 17 8Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <Path d="M12 21L8 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M20 15L12 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M4 20L8 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  earth: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
      <Path d="M2 12H22M12 2C12 2 8 7 8 12C8 17 12 22 12 22M12 2C12 2 16 7 16 12C16 17 12 22 12 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  bomb: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="13" r="7" stroke={color} strokeWidth="1.5" />
      <Path d="M11 6V3M15 5L17 3M17 3L19 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8 11C8 11 9 10 11 10.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  robot: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="8" width="14" height="12" rx="2" stroke={color} strokeWidth="1.5" />
      <Path d="M9 8V6a3 3 0 1 1 6 0v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="9" cy="13" r="1.5" fill={color} />
      <Circle cx="15" cy="13" r="1.5" fill={color} />
      <Path d="M9 17H15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M2 11H5M19 11H22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  wifi: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M1.5 8.5C5.17 4.83 10.29 2.5 12 2.5C13.71 2.5 18.83 4.83 22.5 8.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 12C7.13 9.87 9.47 8.5 12 8.5C14.53 8.5 16.87 9.87 19 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8.5 15.5C9.75 14.25 10.79 13.5 12 13.5C13.21 13.5 14.25 14.25 15.5 15.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="19" r="1.5" fill={color} />
    </Svg>
  ),
  waves: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 8C4 6 6 6 8 8C10 10 12 10 14 8C16 6 18 6 20 8M2 14C4 12 6 12 8 14C10 16 12 16 14 14C16 12 18 12 20 14M2 20C4 18 6 18 8 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  magnet: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 15A6 6 0 0 0 18 15V4H14V15A2 2 0 0 1 10 15V4H6V15Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <Path d="M4 4H8M16 4H20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  fire: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C12 2 7 7 7 13C7 16 8.5 18.5 11 19.5C10 18 10 16.5 11 15.5C11.5 15 12 15.5 12 16C12 17 13 18 14 17.5C16 16.5 17 14.5 17 13C17 9 15 5 12 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <Path d="M12 22C10.34 22 9 20.66 9 19C9 17.5 10 16.5 12 16.5C14 16.5 15 17.5 15 19C15 20.66 13.66 22 12 22Z" fill={color} />
    </Svg>
  ),
  magnet2: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 17A6 6 0 0 0 18 17V3H14V17A2 2 0 0 1 10 17V3H6V17Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  ),
  wrench: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  cpu: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="7" y="7" width="10" height="10" rx="1" stroke={color} strokeWidth="1.5" />
      <Path d="M9 7V4M12 7V4M15 7V4M9 20V17M12 20V17M15 20V17M7 9H4M7 12H4M7 15H4M20 9H17M20 12H17M20 15H17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  molecule: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="2.5" stroke={color} strokeWidth="1.5" />
      <Circle cx="4" cy="8" r="2" stroke={color} strokeWidth="1.5" />
      <Circle cx="20" cy="8" r="2" stroke={color} strokeWidth="1.5" />
      <Circle cx="12" cy="20" r="2" stroke={color} strokeWidth="1.5" />
      <Path d="M6 9L10 11M18 9L14 11M12 14.5V18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  lightning: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2L4.09 12.96H11L10.14 22L20 11H13L13 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} fillOpacity="0.15" />
    </Svg>
  ),
  pressure: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
      <Path d="M12 7V12L15 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 6L9 8M17 6L15 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  thermometer: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14 14.76V3.5A2.5 2.5 0 0 0 9 3.5v11.26a4.5 4.5 0 1 0 5 0z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <Path d="M11.5 15V9" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  ),
  battery: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="7" width="18" height="10" rx="2" stroke={color} strokeWidth="1.5" />
      <Path d="M20 11V13M7 10V14M11 10V14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  link: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  balance: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3V20M5 20H19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M6 7L3 14H9L6 7ZM18 7L15 14H21L18 7Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <Path d="M6 7H18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  water: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L5 12C5 15.87 8.13 19 12 19C15.87 19 19 15.87 19 12L12 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <Path d="M8 14C8 14 9 16 12 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  time: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
      <Path d="M12 7V12L16 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  galaxy: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 12C12 12 8 8 5 10C2 12 3 16 5 18C7 20 11 21 14 19C17 17 19 13 18 10C17 7 14 5 11 6C8 7 6 10 7 13C8 16 11 17 13 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="12" cy="12" r="1.5" fill={color} />
    </Svg>
  ),
  rocket: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C12 2 6 8 6 14H18C18 8 12 2 12 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <Path d="M6 14L4 18L8 17M18 14L20 18L16 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="14" r="2" stroke={color} strokeWidth="1.5" />
      <Path d="M10 22L12 20L14 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  blackhole: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" />
      <Path d="M3 8C5 5 9 3 12 3C15 3 19 5 21 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M3 16C5 19 9 21 12 21C15 21 19 19 21 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M3 12H9M15 12H21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  binary: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 7C4 5.9 4.9 5 6 5C7.1 5 8 5.9 8 7V10C8 11.1 7.1 12 6 12C4.9 12 4 11.1 4 10V7Z" stroke={color} strokeWidth="1.5" />
      <Path d="M10 5H12V12H10M10 8.5H12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M4 14H8M4 17H8M4 20H8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M11 14V20M13 14L13 20M11 17H13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  key: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="8" cy="9" r="5" stroke={color} strokeWidth="1.5" />
      <Path d="M13 14L21 22M13 14L15 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18 19L20 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  data: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Ellipse cx="12" cy="6" rx="8" ry="3" stroke={color} strokeWidth="1.5" />
      <Path d="M4 6V12C4 13.66 7.58 15 12 15C16.42 15 20 13.66 20 12V6" stroke={color} strokeWidth="1.5" />
      <Path d="M4 12V18C4 19.66 7.58 21 12 21C16.42 21 20 19.66 20 18V12" stroke={color} strokeWidth="1.5" />
    </Svg>
  ),
  globe: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
      <Path d="M12 2C12 2 8 7 8 12C8 17 12 22 12 22M12 2C12 2 16 7 16 12C16 17 12 22 12 22" stroke={color} strokeWidth="1.5" />
      <Path d="M2.5 9H21.5M2.5 15H21.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),

  // ── UI ────────────────────────────────────────
  check: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  cross: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  ),
  clock: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
      <Path d="M12 7V12L15 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  refresh: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M1 4V10H7M23 20V14H17M20.49 9C19.56 6.4 17.39 4.38 14.68 3.64C11.97 2.9 9.08 3.55 6.97 5.37L1 10M23 14L17.03 18.63C14.92 20.45 12.03 21.1 9.32 20.36C6.61 19.62 4.44 17.6 3.51 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  info: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
      <Path d="M12 8V8.01M12 11V16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  sun: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.5" />
      <Path d="M12 2V4M12 20V22M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M2 12H4M20 12H22M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  moon: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  ),
  lightbulb: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18H15M10 22H14M12 2C8.69 2 6 4.69 6 8C6 10.22 7.21 12.17 9 13.2V16H15V13.2C16.79 12.17 18 10.22 18 8C18 4.69 15.31 2 12 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  ),
  target: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
      <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.5" />
      <Circle cx="12" cy="12" r="2" fill={color} />
    </Svg>
  ),
  chart: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 3V21H21M7 16L11 10L14 14L17 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  grid: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" />
      <Rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" />
      <Rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" />
      <Rect x="14" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" />
    </Svg>
  ),
  search: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="1.5" />
      <Path d="M21 21L16.65 16.65" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  play: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 5L19 12L8 19V5Z" fill={color} />
    </Svg>
  ),
  drop: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L12 15M12 15L7 10M12 15L17 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 18H19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  sparkle: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} fillOpacity="0.2" />
      <Path d="M19 3L19.5 5L21 5.5L19.5 6L19 8L18.5 6L17 5.5L18.5 5L19 3Z" fill={color} />
    </Svg>
  ),
  construction: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 20L10 12M14 8L16 6L20 4L20 8L18 10M14 8L10 12M14 8L12 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M4 22H20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="7" cy="17" r="3" stroke={color} strokeWidth="1.5" />
    </Svg>
  ),
  history: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
      <Path d="M12 7V12L15 15M3 3L6 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  flag: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 15S5 14 8 14C11 14 13 16 16 16C19 16 20 15 20 15V3S19 4 16 4C13 4 11 2 8 2C5 2 4 3 4 3V21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  factory: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 20H22M2 20V10L8 14V10L14 14V4L22 10V20" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6 20V17H10V20M14 20V16H18V20" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  ),
  person: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.5" />
      <Path d="M4 21C4 17 7.58 14 12 14C16.42 14 20 17 20 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),

  // ── Additional icons ──────────────────────────
  balance: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3V21M3 8L12 5L21 8M3 8L6 16H3M21 8L18 16H21M6 16C6 16 4 16 4 14M18 16C18 16 20 16 20 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  waves: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 6C4 4 6 4 8 6C10 8 12 8 14 6C16 4 18 4 20 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M2 12C4 10 6 10 8 12C10 14 12 14 14 12C16 10 18 10 20 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M2 18C4 16 6 16 8 18C10 20 12 20 14 18C16 16 18 16 20 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  drop: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C12 2 5 10 5 15C5 18.87 8.13 22 12 22C15.87 22 19 18.87 19 15C19 10 12 2 12 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  ),
  construction: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14.7 6.3L21 12.6L19.2 14.4L12.9 8.1M2 22L9.3 14.7M12.6 11.4L7.5 6.3L10.2 3.6C11.4 2.4 13.3 2.4 14.5 3.6L14.7 3.8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M15 12L22 19L20 21L13 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  wrench: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14.7 6.3C14.3 4.3 12.5 2.8 10.4 3.1C8.1 3.4 6.4 5.5 6.7 7.8C6.9 9.2 7.8 10.3 9 10.9L3 17L5 19L11 13C11.7 13.2 12.5 13.2 13.2 13C15.5 12.4 16.9 10 16.3 7.7C16.2 7.2 15.9 6.7 15.5 6.3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  info: ({ size, color }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
      <Path d="M12 16V12M12 8H12.01" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
};

export default function Icon({ name, size = 24, color = '#fff', filled = false }) {
  const IconComp = iconMap[name];
  if (!IconComp) {
    // Fallback to a generic circle if icon not found
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" strokeDasharray="3 2" />
      </Svg>
    );
  }
  return <IconComp size={size} color={color} filled={filled} />;
}

// Named exports for convenience
export { iconMap };
