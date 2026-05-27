/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps } from "firebase/app";
import { 
  initializeFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocFromServer,
  query,
  orderBy,
  limit
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Video, Category, AdSettings, AdminSecurity, ActivityLog, DailyAdStats, VideoComment, VideoCommentReply } from "../types";
import firebaseConfig from "../../firebase-applet-config.json";

// Dynamic configuration check to protect against missing credentials or bootstrap placeholders
const isFirebaseConfigured = 
  firebaseConfig && 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "MISSING" && 
  firebaseConfig.projectId !== "";

let app: any = null;
let db: any = null;
let auth: any = null;

if (isFirebaseConfigured) {
  try {
    const existingApps = getApps();
    app = existingApps.length === 0 ? initializeApp(firebaseConfig) : existingApps[0];
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);
  } catch (error) {
    console.error("Firebase Initialization Error:", error);
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

// Hardened error handler formatted exactly to conform to guidelines
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Comprehensive Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------------------------------------------
// HIGH-FIDELITY SAMPLE SEED DATA
// ----------------------------------------------------

// ----------------------------------------------------
// HIGH-FIDELITY SAMPLE SEED DATA (CLEAN STREAMING REELS)
// ----------------------------------------------------

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "latest", name: "Latest", slug: "latest", iconName: "Clock" },
  { id: "trending", name: "Trending", slug: "trending", iconName: "Flame" },
  { id: "viral", name: "Viral", slug: "viral", iconName: "Sparkles" },
  { id: "premium", name: "Premium", slug: "premium", iconName: "Award" },
  { id: "asian", name: "Asian", slug: "asian", iconName: "Globe" },
  { id: "short-clips", name: "Short Clips", slug: "short-clips", iconName: "Video" },
  { id: "exclusive", name: "Exclusive", slug: "exclusive", iconName: "ShieldAlert" },
  { id: "hd-videos", name: "HD Videos", slug: "hd-videos", iconName: "Tv" }
];

export const DEFAULT_VIDEOS: Video[] = [
  {
    id: "v1",
    title: "Viral BD Dance Performance Highlight",
    description: "Featured direct stream. High-fidelity buffer from premium cloud network.",
    thumbnailUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=600",
    embedUrl: "https://drive.google.com/file/d/1_V4EPrM6aXkZlC_Jp-q61GgP8oE-p18V/view",
    category: "viral",
    duration: "4m 20s",
    rating: "18+",
    views: 145200,
    isTrending: true,
    isLatest: true
  },
  {
    id: "v2",
    title: "Premium Asian Short Clip Highlight",
    description: "Exclusive asian category video. High-definition playback enabled directly in frame.",
    thumbnailUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600",
    embedUrl: "https://drive.google.com/file/d/1_V4EPrM6aXkZlC_Jp-q61GgP8oE-p18V/view",
    category: "asian",
    duration: "3m 45s",
    rating: "18+",
    views: 89400,
    isTrending: true,
    isLatest: false
  },
  {
    id: "v3",
    title: "Exclusive Premium Studio Preview",
    description: "Members-only showcase video preview. Streaming from standard GDrive backup links with instant bypass parameters.",
    thumbnailUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=600",
    embedUrl: "https://drive.google.com/file/d/1_V4EPrM6aXkZlC_Jp-q61GgP8oE-p18V/view",
    category: "exclusive",
    duration: "5m 12s",
    rating: "18+",
    views: 231400,
    isTrending: false,
    isLatest: true
  },
  {
    id: "v4",
    title: "Trending HD Reel Viral Collection",
    description: "High definition clips compiled for optimized bandwidth. Direct view to preview active conversion.",
    thumbnailUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600",
    embedUrl: "https://drive.google.com/file/d/1_V4EPrM6aXkZlC_Jp-q61GgP8oE-p18V/view",
    category: "hd-videos",
    duration: "8m 05s",
    rating: "18+",
    views: 412500,
    isTrending: true,
    isLatest: true
  }
];

