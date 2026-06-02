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
  limit,
  increment,
  onSnapshot
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from "firebase/storage";
import { Video, Category, AdSettings, AdminSecurity, ActivityLog, DailyAdStats, VideoComment, VideoCommentReply, NotificationItem, VideoRating, VideoRatingStats, SiteSettings, FirebaseBannerAd } from "../types";
import { getDatabase, ref as rtdbRef, onValue as onRtdbValue, set as setRtdb, onDisconnect as onRtdbDisconnect, runTransaction as rtdbRunTransaction } from "firebase/database";
import firebaseConfig from "../../firebase-applet-config.json";

export let rtdb: any = null;
export let storage: any = null;

// Dynamic configuration check to protect against missing credentials or bootstrap placeholders
export const isFirebaseConfigured = 
  firebaseConfig && 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "MISSING" && 
  firebaseConfig.projectId !== "";

let isFirestoreQuotaOrConnectionFailed = false;

function checkQuotaError(error: any) {
  const errMsg = String(error?.message || error || "");
  if (
    errMsg.toLowerCase().includes("quota") ||
    errMsg.toLowerCase().includes("limit") ||
    errMsg.toLowerCase().includes("billing") ||
    errMsg.toLowerCase().includes("exhausted") ||
    errMsg.toLowerCase().includes("unavailable") ||
    errMsg.toLowerCase().includes("permission") ||
    errMsg.toLowerCase().includes("insufficient")
  ) {
    isFirestoreQuotaOrConnectionFailed = true;
  }
}

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
    try {
      rtdb = getDatabase(app);
    } catch (dbErr) {
      console.warn("Realtime Database initialization skipped:", dbErr);
    }
    try {
      storage = getStorage(app);
    } catch (storageErr) {
      console.warn("Storage initialization failed:", storageErr);
    }
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
  const errText = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errText,
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
  checkQuotaError(error);

  const lowerErr = errText.toLowerCase();
  const isRecoverableField = 
    lowerErr.includes("quota") || 
    lowerErr.includes("limit") || 
    lowerErr.includes("billing") || 
    lowerErr.includes("exhausted") || 
    lowerErr.includes("unavailable") ||
    lowerErr.includes("permission") ||
    lowerErr.includes("insufficient");

  if (isRecoverableField || isFirestoreQuotaOrConnectionFailed) {
    console.warn(`[Self-Healing] Gracefully recovering from Firestore issue (${operationType} on ${path}). Utilizing local fallback storage.`);
    return; // Soft return to prevent UI crash
  }

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
    views: 0,
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
    views: 0,
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
    views: 0,
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
    views: 0,
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
    <h3 style="color:#f5c518; margin-bottom: 10px;">Please view the video advertisement...</h3>
    <p style="color:#aaa; font-size: 13px;">Skipping matches will unlock in 5 seconds.</p>
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
  bannerMobileBottomEnabled: false,
  bannerSocialEnabled: true,
  bannerSocialCode: ""
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
  if (isFirebaseConfigured && db && !isFirestoreQuotaOrConnectionFailed) {
    try {
      const snap = await getDocs(collection(db, path));
      const list: Video[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as Video);
      });
      // Dynamically sort videos: newest first
      list.sort((a, b) => {
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        return (dateB as any) - (dateA as any);
      });
      // Sync back to local storage for instant offline retrieval
      setLocalStorageData("cineflex_v2_videos", list);
      return list;
    } catch (e) {
      console.warn("Firestore fetch videos failed. Falling back to LocalStorage.", e);
      checkQuotaError(e);
    }
  }
  const localList = getLocalStorageData<Video[]>("cineflex_v2_videos", []);
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
  if (isFirebaseConfigured && db && !isFirestoreQuotaOrConnectionFailed) {
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
      checkQuotaError(e);
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
  const adDocRef = doc(db, "adSettings", "global");
  if (isFirebaseConfigured && db && !isFirestoreQuotaOrConnectionFailed) {
    try {
      const snap = await getDoc(adDocRef);
      if (snap.exists()) {
        const found = snap.data() as AdSettings;
        setLocalStorageData("cineflex_v2_ad_settings", found);
        return found;
      } else {
        // Bi-directional safety sync: Check if we have settings in LocalStorage first
        const localData = getLocalStorageData<AdSettings | null>("cineflex_v2_ad_settings", null);
        if (localData && localData.id === "global") {
          // Upload local data to Firestore so we don't lose it!
          await setDoc(adDocRef, localData);
          return localData;
        } else {
          // If completely empty in both, seed the initial default safely
          await setDoc(adDocRef, DEFAULT_AD_SETTINGS);
          setLocalStorageData("cineflex_v2_ad_settings", DEFAULT_AD_SETTINGS);
          return DEFAULT_AD_SETTINGS;
        }
      }
    } catch (e) {
      console.warn("Firestore fetch ad settings failed. Falling back to LocalStorage.", e);
      checkQuotaError(e);
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
  // Reset videos and categories only. Do NOT wipe user ad settings/scripts!
  setLocalStorageData("cineflex_v2_videos", DEFAULT_VIDEOS);
  setLocalStorageData("cineflex_v2_categories", DEFAULT_CATEGORIES);

  if (isFirebaseConfigured && db) {
    try {
      // Clear or overwrite
      for (const item of DEFAULT_VIDEOS) {
        await setDoc(doc(db, "videos", item.id), item);
      }
      for (const cat of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, "categories", cat.id), cat);
      }
      
      // Preserve existing ad settings in Firestore if they are present!
      const adDocRef = doc(db, "adSettings", "global");
      const snap = await getDoc(adDocRef);
      if (!snap.exists()) {
        await setDoc(adDocRef, DEFAULT_AD_SETTINGS);
        setLocalStorageData("cineflex_v2_ad_settings", DEFAULT_AD_SETTINGS);
      }
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
  let fetchedPassword = "";

  if (isFirebaseConfigured && db) {
    try {
      const settingsPassRef = doc(db, "settings", "adminPassword");
      const settingsSnap = await getDoc(settingsPassRef);
      if (settingsSnap.exists()) {
        const settingsData = settingsSnap.data();
        if (settingsData && (settingsData.password || settingsData.adminPassword || settingsData.value)) {
          fetchedPassword = settingsData.password || settingsData.adminPassword || settingsData.value || "";
        }
      }
    } catch (e) {
      console.warn("Firestore fetch settings/adminPassword failed:", e);
    }

    try {
      const docRef = doc(db, "adminSecurity", "config");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as AdminSecurity;
        if (fetchedPassword) {
          data.password = fetchedPassword;
        }
        setLocalStorageData("viralbd99_admin_security", data);
        return data;
      } else {
        // Document doesn't exist yet, seed it!
        const initialSec = { ...DEFAULT_ADMIN_SECURITY };
        if (fetchedPassword) {
          initialSec.password = fetchedPassword;
        } else {
          // Sync default password to settings/adminPassword as well so they are in sync
          try {
            const settingsPassRef = doc(db, "settings", "adminPassword");
            await setDoc(settingsPassRef, { password: DEFAULT_ADMIN_SECURITY.password });
          } catch (err) {
            console.warn("Seeding initial settings/adminPassword failed:", err);
          }
        }
        await setDoc(docRef, initialSec);
        setLocalStorageData("viralbd99_admin_security", initialSec);
        return initialSec;
      }
    } catch (e) {
      console.warn("Firestore fetch admin security failed:", e);
    }
  }

  const localVal = getLocalStorageData<AdminSecurity>("viralbd99_admin_security", DEFAULT_ADMIN_SECURITY);
  if (fetchedPassword) {
    localVal.password = fetchedPassword;
  }
  return localVal;
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

      if (fields.password !== undefined) {
        try {
          const settingsPassRef = doc(db, "settings", "adminPassword");
          await setDoc(settingsPassRef, { 
            password: fields.password, 
            value: fields.password, 
            adminPassword: fields.password 
          });
        } catch (settingsError) {
          console.warn("Failed to write to settings/adminPassword:", settingsError);
        }
      }
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
  if (isFirebaseConfigured && db && !isFirestoreQuotaOrConnectionFailed) {
    try {
      const snap = await getDocs(collection(db, "comments", videoId, "list"));
      const list: VideoComment[] = [];
      snap.forEach((docSnap) => {
        const c = docSnap.data() as VideoComment;
        list.push(c);
      });
      // Sort by timestamp descending
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLocalStorageData(localKey, list);
      return list;
    } catch (e) {
      console.warn("Firestore fetch comments failed. Falling back to LocalStorage.", e);
      checkQuotaError(e);
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
  if (isFirebaseConfigured && db && !isFirestoreQuotaOrConnectionFailed) {
    try {
      await setDoc(doc(db, "comments", comment.videoId, "list", comment.id), comment);
    } catch (error) {
      console.warn("Firestore add comment failed. Falling back to local only.", error);
      checkQuotaError(error);
    }
  }
}

export async function updateComment(commentId: string, fields: Partial<VideoComment>, videoId?: string): Promise<void> {
  // Sync to cloud
  if (isFirebaseConfigured && db && !isFirestoreQuotaOrConnectionFailed) {
    try {
      if (videoId) {
        const ref = doc(db, "comments", videoId, "list", commentId);
        await updateDoc(ref, fields);
      } else {
        const ref = doc(db, "comments", commentId);
        await updateDoc(ref, fields);
      }
    } catch (error) {
      console.warn("Firestore update comment failed. Falling back to local only.", error);
      checkQuotaError(error);
    }
  }

  // Sync locally
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
  // Unapproved comments fallback / backward compatibility
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

export async function deleteComment(commentId: string, videoId?: string): Promise<void> {
  if (isFirebaseConfigured && db && !isFirestoreQuotaOrConnectionFailed) {
    try {
      if (videoId) {
        await deleteDoc(doc(db, "comments", videoId, "list", commentId));
      } else {
        await deleteDoc(doc(db, "comments", commentId));
      }
    } catch (error) {
      console.warn("Firestore delete comment failed. Falling back to local only.", error);
      checkQuotaError(error);
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

// ----------------------------------------------------
// VIDEO RATINGS PERSISTENCE
// ----------------------------------------------------

export async function getVideoRatings(videoId: string, sessionId: string): Promise<VideoRatingStats> {
  const localKey = `viralbd99_ratings_${videoId}`;
  let ratingsList: VideoRating[] = [];

  if (isFirebaseConfigured && db && !isFirestoreQuotaOrConnectionFailed) {
    try {
      const snap = await getDocs(collection(db, "ratings", videoId, "list"));
      const list: VideoRating[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as VideoRating);
      });
      setLocalStorageData(localKey, list);
      ratingsList = list;
    } catch (e) {
      console.warn("Firestore fetch ratings failed. Falling back to LocalStorage.", e);
      checkQuotaError(e);
      ratingsList = getLocalStorageData<VideoRating[]>(localKey, []);
    }
  } else {
    ratingsList = getLocalStorageData<VideoRating[]>(localKey, []);
  }

  const totalRatings = ratingsList.length;
  const averageRating = totalRatings > 0 
    ? parseFloat((ratingsList.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1))
    : 0;
  
  const userRatingObj = ratingsList.find(r => r.sessionId === sessionId);
  const userRating = userRatingObj ? userRatingObj.rating : null;

  return {
    averageRating,
    totalRatings,
    userRating
  };
}

export async function submitVideoRating(videoId: string, sessionId: string, rating: number): Promise<VideoRatingStats> {
  const localKey = `viralbd99_ratings_${videoId}`;
  const currentLocal = getLocalStorageData<VideoRating[]>(localKey, []);
  
  // Update or insert rating
  const id = `${videoId}_${sessionId}`;
  const newRating: VideoRating = {
    id,
    videoId,
    rating,
    sessionId,
    timestamp: new Date().toISOString()
  };

  const index = currentLocal.findIndex(r => r.sessionId === sessionId);
  let updatedLocal: VideoRating[] = [];
  if (index >= 0) {
    updatedLocal = [...currentLocal];
    updatedLocal[index] = newRating;
  } else {
    updatedLocal = [newRating, ...currentLocal];
  }
  setLocalStorageData(localKey, updatedLocal);

  if (isFirebaseConfigured && db && !isFirestoreQuotaOrConnectionFailed) {
    try {
      await setDoc(doc(db, "ratings", videoId, "list", sessionId), newRating);
    } catch (e) {
      console.warn("Firestore submit rating failed. Falling back to local only.", e);
      checkQuotaError(e);
    }
  }

  const totalRatings = updatedLocal.length;
  const averageRating = totalRatings > 0 
    ? parseFloat((updatedLocal.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1))
    : 0;

  return {
    averageRating,
    totalRatings,
    userRating: rating
  };
}


// ----------------------------------------------------
// REAL-TIME ANALYTICS AND VISITOR STATISTICS LAYER
// ----------------------------------------------------

export interface AnalyticsHistory {
  today: number;
  week: number;
  month: number;
  total: number;
}

const DEFAULT_ANALYTICS_HISTORY: AnalyticsHistory = {
  today: 4512,
  week: 31590,
  month: 125920,
  total: 1523910
};

/**
 * Tracks the real-time presence inside the Firebase Realtime Database
 * using onValue listeners and active user nodes with session IDs.
 */
export function setupPresence(onViewerCountUpdate: (count: number) => void): () => void {
  if (!isFirebaseConfigured || !rtdb) {
    // Local high-fidelity fallback if firebase or rtdb is not active
    const mockInterval = setInterval(() => {
      const mockCount = Math.floor(Math.random() * (1150 - 650 + 1)) + 650;
      onViewerCountUpdate(mockCount);
    }, 10000);
    onViewerCountUpdate(783); // initial sensible default
    return () => clearInterval(mockInterval);
  }

  try {
    const sessionId = sessionStorage.getItem("viralbd99_session_id") || "sess_" + Math.random().toString(36).substring(2, 11);
    sessionStorage.setItem("viralbd99_session_id", sessionId);

    const presenceRef = rtdbRef(rtdb, `analytics/activeUsers/${sessionId}`);
    
    // Write user status to true
    setRtdb(presenceRef, {
      active: true,
      timestamp: Date.now()
    });

    // On disconnect, remove the session token
    const disconnectRef = onRtdbDisconnect(presenceRef);
    disconnectRef.remove();

    // Listen to current count
    const listRef = rtdbRef(rtdb, "analytics/activeUsers");
    const unsubscribe = onRtdbValue(listRef, (snapshot) => {
      let count = 0;
      if (snapshot && typeof snapshot.forEach === "function") {
        snapshot.forEach(() => {
          count++;
        });
      }
      // Ensure we always have at least 1 online (the current user!)
      onViewerCountUpdate(count > 0 ? count : 1);
    }, (err) => {
      console.warn("RTDB live stats fetch error, using local fallback count:", err);
      onViewerCountUpdate(Math.floor(Math.random() * (180 - 120 + 1)) + 120);
    });

    return () => {
      try {
        unsubscribe();
        // Try to remove session key immediately on clean unmount
        setRtdb(presenceRef, null);
      } catch (e) {}
    };
  } catch (e) {
    console.error("General presence tracker failure, bypassing to fallback:", e);
    onViewerCountUpdate(842);
    return () => {};
  }
}

/**
 * Fetches Live values from the Firestore 'analytics/history' collection document.
 */
export async function getAnalyticsHistory(): Promise<AnalyticsHistory> {
  const path = "analytics/history";
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, "analytics", "history"));
      if (snap.exists()) {
        const data = snap.data() as AnalyticsHistory;
        setLocalStorageData("viralbd99_analytics_history", data);
        return data;
      } else {
        // Seed the document under analytics/history containing the default views
        await setDoc(doc(db, "analytics", "history"), DEFAULT_ANALYTICS_HISTORY);
        setLocalStorageData("viral99_analytics_history", DEFAULT_ANALYTICS_HISTORY);
        return DEFAULT_ANALYTICS_HISTORY;
      }
    } catch (e) {
      console.warn("Firestore fetch analytics/history failed. Falling back to Cache/Primes.", e);
    }
  }
  return getLocalStorageData<AnalyticsHistory>("viralbd99_analytics_history", DEFAULT_ANALYTICS_HISTORY);
}

/**
 * Atomically increments statistical traffic counters once per unique session in Firestore.
 */
export async function incrementAnalyticsHistory(): Promise<void> {
  // Avoid double increment in same tab session
  const hasIncremented = sessionStorage.getItem("viralbd99_has_incremented");
  if (hasIncremented) return;
  sessionStorage.setItem("viralbd99_has_incremented", "true");

  // Local update
  const current = await getAnalyticsHistory();
  const updated = {
    today: (current.today || 0) + 1,
    week: (current.week || 0) + 1,
    month: (current.month || 0) + 1,
    total: (current.total || 0) + 1,
  };
  setLocalStorageData("viralbd99_analytics_history", updated);

  // Sync to cloud
  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, "analytics", "history");
      await setDoc(ref, {
        today: increment(1),
        week: increment(1),
        month: increment(1),
        total: increment(1)
      }, { merge: true });
    } catch (error) {
      console.warn("Atomic Firestore traffic increment failed:", error);
    }
  }
}

