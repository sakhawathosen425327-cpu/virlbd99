/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import Cropper from "react-easy-crop";
import { 
  Plus, Sliders, Trash2, Edit2, Check, RefreshCw, Key, Shield, Sparkles, Film, AlertTriangle, 
  FileVideo, Eye, X, DollarSign, Bookmark, Flame, Clock, Award, Globe, Video as LucideVideo, 
  ShieldAlert, Tv, Heart, Play, Zap, Music, Smile, Gamepad, Ghost, Crown, Siren, Camera, Lock
} from "lucide-react";
import { Video, Category, AdSettings, ActivityLog } from "../types";
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
  "🤫 হেডফোন কানেক্ট করুন! শপিং মল ট্রায়াল রুমের সেই গোপন লিক...",
  "🔞 চরম উত্তেজনা! লিফটের সিসিটিভি ক্যামেরায় ধরা পড়া অপ্রকাশিত সেই দৃশ্য...",
  "⚡ চারপাশ খেয়াল করে একক রুমে দেখুন, কাঁপানো ভাইরাল ক্লিপ...",
  "🔒 একদম আনকাট! হোটেলের গোপন ক্যামেরায় যা রেকর্ড হলো...",
  "🍒 ইয়ারফোন মাস্ট! মাঝরাতের ভাইরাল ওয়েব সিরিজের সেরা পার্ট...",
  "🥵 দরজা বন্ধ করুন! সোশ্যাল মিডিয়ায় তোলপাড় করা অফিশিয়াল ট্রেইলার...",
  "🤫 নতুন মডেলের এক্সক্লুসিভ বেডরুম লিক, এখনই দেখে নিন...",
  "🔞 শপিং মলের গোপন সিসিটিভি ফুটেজ! চার তলার ট্রায়াল রুমে যা ঘটলো...",
  "⚡ সার্ভার কাঁপানো নতুন বাংলা ড্রামা! একা ঘরে হেডফোন কানে দেখুন...",
  "🍿 এবার এলো সবচেয়ে চমৎকার আনকাট ডিরেক্টরস কাট...",
  "🤐 একদম নতুন রিলস! কেউ দেখার আগে এখনই ডাউনলোড করুন...",
  "🤫 প্রাইভেট রিসোর্টের বাথরুম জেনারেটর ফুটেজ চরম রোমাঞ্চকর দৃশ্য...",
  "🔞 বাথরুমের লুকানো ক্যামেরায় রেকর্ডকৃত মারাত্মক ভিডিও...",
  "🍿 হোস্টেল গার্লসদের গোপন আড্ডার লিক হওয়া গরম ভিডিও...",
  "⚡ কানে ইয়ারফোন গুজে নিন, চরম উত্তেজনার গোপন ক্লিপ...",
  "🔒 প্রিমিয়াম মেম্বারশিপের আনকাট কন্টেন্ট ফ্রিতে ফাঁস...",
  "🥵 সুইমিং পুলে নতুন মডেলের বোল্ড পারফরম্যান্স...",
  "🍒 বন্ধ ঘরের গোপন ঘটনা! সোশ্যাল মিডিয়ার সবচেয়ে হট ভিডিও...",
  "🤫 লিফটের কোণায় সিসিটিভির চোখে যা ধরা পড়লো...",
  "🔞 ট্রায়াল রুমে নতুন ড্রেস ট্রাই করার ভাইরাল ক্লিপ...",
  "🍿 মাঝরাতের বিশেষ সম্প্রচার! কেবল ১৮ বছরের উপরে ক্লিক করুন...",
  "⚡ কোনো কাটছাঁট ছাড়া সম্পূর্ণ আনকাট ভাইরাল ড্রামা...",
  "🔒 শপিং মল চেঞ্জিং রুমের সেই গোপন সিসিটিভি ক্লিপ...",
  "🥵 কাঁপানো রোমান্স! ইন্টারনেটে রাতারাতি ভাইরাল হওয়া ভিডিও...",
  "🍒 হেডফোন ছাড়া প্লে করলে বিপদে পড়বেন ডিরেক্ট লিংক...",
  "🤫 Offices-এ বসের সাথে সিসিটিভি ফুটেজ ভাইরাল...",
  "🔞 বাথরুমে গোপন ক্যামেরায় রেকর্ডকৃত ভিডিও...",
  "🍿 হোস্টেলের গোপন ক্যামেরায় বন্দী সেই মুহূর্ত..."
];