export const DEFAULT_AD_SETTINGS: AdSettings = {
  id: "global",
  isEnabled: true,
  cpm: 4.50,
  clicks: 0,
  impressions: 0,
  earnings: 0,
  customScriptUrl: "",
  popunderCode: "",
  directLinkUrl: "",
  banner320x50Code: "",
  banner300x250Code: "",
  banner728x90Code: "",
  popunderClickFrequency: 2, // Every 2 clicks - user experience friendly!
  popunderDelaySeconds: 0,   // Instant trigger delay
  popunderCooldownMinutes: 3, // Cooldown minutes to prevent spamming popunders
  telegramUrl: "https://t.me/viralbd99",
  facebookUrl: "https://facebook.com/viralbd99",
  whatsappUrl: "https://whatsapp.com/channel/viralbd99",

  // Default pre-roll values
  preRollEnabled: false,
  preRollCode: `<div style="text-align:center; padding: 20px; font-family: sans-serif;">
    <h3 style="color:#f5c518; margin-bottom: 10px;">ভিডিও বিজ্ঞাপনটি দেখুন</h3>
    <p style="color:#aaa; font-size: 13px;">নিচের বাটনটি ৫ সেকেন্ড পর সক্রিয় হবে।</p>
  </div>`,
  preRollClickUrl: "https://www.google.com",
  preRollSkipDelay: 5,

  // Default social bar values
  socialBarEnabled: false,
  socialBarCode: `<!-- ExoClick/Adsterra Social Bar Ad Script Code -->`,
  socialBarPosition: "bottom",

  // Toggles and intervals
  popunderEnabled: false,
  directLinkEnabled: false,
  directLinkIntervalMinutes: 5,

  // Granular placement toggles
  bannerHomeTopEnabled: false,
  bannerHomeMiddleEnabled: false,
  bannerVideoTopEnabled: false,
  bannerVideoTopCode: "",
  bannerVideoUnderPlayerEnabled: false,
  bannerSidebarEnabled: false,
  bannerMobileBottomEnabled: false
};

// ----------------------------------------------------
// PERSISTENT DATA LAYER FUNCTIONS
// ----------------------------------------------------

export async function testConnection(): Promise<boolean> {
  const path = "test/connection";
  if (!isFirebaseConfigured || !db) return false;
  try {
    const ref = doc(db, "test", "connection");
    await getDocFromServer(ref);
    return true;
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration: Client is offline.");
    }
    return false;
  }
}

// Low-latency local storage initializers
function getLocalStorageData<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("LocalStorage JSON parse failed:", e);
  }
  // If not in localStorage, write default
  localStorage.setItem(key, JSON.stringify(defaultValue));
  return defaultValue;
}

function setLocalStorageData<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("LocalStorage write failed:", e);
  }
}

// Unified APIs feeding into both LocalStorage + Cloud Firestore (if configured)
export async function getVideos(): Promise<Video[]> {
  const path = "videos";
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, path));
      const list: Video[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as Video);
      });
      if (list.length > 0) {
        // Dynamically sort videos: newest first
        list.sort((a, b) => {
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          return (dateB as any) - (dateA as any);
        });
        // Sync back to local storage for instant offline retrieval
        setLocalStorageData("cineflex_v2_videos", list);
        return list;
      }
    } catch (e) {
      console.warn("Firestore fetch videos failed. Falling back to LocalStorage.", e);
    }
  }
  const localList = getLocalStorageData<Video[]>("cineflex_v2_videos", DEFAULT_VIDEOS);
  localList.sort((a, b) => {
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
    return (dateB as any) - (dateA as any);
  });
  return localList;
}

export async function addVideo(video: Video): Promise<void> {
  const path = `videos/${video.id}`;
  // Ensure createdAt timestamp is populated to maintain proper latest ordering
  if (!video.createdAt) {
    video.createdAt = new Date().toISOString();
  }
  
  // 1. Write locally
  const current = await getVideos();
  const updated = [video, ...current.filter(v => v.id !== video.id)];
  setLocalStorageData("cineflex_v2_videos", updated);

  // 2. Sync to cloud
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "videos", video.id), video);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
}

// Export saveVideo alias to guarantee compliance with all save video requests
export const saveVideo = addVideo;

export async function updateVideo(id: string, fields: Partial<Video>): Promise<void> {
  const path = `videos/${id}`;
  // 1. Write locally
  const current = await getVideos();
  const updated = current.map(v => v.id === id ? { ...v, ...fields } : v);
  setLocalStorageData("cineflex_v2_videos", updated);

  // 2. Sync to cloud
  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, "videos", id);
      await updateDoc(ref, fields);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
}

export async function deleteVideo(id: string): Promise<void> {
  const path = `videos/${id}`;
  // 1. Write locally
  const current = await getVideos();
  const updated = current.filter(v => v.id !== id);
  setLocalStorageData("cineflex_v2_videos", updated);

  // 2. Sync to cloud
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "videos", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
}

export async function getCategories(): Promise<Category[]> {
  const path = "categories";
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, path));
      const list: Category[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as Category);
      });
      if (list.length > 0) {
        setLocalStorageData("cineflex_v2_categories", list);
        return list;
      }
    } catch (e) {
      console.warn("Firestore fetch categories failed. Falling back to LocalStorage.", e);
    }
  }
  return getLocalStorageData<Category[]>("cineflex_v2_categories", DEFAULT_CATEGORIES);
}