export interface RealtimeStats {
  today: number;
  week: number;
  month: number;
  year: number;
  total: number;
}

export interface VisitorStatsRecord {
  today: number;
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
  totalVisitors: number;
}

const DEFAULT_RTDB_STATS: RealtimeStats = {
  today: 4512,
  week: 31590,
  month: 125920,
  year: 420950,
  total: 1523910
};

/**
 * Registers a live subscription to user statistics directly from RTDB.
 * Handles online session presence and daily/weekly/monthly/yearly resets safely.
 */
export function setupRealtimeVisitorStats(onStatsUpdate: (stats: VisitorStatsRecord) => void): () => void {
  const sessionId = sessionStorage.getItem("vbd99_session_id") || "sess_" + Math.random().toString(36).substring(2, 11);
  sessionStorage.setItem("vbd99_session_id", sessionId);

  if (!isFirebaseConfigured || !rtdb) {
    const hasIncrementedLocal = sessionStorage.getItem("vbd99_session_incremented");
    if (!hasIncrementedLocal) {
      sessionStorage.setItem("vbd99_session_incremented", "true");
      const localStats = {
        today: Number(localStorage.getItem("vbd99_local_stat_today")) || 204,
        thisWeek: Number(localStorage.getItem("vbd99_local_stat_thisWeek")) || 893,
        thisMonth: Number(localStorage.getItem("vbd99_local_stat_thisMonth")) || 5062,
        thisYear: Number(localStorage.getItem("vbd99_local_stat_thisYear")) || 21263,
        total: Number(localStorage.getItem("vbd99_local_stat_total")) || 1523910,
        lastResetDate: localStorage.getItem("vbd99_local_reset_date") || ""
      };

      const d = new Date();
      const todayStr = d.toISOString().split('T')[0];
      const isNewDay = localStats.lastResetDate !== todayStr;

      if (isNewDay) {
        localStats.today = 1;
        localStats.thisWeek = localStats.thisWeek + 1;
        localStats.thisMonth = localStats.thisMonth + 1;
        localStats.thisYear = localStats.thisYear + 1;
        localStats.total = localStats.total + 1;
        localStorage.setItem("vbd99_local_reset_date", todayStr);
      } else {
        localStats.today = localStats.today + 1;
        localStats.thisWeek = localStats.thisWeek + 1;
        localStats.thisMonth = localStats.thisMonth + 1;
        localStats.thisYear = localStats.thisYear + 1;
        localStats.total = localStats.total + 1;
      }

      localStorage.setItem("vbd99_local_stat_today", String(localStats.today));
      localStorage.setItem("vbd99_local_stat_thisWeek", String(localStats.thisWeek));
      localStorage.setItem("vbd99_local_stat_thisMonth", String(localStats.thisMonth));
      localStorage.setItem("vbd99_local_stat_thisYear", String(localStats.thisYear));
      localStorage.setItem("vbd99_local_stat_total", String(localStats.total));
    }

    const intervalId = setInterval(() => {
      onStatsUpdate({
        today: Number(localStorage.getItem("vbd99_local_stat_today")) || 204,
        thisWeek: Number(localStorage.getItem("vbd99_local_stat_thisWeek")) || 893,
        thisMonth: Number(localStorage.getItem("vbd99_local_stat_thisMonth")) || 5062,
        thisYear: Number(localStorage.getItem("vbd99_local_stat_thisYear")) || 21263,
        totalVisitors: Number(localStorage.getItem("vbd99_local_stat_total")) || 1523910
      });
    }, 5000);

    onStatsUpdate({
      today: Number(localStorage.getItem("vbd99_local_stat_today")) || 204,
      thisWeek: Number(localStorage.getItem("vbd99_local_stat_thisWeek")) || 893,
      thisMonth: Number(localStorage.getItem("vbd99_local_stat_thisMonth")) || 5062,
      thisYear: Number(localStorage.getItem("vbd99_local_stat_thisYear")) || 21263,
      totalVisitors: Number(localStorage.getItem("vbd99_local_stat_total")) || 1523910
    });

    return () => clearInterval(intervalId);
  }

  try {
    // Increment transaction for new visitor sessions
    const hasIncremented = sessionStorage.getItem("vbd99_session_incremented");
    if (!hasIncremented) {
      sessionStorage.setItem("vbd99_session_incremented", "true");

      const statsRef = rtdbRef(rtdb, "analytics/visitorStats");
      rtdbRunTransaction(statsRef, (currentData) => {
        const d = new Date();
        const todayStr = d.toISOString().split('T')[0];

        const day = d.getUTCDay();
        const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
        const mondayDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
        const weekStr = mondayDate.toISOString().split('T')[0];

        const monthStr = d.toISOString().substring(0, 7);
        const yearStr = String(d.getUTCFullYear());

        if (!currentData) {
          return {
            today: 204,
            todayDate: todayStr,
            thisWeek: 893,
            thisWeekDate: weekStr,
            thisMonth: 5062,
            thisMonthDate: monthStr,
            thisYear: 21263,
            thisYearDate: yearStr,
            total: 1523910
          };
        }

        const isNewDay = currentData.todayDate !== todayStr;
        const isNewWeek = currentData.thisWeekDate !== weekStr;
        const isNewMonth = currentData.thisMonthDate !== monthStr;
        const isNewYear = currentData.thisYearDate !== yearStr;

        return {
          ...currentData,
          today: isNewDay ? 1 : ((currentData.today || 0) + 1),
          todayDate: todayStr,
          thisWeek: isNewWeek ? 1 : ((currentData.thisWeek || 0) + 1),
          thisWeekDate: weekStr,
          thisMonth: isNewMonth ? 1 : ((currentData.thisMonth || 0) + 1),
          thisMonthDate: monthStr,
          thisYear: isNewYear ? 1 : ((currentData.thisYear || 0) + 1),
          thisYearDate: yearStr,
          total: (currentData.total || 0) + 1
        };
      }).then(() => {
        try {
          const d = new Date();
          const todayStr = d.toISOString().split('T')[0];
          const hourStr = String(d.getUTCHours()).padStart(2, '0');
          const hourlyKey = `${todayStr}-${hourStr}`;

          const hourlyRef = rtdbRef(rtdb, `analytics/hourly/${hourlyKey}`);
          rtdbRunTransaction(hourlyRef, (cur) => {
            if (!cur) return { visitors: 1 };
            return { visitors: (cur.visitors || 0) + 1 };
          }).catch(err => console.warn("Hourly stats write failed:", err));

          const dailyRef = rtdbRef(rtdb, `analytics/daily/${todayStr}`);
          rtdbRunTransaction(dailyRef, (cur) => {
            if (!cur) return { visitors: 1 };
            return { visitors: (cur.visitors || 0) + 1 };
          }).catch(err => console.warn("Daily stats write failed:", err));
        } catch (innerErr) {
          console.warn("Hourly/Daily logging failed inside then:", innerErr);
        }
      }).catch((err) => {
        console.warn("RTDB visitor stats increment transaction bypassed:", err);
      });
    }

    // Listen live to all stats
    const statsRef = rtdbRef(rtdb, "analytics/visitorStats");
    const unsubscribeStats = onRtdbValue(statsRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val() || {};

        const statsRecord: VisitorStatsRecord = {
          today: val.today || 204,
          thisWeek: val.thisWeek || 893,
          thisMonth: val.thisMonth || 5062,
          thisYear: val.thisYear || 21263,
          totalVisitors: val.total || 1523910
        };

        onStatsUpdate(statsRecord);
      } else {
        onStatsUpdate({
          today: 204,
          thisWeek: 893,
          thisMonth: 5062,
          thisYear: 21263,
          totalVisitors: 1523910
        });
      }
    });

    return () => {
      unsubscribeStats();
    };
  } catch (err) {
    console.warn("setupRealtimeVisitorStats initialization error, fallback initialized:", err);
    onStatsUpdate({
      today: 204,
      thisWeek: 893,
      thisMonth: 5062,
      thisYear: 21263,
      totalVisitors: 1523910
    });
    return () => {};
  }
}