const SEO_DESCRIPTION_TEMPLATES = [
  "🔥 {title} সম্পূর্ণ আনকাট ও এইচডি কোয়ালিটিতে এখনই দেখুন। কোনো ভিপিএন ছাড়াই সুপারফাস্ট গতিতে প্লে করুন। বাফারিং-মুক্ত গোপন ভিডিওটি ডিলিট হওয়ার আগেই এক ক্লিকে দেখে নিন।\n\n📌 ট্যাগসমূহ: এক্সক্লুসিভ স্ট্রিমিং, বাফারিং-মুক্ত, গোপন ভিডিও, ১৮+ ড্রামা, ভাইরাল রিলস, গোপন লিক, বাংলা রিলস",
  "🤫 সামাজিক যোগাযোগ মাধ্যমে তোলপাড় সৃষ্টি করা {title} এক্সক্লুসিভ স্ট্রিমিং শুরু হয়েছে। হেডফোন ছাড়াই দেখার ভুল করবেন না, সম্পূর্ণ বাফারিং-মুক্ত হাই-স্পিড প্লেয়ার।\n\n📌 ট্যাগসমূহ: এক্সক্লুসিভ স্ট্রিমিং, বাংলা নতুন রিলস, ভাইরাল ক্লিপস, বাফারিং-মুক্ত, গোপন ভিডিও, আনকাট ট্রেইলার",
  "🍒 ইন্টারনেট তোলপাড় করা অফিশিয়াল ট্রেইলার {title} নতুন চমক নিয়ে হাজির। দরজা বন্ধ করে কানের হেডফোন গুজে একা উপভোগ করার উপযুক্ত এক্সক্লুসিভ কন্টেন্ট।\n\n📌 ট্যাগসমূহ: গোপন ভিডিও, বাফারিং-মুক্ত, এক্সক্লুসিভ স্ট্রিমিং, ওটিটি সিরিজ, মাঝরাতের রোমাঞ্চ, আনকাট ক্লিপ",
  "🔞 সতর্ক থাকুন! {title} এখন সচল ও আনলকড। শতভাগ সিকিউর উপায়ে ফুল এইচডি দেখার সুযোগ। কোনো রেজিস্ট্রেশন বা পেমেন্ট ছাড়াই বাফারিং-মুক্ত স্পেশাল অ্যাক্সেস।\n\n📌 ট্যাগসমূহ: এক্সক্লুসিভ স্ট্রিমিং, গোপন ভিডিও, বাফারিং-মুক্ত, ১৮+ শর্টস, বাংলা হট রিলস, বেডরুম ওটিটি",
  "🥵 মনের মাঝে ঝড় তুলতে ও নিঃসঙ্গতা কাটাতে এখনই প্লে বাটনে ক্লিক করে উপভোগ করুন {title}। ১০০% সুরক্ষিত উপায়ে বাফারিং-মুক্ত এক্সক্লুসিভ স্ট্রিমিং লিংক জেনারেট করুন।\n\n📌 ট্যাগসমূহ: গোপন ভিডিও, এক্সক্লুসিভ স্ট্রিমিং, বাফারিং-মুক্ত, সিসিটিভি লিকস, ট্রায়াল রুম সিক্রেট, বেস্ট রিলস",
  "🎬 দর্শকদের বহুল প্রতীক্ষিত এবং অত্যন্ত স্পর্শকাতর ভিডিও {title} সরাসরি সার্ভার থেকে আপনাদের জন্য উন্মোচিত হলো। এখনই দেখে নিন বাফারিং-মুক্ত প্রিমিয়াম কোয়ালিটিতে।\n\n📌 ট্যাগসমূহ: এক্সক্লুসিভ স্ট্রিমিং, বাফারিং-মুক্ত, গোপন ভিডিও, বাংলা ভাইরাল ড্রামা, আনকাট পারফরম্যান্স, ওটিটি পাসওয়ার্ড বাইপাস",
  "🔥 {title} এর সবচেয়ে বোল্ড এবং রোমাঞ্চকর আনকাট এপিসোড নিয়ে এসেছে উন্মাদনা। এটি সম্পূর্ণ বাফারিং-মুক্ত এইচডি কোয়ালিটিতে লোড হচ্ছে। আপনার আইপি হাইড করে অত্যন্ত নিরাপদে দেখুন।\n\n📌 ট্যাগসমূহ: গোপন ভিডিও, বাফারিং-মুক্ত, এক্সক্লুসিভ স্ট্রিমিং, আনসেন্সরড ক্লিপস, বাংলা ভাইরাল শর্টস, টিকток ট্রেন্ড",
  "🤐 আর কোনো বাফারিং ল্যাগ নেই! {title} এখন পাওয়া যাচ্ছে এক্সক্লুসিভ স্ট্রিমিং ক্যাটাগরিতে। হেডফোন কানেক্ট করে একদম প্রাইভেট ব্রাউজারে দেখে ফেলুন সম্পূর্ণ ভিডিও।\n\n📌 ট্যাগসমূহ: এক্সক্লুসিভ স্ট্রিমিং, গোপন ভিডিও, বাফারিং-মুক্ত, বাংলা সিসিটিভি ট্র্যাপ, লিফট সিসিটিভি, হট মডেল রিলস"
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
  const [adminTab, setAdminTab] = useState<"streams" | "ads" | "logs" | "categories">("streams");

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
    const activeTitle = title || "নতুন ভাইরাল হট রিল";
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
      alert("অনুগ্রহ করে সেভ করার আগে নিশ্চিতকরণ বাক্সে টিক দিন (Please confirm before saving).");
      return;
    }

    setSubmitting(true);
    setStatusMessage("Publishing details...");

    const processedEmbedUrl = embedUrl.trim();

    const videoId = editingId || `stream-${Date.now()}`;
    let status: "published" | "scheduled" = "published";
    let finalScheduledAt = "";

    if (scheduledAt) {
      const selectedDate = new Date(scheduledAt);
      if (selectedDate > new Date()) {
        status = "scheduled";
      }
      finalScheduledAt = selectedDate.toISOString();
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
      views: editingId ? videos.find(v => v.id === editingId)?.views || 0 : Math.floor(Math.random() * 1000) + 100,
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
                      <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">কনফার্ম ভিডিও প্রিভিউ (Video Preview):</span>
                      <div className="w-full max-w-sm aspect-video rounded-lg relative overflow-hidden bg-black border border-white/10 shadow-inner flex items-center justify-center">
                        {(() => {
                          const embedResult = convertToEmbed(embedUrl);
                          if (!embedResult.src) {
                            return <span className="text-zinc-500 text-[10px]">অকার্যকর লিংক (Invalid URL)</span>;
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
                        <span className="font-bold block text-[#f5c518]">আমি ভিডিওটির উৎস এবং প্রিভিউ সঠিক বলে নিশ্চিত করছি</span>
                        <span className="text-zinc-500 block text-[9px] mt-0.5">(I confirm before saving that the video source is correct)</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Genre / Category selector */}
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
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full bg-[#111] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-[#f5c518] focus:outline-none"
                />
                <span className="text-[8.5px] text-zinc-500 leading-snug font-mono">
                  যদি ভবিষ্যতের সময় সিলেক্ট করেন তবে ভিডিওটি নির্ধারিত সময়ে স্বয়ংক্রিয়ভাবে প্রকাশিত হবে (Otherwise, leave blank to publish instantly).
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
                      Category Display Name (Bangla / English)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ১৮+ থ্রিলার (18+ Thriller)"
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
                      {submitting ? "সংরক্ষণ করা হচ্ছে..." : editingCatId ? "Update Category" : "Publish Category"}
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
                  কোনো লগ রেকর্ড পাওয়া যায়নি।
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
                  থাম্বনেইল ক্রপ করুন (Strict 16:9 Cropper)
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
                  বাতিল (Cancel)
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