export async function addCategory(category: Category): Promise<void> {
  const path = `categories/${category.id}`;
  // 1. Write locally
  const current = await getCategories();
  const updated = [...current.filter(c => c.id !== category.id), category];
  setLocalStorageData("cineflex_v2_categories", updated);

  // 2. Sync to cloud
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "categories", category.id), category);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
}

export async function getAdSettings(): Promise<AdSettings> {
  const path = "adSettings/global";
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, "adSettings"));
      let found: AdSettings | null = null;
      snap.forEach((docSnap) => {
        if (docSnap.id === "global") {
          found = docSnap.data() as AdSettings;
        }
      });
      if (found) {
        setLocalStorageData("cineflex_v2_ad_settings", found);
        return found;
      }
    } catch (e) {
      console.warn("Firestore fetch ad settings failed. Falling back to LocalStorage.", e);
    }
  }
  return getLocalStorageData<AdSettings>("cineflex_v2_ad_settings", DEFAULT_AD_SETTINGS);
}

export async function updateAdSettings(settings: AdSettings): Promise<void> {
  const path = "adSettings/global";
  // 1. Write locally
  setLocalStorageData("cineflex_v2_ad_settings", settings);

  // 2. Sync to cloud
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "adSettings", "global"), settings);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

// Method to reset database back to initial pristine seed values
export async function resetToSeedData(): Promise<void> {
  setLocalStorageData("cineflex_v2_videos", DEFAULT_VIDEOS);
  setLocalStorageData("cineflex_v2_categories", DEFAULT_CATEGORIES);
  setLocalStorageData("cineflex_v2_ad_settings", DEFAULT_AD_SETTINGS);

  if (isFirebaseConfigured && db) {
    try {
      // Clear or overwrite
      for (const item of DEFAULT_VIDEOS) {
        await setDoc(doc(db, "videos", item.id), item);
      }
      for (const cat of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, "categories", cat.id), cat);
      }
      await setDoc(doc(db, "adSettings", "global"), DEFAULT_AD_SETTINGS);
    } catch (e) {
      console.error("Firebase bulk reset failed:", e);
    }
  }
}

// ----------------------------------------------------
// ADMIN SECURITY & RECONCILIATION API
// ----------------------------------------------------

export const DEFAULT_ADMIN_SECURITY: AdminSecurity = {
  id: "config",
  password: "viralbd99admin",
  failedAttempts: 0,
  blockedUntil: ""
};

export async function getAdminSecurity(): Promise<AdminSecurity> {
  const path = "adminSecurity/config";
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "adminSecurity", "config");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as AdminSecurity;
        setLocalStorageData("viralbd99_admin_security", data);
        return data;
      } else {
        // Document doesn't exist yet, seed it!
        await setDoc(docRef, DEFAULT_ADMIN_SECURITY);
        setLocalStorageData("viralbd99_admin_security", DEFAULT_ADMIN_SECURITY);
        return DEFAULT_ADMIN_SECURITY;
      }
    } catch (e) {
      console.warn("Firestore fetch admin security failed:", e);
    }
  }
  return getLocalStorageData<AdminSecurity>("viralbd99_admin_security", DEFAULT_ADMIN_SECURITY);
}

export async function updateAdminSecurity(fields: Partial<AdminSecurity>): Promise<void> {
  const path = "adminSecurity/config";
  // Sync locally
  const current = await getAdminSecurity();
  const updated = { ...current, ...fields };
  setLocalStorageData("viralbd99_admin_security", updated);

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "adminSecurity", "config");
      await setDoc(docRef, updated); // Use setDoc so it works even if it doesn't exist
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

export async function addActivityLog(action: string, details: string): Promise<void> {
  const logId = "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  const path = `activityLogs/${logId}`;
  const newLog: ActivityLog = {
    id: logId,
    action,
    timestamp: new Date().toISOString(),
    details
  };

  // 1. Log locally
  const current = getLocalStorageData<ActivityLog[]>("viralbd99_activity_logs", []);
  const updated = [newLog, ...current].slice(0, 100); // keep last 100 locally
  setLocalStorageData("viralbd99_activity_logs", updated);

  // 2. Sync to Firestore
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "activityLogs", logId), newLog);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  const path = "activityLogs";
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "activityLogs"), orderBy("timestamp", "desc"), limit(50));
      const snap = await getDocs(q);
      const list: ActivityLog[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as ActivityLog);
      });
      if (list.length > 0) {
        setLocalStorageData("viralbd99_activity_logs", list);
        return list;
      }
    } catch (e) {
      console.warn("Firestore fetch activity logs failed:", e);
    }
  }
  return getLocalStorageData<ActivityLog[]>("viralbd99_activity_logs", []).slice(0, 50);
}

