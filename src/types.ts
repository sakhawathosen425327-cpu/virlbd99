/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  embedUrl: string; // Google Drive iframe or stream link
  category: string; // slug or ID
  description?: string;
  views: number;
  duration?: string; // e.g. "1h 45m"
  rating?: string; // e.g. "PG-13", "18+"
  isTrending?: boolean;
  isLatest?: boolean;
  createdAt?: string; // ISO string
  tags?: string; // Comma separated tags e.g. "dance, viral, premium"
  likes?: number;
  dislikes?: number;
}

export interface VideoComment {
  id: string;
  videoId: string;
  name: string;
  comment: string;
  timestamp: string; // ISO string
  likes: number;
  replies?: VideoCommentReply[];
  isApproved: boolean;
  reported?: boolean;
}

export interface VideoCommentReply {
  id: string;
  name: string;
  comment: string;
  timestamp: string;
}

export interface WatchHistoryItem {
  id: string; // videoId
  watchedAt: number; // timestamp
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName?: string; // Lucide icon name mapping
}

export interface AdSettings {
  id: string;
  isEnabled: boolean;
  cpm: number; // CPM rate for simulated earnings e.g. 2.50 USD
  clicks: number;
  impressions: number;
  earnings: number;
  customScriptUrl?: string; // General Adsterra script URL or link
  popunderCode?: string;     // Script code block for Popunders
  directLinkUrl?: string;    // Direct Link Redirect URL
  banner320x50Code?: string; // HTML/Script code for Mobile sticky banner (320x50)
  banner300x250Code?: string;// HTML/Script for Medium Rectangle banner (300x250)
  banner728x90Code?: string; // HTML/Script for Leaderboard banner (728x90)
  popunderClickFrequency: number; // e.g. 1 (every click), 2 (every 2 clicks), 0 (disabled)
  popunderDelaySeconds: number;   // seconds to delay direct link opening on click
  popunderCooldownMinutes: number;// wait minutes before triggering next popunder per user
  telegramUrl?: string;      // Telegram channel URL
  facebookUrl?: string;      // Facebook page URL
  whatsappUrl?: string;      // WhatsApp channel URL
  
  // Custom video pre-roll settings
  preRollEnabled?: boolean;
  preRollCode?: string;      // HTML or script frame for video pre-roll ad
  preRollClickUrl?: string;  // Destination for pre-roll click
  preRollSkipDelay?: number; // skip count delta in seconds, default 5

  // ExoClick/Adsterra Social Bar settings
  socialBarEnabled?: boolean;
  socialBarCode?: string;    // Full HTML/JS code for Social Bar
  socialBarPosition?: "top" | "bottom";

  // Pop-under & Direct Link toggles
  popunderEnabled?: boolean;
  directLinkEnabled?: boolean;
  directLinkIntervalMinutes?: number;

  // Granular placement triggers
  bannerHomeTopEnabled?: boolean;
  bannerHomeTopCode?: string;
  bannerHomeMiddleEnabled?: boolean;
  bannerHomeMiddleCode?: string;
  bannerVideoTopEnabled?: boolean;
  bannerVideoTopCode?: string;
  bannerVideoUnderPlayerEnabled?: boolean;
  bannerVideoUnderPlayerCode?: string;
  bannerSidebarEnabled?: boolean;
  bannerSidebarCode?: string;
  bannerMobileBottomEnabled?: boolean;
  bannerMobileBottomCode?: string;
}

export interface DailyAdStats {
  id: string; // format: "YYYY-MM-DD"
  preRollShown: number;
  preRollSkipped: number;
  directLinkFired: number;
}

export enum ViewTab {
  HOME = "home",
  CATEGORIES = "categories",
  ADMIN = "admin",
  ADS = "ads",
  BOOKMARKS = "bookmarks"
}

export interface AdminSecurity {
  id: string;
  password?: string;
  failedAttempts: number;
  blockedUntil: string; // ISO string
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string; // ISO string
  details: string;
}
