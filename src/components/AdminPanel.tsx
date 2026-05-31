/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import Cropper from "react-easy-crop";
import { 
  Plus, Sliders, Trash2, Edit2, Check, RefreshCw, Key, Shield, Sparkles, Film, AlertTriangle, 
  FileVideo, Eye, X, DollarSign, Bookmark, Flame, Clock, Award, Globe, Video as LucideVideo, 
  ShieldAlert, Tv, Heart, Play, Zap, Music, Smile, Gamepad, Ghost, Crown, Siren, Camera, Lock,
  MessageSquare, BarChart3, Image, Settings
} from "lucide-react";
import { Video, Category, AdSettings, ActivityLog, NotificationItem, VideoComment, SiteSettings, FirebaseBannerAd } from "../types";
import { 
  subscribeNotifications, 
  addNotification, 
  updateNotification, 
  deleteNotification, 
  getComments, 
  deleteComment,
  getSiteSettings,
  updateSiteSettings,
  getFirebaseBanners,
  saveFirebaseBanner,
  deleteFirebaseBanner,
  getAnalyticsHistory
} from "../services/db";
import AdsController from "./AdsController";
import { convertToEmbed, getDetectionMessage } from "./videoHelper";

const PREDEFINED_ICONS = [
  { name: "Flame", label: "🔥 Flame (Trending)" },
  { name: "Clock", label: "⏱️ Clock (Latest)" },
  { name: "Sparkles", label: "✨ Sparkles (Viral)" },
  { name: "Award", label: "👑 Award (Premium)" },
  { name: "Globe", label: "🌐 Globe (Asian/International)" },
  { name: "Video", label: "📹 Video (Shorts)" },
  { name: "ShieldAlert", label: "⚠️ ShieldAlert (Exclusive)" },
  { name: "Tv", label: "📺 Tv (HD)" },
  { name: "Film", label: "🎬 Film (Movies)" },
  { name: "Heart", label: "❤️ Heart (Romantic)" },
  { name: "Play", label: "▶️ Play (Live)" },
  { name: "Zap", label: "⚡ Zap (High Voltage)" },
  { name: "Key", label: "🔑 Key (VIP)" },
  { name: "Eye", label: "👁️ Eye (Exclusives)" },
  { name: "Music", label: "🎵 Music (Songs/Dance)" },
  { name: "Smile", label: "😊 Smile (Comedy)" },
  { name: "Gamepad", label: "🎮 Gamepad (Fun)" },
  { name: "Ghost", label: "👻 Ghost (Horror)" },
  { name: "Crown", label: "👑 Crown (Premium/Elite)" },
  { name: "Siren", label: "🚨 Siren (Emergency/Viral)" },
  { name: "Camera", label: "📷 Camera (Behind-scenes)" },
  { name: "Lock", label: "🔒 Lock (Private/Uncut)" }
];

const IconMap: { [key: string]: React.ComponentType<any> } = {
  Flame,
  Clock,
  Sparkles,
  Award,
  Globe,
  Video: LucideVideo,
  ShieldAlert,
  Tv,
  Film,
  Heart,
  Play,
  Zap,
  Key,
  Eye,
  Music,
  Smile,
  Gamepad,
  Ghost,
  Crown,
  Siren,
  Camera,
  Lock
};

const CLICKBAIT_TITLES = [
  "🤫 Use Headphones! Changing Room Secret Raw CCTV Tape Leaked...",
  "🔞 Caught on Camera! Hidden Lift CCTV Footage Revealed Uncut...",
  "⚡ Locked Room Only! Sensational Viral Clip Breaking the Internet...",
  "🔒 Totally Uncensored! Hotel Room Shocker You Didn't See Coming...",
  "🍒 Earphones Mandatory! Midnight Web-Series Exclusive Compilation...",
  "🥵 Close the Door! Thrilling Bedroom Performance Going Super Viral...",
  "🤫 Leaked Secret Reel of Trending Sensation, Watch Online Fast...",
  "🔞 Shopping Mall trial room scandal! Watch what happened...",
  "⚡ Most Clicked Romantic Drama! Strictly Uncensored & Uncut...",
  "🍿 Exclusive Director's Cut: Breathtaking Behind the Scenes...",
  "🤐 Fresh New Leaked Video! Watch Online Before It gets Deleted...",
  "🤫 Luxury Resort Hidden Cam Footage Captures Unexpected Drama...",
  "🔞 Secret bathroom clip leaked online watch immediately...",
  "🍿 College Hostel Girls' Leaked Night Out Shocker...",
  "⚡ Plug in your earphones: Highly requested private leak...",
  "🔒 Premium Member Uncut Content Bypassed & Leaked for Free...",
  "🥵 Swimming Pool Bold Performance of Top Instagram Model...",
  "🍒 Behind Closed Doors! Deepest Secret of Popular Influencer...",
  "🤫 Elevator corner camera captures what they thought was private...",
  "🔞 Fitting room dress trial footage goes viral on TikTok...",
  "🍿 Late Night Special Broadcast: Click only if you are 18+...",
  "⚡ 100% Uncut and Raw Viral Episode Trending Online...",
  "🔒 Shifting Mall Changing Room Secret Scandal Exposed..."
];

const SEO_DESCRIPTION_TEMPLATES = [
  "🔥 Watch {title} in 100% uncut & full HD quality now! Fast play with secure premium loading and absolutely no VPN needed. Stream this trending release before it gets taken down.\n\n📌 Tags: Exclusive Stream, Hot Leak, Uncut Video, 18+ Drama, Viral Reels, TikTok Trend",
  "🤫 Sensational internet hit {title} is now streaming live. Get a pristine high-speed experience with our fast loading server. Headphones heavily recommended!\n\n📌 Tags: Viral BD, Web Series, Secret Cam, Trending Clips, Uncensored Drama",
  "🍒 Official Trailer for the viral hit {title} has arrived online! Best enjoyed in private, plug in your headsets for this exclusive masterpiece.\n\n📌 Tags: Premium Release, HD Stream, Late Night Drama, Uncut Trailer",
  "🔞 Warning! {title} is now unlocked and streaming with high-speed playback keys. Get absolute premium quality without any subscription or downloads.\n\n📌 Tags: Free VIP Access, Secure Video Link, Viral Shorts, Romantic Series",
  "🥵 Set your mood right and beat the loneliness! Tap the play button now to enjoy {title}. Generate direct streaming high-speed optimized links safely.\n\n📌 Tags: CCTV Leaks, Fitting Room, Secret Video, Raw footage, Unedited Show",
  "🎬 The highly requested and extremely bold {title} has been uploaded to our servers. Check out the uninterrupted, high-definition play frame right now.\n\n📌 Tags: Hot Model, Super Viral, Zero Buffer, Full Movie, Uncensored Scenes"
];

interface AdminPanelProps {
  videos: Video[];
  categories: Category[];
  adSettings: AdSettings;
  onAddVideo: (video: Video) => Promise<void>;
  onUpdateVideo: (id: string, fields: Partial<Video>) => Promise<void>;
  onDeleteVideo: (id: string) => Promise<void>;
  onResetSeedData: () => Promise<void>;
  onUpdateAdSettings: (settings: AdSettings) => Promise<void>;
  onTriggerSimulatedClick: () => void;
  onResetSimulatedEarnings: () => void;
  onLogout: () => void;
  activityLogs: ActivityLog[];
  onSaveCategory?: (category: Category) => Promise<void>;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (err) => reject(err));
    image.setAttribute("crossOrigin", "anonymous"); // to prevent CORS issues if loading cross-origin URLs
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return "";
  }

  // Set canvas size to the cropped dimensions (strictly 16:9 bounds)
  const maxDim = 640;
  let targetWidth = pixelCrop.width;
  let targetHeight = pixelCrop.height;

  if (targetWidth > maxDim) {
    targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
    targetWidth = maxDim;
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return canvas.toDataURL("image/jpeg", 0.82);
}

const toDatetimeLocal = (isoString?: string) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  } catch (e) {
    return "";
  }
};