// ----------------------------------------------------
// DAILY AD STATISTICS TRACKING APIs
// ----------------------------------------------------

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getDailyAdStats(dateStr?: string): Promise<DailyAdStats> {
  const targetDate = dateStr || getTodayDateString();
  const localKey = `viralbd99_ad_stats_${targetDate}`;
  const defaultStats: DailyAdStats = {
    id: targetDate,
    preRollShown: 0,
    preRollSkipped: 0,
    directLinkFired: 0,
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "adDailyStats", targetDate);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as DailyAdStats;
        setLocalStorageData(localKey, data);
        return data;
      } else {
        // initialize in firebase
        await setDoc(docRef, defaultStats);
        setLocalStorageData(localKey, defaultStats);
        return defaultStats;
      }
    } catch (e) {
      console.warn("Firestore fetch daily stats failed, fallback to local storage:", e);
    }
  }

  return getLocalStorageData<DailyAdStats>(localKey, defaultStats);
}

export async function incrementDailyAdStat(type: "preRollShown" | "preRollSkipped" | "directLinkFired"): Promise<void> {
  const targetDate = getTodayDateString();
  const localKey = `viralbd99_ad_stats_${targetDate}`;
  const current = await getDailyAdStats(targetDate);
  
  current[type] = (current[type] || 0) + 1;
  setLocalStorageData(localKey, current);

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "adDailyStats", targetDate);
      await setDoc(docRef, current);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `adDailyStats/${targetDate}`);
    }
  }
}

// ----------------------------------------------------
// VIDEO COMMENTS PERSISTENCE
// ----------------------------------------------------

export async function getComments(videoId: string): Promise<VideoComment[]> {
  const localKey = `viralbd99_comments_${videoId}`;
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, "comments"));
      const list: VideoComment[] = [];
      snap.forEach((docSnap) => {
        const c = docSnap.data() as VideoComment;
        if (c.videoId === videoId && c.isApproved) {
          list.push(c);
        }
      });
      // Sort by timestamp descending
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLocalStorageData(localKey, list);
      return list;
    } catch (e) {
      console.warn("Firestore fetch comments failed. Falling back to LocalStorage.", e);
    }
  }
  return getLocalStorageData<VideoComment[]>(localKey, []);
}

export async function addComment(comment: VideoComment): Promise<void> {
  const localKey = `viralbd99_comments_${comment.videoId}`;
  // 1. Write locally
  const current = getLocalStorageData<VideoComment[]>(localKey, []);
  const updated = [comment, ...current];
  setLocalStorageData(localKey, updated);

  // 2. Sync to cloud
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "comments", comment.id), comment);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `comments/${comment.id}`);
    }
  }
}

export async function updateComment(commentId: string, fields: Partial<VideoComment>): Promise<void> {
  // Sync to cloud
  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, "comments", commentId);
      await updateDoc(ref, fields);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `comments/${commentId}`);
    }
  }

  // Sync locally
  // We can scan and update cache where applicable, or let the next fetch handle it.
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith("viralbd99_comments_")) {
        const comments = getLocalStorageData<VideoComment[]>(key, []);
        const exists = comments.some(c => c.id === commentId);
        if (exists) {
          const updated = comments.map(c => c.id === commentId ? { ...c, ...fields } : c);
          setLocalStorageData(key, updated);
        }
      }
    }
  } catch (e) {
    console.error("Local comments update error:", e);
  }
}

export async function getUnapprovedComments(): Promise<VideoComment[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, "comments"));
      const list: VideoComment[] = [];
      snap.forEach((docSnap) => {
        const c = docSnap.data() as VideoComment;
        if (!c.isApproved) {
          list.push(c);
        }
      });
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return list;
    } catch (e) {
      console.warn("Firestore fetch unapproved comments failed.", e);
    }
  }
  // Fallback scan local storage for any unapproved comments
  const list: VideoComment[] = [];
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith("viralbd99_comments_")) {
        const comments = getLocalStorageData<VideoComment[]>(key, []);
        comments.forEach(c => {
          if (!c.isApproved) {
            list.push(c);
          }
        });
      }
    }
  } catch (e) {}
  return list;
}

export async function deleteComment(commentId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "comments", commentId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `comments/${commentId}`);
    }
  }

  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith("viralbd99_comments_")) {
        const comments = getLocalStorageData<VideoComment[]>(key, []);
        const exists = comments.some(c => c.id === commentId);
        if (exists) {
          const updated = comments.filter(c => c.id !== commentId);
          setLocalStorageData(key, updated);
        }
      }
    }
  } catch (e) {}
}