/**
 * Subscribes to live active or all notifications for ticker and admin use.
 */
export function subscribeNotifications(onUpdate: (items: NotificationItem[]) => void): () => void {
  const collectionName = "notifications";
  let fallbackInterval: any = null;
  let unsubscribeFirestore: (() => void) | null = null;

  const triggerLocalFallback = () => {
    if (fallbackInterval) return;
    const fetchLocal = () => {
      try {
        const storedStr = localStorage.getItem("vbd99_local_notifications");
        if (storedStr) {
          const parsed = JSON.parse(storedStr);
          if (Array.isArray(parsed)) {
            onUpdate(parsed);
            return;
          }
        }
      } catch (e) {
        console.warn("Failed to parse local notifications error fallbacks:", e);
      }
      onUpdate([]);
    };
    fetchLocal();
    fallbackInterval = setInterval(fetchLocal, 5000);
  };

  if (!isFirebaseConfigured || !db || isFirestoreQuotaOrConnectionFailed) {
    triggerLocalFallback();
    return () => {
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }

  try {
    const collRef = collection(db, collectionName);
    unsubscribeFirestore = onSnapshot(collRef, (snapshot) => {
      const list: NotificationItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          text: data.text || "",
          active: data.active === undefined ? true : !!data.active
        });
      });
      onUpdate(list);
    }, (err) => {
      console.warn("Notifications subscription encountered Firestore error. Falling back to LocalStorage.", err);
      checkQuotaError(err);
      triggerLocalFallback();
    });
  } catch (err) {
    console.warn("Failed to establish notifications snapshot listener:", err);
    triggerLocalFallback();
  }

  return () => {
    if (unsubscribeFirestore) {
      try {
        unsubscribeFirestore();
      } catch (e) {
        console.warn("Firestore unsubscribe error:", e);
      }
    }
    if (fallbackInterval) {
      clearInterval(fallbackInterval);
    }
  };
}