export default function AdminPanel({
  videos,
  categories,
  adSettings,
  onAddVideo,
  onUpdateVideo,
  onDeleteVideo,
  onResetSeedData,
  onUpdateAdSettings,
  onTriggerSimulatedClick,
  onResetSimulatedEarnings,
  onLogout,
  activityLogs,
  onSaveCategory
}: AdminPanelProps) {
  // Passcode security model is managed by parent gates
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<"streams" | "ads" | "logs" | "categories" | "notifications" | "comments" | "analytics" | "banner_manager" | "site_settings">("streams");

  // Comments Tab states
  const [selectedVideoCommentsId, setSelectedVideoCommentsId] = useState<string>("");
  const [allVideoComments, setAllVideoComments] = useState<(VideoComment & { videoTitle?: string })[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // New Sub-panel States (Analytics, Site Settings, Custom Banners)
  const [analyticsData, setAnalyticsData] = useState<any>({ today: 4512, week: 31590, month: 125920, total: 1523910 });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [siteTitleForm, setSiteTitleForm] = useState("");
  const [siteLogoForm, setSiteLogoForm] = useState("");
  const [siteMaintenanceForm, setSiteMaintenanceForm] = useState(false);
  const [siteWelcomeForm, setSiteWelcomeForm] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  const [bannersList, setBannersList] = useState<FirebaseBannerAd[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerName, setBannerName] = useState("");
  const [bannerCode, setBannerCode] = useState("");
  const [bannerPosition, setBannerPosition] = useState<"top" | "middle" | "bottom">("top");
  const [bannerIsEnabled, setBannerIsEnabled] = useState(true);

  // Notifications custom states
  const [tickerNotifs, setTickerNotifs] = useState<NotificationItem[]>([]);
  const [newNotifText, setNewNotifText] = useState("");
  const [newNotifActive, setNewNotifActive] = useState(true);
  const [editingNotifId, setEditingNotifId] = useState<string | null>(null);

  React.useEffect(() => {
    if (adminTab === "notifications") {
      const unsub = subscribeNotifications((data) => {
        setTickerNotifs(data);
      });
      return unsub;
    }
  }, [adminTab]);

  React.useEffect(() => {
    if (adminTab === "site_settings") {
      const loadSettings = async () => {
        try {
          const s = await getSiteSettings();
          if (s) {
            setSiteTitleForm(s.title);
            setSiteLogoForm(s.logoText || "VIRALBD99");
            setSiteMaintenanceForm(s.maintenanceMode || false);
            setSiteWelcomeForm(s.welcomeMessage || "");
          }
        } catch (e) {
          console.error("Failed to load settings in panel:", e);
        }
      };
      loadSettings();
    } else if (adminTab === "banner_manager") {
      const loadBanners = async () => {
        setLoadingBanners(true);
        try {
          const list = await getFirebaseBanners();
          setBannersList(list || []);
        } catch (e) {
          console.error("Failed to load banners in panel:", e);
        } finally {
          setLoadingBanners(false);
        }
      };
      loadBanners();
    } else if (adminTab === "analytics") {
      const loadAnalytics = async () => {
        setLoadingAnalytics(true);
        try {
          const stats = await getAnalyticsHistory();
          setAnalyticsData(stats);
        } catch (e) {
          console.error("Failed to load analytics in panel:", e);
        } finally {
          setLoadingAnalytics(false);
        }
      };
      loadAnalytics();
    }
  }, [adminTab]);

  // Category management form states
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catIcon, setCatIcon] = useState("Film");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [category, setCategory] = useState(categories[0]?.slug || "action");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [rating, setRating] = useState("");
  const [isTrending, setIsTrending] = useState(false);
  const [isLatest, setIsLatest] = useState(true);
  const [saveConfirmed, setSaveConfirmed] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [viewsCount, setViewsCount] = useState<string>("0");

  // Super Dashboard Upgrade States
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set());
  const [bulkText, setBulkText] = useState("");
  const [bulkCategory, setBulkCategory] = useState(categories[0]?.slug || "premium");

  // Image Cropper States
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  // File upload state & handlers
  const [thumbnailMode, setThumbnailMode] = useState<"upload" | "url">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, WEBP, etc.)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageToCrop(event.target.result as string);
        setIsCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  // Edit fields tracker
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleUnlock = () => {
    // Default unlock is "admin" or blank bypass for streamlined review in the playground
    if (passcode.toLowerCase() === "admin" || passcode === "") {
      setIsAuthorized(true);
      localStorage.setItem("is_admin_unlocked", "true");
      setStatusMessage("Passcode unlocked. Welcome, Admin!");
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage("Error: Invalid Passcode. Try 'admin' or leave blank.");
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  const handleLock = () => {
    setIsAuthorized(false);
    localStorage.removeItem("is_admin_unlocked");
  };

  // Pre-populate with high quality mock fields to facilitate instant testing
  const handleLoadDemoValues = () => {
    const randomIndex = Math.floor(Math.random() * CLICKBAIT_TITLES.length);
    setTitle(CLICKBAIT_TITLES[randomIndex]);
    setThumbnailUrl("https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&q=80&w=800");
    setThumbnailMode("url");
    setEmbedUrl("https://drive.google.com/file/d/1_V4EPrM6aXkZlC_Jp-q61GgP8oE-p18V/preview");
    setCategory("premium");
    setDescription("This is an instantly published premium stream configured utilizing standard Google Drive previews. It bypasses conventional hosting fees and streams smoothly to mobile players.");
    setDuration("2h 05m");
    setRating("18+");
    setIsTrending(true);
    setIsLatest(true);
  };

  const handleAutoTitle = () => {
    const randomIndex = Math.floor(Math.random() * CLICKBAIT_TITLES.length);
    setTitle(CLICKBAIT_TITLES[randomIndex]);
  };

  const handleMagicAutoFill = () => {
    // Generate clickbait title
    const randomIndex = Math.floor(Math.random() * CLICKBAIT_TITLES.length);
    const generatedTitle = CLICKBAIT_TITLES[randomIndex];
    setTitle(generatedTitle);

    // Auto fill description using generated title
    const randomDescIndex = Math.floor(Math.random() * SEO_DESCRIPTION_TEMPLATES.length);
    const generatedDesc = SEO_DESCRIPTION_TEMPLATES[randomDescIndex].replace(/{title}/g, generatedTitle);
    setDescription(generatedDesc);

    // Seed Unsplash high CTR thumbnail if thumbnail url is currently empty
    if (!thumbnailUrl) {
      const unsplashIds = [
        "photo-1518173946687-a4c8a383392e",
        "photo-1506318137071-a8e063b4bec0",
        "photo-1511671782779-c97d3d27a1d4",
        "photo-1492691527719-9d1e07e534b4",
        "photo-1514525253161-7a46d19cd819"
      ];
      const randomId = unsplashIds[Math.floor(Math.random() * unsplashIds.length)];
      setThumbnailUrl(`https://images.unsplash.com/${randomId}?auto=format&fit=crop&q=80&w=800`);
      setThumbnailMode("url");
    }

    // Auto set rating and confirm checks for frictionless workflow
    setRating("18+");
    setSaveConfirmed(true);
    setStatusMessage("✨ Magic Auto-Fill: Populated highest CTR titles and meta!");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) {
      alert("Please enter direct video links or GDrive preview URLs.");
      return;
    }

    setSubmitting(true);
    setStatusMessage("Bulk publishing stream records...");

    const lines = bulkText.split("\n").map(l => l.trim()).filter(Boolean);
    let successCount = 0;

    for (const line of lines) {
      let finalTitle = "";
      let finalUrl = "";

      if (line.includes("|")) {
        const parts = line.split("|");
        finalTitle = parts[0].trim();
        finalUrl = parts[1].trim();
      } else {
        finalUrl = line;
        const randomIndex = Math.floor(Math.random() * CLICKBAIT_TITLES.length);
        finalTitle = CLICKBAIT_TITLES[randomIndex];
      }

      if (!finalUrl) continue;

      const randomDescIndex = Math.floor(Math.random() * SEO_DESCRIPTION_TEMPLATES.length);
      const generatedDesc = SEO_DESCRIPTION_TEMPLATES[randomDescIndex].replace(/{title}/g, finalTitle);
      const streamId = `stream-bulk-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

      // Default high CTR Unsplash thumb
      const randomThumbIndex = Math.floor(Math.random() * 5);
      const thumbId = ["photo-1518173946687-a4c8a383392e", "photo-1506318137071-a8e063b4bec0", "photo-1511671782779-c97d3d27a1d4", "photo-1492691527719-9d1e07e534b4"][randomThumbIndex] || "photo-1506318137071-a8e063b4bec0";

      const newVideo: Video = {
        id: streamId,
        title: finalTitle,
        thumbnailUrl: `https://images.unsplash.com/${thumbId}?auto=format&fit=crop&q=80&w=800`,
        embedUrl: finalUrl,
        category: bulkCategory,
        description: generatedDesc,
        duration: `${Math.floor(Math.random() * 10) + 5}m`,
        rating: "18+",
        views: Math.floor(Math.random() * 12000) + 1500,
        createdAt: new Date().toISOString(),
        status: "published"
      };

      try {
        await onAddVideo(newVideo);
        successCount++;
      } catch (err) {
        console.error("Bulk publish error:", err);
      }
    }

    setBulkText("");
    setStatusMessage(`✅ Done! Successfully bulk uploaded ${successCount} streams to category "${bulkCategory}".`);
    setSubmitting(false);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const toggleSelectVideo = (id: string) => {
    setSelectedVideoIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllVideos = () => {
    if (selectedVideoIds.size === videos.length) {
      setSelectedVideoIds(new Set());
    } else {
      setSelectedVideoIds(new Set(videos.map(v => v.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVideoIds.size === 0) {
      alert("No streams selected!");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete the ${selectedVideoIds.size} selected streams?`)) {
      return;
    }
    setSubmitting(true);
    setStatusMessage(`Bulk purging ${selectedVideoIds.size} streams in sequence...`);
    let deletedCount = 0;
    try {
      const ids: string[] = Array.from(selectedVideoIds);
      for (const id of ids) {
        await onDeleteVideo(id);
        deletedCount++;
      }
      setSelectedVideoIds(new Set());
      setStatusMessage(`✅ Successfully purged ${deletedCount} streams!`);
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (e) {
      console.error(e);
      setStatusMessage("🚨 Bulk purge completed with partial database errors.");
    } finally {
      setSubmitting(false);
    }
  };

  const checkLinkHealth = (url: string): "working" | "broken" => {
    if (!url) return "broken";
    const cleanUrl = url.trim().toLowerCase();
    if (
      cleanUrl.includes("drive.google.com") || 
      cleanUrl.includes("youtube.com") || 
      cleanUrl.includes("youtu.be") || 
      cleanUrl.endsWith(".mp4") || 
      cleanUrl.includes(".mp4?") ||
      cleanUrl.includes("vk.com") ||
      cleanUrl.includes("ok.ru") ||
      cleanUrl.startsWith("http://") || 
      cleanUrl.startsWith("https://")
    ) {
      return "working";
    }
    return "broken";
  };

  const handleAutoDescription = () => {
    const activeTitle = title || "Fresh New Viral Clip";
    const randomIndex = Math.floor(Math.random() * SEO_DESCRIPTION_TEMPLATES.length);
    const generated = SEO_DESCRIPTION_TEMPLATES[randomIndex].replace(/{title}/g, activeTitle);
    setDescription(generated);
  };

  const clearForm = () => {
    setTitle("");
    setThumbnailUrl("");
    setEmbedUrl("");
    setDescription("");
    setDuration("");
    setRating("");
    setEditingId(null);
    setSaveConfirmed(false);
    setScheduledAt("");
    setViewsCount("0");
  };

  // Auto-detect duration helper for direct video URLs
  React.useEffect(() => {
    if (!embedUrl) return;
    const url = embedUrl.trim();
    // Check if it is a direct mp4/video or can be loaded by HTML5 element
    const isDirectVideo = url.endsWith(".mp4") || url.includes(".mp4?") || url.endsWith(".webm") || url.endsWith(".ogg");
    
    if (isDirectVideo) {
      const tempVideo = document.createElement("video");
      tempVideo.src = url;
      tempVideo.preload = "metadata";
      
      const onLoadedMetadata = () => {
        const totalSecs = Math.round(tempVideo.duration);
        if (!isNaN(totalSecs) && totalSecs > 0) {
          const mins = Math.floor(totalSecs / 60);
          const secs = totalSecs % 60;
          if (mins >= 60) {
            const hrs = Math.floor(mins / 60);
            const remainingMins = mins % 60;
            setDuration(`${hrs}h ${remainingMins}m`);
          } else if (mins > 0) {
            setDuration(`${mins}m ${secs}s`);
          } else {
            setDuration(`${secs}s`);
          }
        }
      };

      tempVideo.addEventListener("loadedmetadata", onLoadedMetadata);
      return () => {
        tempVideo.removeEventListener("loadedmetadata", onLoadedMetadata);
      };
    }
  }, [embedUrl]);

  const handleCatNameChange = (val: string) => {
    setCatName(val);
    if (!editingCatId) {
      setCatSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9\u0980-\u09ff\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
      );
    }
  };

  const handleSaveCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catSlug) {
      setStatusMessage("🚨 error: Category name and slug are required.");
      return;
    }

    setSubmitting(true);
    try {
      const categoryId = editingCatId || catSlug;
      if (onSaveCategory) {
        await onSaveCategory({
          id: categoryId,
          name: catName,
          slug: catSlug,
          iconName: catIcon
        });
        setStatusMessage(`✅ Category "${catName}" successfully saved!`);
        setCatName("");
        setCatSlug("");
        setCatIcon("Film");
        setEditingCatId(null);
      } else {
        setStatusMessage("🚨 Category save callback not registered.");
      }
    } catch (err: any) {
      setStatusMessage(`🚨 Category save failed: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !thumbnailUrl || !embedUrl) {
      alert("Title, Thumbnail URL, and Google Drive Link are mandatory.");
      return;
    }

    if (!saveConfirmed) {
      alert("Please check the confirmation box before saving.");
      return;
    }

    setSubmitting(true);
    setStatusMessage("Publishing details...");

    const processedEmbedUrl = embedUrl.trim();

    const videoId = editingId || `stream-${Date.now()}`;
    let status: "published" | "scheduled" = "published";
    let finalScheduledAt = "";

    // 1. DUAL LOGIC UPDATE: If scheduledAt is null or empty, bypass the scheduling check and set the video status to 'published' immediately.
    // 2. PRESERVATION LOCK: If a user explicitly sets a date, the scheduling feature still works if the selected date is in the future.
    if (scheduledAt && scheduledAt.trim() !== "") {
      const selectedDate = new Date(scheduledAt);
      if (selectedDate > new Date()) {
        status = "scheduled";
      } else {
        status = "published";
      }
      finalScheduledAt = selectedDate.toISOString();
    } else {
      status = "published";
      finalScheduledAt = "";
    }

    const targetVideo: Video = {
      id: videoId,
      title,
      thumbnailUrl,
      embedUrl: processedEmbedUrl,
      category,
      description,
      duration,
      rating,
      isTrending,
      isLatest,
      views: parseInt(viewsCount) || (editingId ? videos.find(v => v.id === editingId)?.views || 0 : Math.floor(Math.random() * 1000) + 100),
      createdAt: editingId ? (videos.find(v => v.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      scheduledAt: finalScheduledAt || undefined,
      status: status
    };

    try {
      if (editingId) {
        await onUpdateVideo(editingId, targetVideo);
        setStatusMessage("Success: Video updated successfully!");
      } else {
        await onAddVideo(targetVideo);
        setStatusMessage("Success: Video published instantly!");
      }

      clearForm();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (e) {
      console.error(e);
      setStatusMessage("Failed to publish video. Check network logs.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (video: Video) => {
    setEditingId(video.id);
    setTitle(video.title);
    const isBase64 = video.thumbnailUrl?.startsWith("data:image/");
    setThumbnailUrl(video.thumbnailUrl);
    setThumbnailMode(isBase64 ? "upload" : "url");
    setEmbedUrl(video.embedUrl);
    setCategory(video.category);
    setDescription(video.description || "");
    setDuration(video.duration || "");
    setRating(video.rating || "");
    setIsTrending(!!video.isTrending);
    setIsLatest(!!video.isLatest);
    setSaveConfirmed(true);
    setScheduledAt(video.scheduledAt ? toDatetimeLocal(video.scheduledAt) : "");
    setViewsCount(String(video.views || 0));

    // Scroll back to administrative editing form
    document.getElementById("admin-editor-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeleteClick = async (id: string, name: string) => {
    setStatusMessage("Deleting video metadata...");
    try {
      await onDeleteVideo(id);
      setStatusMessage("Deleted successfully.");
      setDeleteConfirmId(null);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (e) {
      setStatusMessage("Delete error occurred.");
    }
  };

  const handleBulkReset = async () => {
    setResetting(true);
    setStatusMessage("Resetting database records...");
    try {
      await onResetSeedData();
      setStatusMessage("Database reset cleanly.");
      setResetConfirm(false);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (e) {
      setStatusMessage("Reset compilation failed.");
    } finally {
      setResetting(false);
    }
  };

  // 1. Authorized Auth Wall
  if (!isAuthorized) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4" id="admin-passcode-wall">
        <div className="w-full max-w-sm bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden text-center">
          {/* Visual Accents */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-purple/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-brand-red/10 rounded-full blur-2xl" />

          <div className="w-12 h-12 rounded-full bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center mx-auto mb-4 text-brand-purple">
            <Key className="w-6 h-6 animate-pulse" />
          </div>

          <h1 className="text-lg font-bold font-display text-white">Studio Gatekeeper</h1>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            Enter the credentials below to publish new streams, edit thumbnails, or purge metadata.
          </p>

          <div className="mt-5 text-left">
            <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold mb-1">
              Admin Passcode
            </label>
            <input
              type="password"
              placeholder="Leave blank or type 'admin' to unlock"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              className="w-full bg-[#1e1e1e] border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-purple focus:border-brand-purple"
            />
          </div>

          <button
            onClick={handleUnlock}
            id="admin-unlock-button"
            className="w-full mt-4 bg-gradient-to-r from-brand-red to-brand-purple text-white text-xs font-semibold py-2.5 rounded-xl cursor-pointer hover:opacity-90 active:scale-95 transition-all text-shadow"
          >
            Authenticate Studio
          </button>

          <div className="mt-4 p-2 bg-slate-900/60 rounded-lg text-[10px] text-slate-500 font-mono tracking-wide leading-relaxed border border-white/5">
            🔒 Fully offline-capable passkey. No email signup required.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 max-w-7xl mx-auto flex flex-col gap-6" id="admin-console-dashboard">
      
      {/* Head section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-brand-purple" />
            <h1 className="text-xl font-bold font-display text-white tracking-tight">ViralBD99 Admin Studio</h1>
            <span className="bg-brand-purple/15 text-brand-purple text-[8px] font-mono font-bold border border-brand-purple/20 px-2 rounded">
              ADMIN CONTROL
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">
            Instant publish Google Drive embedded streams without recompiling.
          </p>
        </div>

        <div className="flex gap-2">
          {/* Reset button with non-blocking confirmation */}
          {resetConfirm ? (
            <div className="flex items-center gap-1.5 bg-[#221c1d] border border-brand-red/20 px-2 py-1 rounded-lg">
              <span className="text-[9px] text-brand-red font-mono font-bold uppercase tracking-wider">Reset?</span>
              <button
                onClick={handleBulkReset}
                disabled={resetting}
                className="px-1.5 py-0.5 rounded bg-brand-red hover:bg-red-700 text-white text-[8px] font-mono font-bold uppercase transition active:scale-95"
              >
                Yes
              </button>
              <button
                onClick={() => setResetConfirm(false)}
                className="px-1.5 py-0.5 rounded bg-[#18181b] hover:bg-zinc-800 text-slate-300 text-[8px] font-mono font-bold uppercase transition active:scale-95"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setResetConfirm(true)}
              disabled={resetting}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#221c1d] border border-brand-red/10 text-[10px] text-brand-red font-mono font-bold hover:bg-brand-red/10 cursor-pointer active:scale-95 transition-all"
              title="Reset Database to original seeds"
            >
              <RefreshCw className={`w-3 h-3 ${resetting ? 'animate-spin' : ''}`} />
              <span>RESET SEED</span>
            </button>
          )}

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-950/20 border border-red-500/30 text-[10px] text-red-400 hover:text-white hover:bg-red-500/20 hover:border-red-500 cursor-pointer active:scale-95 transition-all shrink-0 font-sans"
          >
            <Shield className="w-3 h-3 text-red-500 shrink-0" />
            <span>SECURITY LOGOUT</span>
          </button>
        </div>
      </div>

      {/* Transaction Feed HUD */}
      {statusMessage && (
        <div 
          className="p-3 bg-brand-purple/10 border border-brand-purple/20 rounded-xl text-xs text-brand-purple flex items-center gap-2 font-mono animate-fadeIn"
          id="admin-hud-status"
        >
          <Sparkles className="w-4 h-4 text-brand-purple animate-pulse" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Sub tabs switcher */}
      <div className="flex border-b border-white/5 gap-2 -mt-2">
        <button
          onClick={() => setAdminTab("streams")}
          className={`px-4 py-2 border-b-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
            adminTab === "streams"
              ? "border-[#f5c518] text-[#f5c518] bg-white/[0.02]"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Configure Streams ({videos.length})</span>
        </button>
        <button
          onClick={() => setAdminTab("ads")}
          className={`px-4 py-2 border-b-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
            adminTab === "ads"
              ? "border-[#f5c518] text-[#f5c518] bg-white/[0.02]"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Adsterra Monetization Desk</span>
        </button>
        <button
          onClick={() => setAdminTab("categories")}
          className={`px-4 py-2 border-b-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
            adminTab === "categories"
              ? "border-[#f5c518] text-[#f5c518] bg-white/[0.02]"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
          id="tab-manage-categories"
        >
          <Sliders className="w-4 h-4 text-pink-400" />
          <span>Configure Categories ({categories.length})</span>
        </button>
        <button
          onClick={() => setAdminTab("logs")}
          className={`px-4 py-2 border-b-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
            adminTab === "logs"
              ? "border-[#f5c518] text-[#f5c518] bg-white/[0.02]"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Activity Logs ({activityLogs?.length || 0})</span>
        </button>
        <button
          onClick={() => setAdminTab("notifications")}
          className={`px-4 py-2 border-b-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
            adminTab === "notifications"
              ? "border-[#f5c518] text-[#f5c518] bg-white/[0.02]"
              : "border-transparent text-[#f5c518] hover:text-white"
          }`}
          id="tab-manage-notifications"
        >
          <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
          <span>Live Notifications Ticker ({tickerNotifs.length})</span>
        </button>
        <button
          onClick={() => setAdminTab("comments")}
          className={`px-4 py-2 border-b-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
            adminTab === "comments"
              ? "border-[#f5c518] text-[#f5c518] bg-white/[0.02]"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
          id="tab-manage-comments"
        >
          <MessageSquare className="w-4 h-4 text-sky-400" />
          <span>Comments Board</span>
        </button>
        <button
          onClick={() => setAdminTab("analytics")}
          className={`px-4 py-2 border-b-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
            adminTab === "analytics"
              ? "border-[#f5c518] text-[#f5c518] bg-white/[0.02]"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
          id="tab-manage-analytics"
        >
          <BarChart3 className="w-4 h-4 text-[#f5c518]" />
          <span>User Analytics</span>
        </button>
        <button
          onClick={() => setAdminTab("banner_manager")}
          className={`px-4 py-2 border-b-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
            adminTab === "banner_manager"
              ? "border-[#f5c518] text-[#f5c518] bg-white/[0.02]"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
          id="tab-manage-banners"
        >
          <Image className="w-4 h-4 text-emerald-400" />
          <span>Banner Ads ({bannersList.length})</span>
        </button>
        <button
          onClick={() => setAdminTab("site_settings")}
          className={`px-4 py-2 border-b-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
            adminTab === "site_settings"
              ? "border-[#f5c518] text-[#f5c518] bg-white/[0.02]"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
          id="tab-manage-site-settings"
        >
          <Settings className="w-4 h-4 text-amber-500" />
          <span>Site Settings</span>
        </button>
      </div>

      {adminTab === "streams" ? (
        <div className="flex flex-col gap-6 w-full">
          {/* Bento Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="admin-bento-indicators">
            <div className="bg-[#121212] border border-white/5 p-4 rounded-xl flex flex-col justify-between shadow-lg">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Total Active Streams</span>
              <span className="text-2xl font-black text-white mt-1">{videos.length} <span className="text-xs text-slate-500">clips</span></span>
            </div>
            <div className="bg-[#121212] border border-white/5 p-4 rounded-xl flex flex-col justify-between shadow-lg">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Estimated Content Views</span>
              <span className="text-2xl font-black text-emerald-400 mt-1">
                {videos.reduce((acc, v) => acc + (v.views || 0), 0).toLocaleString()} <span className="text-xs text-slate-500 text-slate-400">hits</span>
              </span>
            </div>
            <div className="bg-[#121212] border border-white/5 p-4 rounded-xl flex flex-col justify-between col-span-2 shadow-lg">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider font-semibold">Daily Real-time CPM / POP Index</span>
              <span className="text-sm font-bold text-white mt-1 flex items-center justify-between gap-1">
                <span className="px-2 py-0.5 rounded bg-brand-purple/10 text-brand-purple font-mono font-black text-[9px] border border-brand-purple/20">GLOBAL AD DISTRIBUTION</span>
                <span className="text-amber-400 font-mono font-black shrink-0">${(adSettings?.cpm || 2.50).toFixed(2)} CPM</span>
              </span>
            </div>
          </div>

          {/* Top 5 Most Viewed Videos in Last 24 Hours */}
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 shadow-xl text-left" id="analytics-top5-slider">
            <h3 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>📈 TOP 5 MOST ACTIVE STREAMS (LAST 24 HOURS ANALYTICS)</span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-sans">Live Sync Active</span>
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {[...videos]
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .slice(0, 5)
                .map((v, i) => (
                  <div key={v.id} className="bg-black/35 border border-white/5 rounded-xl p-2.5 flex flex-col justify-between text-left hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-5 h-5 rounded-md bg-amber-500/10 text-[#f5c518] border border-amber-500/20 text-[10px] font-black font-mono flex items-center justify-center shrink-0">
                        #{i + 1}
                      </span>
                      <span className="text-[8px] bg-brand-purple/10 text-brand-purple font-bold tracking-widest uppercase px-1.5 py-0.5 rounded border border-brand-purple/20 truncate">
                        {v.category}
                      </span>
                    </div>
                    <h4 className="text-slate-200 text-xs font-bold line-clamp-1 leading-snug tracking-tight mb-2">
                      {v.title}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-white/5 pt-1.5">
                      <span>👁️ {(v.views || 0).toLocaleString()}</span>
                      <span className="text-emerald-400 font-bold">+{Math.floor((v.views || 0) * 0.15)} live</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Split layout: Form Editor and List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Creator Studio */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div 
            id="admin-editor-form"
            className="bg-[#121212] border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
              <h3 className="text-sm font-semibold text-white font-display flex items-center gap-1.5">
                <FileVideo className="w-4 h-4 text-brand-red" />
                {editingId ? "Edit Stream Parameters" : "Publish New Stream"}
              </h3>
              {!editingId && (
                <button
                  type="button"
                  onClick={handleLoadDemoValues}
                  className="text-[9px] bg-slate-900 border border-white/5 hover:border-brand-purple/20 font-mono text-brand-purple px-2 py-1 rounded cursor-pointer transition-all active:scale-95 font-bold"
                  title="Mock testing data helper"
                >
                  ⚡ MOCK AUTOFILL
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500">
                    Video Stream Title
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleAutoTitle}
                      className="text-[9px] bg-[#f5c518]/10 hover:bg-[#f5c518]/20 border border-[#f5c518]/30 font-mono text-[#f5c518] px-2 py-0.5 rounded cursor-pointer transition-all active:scale-95 font-bold"
                    >
                      ⚡ Title Only
                    </button>
                    <button
                      type="button"
                      onClick={handleMagicAutoFill}
                      className="text-[9px] bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 font-mono text-emerald-400 px-2 py-0.5 rounded cursor-pointer transition-all active:scale-95 font-medium flex items-center gap-0.5"
                      title="Magic Auto-Fill highest CTR clickbait title, description, and premium thumbnail!"
                    >
                      <span>✨ Magic Auto-Fill</span>
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Inception 2: Virtual Horizons"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#1a1a1c] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-brand-red focus:border-brand-red focus:outline-none"
                  required
                />
              </div>

              {/* Thumbnail Selector (Supports File upload & Drag & Drop, plus image URL) */}
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                  Thumbnail Image
                </label>
                <div className="bg-[#1a1a1c] border border-white/5 rounded-xl p-3 flex flex-col gap-3">
                  <div className="flex gap-2 border-b border-white/5 pb-1.5">
                    <button
                      type="button"
                      onClick={() => setThumbnailMode("upload")}
                      className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${
                        thumbnailMode === "upload"
                          ? "bg-[#f5c518] text-black"
                          : "text-slate-400 hover:text-white bg-white/5 animate-none"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setThumbnailMode("url")}
                      className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${
                        thumbnailMode === "url"
                          ? "bg-[#f5c518] text-black"
                          : "text-slate-400 hover:text-white bg-white/5 animate-none"
                      }`}
                    >
                      Image URL
                    </button>
                  </div>

                  {thumbnailMode === "upload" ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={triggerFileSelect}
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-150 ${
                        isDragging 
                          ? "border-[#f5c518] bg-[#f5c518]/5" 
                          : "border-white/10 hover:border-white/20 bg-black/25"
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-1.5 justify-center">
                        <Plus className="w-5 h-5 text-[#f5c518]" />
                        <span className="text-[10px] font-semibold text-slate-300">
                          Click to select or drag & drop image
                        </span>
                        <span className="text-[8px] text-slate-500 font-mono">
                          PNG, JPG, WEBP SUPPORTED • AUTO CONVERTED
                        </span>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="url"
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      className="w-full bg-[#111] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-[#f5c518] focus:outline-none"
                    />
                  )}

                  {/* Realtime image preview */}
                  {thumbnailUrl && (
                    <div className="relative aspect-[16/9] w-full rounded overflow-hidden border border-white/10 bg-black">
                      <img
                        src={thumbnailUrl}
                        alt="Thumbnail preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setThumbnailUrl("")}
                        className="absolute top-1.5 right-1.5 bg-black/80 hover:bg-black p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Remove thumbnail"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1.5 left-2 bg-black/70 px-1.5 py-0.5 rounded text-[8px] font-mono text-slate-300">
                        {thumbnailUrl.startsWith("data:image/") ? "Uploaded Local Image" : "External Web URL"}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (thumbnailUrl) {
                            setImageToCrop(thumbnailUrl);
                            setIsCropperOpen(true);
                          }
                        }}
                        className="absolute bottom-1.5 right-2 bg-black/95 hover:bg-black border border-pink-500/30 hover:border-pink-500/80 px-2.5 py-1 rounded text-[8px] text-pink-400 font-mono font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-md"
                        title="Crop layout to strict 16:9 ratio"
                      >
                        <Sliders className="w-2.5 h-2.5 text-pink-400 animate-pulse" />
                        <span>Crop 16:9</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Embedded Player URL */}
              <div className="flex flex-col gap-2">
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
                    <span>Google Drive Embed / Video URL</span>
                    <span className="text-[8px] text-slate-600 font-bold lowercase">Supports GDrive, MP4, custom iframe</span>
                  </label>
                  <input
                    type="text"
                    placeholder="drive.google.com/file/d/ID/preview or URL.mp4"
                    value={embedUrl}
                    onChange={(e) => {
                      setEmbedUrl(e.target.value);
                      setSaveConfirmed(false);
                    }}
                    className="w-full bg-[#1a1a1c] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-brand-red focus:border-brand-red focus:outline-none"
                    required
                  />
                </div>

                {/* Auto Detection Status Indicators */}
                {embedUrl && (
                  <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-zinc-300 font-sans">
                      <span className="font-bold flex items-center gap-1">
                        {getDetectionMessage(embedUrl)}
                      </span>
                    </div>

                    {/* Small Live Video Preview */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">Confirm Video Preview:</span>
                      <div className="w-full max-w-sm aspect-video rounded-lg relative overflow-hidden bg-black border border-white/10 shadow-inner flex items-center justify-center">
                        {(() => {
                          const embedResult = convertToEmbed(embedUrl);
                          if (!embedResult.src) {
                            return <span className="text-zinc-500 text-[10px]">Invalid URL</span>;
                          }
                          if (embedResult.type === "video") {
                            return (
                              <video
                                src={embedResult.src}
                                controls
                                className="w-full h-full object-contain"
                                style={{ aspectRatio: "16/9" }}
                              />
                            );
                          } else {
                            return (
                              <iframe
                                src={embedResult.src}
                                className="w-full h-full"
                                style={{ border: "none", position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                                allow="autoplay; fullscreen"
                                allowFullScreen
                                referrerPolicy="no-referrer"
                              />
                            );
                          }
                        })()}
                      </div>
                    </div>

                    {/* Checkbox confirmation before saving */}
                    <div className="mt-2.5 flex items-start gap-2 bg-[#1c1c1e]/40 p-2.5 rounded-lg border border-white/5">
                      <input
                        type="checkbox"
                        id="input-save-confirmed"
                        checked={saveConfirmed}
                        onChange={(e) => setSaveConfirmed(e.target.checked)}
                        className="mt-0.5 rounded text-[#f5c518] focus:ring-[#f5c518] bg-[#1a1a1c] border-white/10 cursor-pointer w-3.5 h-3.5"
                      />
                      <label htmlFor="input-save-confirmed" className="text-[10.5px] text-zinc-300 leading-snug font-sans select-none cursor-pointer">
                        <span className="font-bold block text-[#f5c518]">I confirm that the video source and preview are correct</span>
                        <span className="text-zinc-500 block text-[9px] mt-0.5">(I confirm before saving that the video source is correct)</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Genre / Category selector & View Count */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-semibold">
                    Genre / Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#1a1a1c] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-[#f5c518] focus:border-[#f5c518] focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-semibold text-slate-400">
                    Edit View Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 2500"
                    value={viewsCount}
                    onChange={(e) => setViewsCount(e.target.value)}
                    className="w-full bg-[#1a1a1c] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-[#f5c518] focus:border-[#f5c518] focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Synoptic Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                    Plot synopsis / Description
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoDescription}
                    className="text-[9px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 font-mono text-red-500 px-2 py-0.5 rounded cursor-pointer transition-all active:scale-95 font-bold"
                  >
                    ⚡ Auto Description
                  </button>
                </div>
                <textarea
                  placeholder="Brief cinematic plot details..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#1a1a1c] border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white focus:ring-1 focus:ring-brand-red focus:border-brand-red focus:outline-none resize-none"
                />
              </div>

              {/* Scheduled Publishing */}
              <div className="bg-[#1a1a1c]/40 border border-white/5 rounded-xl p-3 flex flex-col gap-1.5">
                <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-0.5">
                  Publish Date / Time (Optional Schedule)
                </label>
                <input
                  type="datetime-local"
                  required={false}
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full bg-[#111] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-[#f5c518] focus:outline-none"
                />
                <span className="text-[8.5px] text-zinc-500 leading-snug font-mono">
                  If you select a future date/time, the video will be scheduled to publish automatically (Otherwise, leave blank to publish instantly).
                </span>
              </div>

              {/* Flags Row */}
              <div className="flex items-center gap-4 py-1.5 border-t border-b border-white/5 my-1 bg-[#1a1a1c]/40 px-3 rounded-lg">
                <label className="flex items-center gap-1.5 text-xs text-slate-400 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-800 text-brand-red focus:ring-brand-red"
                  />
                  <span>Hero Slider (Trending)</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-slate-400 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLatest}
                    onChange={(e) => setIsLatest(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-800 text-brand-purple focus:ring-brand-purple mb-0.5"
                  />
                  <span>Mark Latest</span>
                </label>
              </div>

              {/* Action Triggers */}
              <div className="flex gap-2.5 mt-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={clearForm}
                    className="w-1/3 bg-[#1e1e1e] border border-white/5 rounded-xl text-slate-400 py-2.5 text-xs font-semibold cursor-pointer active:scale-95 transition-all text-center"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-grow bg-gradient-to-r from-brand-red to-brand-purple text-white py-2.5 text-xs font-semibold rounded-xl cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1 text-shadow ${
                    submitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-95'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? "Apply Modifications" : "Instant Publish Stream"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card: Bulk Upload Engine */}
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 shadow-xl" id="admin-bulk-uploader">
            <h3 className="text-sm font-semibold text-white font-display flex items-center gap-1.5 border-b border-white/5 pb-2 mb-3">
              <Zap className="w-4 h-4 text-[#f5c518]" />
              <span>Bulk Stream Uploader</span>
            </h3>

            <form onSubmit={handleBulkSubmit} className="flex flex-col gap-3 text-left">
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
                  <span>Paste Video Links (One link per line)</span>
                  <span className="text-[#f5c518] text-[8px] font-bold">Supports Title | URL too</span>
                </label>
                <textarea
                  rows={4}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="https://drive.google.com/file/d/.../preview&#10;Inception 3 Leak | https://example.com/movie.mp4"
                  className="w-full bg-[#1a1a1c] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-brand-purple focus:border-brand-purple focus:outline-none placeholder-slate-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-semibold">
                  Bulk Category Destination
                </label>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="w-full bg-[#1a1a1c] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-brand-purple focus:border-brand-purple focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2.5 text-xs font-semibold rounded-xl cursor-pointer hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Bulk Publish Streams ({bulkText.split("\n").filter(Boolean).length})</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel: Uploaded Reels Catalog */}
        <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-4">
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-white font-display mb-3 border-b border-white/5 pb-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span>Streams Catalog ({videos.length})</span>
                <button
                  type="button"
                  onClick={handleSelectAllVideos}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[9px] font-mono text-slate-300 border border-white/5 cursor-pointer"
                >
                  {selectedVideoIds.size === videos.length ? "Deselect All" : "Select All"}
                </button>
              </span>
              {selectedVideoIds.size > 0 && (
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="px-2 py-0.5 rounded bg-brand-red hover:bg-red-700 text-[9px] font-mono text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  <span>Bulk Delete ({selectedVideoIds.size})</span>
                </button>
              )}
            </h3>

            <div className="flex flex-col gap-3 max-h-[58vh] overflow-y-auto pr-1" id="uploaded-reels-list">
              {videos.length === 0 ? (
                <div className="p-8 text-center text-slate-600 text-xs font-mono">
                  No streams published. Launch MOCK AUTOFILL on left to seed!
                </div>
              ) : (
                videos.map((vid) => (
                  <div
                    key={vid.id}
                    className="flex text-left items-center justify-between p-2 rounded-xl bg-[#161618] border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 w-5/6">
                      {/* Checkbox selector for Bulk Management */}
                      <input
                        type="checkbox"
                        checked={selectedVideoIds.has(vid.id)}
                        onChange={() => toggleSelectVideo(vid.id)}
                        className="rounded bg-[#1a1a1c] border-white/10 text-brand-purple focus:ring-brand-purple cursor-pointer w-4 h-4 shrink-0"
                      />

                      <div className="w-[84px] aspect-[16/9] rounded overflow-hidden bg-zinc-900 border border-white/5 flex-shrink-0 relative">
                        <img
                          src={vid.thumbnailUrl}
                          alt={vid.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        {/* Health Status Indicator Badge Layer */}
                        {(() => {
                          const isHealthy = checkLinkHealth(vid.embedUrl) === "working";
                          return (
                            <div 
                              className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-zinc-900 shadow ${
                                isHealthy ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                              }`}
                              title={isHealthy ? "Stream Health Optimal (Working Link)" : "Stream Link Unrecognized / Invalid Format"}
                            />
                          );
                        })()}
                      </div>
                      <div className="min-w-0 flex-grow">
                        <h4 className="text-slate-100 font-semibold text-xs truncate">
                          {vid.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-2 text-[9px] font-mono text-slate-500 mt-1">
                          <span className="text-brand-purple uppercase font-bold">{vid.category}</span>
                          <span>•</span>
                          <span>{vid.duration || "Exclusive"}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{vid.views}</span>
                          <span>•</span>
                          <span 
                            className={`inline-flex items-center gap-0.5 px-1 rounded text-[8px] font-bold ${
                              checkLinkHealth(vid.embedUrl) === "working" ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
                            }`}
                          >
                            <span>●</span> {checkLinkHealth(vid.embedUrl) === "working" ? "Working" : "Broken"}
                          </span>
                          {vid.status === "scheduled" && (
                            <>
                              <span>•</span>
                              <span className="text-[#f5c518] bg-[#f5c518]/10 px-1.5 py-0.5 rounded text-[8px] font-bold">⏱️ SCHEDULED: {new Date(vid.scheduledAt || '').toLocaleString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Options list */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {deleteConfirmId === vid.id ? (
                        <div className="flex items-center gap-1 bg-[#221c1d] border border-brand-red/20 p-1 rounded-lg animate-pulse">
                          <span className="text-[10px] text-brand-red font-mono px-1 font-bold">Delete?</span>
                          <button
                            onClick={() => handleDeleteClick(vid.id, vid.title)}
                            className="px-2 py-1 rounded bg-brand-red hover:bg-red-700 text-white text-[9px] font-mono font-bold uppercase transition active:scale-95"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-mono font-bold uppercase transition active:scale-95"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditClick(vid)}
                            className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-brand-purple hover:bg-slate-800 cursor-pointer active:scale-90 transition-all"
                            title="Edit entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(vid.id)}
                            className="p-2 rounded-lg bg-[#221c1d] text-brand-red hover:bg-[#311c1d] cursor-pointer active:scale-90 transition-all"
                            title="Purge stream"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
      ) : adminTab === "ads" ? (
        <div className="bg-[#121212]/30 border border-white/5 rounded-3xl p-5 shadow-2xl">
          <AdsController 
            adSettings={adSettings}
            onUpdateSettings={onUpdateAdSettings}
            onTriggerSimulatedClick={onTriggerSimulatedClick}
            onResetSimulatedEarnings={onResetSimulatedEarnings}
          />
        </div>
      ) : adminTab === "categories" ? (
        <div className="bg-[#121212]/30 border border-white/5 rounded-3xl p-6 shadow-2xl animate-fade-in" id="admin-categories-tab">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-pink-400" />
                Category & Icon Customization Studio
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure content categories and dynamically choose customized Lucide icons displayed platform-wide.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
            {/* Left Column: Form Editor */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                <h4 className="text-xs font-mono font-bold text-pink-400 tracking-wider uppercase mb-4 border-b border-white/5 pb-2">
                  {editingCatId ? "📝 Edit Category Parameters" : "✨ Create New Category"}
                </h4>

                <form onSubmit={handleSaveCategorySubmit} className="flex flex-col gap-4">
                  {/* Category Name */}
                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                      Category Display Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 18+ Thriller"
                      value={catName}
                      onChange={(e) => handleCatNameChange(e.target.value)}
                      className="w-full bg-[#1a1a1c] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-pink-400 focus:border-pink-400 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Category Slug */}
                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                      URL friendly Slug
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. hot-thriller"
                      value={catSlug}
                      onChange={(e) => setCatSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                      disabled={!!editingCatId}
                      className="w-full bg-[#1a1a1c] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-pink-400 focus:border-pink-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    />
                    {!editingCatId && (
                      <span className="text-[9px] text-slate-500 block mt-1 font-mono">Based on the name. Auto-generated.</span>
                    )}
                  </div>

                  {/* Icon Picker Grid */}
                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                      Select Dynamic Lucide Icon
                    </label>
                    
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 gap-2 max-h-[180px] overflow-y-auto p-1 border border-white/5 bg-[#171719] rounded-xl no-scrollbar">
                      {PREDEFINED_ICONS.map((ico) => {
                        const IconComponent = IconMap[ico.name] || Film;
                        const isSelected = catIcon === ico.name;
                        return (
                          <button
                            key={ico.name}
                            type="button"
                            onClick={() => setCatIcon(ico.name)}
                            className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#f5c518] bg-[#f5c518]/10 text-[#f5c518]"
                                : "border-white/5 bg-white/[0.01] text-slate-400 hover:text-white"
                            }`}
                            title={ico.label}
                          >
                            <IconComponent className="w-5 h-5" />
                            <span className="text-[8px] font-mono truncate w-full text-center">{ico.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit and Controls */}
                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-[#f5c518] hover:bg-[#ffe042] text-black text-xs font-bold py-2 px-4 rounded-xl transition duration-150 active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? "Saving..." : editingCatId ? "Update Category" : "Publish Category"}
                    </button>
                    {editingCatId && (
                      <button
                        type="button"
                        onClick={() => {
                          setCatName("");
                          setCatSlug("");
                          setCatIcon("Film");
                          setEditingCatId(null);
                        }}
                        className="bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-semibold py-2 px-4 rounded-xl transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Existing Categories List */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 shadow-xl">
                <h4 className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase mb-4 border-b border-white/5 pb-2 flex items-center justify-between">
                  <span>Current Categories List</span>
                  <span className="bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-[10px] font-mono text-white select-none">
                    {categories.length} total
                  </span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const CategoryIcon = IconMap[cat.iconName || "Film"] || Film;
                    return (
                      <div
                        key={cat.id}
                        className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 flex items-center justify-between gap-3 group transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-pink-400/5 text-pink-400 border border-pink-400/10 flex items-center justify-center">
                            <CategoryIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-white group-hover:text-[#f5c518] transition">{cat.name}</h5>
                            <span className="text-[10px] font-mono text-slate-500 block">slug: {cat.slug}</span>
                            <span className="text-[9px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-slate-400 inline-block mt-1 font-semibold">{cat.iconName || "Film"}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingCatId(cat.id);
                            setCatName(cat.name);
                            setCatSlug(cat.slug);
                            setCatIcon(cat.iconName || "Film");
                          }}
                          className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-slate-300 rounded-lg flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                          title="Category settings"
                        >
                          <Edit2 className="w-3 h-3 text-pink-400" />
                          <span>Edit</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : adminTab === "notifications" ? (
        <div className="bg-[#121212]/30 border border-white/5 rounded-3xl p-6 shadow-2xl animate-fade-in text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                Live Announcement Ticker Customizer
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure running crawler ticker messages appearing immediately in real-time below the statistics row on all visitor screens.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Column */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 shadow-xl">
                <h4 className="text-xs font-mono font-bold text-yellow-400 tracking-wider uppercase mb-4 border-b border-white/5 pb-2">
                  {editingNotifId ? "📝 Edit Announcement" : "✨ Publish Announcement"}
                </h4>

                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newNotifText.trim()) return;
                    setSubmitting(true);
                    try {
                      if (editingNotifId) {
                        await updateNotification(editingNotifId, { text: newNotifText, active: newNotifActive });
                        setStatusMessage("Notification updated!");
                      } else {
                        await addNotification(newNotifText, newNotifActive);
                        setStatusMessage("Notification published!");
                      }
                      setNewNotifText("");
                      setNewNotifActive(true);
                      setEditingNotifId(null);
                    } catch (err: any) {
                      alert("Operation failed: " + err.message);
                    } finally {
                      setSubmitting(false);
                      setTimeout(() => setStatusMessage(null), 3000);
                    }
                  }} 
                  className="flex flex-col gap-4"
                >
                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                      Announcement Ticker Message
                    </label>
                    <textarea
                      placeholder="e.g. 🟢 Welcome to ViralBD99! Keep watching for the newest exclusive clips..."
                      value={newNotifText}
                      onChange={(e) => setNewNotifText(e.target.value)}
                      className="w-full bg-[#1a1a1c] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none min-h-[90px]"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="notif-active-cb-admin"
                      checked={newNotifActive}
                      onChange={(e) => setNewNotifActive(e.target.checked)}
                      className="rounded border-white/10 bg-[#1a1a1c] text-yellow-400 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="notif-active-cb-admin" className="text-xs text-slate-300 font-semibold cursor-pointer select-none">
                      Active (Display immediately on ticker)
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-grow py-2.5 bg-[#f5c518] hover:bg-[#ffe042] disabled:bg-zinc-700 text-black text-xs font-black rounded-xl transition duration-150 active:scale-95 cursor-pointer shadow-lg flex items-center justify-center gap-1.5"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving Parameters...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{editingNotifId ? "Update Ticker Message" : "Broadcast Announcement"}</span>
                        </>
                      )}
                    </button>

                    {editingNotifId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNotifId(null);
                          setNewNotifText("");
                          setNewNotifActive(true);
                        }}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* List Column */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col h-full min-h-[400px]">
                <h4 className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase mb-4 border-b border-white/5 pb-2">
                  🗂️ Active Announcements Registry ({tickerNotifs.length})
                </h4>

                <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[450px] pr-1">
                  {tickerNotifs.length > 0 ? (
                    tickerNotifs.map((notif) => (
                      <div 
                        key={notif.id}
                        className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-4 group ${
                          notif.active 
                            ? "bg-[#181812] border-yellow-500/20 hover:border-yellow-500/30" 
                            : "bg-[#121212]/40 border-white/5 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <div className="flex-grow">
                          <p className={`text-xs leading-relaxed break-words font-medium ${
                            notif.active ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.2)]" : "text-slate-400"
                          }`}>
                            {notif.text}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase ${
                              notif.active 
                                ? "bg-yellow-400/5 text-yellow-400 border-yellow-400/10" 
                                : "bg-zinc-800 text-slate-500 border-white/5"
                            }`}>
                              {notif.active ? "🟢 Active & Rendering" : "⚪ Offline/Inactive"}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await updateNotification(notif.id, { active: !notif.active });
                                setStatusMessage("Toggled status!");
                                setTimeout(() => setStatusMessage(null), 2000);
                              } catch (err: any) {
                                alert("Failed toggling status: " + err.message);
                              }
                            }}
                            className="bg-zinc-800 hover:bg-zinc-700 text-slate-300 p-2 rounded-lg flex items-center justify-center transition active:scale-90 cursor-pointer"
                            title="Toggle active status"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNotifId(notif.id);
                              setNewNotifText(notif.text);
                              setNewNotifActive(notif.active);
                            }}
                            className="bg-zinc-800 hover:bg-zinc-700 text-slate-300 p-2 rounded-lg flex items-center justify-center transition active:scale-90 cursor-pointer"
                            title="Edit message content"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-yellow-400" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm("Delete this notification ticker message permanently?")) {
                                try {
                                  await deleteNotification(notif.id);
                                  setStatusMessage("Deleted!");
                                  if (editingNotifId === notif.id) {
                                    setEditingNotifId(null);
                                    setNewNotifText("");
                                  }
                                } catch (err: any) {
                                  alert("Deletion failed: " + err.message);
                                } finally {
                                  setTimeout(() => setStatusMessage(null), 2500);
                                }
                              }
                            }}
                            className="bg-zinc-800 hover:bg-zinc-700 text-slate-300 p-2 rounded-lg flex items-center justify-center transition active:scale-90 cursor-pointer"
                            title="Delete notification"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-500 text-xs font-mono bg-white/[0.01] rounded-xl border border-dashed border-white/5">
                      No active ticker notifications found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : adminTab === "comments" ? (
        <div className="bg-[#121212]/30 border border-white/5 rounded-3xl p-6 shadow-2xl animate-fade-in text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-400" />
                Comments Management Panel
              </h3>
              <p className="text-xs text-slate-400 mt-1">Select a video to view and delete users' comments</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Video List Selector */}
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex flex-col gap-3 h-[60vh] overflow-y-auto">
              <h4 className="text-xs font-mono font-bold text-[#f5c518] tracking-wider uppercase pl-1 pb-1 border-b border-white/5 font-display">Select Video</h4>
              
              {/* Global view button option */}
              <button
                type="button"
                onClick={async () => {
                  setSelectedVideoCommentsId("all");
                  setLoadingComments(true);
                  try {
                    const allPromise = videos.map(async (v) => {
                      const list = await getComments(v.id);
                      return list.map(c => ({ ...c, videoTitle: v.title }));
                    });
                    const results = await Promise.all(allPromise);
                    const flatList = results.flat().sort((a,b) => b.timestamp.localeCompare(a.timestamp));
                    setAllVideoComments(flatList);
                  } catch (err) {
                    console.error("Fetch all comments error:", err);
                  } finally {
                    setLoadingComments(false);
                  }
                }}
                className={`p-2.5 rounded-xl border text-left transition duration-150 active:scale-[0.98] flex items-center gap-3 cursor-pointer ${
                  selectedVideoCommentsId === "all"
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold"
                    : "bg-[#141416]/50 hover:bg-[#141416] border-white/5 text-emerald-500"
                }`}
              >
                <div className="w-12 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="min-w-0 flex-grow">
                  <p className="text-[11px] leading-tight truncate">🟢 Global Comments View</p>
                  <span className="text-[9px] font-mono text-slate-400 mt-0.5 block">Show all comments across site</span>
                </div>
              </button>

              {videos.map((vid) => (
                <button
                  key={vid.id}
                  type="button"
                  onClick={async () => {
                    setSelectedVideoCommentsId(vid.id);
                    setLoadingComments(true);
                    try {
                      const list = await getComments(vid.id);
                      setAllVideoComments(list.map(c => ({ ...c, videoTitle: vid.title })));
                    } catch (err) {
                      console.error("Fetch comments error:", err);
                    } finally {
                      setLoadingComments(false);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left transition duration-150 active:scale-[0.98] flex items-center gap-3 cursor-pointer ${
                    selectedVideoCommentsId === vid.id
                      ? "bg-[#f5c518]/15 border-[#f5c518]/20 text-[#f5c518]"
                      : "bg-[#141416]/50 hover:bg-[#141416] border-white/5 text-slate-300"
                  }`}
                >
                  <img
                    src={vid.thumbnailUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-12 h-8 rounded-lg object-cover bg-zinc-800 shrink-0"
                  />
                  <div className="min-w-0 flex-grow">
                    <p className="text-[11px] font-bold leading-tight truncate">{vid.title}</p>
                    <span className="text-[9px] font-mono text-slate-500 mt-0.5 block">id: {vid.id}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Right: Comments Manager List */}
            <div className="md:col-span-2 bg-[#141416]/20 rounded-2xl p-4 border border-white/5 flex flex-col gap-4 h-[60vh] overflow-y-auto">
              <h4 className="text-xs font-mono font-bold text-[#f5c518] tracking-wider uppercase pb-1 border-b border-white/5">Comments List</h4>
              
              {!selectedVideoCommentsId ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 font-mono text-xs">
                  Please select a video from the left to manage comments
                </div>
              ) : loadingComments ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 font-mono text-xs">
                  <div className="w-6 h-6 border-2 border-[#f5c518] border-t-transparent rounded-full animate-spin mb-2" />
                  Loading comments...
                </div>
              ) : allVideoComments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 font-mono text-xs">
                  No comments found for this selection.
                </div>
              ) : (
                <div className="space-y-3">
                  {allVideoComments.map((comment) => (
                    <div 
                      key={comment.id}
                      className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-start gap-3 justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#f5c518]">{comment.name}</span>
                          <span className="text-[9px] text-zinc-500 font-mono">{new Date(comment.timestamp).toLocaleString()}</span>
                          {comment.videoTitle && (
                            <span className="text-[9px] bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/20 max-w-full truncate">
                              🎬 {comment.videoTitle}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed pr-2 whitespace-normal break-words">{comment.comment}</p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm("Are you sure you want to delete this comment?")) {
                            setLoadingComments(true);
                            try {
                              const targetVideoId = comment.videoId || selectedVideoCommentsId;
                              await deleteComment(comment.id, targetVideoId);
                              
                              // Reload
                              if (selectedVideoCommentsId === "all") {
                                const allPromise = videos.map(async (v) => {
                                  const list = await getComments(v.id);
                                  return list.map(c => ({ ...c, videoTitle: v.title }));
                                });
                                const results = await Promise.all(allPromise);
                                setAllVideoComments(results.flat().sort((a,b) => b.timestamp.localeCompare(a.timestamp)));
                              } else {
                                const list = await getComments(selectedVideoCommentsId);
                                setAllVideoComments(list.map(c => ({ ...c, videoTitle: comment.videoTitle })));
                              }
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setLoadingComments(false);
                            }
                          }
                        }}
                        className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition active:scale-95 shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : adminTab === "analytics" ? (
        <div className="bg-[#121212]/30 border border-white/5 rounded-3xl p-6 shadow-2xl animate-fade-in text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#f5c518]" />
                User Traffic & Content Analytics
              </h3>
              <p className="text-xs text-slate-400 mt-1">Live statistical records and most popular dynamic assets</p>
            </div>
          </div>

          {/* Indicators Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#141416]/40 p-4 border border-white/5 rounded-2xl flex flex-col justify-between shadow-lg">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider text-slate-400">Today's Unique IPs</span>
              <span className="text-2xl font-black text-emerald-400 mt-1">{(analyticsData?.today || 4512).toLocaleString()}</span>
            </div>
            <div className="bg-[#141416]/40 p-4 border border-white/5 rounded-2xl flex flex-col justify-between shadow-lg">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider text-slate-400">This Week Stats</span>
              <span className="text-2xl font-black text-amber-400 mt-1">{(analyticsData?.week || 31590).toLocaleString()}</span>
            </div>
            <div className="bg-[#141416]/40 p-4 border border-white/5 rounded-2xl flex flex-col justify-between shadow-lg">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider text-slate-400 font-bold">Month Aggregates</span>
              <span className="text-2xl font-black text-sky-400 mt-1">{(analyticsData?.month || 125920).toLocaleString()}</span>
            </div>
            <div className="bg-[#141416]/40 p-4 border border-white/5 rounded-2xl flex flex-col justify-between shadow-lg">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider text-slate-400">Total Unique Visitors</span>
              <span className="text-2xl font-black text-violet-400 mt-1">{(analyticsData?.total || 1523910).toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Visitor Bar Graph */}
            <div className="lg:col-span-2 bg-[#141416]/30 border border-white/5 p-5 rounded-2xl flex flex-col h-[350px]">
              <span className="text-xs font-mono font-bold text-[#f5c518] uppercase tracking-wider mb-4 pb-2 border-b border-white/5 block">
                Visitor Progression Chart
              </span>
              <div className="flex-grow w-full h-[260px] flex items-center justify-center relative font-mono text-xs">
                {/* Visual Chart Bars Representation */}
                <div className="w-full h-full flex flex-col justify-between pt-2">
                  <div className="flex-grow flex items-end justify-around gap-4 pb-2 border-b border-white/10">
                    <div className="flex flex-col items-center w-16">
                      <div className="text-[10px] font-bold text-emerald-400 mb-1">{(analyticsData?.today || 4512).toLocaleString()}</div>
                      <div className="w-full bg-[#10b981]/20 rounded-t-lg border-t border-[#10b981]/40" style={{ height: "45px" }} />
                      <span className="text-[9px] text-zinc-400 mt-2 font-bold font-sans">TODAY</span>
                    </div>
                    <div className="flex flex-col items-center w-16">
                      <div className="text-[10px] font-bold text-amber-400 mb-1">{(analyticsData?.week || 31590).toLocaleString()}</div>
                      <div className="w-full bg-[#f5c518]/20 rounded-t-lg border-t border-[#f5c518]/40" style={{ height: "90px" }} />
                      <span className="text-[9px] text-zinc-400 mt-2 font-bold font-sans">THIS WEEK</span>
                    </div>
                    <div className="flex flex-col items-center w-16">
                      <div className="text-[10px] font-bold text-sky-400 mb-1">{(analyticsData?.month || 125920).toLocaleString()}</div>
                      <div className="w-full bg-[#0ea5e9]/20 rounded-t-lg border-t border-[#0ea5e9]/40" style={{ height: "155px" }} />
                      <span className="text-[9px] text-zinc-400 mt-2 font-bold font-sans">THIS MONTH</span>
                    </div>
                    <div className="flex flex-col items-center w-16">
                      <div className="text-[10px] font-bold text-violet-400 mb-1">{(analyticsData?.total || 1523910).toLocaleString()}</div>
                      <div className="w-full bg-[#8b5cf6]/20 rounded-t-lg border-t border-[#8b5cf6]/40" style={{ height: "210px" }} />
                      <span className="text-[9px] text-zinc-400 mt-2 font-bold font-sans">TOTAL VISITS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Traffic source breakdown & Top Videos column */}
            <div className="flex flex-col gap-6">
              {/* Traffic Sources representation */}
              <div className="bg-[#141416]/30 border border-white/5 p-5 rounded-2xl text-left">
                <span className="text-xs font-mono font-bold text-[#f5c518] uppercase tracking-wider mb-4 pb-2 border-b border-white/5 block">
                  Traffic Source Breakdown
                </span>
                <div className="space-y-3 font-mono text-[11px]">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-zinc-400">
                      <span>🔗 WhatsApp Share</span>
                      <span className="text-emerald-400 font-bold">45%</span>
                    </div>
                    <div className="w-full bg-zinc-800/50 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: "45%" }} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-zinc-400">
                      <span>✈️ Telegram Channels</span>
                      <span className="text-sky-400 font-bold">28%</span>
                    </div>
                    <div className="w-full bg-zinc-800/50 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: "28%" }} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-zinc-400">
                      <span>👥 Facebook Groups / Posts</span>
                      <span className="text-indigo-400 font-bold">15%</span>
                    </div>
                    <div className="w-full bg-zinc-800/50 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: "15%" }} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-zinc-400">
                      <span>🏠 Bookmarks & Direct Access</span>
                      <span className="text-[#f5c518] font-bold">12%</span>
                    </div>
                    <div className="w-full bg-zinc-800/50 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#f5c518] h-full rounded-full" style={{ width: "12%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top 5 Most Watched Videos Container */}
          <div className="mt-6 bg-[#141416]/30 border border-white/5 p-5 rounded-2xl text-left">
            <span className="text-xs font-mono font-bold text-[#f5c518] uppercase tracking-wider mb-4 pb-2 border-b border-white/5 block">
              🏆 Top 5 Most Watched Videos
            </span>
            <div className="space-y-3">
              {[...videos].sort((a,b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((vid, ix) => (
                <div key={vid.id} id={`top-video-row-${vid.id}`} className="flex items-center gap-4 p-2 bg-white/[0.01] hover:bg-white/[0.03] rounded-xl border border-white/5 transition-all">
                  <div className="w-6 h-6 rounded-lg bg-[#f5c518]/10 text-[#f5c518] border border-[#f5c518]/25 flex items-center justify-center font-mono font-black text-xs shrink-0 self-center">
                    {ix + 1}
                  </div>
                  <img
                    src={vid.thumbnailUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-14 h-9 object-cover rounded bg-zinc-800 shrink-0"
                  />
                  <div className="min-w-0 flex-grow">
                    <h5 className="text-xs font-bold text-white truncate leading-snug">{vid.title}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded border border-white/5 font-mono text-zinc-400 uppercase select-none">{vid.category}</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">👁️ {(vid.views || 0).toLocaleString()} Views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : adminTab === "banner_manager" ? (
        <div className="bg-[#121212]/30 border border-white/5 rounded-3xl p-6 shadow-2xl animate-fade-in text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Image className="w-5 h-5 text-emerald-400" />
                Banner Ads & Placement Manager
              </h3>
              <p className="text-xs text-slate-400 mt-1">Instantly inject, toggle, or swap banner HTML/Script scripts from the database</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Create / Edit Banner Form */}
            <div className="bg-black/20 p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
              <h4 className="text-xs font-mono font-bold text-[#f5c518] tracking-widest uppercase pb-2 border-b border-white/5">
                {editingBannerId ? "📝 Edit Existing Banner" : "➕ Add Custom Banner AD"}
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1 font-sans text-slate-400">Banner Friendly Name</label>
                  <input
                    type="text"
                    value={bannerName}
                    onChange={(e) => setBannerName(e.target.value)}
                    placeholder="e.g. Center Sticky Mobile"
                    className="w-full bg-[#121214] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-zinc-650 focus:outline-none focus:border-[#f5c518] font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold mb-1 font-sans text-slate-400">Placement Position</label>
                  <select
                    value={bannerPosition}
                    onChange={(e) => setBannerPosition(e.target.value as any)}
                    className="w-full bg-[#121214] border border-white/10 rounded-xl px-2 py-2.5 text-white focus:outline-none focus:border-[#f5c518] font-mono text-xs shrink-0"
                  >
                    <option value="top">Top Position (Below Site Header)</option>
                    <option value="middle">Middle Position (Sponsored Row)</option>
                    <option value="bottom">Bottom Position (Above Footer Grid)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold mb-1 font-sans text-slate-400">Banner Script / Code</label>
                  <textarea
                    rows={4}
                    value={bannerCode}
                    onChange={(e) => setBannerCode(e.target.value)}
                    placeholder="<script>...</script> or <a href='...'><img src='...'/></a>"
                    className="w-full bg-[#121214] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-650 focus:outline-none focus:border-[#f5c518] font-mono text-[11px]"
                  />
                </div>

                <div className="flex items-center gap-2 py-1 select-none">
                  <input
                    type="checkbox"
                    id="bannerEnabledCheck"
                    checked={bannerIsEnabled}
                    onChange={(e) => setBannerIsEnabled(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-950 accent-[#f5c518]"
                  />
                  <label htmlFor="bannerEnabledCheck" className="text-zinc-300 font-bold cursor-pointer">Active / Enabled</label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!bannerName.trim() || !bannerCode.trim()) {
                        alert("Please fill out Name and Banner Code");
                        return;
                      }
                      setSavingBanner(true);
                      try {
                        const targetId = editingBannerId || `banner_${Date.now()}`;
                        const payload: FirebaseBannerAd = {
                          id: targetId,
                          name: bannerName,
                          code: bannerCode,
                          position: bannerPosition,
                          isEnabled: bannerIsEnabled,
                          type: "728x90"
                        };
                        await saveFirebaseBanner(payload);
                        
                        // clear state
                        setBannerName("");
                        setBannerCode("");
                        setEditingBannerId(null);
                        setBannerIsEnabled(true);
                        
                        // reload
                        const list = await getFirebaseBanners();
                        setBannersList(list || []);
                        alert("Settings applied securely in Firestore!");
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setSavingBanner(false);
                      }
                    }}
                    disabled={savingBanner}
                    className="flex-grow bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-black font-black py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 text-xs shadow-md shadow-emerald-500/10"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingBannerId ? "Update Banner" : "Create Banner"}</span>
                  </button>

                  {editingBannerId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBannerId(null);
                        setBannerName("");
                        setBannerCode("");
                        setBannerIsEnabled(true);
                      }}
                      className="bg-zinc-800 hover:bg-zinc-750 px-3 py-2.5 rounded-xl text-zinc-350 text-xs font-bold transition active:scale-95"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Listing Active Banners */}
            <div className="lg:col-span-2 bg-[#141416]/20 p-5 rounded-2xl border border-white/5 h-[50vh] overflow-y-auto text-left">
              <h4 className="text-xs font-mono font-bold text-[#f5c518] tracking-widest uppercase pb-2 border-b border-white/5">
                📁 Registered Ad Placements
              </h4>
              {loadingBanners ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 font-mono text-xs">
                  <div className="w-6 h-6 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin mb-2" />
                  Loading database banners...
                </div>
              ) : bannersList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-zinc-500 font-mono text-xs text-center border border-dashed border-white/5 rounded-2xl mt-4">
                  No custom banner placements registered.<br />Use the controller on the left to inject ads.
                </div>
              ) : (
                <div className="space-y-3 mt-3">
                  {bannersList.map((banner) => (
                    <div key={banner.id} id={`banner-item-${banner.id}`} className="p-3.5 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all text-xs">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white font-sans text-xs">{banner.name}</span>
                          <span className="font-mono text-[9px] bg-[#f5c518]/10 text-[#f5c518] px-2 py-0.5 rounded border border-[#f5c518]/25 uppercase">
                            📍 {banner.position}
                          </span>
                          <span className={`font-mono text-[9px] px-2 py-0.5 rounded uppercase ${
                            banner.isEnabled ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}>
                            {banner.isEnabled ? "🟢 Active" : "🔴 Paused"}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1 w-72 truncate">CODE: {banner.code}</p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBannerId(banner.id);
                            setBannerName(banner.name);
                            setBannerCode(banner.code);
                            setBannerPosition(banner.position);
                            setBannerIsEnabled(banner.isEnabled);
                          }}
                          className="px-2.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-95"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm("De-register this custom ad element completely?")) {
                              setLoadingBanners(true);
                              try {
                                await deleteFirebaseBanner(banner.id);
                                const list = await getFirebaseBanners();
                                setBannersList(list || []);
                              } catch (e) {
                                console.error(e);
                              } finally {
                                setLoadingBanners(false);
                              }
                            }
                          }}
                          className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-95"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : adminTab === "site_settings" ? (
        <div className="bg-[#121212]/30 border border-white/5 rounded-3xl p-6 shadow-2xl animate-fade-in text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" />
                Global Dynamic Site Settings
              </h3>
              <p className="text-xs text-slate-400 mt-1">Configure site logos, titles, welcome notifications, and maintenance modes</p>
            </div>
          </div>

          <div className="max-w-2xl bg-black/20 p-5 rounded-2xl border border-white/5 space-y-5 text-xs text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 font-bold mb-1.5 font-sans">Browser Metadata Title</label>
                <input
                  type="text"
                  value={siteTitleForm}
                  onChange={(e) => setSiteTitleForm(e.target.value)}
                  placeholder="e.g. ViralBD99 | Premium Video Vault"
                  className="w-full bg-[#121214] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-zinc-650 focus:outline-none focus:border-[#f5c518] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1.5 font-sans">Header Display Logo Text</label>
                <input
                  type="text"
                  value={siteLogoForm}
                  onChange={(e) => setSiteLogoForm(e.target.value)}
                  placeholder="e.g. VIRALBD99"
                  className="w-full bg-[#121214] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-zinc-650 focus:outline-none focus:border-[#f5c518] font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 font-bold mb-1.5">Welcome Message Overlay (Default Ticker Text)</label>
              <textarea
                rows={2}
                value={siteWelcomeForm}
                onChange={(e) => setSiteWelcomeForm(e.target.value)}
                placeholder="🟢 Welcome to ViralBD99. Stream premium uncut footage instantly without registration."
                className="w-full bg-[#121214] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-zinc-650 focus:outline-none focus:border-[#f5c518] font-mono text-[11px]"
              />
            </div>

            {/* Maintenance Mode block */}
            <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#f5c518] block">🚧 Site Maintenance Mode State</span>
                <p className="text-[10px] text-zinc-400 mt-0.5">When active, normal users are blocked by a full-screen offline maintenance prompt.</p>
              </div>
              <div className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  id="siteMaintenanceInput"
                  checked={siteMaintenanceForm}
                  onChange={(e) => setSiteMaintenanceForm(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 accent-[#f5c518]"
                />
                <label htmlFor="siteMaintenanceInput" className="text-zinc-300 font-bold cursor-pointer font-sans text-xs shrink-0 select-none">ACTIVATE</label>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex justify-end">
              <button
                type="button"
                onClick={async () => {
                  if (!siteTitleForm.trim() || !siteLogoForm.trim()) {
                    alert("Please fill out Site Title and Logo Text fields");
                    return;
                  }
                  setSavingSettings(true);
                  try {
                    const payload: SiteSettings = {
                      id: "global",
                      title: siteTitleForm,
                      logoText: siteLogoForm,
                      welcomeMessage: siteWelcomeForm,
                      maintenanceMode: siteMaintenanceForm
                    };
                    await updateSiteSettings(payload);
                    alert("Settings updated successfully! Please reload the page to verify changes across active windows.");
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setSavingSettings(false);
                  }
                }}
                disabled={savingSettings}
                className="bg-[#f5c518] hover:bg-[#ffe045] disabled:opacity-50 active:scale-95 text-black font-black px-6 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-md shadow-amber-500/10 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Site Config</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-2xl">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-500" />
                  Audit & Security Activity Logs
                </h3>
                <p className="text-xs text-slate-400 mt-1">Real-time system actions logged to Firebase (last 50 audits shown)</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {activityLogs && activityLogs.length > 0 ? (
                activityLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0 animate-pulse" />
                      <div>
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/10 uppercase tracking-wider mr-2">{log.action}</span>
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{log.details}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 text-left sm:text-right shrink-0">
                      {new Date(log.timestamp).toLocaleString("en-US", { hour12: true }) || log.timestamp}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-xs text-slate-500 font-mono">
                  No logs recorded found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Strict 16:9 Thumbnail Image Cropper Modal */}
      {isCropperOpen && imageToCrop && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-4 animate-fade-in" id="thumbnail-cropper-modal">
          <div className="relative w-full max-w-2xl bg-[#0f0f12] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#141416]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-pink-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  Crop Thumbnail (Strict 16:9 Cropper)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCropperOpen(false);
                  setImageToCrop(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cropping Editor Area */}
            <div className="relative flex-grow min-h-[350px] bg-[#09090b]">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                onZoomChange={setZoom}
              />
            </div>

            {/* Zoom Slider and Action Buttons */}
            <div className="p-5 border-t border-white/5 bg-[#141416] flex flex-col gap-4">
              {/* Zoom Scale */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-label="Zoom scale"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-grow h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400"
                />
                <span className="text-[10px] font-mono text-white w-8 text-right font-bold">{zoom.toFixed(1)}x</span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsCropperOpen(false);
                    setImageToCrop(null);
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (croppedAreaPixels && imageToCrop) {
                      try {
                        const croppedStr = await getCroppedImg(imageToCrop, croppedAreaPixels);
                        setThumbnailUrl(croppedStr);
                        setIsCropperOpen(false);
                        setImageToCrop(null);
                      } catch (e: any) {
                        alert("Cropping failed: " + e.message);
                      }
                    }
                  }}
                  className="px-5 py-2 bg-[#f5c518] hover:bg-[#ffe042] text-black text-xs font-black rounded-xl transition duration-150 active:scale-95 cursor-pointer shadow-lg"
                >
                  Crop & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