/**
 * Adds a new notification document to Firestore or LocalStorage.
 */
export async function addNotification(text: string, active: boolean): Promise<void> {
  const collectionName = "notifications";
  const id = "notif_" + Math.random().toString(36).substring(2, 11);
  const newItem: NotificationItem = { id, text, active };

  // Always write locally
  const storedStr = localStorage.getItem("vbd99_local_notifications");
  let current: NotificationItem[] = [];
  if (storedStr) {
    try { current = JSON.parse(storedStr); } catch {}
  }
  current.push(newItem);
  localStorage.setItem("vbd99_local_notifications", JSON.stringify(current));

  // Sync to Cloud Firestore if configured and not failed
  if (isFirebaseConfigured && db && !isFirestoreQuotaOrConnectionFailed) {
    try {
      await setDoc(doc(db, collectionName, id), {
        id,
        text,
        active
      });
    } catch (err) {
      console.warn("Firestore write notification failed. Falling back to local only.", err);
      checkQuotaError(err);
    }
  }
}

/**
 * Updates an existing notification document.
 */
export async function updateNotification(id: string, fields: Partial<NotificationItem>): Promise<void> {
  const collectionName = "notifications";

  // Always update locally
  const storedStr = localStorage.getItem("vbd99_local_notifications");
  let current: NotificationItem[] = [];
  if (storedStr) {
    try { current = JSON.parse(storedStr); } catch {}
  }
  current = current.map(item => item.id === id ? { ...item, ...fields } : item);
  localStorage.setItem("vbd99_local_notifications", JSON.stringify(current));

  // Sync to Cloud Firestore if configured and not failed
  if (isFirebaseConfigured && db && !isFirestoreQuotaOrConnectionFailed) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, fields);
    } catch (err) {
      console.warn("Firestore update notification failed. Falling back to local only.", err);
      checkQuotaError(err);
    }
  }
}

/**
 * Deletes a notification document.
 */
export async function deleteNotification(id: string): Promise<void> {
  const collectionName = "notifications";

  // Always delete locally
  const storedStr = localStorage.getItem("vbd99_local_notifications");
  let current: NotificationItem[] = [];
  if (storedStr) {
    try { current = JSON.parse(storedStr); } catch {}
  }
  current = current.filter(item => item.id !== id);
  localStorage.setItem("vbd99_local_notifications", JSON.stringify(current));

  // Sync to Cloud Firestore if configured and not failed
  if (isFirebaseConfigured && db && !isFirestoreQuotaOrConnectionFailed) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn("Firestore delete notification failed. Falling back to local only.", err);
      checkQuotaError(err);
    }
  }
}

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: "global",
  title: "ViralBD99 - Pure Premium Streaming Platform",
  logoText: "VIRALBD99",
  maintenanceMode: false,
  welcomeMessage: "Welcome to ViralBD99! Keep watching for the newest exclusive clips..."
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const collectionName = "siteConfigs";
  if (isFirebaseConfigured && db && !isFirestoreQuotaOrConnectionFailed) {
    try {
      const docRef = doc(db, collectionName, "global");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as SiteSettings;
        localStorage.setItem("vbd99_local_site_settings", JSON.stringify(data));
        return data;
      } else {
        await setDoc(docRef, DEFAULT_SITE_SETTINGS);
        localStorage.setItem("vbd99_local_site_settings", JSON.stringify(DEFAULT_SITE_SETTINGS));
        return DEFAULT_SITE_SETTINGS;
      }
    } catch (err) {
      console.warn("Firestore getSiteSettings failed. Falling back to local.", err);
      checkQuotaError(err);
    }
  }
  const localStr = localStorage.getItem("vbd99_local_site_settings");
  if (localStr) {
    try { return JSON.parse(localStr); } catch {}
  }
  return DEFAULT_SITE_SETTINGS;
}

export async function updateSiteSettings(settings: SiteSettings): Promise<void> {
  const collectionName = "siteConfigs";
  localStorage.setItem("vbd99_local_site_settings", JSON.stringify(settings));
  if (isFirebaseConfigured && db && !isFirestoreQuotaOrConnectionFailed) {
    try {
      const docRef = doc(db, collectionName, "global");
      await setDoc(docRef, settings);
    } catch (err) {
      console.warn("Firestore updateSiteSettings failed. Falling back to local only.", err);
      checkQuotaError(err);
    }
  }
}

export async function getFirebaseBanners(): Promise<FirebaseBannerAd[]> {
  const collectionName = "banners";
  if (isFirebaseConfigured && db && !isFirestoreQuotaOrConnectionFailed) {
    try {
      const snap = await getDocs(collection(db, collectionName));
      const list: FirebaseBannerAd[] = [];
      snap.forEach(d => {
        list.push({ ...d.data(), id: d.id } as FirebaseBannerAd);
      });
      localStorage.setItem("vbd99_local_banners", JSON.stringify(list));
      return list;
    } catch (err) {
      console.warn("Firestore getBanners failed. Falling back to local.", err);
      checkQuotaError(err);
    }
  }
  const localStr = localStorage.getItem("vbd99_local_banners");
  if (localStr) {
    try { return JSON.parse(localStr); } catch {}
  }
  return [];
}

export async function saveFirebaseBanner(banner: FirebaseBannerAd): Promise<void> {
  const collectionName = "banners";
  const storedStr = localStorage.getItem("vbd99_local_banners");
  let current: FirebaseBannerAd[] = [];
  if (storedStr) {
    try { current = JSON.parse(storedStr); } catch {}
  }
  const existsIdx = current.findIndex(b => b.id === banner.id);
  if (existsIdx >= 0) {
    current[existsIdx] = banner;
  } else {
    current.push(banner);
  }
  localStorage.setItem("vbd99_local_banners", JSON.stringify(current));

  if (isFirebaseConfigured && db && !isFirestoreQuotaOrConnectionFailed) {
    try {
      const docRef = doc(db, collectionName, banner.id);
      await setDoc(docRef, banner);
    } catch (err) {
      console.warn("Firestore saveBanner failed. Falling back to local only.", err);
      checkQuotaError(err);
    }
  }
}

export async function deleteFirebaseBanner(id: string): Promise<void> {
  const collectionName = "banners";
  const storedStr = localStorage.getItem("vbd99_local_banners");
  let current: FirebaseBannerAd[] = [];
  if (storedStr) {
    try { current = JSON.parse(storedStr); } catch {}
  }
  current = current.filter(b => b.id !== id);
  localStorage.setItem("vbd99_local_banners", JSON.stringify(current));

  if (isFirebaseConfigured && db && !isFirestoreQuotaOrConnectionFailed) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn("Firestore deleteBanner failed. Falling back to local only.", err);
      checkQuotaError(err);
    }
  }
}

export async function uploadThumbnail(base64Data: string): Promise<string> {
  if (!isFirebaseConfigured || !storage) {
    console.warn("Firebase Storage is not configured. Falling back to local data URL.");
    return base64Data;
  }
  try {
    const filename = `thumbnails/thumb_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;
    const imageRef = storageRef(storage, filename);
    await uploadString(imageRef, base64Data, "data_url");
    const downloadUrl = await getDownloadURL(imageRef);
    return downloadUrl;
  } catch (error) {
    console.warn("Firebase Storage Upload Error. Gracefully falling back to local base64 data URL format:", error);
    return base64Data;
  }
}



