/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Sliders, Tv, Film, Download, X, Info, ShieldCheck, FileText, Mail, Heart, Globe, AlertTriangle, ExternalLink, Send, Facebook, MessageCircle, Flame, Clock, Sparkles, Award, History, Bookmark, Trash2, Play, User } from "lucide-react";
import { Video, Category, AdSettings, ViewTab, ActivityLog } from "./types";
import { 
  getVideos, 
  getCategories, 
  getAdSettings, 
  addVideo, 
  updateVideo, 
  deleteVideo, 
  addCategory,
  updateAdSettings, 
  testConnection, 
  resetToSeedData,
  getAdminSecurity,
  updateAdminSecurity,
  addActivityLog,
  getActivityLogs,
  incrementDailyAdStat
} from "./services/db";

import Header from "./components/Header";
import VideoGrid from "./components/VideoGrid";
import AdPlacement from "./components/AdPlacement";
import HeroSlider from "./components/HeroSlider";
import BottomNav from "./components/BottomNav";
import SmartCategoryFilter from "./components/SmartCategoryFilter";

const AdminPanel = React.lazy(() => import("./components/AdminPanel"));
const VideoPlayerModal = React.lazy(() => import("./components/VideoPlayerModal"));

const PRELOADER_MESSAGES = [
  "🔞 সার্ভার গরম হচ্ছে! একটু ধৈর্য ধরুন...",
  "🍿 হেডফোন কানেক্ট করুন, চরম কিছু আসছে...",
  "🤫 চারপাশ খেয়াল করুন, ভিডিও প্লে হতে যাচ্ছে...",
  "⚡ বাফারিং ছাড়া কাঁপানো সব ভিডিও লোড হচ্ছে...",
  "🔒 আপনার গোপন কানেকশনটি সিকিউর করা হচ্ছে...",
  "🍓 নিষিদ্ধ ট্রেইলার ব্যাকএন্ডে কম্পাইল হচ্ছে...",
  "🍒 একদম এক্সক্লুসিভ কালেকশন প্রসেস করা হচ্ছে...",
  "🚀 সুপারফাস্ট প্রিমিয়াম সার্ভার কানেক্টেড...",
  "🔥 আজকের সেরা ট্রেন্ডিং ভিডিও রেডি হচ্ছে...",
  "👀 গোপন চোখ থেকে নিজেকে আড়াল করে নিন...",
  "💣 হাই-স্পিড ভিডিও স্ট্রিমিং বাফার হচ্ছে...",
  "🎬 থ্রিলিং সিনেমা লোড হচ্ছে, লাইট অফ করুন...",
  "💖 স্পেশাল রিলস সিক্রেট ডাটাবেজ ডিক্রিপ্ট হচ্ছে...",
  "🤫 দরজা বন্ধ করুন, হট এপিসোড শুরু হচ্ছে...",
  "🥂 আনলিমিটেড এন্টারটেইনমেন্ট লিংক জেনারেট হচ্ছে...",
  "📲 মোবাইল স্ক্রিন ঘুরিয়ে ফুল স্ক্রিন মুড অন করুন...",
  "🛡️ ১৮+ প্রক্সি প্রোটোকল অ্যাক্টিভেট করা হচ্ছে...",
  "👑 প্রিমিয়াম ওটিটি কন্টেন্ট ফ্রিতে আনলক হচ্ছে...",
  "🥵 আজকের চরম আবহাওয়া সার্ভারে হিট বাড়াচ্ছে...",
  "✨ আল্ট্রা এইচডি ক্লারিটি অডিও অপ্টিমাইজড হচ্ছে...",
  "🍿 পপকর্ন নিয়ে বসুন, রোমাঞ্চ শুরু হতে যাচ্ছে...",
  "🎟️ হাই-ভোল্টেজ ড্রামা লোডিং সিকোয়েন্স...",
  "🎭 আপনার মুড অনুযায়ী ভিডিও সিলেক্ট করা হচ্ছে...",
  "🔥 ইন্টারনেট স্পিড চ্যাক হচ্ছে, রোমাঞ্চ দ্বিগুণ হচ্ছে...",
  "🌟 রাত ১০টার পর যা দেখার তাই লোড হচ্ছে...",
  "🔒 কন্টেন্ট ডিলিট হওয়ার আগেই চটজলদি দেখে নিন...",
  "📡 গ্লোবাল ক্লাউড নেটওয়ার্ক থেকে প্রক্সি রেডি...",
  "🍓 কাঁপানো স্পেশাল ক্লিপস রেডি করা হচ্ছে...",
  "🔞 অ্যাডাল্ট ক্যাটাগরির হট সার্ভার সচল হচ্ছে...",
  "🍿 বিরতিহীন স্ট্রিমিংয়ের জন্য মেমোরি ক্লিন হচ্ছে...",
  "⚡ সুপার রানিং ডাটা ব্যান্ডউইথ সেটআপ...",
  "🤫 সাউন্ড সিস্টেম চেক করে ভলিউম কমিয়ে নিন...",
  "🍒 টক-মিষ্টি এক্সক্লুসিভ ক্লিপ লোড হচ্ছে...",
  "💖 স্পেশাল সিক্রেট ফোল্ডার আনলক করতে একটু অপেক্ষা করুন...",
  "🚀 ফাস্টেস্ট ক্লাউড গেটওয়ে দিয়ে ডাটা আসছে...",
  "🎬 মেকিং অ্যান্ড আনকাট সিন লোডিং চলছে...",
  "🥵 হৃদস্পন্দন বেড়ে গেলে আমাদের দোষ নেই...",
  "📱 এইচডি কোয়ালিটি মোবাইল ফ্রেন্ডলি হচ্ছে...",
  "🛡️ ১০০% সুরক্ষিত এবং এনক্রিপ্টেড পথ চালু...",
  "🍓 মিষ্টি প্রেমের হট এপিসোড আনপ্যাক হচ্ছে...",
  "🎧 কানের ইয়ারফোন খুলে না থাকলে এখনই লাগান...",
  "🔒 আইপি হাইড করে ফাস্টার ভিউয়িং এনাবলড...",
  "⚡ লাইভ স্ট্রিমিং ট্র্যাকার এনাবল্ড হচ্ছে...",
  "🔞 আজ রাতের আকর্ষণীয় ড্রামা প্রিমিয়ার হচ্ছে...",
  "🎬 আনসেন্সরড স্ট্রিমিং ডাটা সিঙ্ক হচ্ছে...",
  "🍿 সিনেমার সবচেয়ে বোল্ড সিনগুলো চেক হচ্ছে...",
  "🤫 চারপাশের লোকজনের লুকিয়ে তাকানো এড়াতে স্ক্রিন ছোট করুন...",
  "🍒 সব লিমিটেড অ্যাক্সেস লিংক ফ্রি করা হচ্ছে...",
  "🔥 হাই-ডিমান্ড ভিডিও বাফারিং সমাধান করা হচ্ছে...",
  "🚀 সুপার সিড ড্রাইভ থেকে ফাইল রিকভারড...",
  "🥵 সার্ভারে একটু বেশি লোড, কারণ কন্টেন্ট চরম খতরনাক...",
  "🎬 নতুন ভাইরাল ভিডিওটির এইচডি প্রিন্ট রেডি...",
  "💖 মনের মাঝে ঝড় তোলার মতো সিন প্রস্তুত হচ্ছে...",
  "🤫 গোপনে দেখার জন্য সেফ ব্রাউজার ইনজেকশন...",
  "🍿  হাই-বিটরেট ওভি ক্রোম রেন্ডারার চালু...",
  "⚡ ডাটা ইউজেস অপ্টিমাইজেশন প্রক্রিয়া সচল...",
  "🔞 কোনো রেজিস্ট্রেশন ছাড়াই ডিরেক্ট প্রবেশ...",
  "🍓 দারুণ রোমান্টিক থ্রিল রিং রিলিজ হচ্ছে...",
  "🎬 আপনার ফেভারিট মডেলের রিলস লোড হচ্ছে...",
  "🍒 রসালো এপিসোডের ক্লাউড ব্যাকআপ রেডি...",
  "🔒 আপনার ব্রাউজিং হিস্টোরি সুরক্ষিত রাখা হচ্ছে...",
  "🚀 ১ সেকেন্ডের মধ্যে সুপার প্লে লিংকের আগমন...",
  "🥵 অতিরিক্ত গরমের জন্য সার্ভার ফ্যান চলছে...",
  "🎧 থ্রিডি অডিও বিটস এনহ্যান্স করা হচ্ছে...",
  "🍿 আপনার জন্য স্পেশাল কিউরেটেড প্লেলিস্ট...",
  "🤫 চুপিচুপি দেখার সেরা সাইট লোড হচ্ছে...",
  "⚡ আনলিমিটেড ব্যান্ডউইথ অ্যালোকেশন সক্রিয়...",
  "🔞 ১৮ বছরের নিচে কারোর ঢোকা নিষেধ করা হচ্ছে...",
  "🎬 আনকাট এডিট প্যানেল থেকে ফাইনাল আউটপুট...",
  "🍓 মনের খিদে মেটানোর সেরা সিনেমা প্রস্তুত...",
  "🥵 চোখ ধাঁধানো সব দৃশ্যের হাই কোয়ালিটি রেন্ডার...",
  "💖 ভালো লাগার মুহূর্তগুলো ফ্রেমবন্দি হচ্ছে...",
  "🔒 নিরাপদ ও বেনামী কান্ট্রি আইপি কানেক্টেড...",
  "🚀 বিন্দুমাত্র ল্যাগ ছাড়া লোড হওয়া নিশ্চিত হচ্ছে...",
  "📱 সব ডিভাইসের স্ক্রিন রেশিও অপ্টিমাইজিং...",
  "🍒 প্রিমিয়াম রিল ভিউয়ার্সদের জন্য ফ্রি এক্সেস...",
  "🍿 ব্যাকগ্রাউন্ডে পপআপ অ্যাড নিয়ন্ত্রণ করা হচ্ছে...",
  "⚡ বিদ্যুতের গতিতে স্ট্রিমিং পোর্ট জেনারেটড...",
  "🔞 হট ট্রেন্ডস ও ভাইরাল ভিডিও ক্লিপ লোডিং...",
  "🎬 সম্পূর্ণ নতুন ডিরেক্টরের স্পেশাল কাট...",
  "🥵 চরম উত্তেজনাকর ক্লাইম্যাক্স সিন সিঙ্ক হচ্ছে...",
  "🤫 চোখ কান খোলা রাখুন, মনের দরজা খুলে দিন...",
  "💖 আপনার নিঃসঙ্গ সময় কাটানোর উপযুক্ত কন্টেন্ট...",
  "🔒 ওটিটি পাসওয়ার্ড বাইপাস সফল হয়েছে...",
  "🚀 ডিরেক্ট প্লে সার্ভার-০৭ কানেক্ট করা হলো...",
  "🍓 জাদুকরী রোমান্স ও ড্রামা ক্লিপ আনপ্যাকড...",
  "🍿 সব ওল্ড অ্যান্ড নিউ কালেকশন ইনডেক্সিং হচ্ছে...",
  "⚡ প্রসেসর স্পিড টিউনিং ফর বেস্ট ফ্রেমরেট...",
  "🔞 টপ সিক্রেট কন্টেন্ট গ্যালারি উন্মুক্ত হচ্ছে...",
  "🎬 আপনার চরম ভালো লাগার মুহূর্ত রেডি হচ্ছে...",
  "🥵 সার্ভারের টেম্পারেচার এখন পিক লেভেলে...",
  "🤫 সাবধানে দেখুন, কেউ যেন দেখে না ফেলে...",
  "🍒 একদম এক্সক্লুসিভ অ্যান্ড ফ্রেশ আপলোডস...",
  "🔒 প্রাইভেট স্ট্রিমিং টানেল ওপেন হচ্ছে...",
  "🚀 হাই মেমোরি ক্যাশ ডাটা এনাবলিং...",
  "🎬 সুপার ভাইরাল ক্লিপটি ডাটাবেজে যুক্ত হলো...",
  "🍿 ভিডিও ডাউনলোডার ইমারসিভ প্রক্সি রেডি...",
  "⚡ সেরা স্পিড সার্ভার দিয়ে কানেক্ট হচ্ছে...",
  "🍓 চোখ ভরে দেখার দারুণ কিছু আসছে...",
  "🔒 ১০০% ফ্রিতে ফুল এইচডি কন্টেন্ট গেটওয়ে অ্যাক্টিভেটেড..."
];

export default function App() {
  // Database States
  const [videos, setVideos] = useState<Video[]>([]);
  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [firebaseOnline, setFirebaseOnline] = useState(false);

  // Bookmarks State (Save/Bookmark)
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("viralbd99_bookmarks") || "[]");
    } catch {
      return [];
    }
  });

  // Continue Watching progress mapping
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  // Ad Settings State with robust fallback configurations
  const [adSettings, setAdSettings] = useState<AdSettings>({
    id: "global",
    isEnabled: true,
    cpm: 4.5,
    clicks: 0,
    impressions: 0,
    earnings: 0,
    customScriptUrl: "",
    popunderCode: "",
    directLinkUrl: "",
    banner320x50Code: "",
    banner300x250Code: "",
    banner728x90Code: "",
    popunderClickFrequency: 2, // Monitored every 2 clicks to safeguard audiences
    popunderDelaySeconds: 0,
    popunderCooldownMinutes: 3,
    telegramUrl: "https://t.me/viralbd99",
    facebookUrl: "https://facebook.com/viralbd99",
    whatsappUrl: "https://whatsapp.com/channel/viralbd99"
  });

  // Session click monitor for frequency capping
  const [sessionClicks, setSessionClicks] = useState(0);

  // Dismiss toggler for sticky mobile footer banners to keep audiences satisfied!
  const [showStickyMobileAd, setShowStickyMobileAd] = useState(true);

  // Sticky Social Ad Bar state
  const [showSocialBar, setShowSocialBar] = useState(false);

  // Age verification state - blocks adult content for safety
  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(() => {
    try {
      return localStorage.getItem("viralbd99_age_verified") === "true";
    } catch {
      return false;
    }
  });

  // App Navigation & Filters
  const [currentTab, setCurrentTab] = useState<ViewTab>(ViewTab.HOME);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePlayingVideo, setActivePlayingVideo] = useState<Video | null>(null);

  // Hidden admin/owners authorization and pager configurations
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Dynamic system toast representation
  const [showToast, setShowToast] = useState<string | null>(null);

  // App initialization loaders
  const [loading, setLoading] = useState(true);

  // Selected random preloader message string across site load/refresh
  const [selectedPreloaderMessage] = useState(() => {
    const randomIndex = Math.floor(Math.random() * PRELOADER_MESSAGES.length);
    return PRELOADER_MESSAGES[randomIndex];
  });

  // Footer active informational dialog State
  const [footerModal, setFooterModal] = useState<"about" | "contact" | "terms" | "privacy" | "dmca" | "content_removal" | null>(null);

  // IMDb design details & profile navigation
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);

  // Real-time site live viewer counter
  const [appLiveViewers, setAppLiveViewers] = useState(() => {
    return Math.floor(Math.random() * (1150 - 650 + 1)) + 650;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setAppLiveViewers((current) => {
        const isAddition = Math.random() > 0.5;
        const amount = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
        let nextValue = isAddition ? current + amount : current - amount;
        if (nextValue < 650) nextValue = 650 + (650 - nextValue);
        if (nextValue > 1150) nextValue = 1150 - (nextValue - 1150);
        return nextValue;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Infinite scroll trigger
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 300
      ) {
        setVisibleCount((prev) => prev + 6);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ==========================================
  // SECURE ADMIN SYSTEM AUTH STATES
  // ==========================================
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const user = {
    role: isLoggedIn ? "admin" : "public"
  };

  const showAdminPanel = () => {
    setIsAdminMode(true);
  };

  const hideAdminPanel = () => {
    setIsAdminMode(false);
    if (currentTab === ViewTab.ADMIN) {
      setCurrentTab(ViewTab.HOME);
    }
  };

  // Visibility logic and observer check
  useEffect(() => {
    if (user.role === "admin") {
      showAdminPanel();
    } else {
      hideAdminPanel();
    }
  }, [isLoggedIn]);

  const [loginStep, setLoginStep] = useState(1); // 1 = Secret knock, 2 = Password
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [lockoutSecs, setLockoutSecs] = useState<number>(0);
  const [activityLogsList, setActivityLogsList] = useState<ActivityLog[]>([]);
  const [checkingAuthLock, setCheckingAuthLock] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState("");

  const secretKnockInputRef = useRef<HTMLInputElement>(null);

  const toBanglaNumber = (num: number | string) => {
    const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return num
      .toString()
      .split("")
      .map((digit) => {
        const index = parseInt(digit, 10);
        return isNaN(index) ? digit : banglaDigits[index];
      })
      .join("");
  };

  const formatViews = (num: number | string) => {
    const parsed = typeof num === "string" ? parseInt(num, 10) : num;
    if (isNaN(parsed) || !parsed) return "0";
    if (parsed >= 1000000) {
      return (parsed / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (parsed >= 1000) {
      return (parsed / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return parsed.toString();
  };

  const isSessionValid = () => {
    try {
      const isBrowserSessionActive = sessionStorage.getItem("viralbd99_session_active") === "true";
      if (!isBrowserSessionActive) return false;

      const sessionJson = localStorage.getItem("viralbd99_admin_session");
      if (!sessionJson) return false;

      const session = JSON.parse(sessionJson);
      if (!session || !session.token || !session.expiresAt) return false;

      if (Date.now() > session.expiresAt) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  // Handle toggling of bookmarks/saves from anywhere in the app
  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      let updated;
      if (prev.includes(id)) {
        updated = prev.filter((item) => item !== id);
        setShowToast("ভিডিওটি সেভ থেকে সরানো হয়েছে।");
      } else {
        updated = [...prev, id];
        setShowToast("ভিডিওটি সফলভাবে সেভ করা হয়েছে!");
      }
      localStorage.setItem("viralbd99_bookmarks", JSON.stringify(updated));
      return updated;
    });
    setTimeout(() => setShowToast(null), 2500);
  };

  // Reload the mapped decimal percentages of currently progressive videos
  const reloadProgressMap = () => {
    try {
      const mapping: Record<string, number> = {};
      const cwList = JSON.parse(localStorage.getItem("viralbd99_continue_watching") || "[]");
      cwList.forEach((id: string) => {
        const val = localStorage.getItem(`video_progress_percent_${id}`);
        if (val) {
          mapping[id] = parseFloat(val);
        }
      });
      setProgressMap(mapping);
    } catch (e) {
      console.warn("Error maps reload:", e);
    }
  };

  // Periodically refresh the progress map and watch history queues
  useEffect(() => {
    reloadProgressMap();
    const interval = setInterval(() => {
      reloadProgressMap();
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Perform session check on load
  useEffect(() => {
    if (isSessionValid()) {
      setIsLoggedIn(true);
      setIsAdminMode(true);
    }
  }, []);

  // Countdown lockout ticks
  useEffect(() => {
    if (lockoutSecs <= 0) return;
    const interval = setInterval(() => {
      setLockoutSecs((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSecs]);

  // Automated background trigger for scheduled videos
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = new Date();
      
      setVideos((prevVideos) => {
        const dueVideos = prevVideos.filter(v => v.status === "scheduled" && v.scheduledAt && new Date(v.scheduledAt) <= now);
        
        if (dueVideos.length === 0) {
          return prevVideos;
        }

        console.log(`Auto-publishing ${dueVideos.length} scheduled videos...`);
        
        dueVideos.forEach(async (video) => {
          try {
            await updateVideo(video.id, { status: "published" });
            await addActivityLog("Scheduled Video Published", `Video titled "${video.title}" was automatically published.`);
          } catch (err) {
            console.error(`Failed to automatically publish scheduled video ${video.id}:`, err);
          }
        });

        setTimeout(() => {
          loadLogs();
        }, 100);

        return prevVideos.map(v => {
          const isDue = dueVideos.some(dv => dv.id === v.id);
          if (isDue) {
            return { ...v, status: "published" as const };
          }
          return v;
        });
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Load activity logs
  const loadLogs = async () => {
    try {
      const logs = await getActivityLogs();
      setActivityLogsList(logs);
    } catch (e) {
      console.warn("Could not retrieve log segments:", e);
    }
  };

  useEffect(() => {
    if (isLoggedIn && currentTab === ViewTab.ADMIN) {
      loadLogs();
    }
  }, [isLoggedIn, currentTab]);

  // Check for admin/owner credentials, route changes, or keyboard shortcuts
  useEffect(() => {
    const checkRoutesAndHotkeys = () => {
      const pathname = window.location.pathname;
      if (pathname === "/admin") {
        // Redirect standard /admin attempts to homepage immediately
        window.history.replaceState(null, "", "/");
        setCurrentTab(ViewTab.HOME);
        setIsAdminMode(false);
      } else if (pathname === "/admin-shamim27") {
        setIsAdminMode(true);
        setCurrentTab(ViewTab.ADMIN);
      }
    };

    checkRoutesAndHotkeys();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + A shortcut sets the secret URL and shows portals safely
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        window.history.pushState(null, "", "/admin-shamim27");
        setIsAdminMode(true);
        setCurrentTab(ViewTab.ADMIN);
        setShowToast("Redirecting to Owner Portal...");
        setTimeout(() => setShowToast(null), 3000);
      }
    };

    window.addEventListener("popstate", checkRoutesAndHotkeys);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("popstate", checkRoutesAndHotkeys);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Test Firebase availability and fetch initial payloads
  useEffect(() => {
    async function initializeApplet() {
      try {
        const isOnline = await testConnection();
        setFirebaseOnline(isOnline);

        // Retrieve resources
        const [fetchedVideos, fetchedCategories, fetchedAdSettings] = await Promise.all([
          getVideos(),
          getCategories(),
          getAdSettings()
        ]);

        setVideos(fetchedVideos || []);
        setCategories(fetchedCategories || []);
        if (fetchedAdSettings) {
          setAdSettings(fetchedAdSettings);
        }
      } catch (err) {
        console.error("Baseline fetch sequence interrupted:", err);
      } finally {
        setLoading(false);
      }
    }

    initializeApplet();
  }, []);

  // 4-SECOND AUTO-SWEEP LIST effect
  useEffect(() => {
    if (currentTab !== ViewTab.HOME || searchQuery) return;

    let intervalId: NodeJS.Timeout | null = null;

    const timer = setTimeout(() => {
      const container = trendingScrollRef.current;
      if (!container) return;

      intervalId = setInterval(() => {
        const cardWidth = 110; // w-[110px]
        const gap = 16;       // gap-4 is 16px
        const step = cardWidth + gap; // 126px

        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        
        // Wrap back to 0 if at the end of the scroll width
        if (container.scrollLeft >= maxScrollLeft - 10) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: step, behavior: "smooth" });
        }
      }, 4000);
    }, 150);

    return () => {
      clearTimeout(timer);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentTab, searchQuery, videos]);

  // Direct Link Click Capture Handler
  useEffect(() => {
    const handleGlobalClick = () => {
      if (!adSettings.isEnabled || !adSettings.directLinkEnabled || !adSettings.directLinkUrl) {
        return;
      }
      const intervalMins = adSettings.directLinkIntervalMinutes || 5;
      const lastFireTimeStr = localStorage.getItem("last_direct_click_time");
      const lastFireTime = lastFireTimeStr ? parseInt(lastFireTimeStr, 10) : 0;
      const now = Date.now();

      if (now - lastFireTime > intervalMins * 60 * 1000) {
        localStorage.setItem("last_direct_click_time", now.toString());
        window.open(adSettings.directLinkUrl, "_blank", "referrerPolicy=no-referrer");
        incrementDailyAdStat("directLinkFired").catch(err => console.error("Direct link tracking error:", err));
        
        // Also fire simulated click to count inside Admin Metrics
        handleTriggerSimulatedAdClick();
      }
    };

    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [adSettings]);

  // Popunder and Social Bar load hooks
  useEffect(() => {
    // 1. Popunder execution once per session
    if (adSettings.isEnabled && adSettings.popunderEnabled && adSettings.popunderCode) {
      const popped = sessionStorage.getItem("popunder_fired_this_session");
      if (!popped) {
        sessionStorage.setItem("popunder_fired_this_session", "true");
        try {
          const oldScript = document.getElementById("adsterra-popunder-container");
          if (oldScript) oldScript.remove();

          const doc = new DOMParser().parseFromString(adSettings.popunderCode, "text/html");
          const scripts = doc.querySelectorAll("script");
          scripts.forEach((scriptTag) => {
            const container = document.createElement("script");
            container.id = "adsterra-popunder-container";
            if (scriptTag.src) {
              container.src = scriptTag.src;
            } else {
              container.textContent = scriptTag.textContent;
            }
            container.async = true;
            document.head.appendChild(container);
          });
        } catch (err) {
          console.warn("Popunder injection check failed:", err);
        }
      }
    }

    // 2. Social Bar visibility sync
    if (adSettings.isEnabled && adSettings.socialBarEnabled) {
      const dismissedStamp = localStorage.getItem("social_bar_dismissed_time");
      if (dismissedStamp) {
        const dismissedTime = parseInt(dismissedStamp, 10);
        const elapsedMins = (Date.now() - dismissedTime) / (60 * 1000);
        if (elapsedMins < 30) {
          setShowSocialBar(false);
          return;
        }
      }
      setShowSocialBar(true);
    } else {
      setShowSocialBar(false);
    }
  }, [adSettings]);

  // Helper to extract video ID from either standard /video/VIDEO_ID or legacy ?video=VIDEO_ID format
  const getVideoIdFromUrl = () => {
    const path = window.location.pathname;
    const match = path.match(/\/video\/([a-zA-Z0-9_-]+)/);
    if (match) {
      return match[1];
    }
    const params = new URLSearchParams(window.location.search);
    return params.get("video");
  };

  // 1. Auto-open video from shared URL on initial load of videos
  useEffect(() => {
    if (videos.length === 0) return;
    const videoId = getVideoIdFromUrl();
    if (videoId) {
      const match = videos.find((v) => v.id === videoId);
      if (match) {
        setActivePlayingVideo(match);
      }
    }
  }, [videos]);

  // 2. Clear or set URL paths & Browser tab Title dynamically on video change
  useEffect(() => {
    const videoId = activePlayingVideo?.id;
    const currentVideoIdInUrl = getVideoIdFromUrl();

    if (videoId) {
      // Update browser tab title
      document.title = `${activePlayingVideo.title} | ViralBD99`;
      
      if (currentVideoIdInUrl !== videoId) {
        const newUrl = `${window.location.origin}/video/${videoId}`;
        window.history.pushState({ videoId }, "", newUrl);
      }
    } else {
      // Reset default page title
      document.title = "ViralBD99 - Pure Premium Streaming Platform";
      
      if (currentVideoIdInUrl) {
        const newUrl = `${window.location.origin}/`;
        window.history.pushState(null, "", newUrl);
      }
    }
  }, [activePlayingVideo]);

  // 3. Listen for popstate (Back/Forward browser keys) events to keep player matches updated
  useEffect(() => {
    const handlePopState = () => {
      const videoId = getVideoIdFromUrl();
      if (videoId) {
        const match = videos.find((v) => v.id === videoId);
        if (match) {
          setActivePlayingVideo(match);
        } else {
          setActivePlayingVideo(null);
        }
      } else {
        setActivePlayingVideo(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [videos]);

  const handleUpdateAdSettings = async (settings: AdSettings) => {
    await updateAdSettings(settings);
    setAdSettings(settings);
    await addActivityLog("Settings Changed", "Ad configurations or custom iframe scripts were modified.");
    loadLogs();
  };

  const calculateDynamicCPM = (clicks: number, impressions: number): number => {
    if (!impressions || impressions === 0) return 4.56;
    const ctr = clicks / impressions;
    const networkLatencyMs = 120 + ((clicks * 7) % 180);
    const latencyFactor = Math.max(0.8, 1.2 - (networkLatencyMs / 1000));
    const networkDeliverabilityIndex = 0.95 + ((clicks + impressions) % 6) * 0.01;
    const rawCpm = 3.50 + (ctr * 30 * latencyFactor * networkDeliverabilityIndex);
    return Number(Math.max(3.00, Math.min(12.50, rawCpm)).toFixed(3));
  };

  const handleTriggerSimulatedAdClick = async () => {
    try {
      const updatedClicks = (adSettings.clicks || 0) + 1;
      const updatedImpressions = (adSettings.impressions || 0) + Math.floor(Math.random() * 4) + 2;
      
      // Fully automated dynamic CPM calculation natively based on live clicks/impressions and network indicators
      const liveCpm = calculateDynamicCPM(updatedClicks, updatedImpressions);
      
      const earningsIncrement = ((updatedImpressions - (adSettings.impressions || 0)) * (liveCpm / 1000)) + (liveCpm / 200);
      const updatedEarnings = (adSettings.earnings || 0) + earningsIncrement;

      const nextSettings: AdSettings = {
        ...adSettings,
        clicks: updatedClicks,
        impressions: updatedImpressions,
        cpm: liveCpm,
        earnings: Number(updatedEarnings)
      };

      await updateAdSettings(nextSettings);
      setAdSettings(nextSettings);
    } catch (e) {
      console.warn("Analytics increment failed:", e);
    }
  };

  const handleResetSimulatedEarnings = async () => {
    try {
      const nextSettings: AdSettings = {
        ...adSettings,
        clicks: 0,
        impressions: 0,
        earnings: 0,
        cpm: 4.56
      };
      await updateAdSettings(nextSettings);
      setAdSettings(nextSettings);
    } catch (e) {
      console.warn("Analytics reset failed:", e);
    }
  };

  // Reusable popunder direct redirect routine with timer and cap checks
  const triggerPopunderAction = () => {
    if (!adSettings.isEnabled) return;

    const freq = adSettings.popunderClickFrequency;
    if (freq <= 0) return; // Popunders are completely disabled

    // Increment local counter
    const nextClicks = sessionClicks + 1;
    setSessionClicks(nextClicks);

    // If it doesn't match frequency interval, bypass!
    if (nextClicks % freq !== 0) {
      // Just increase simulated impression views
      handleTriggerSimulatedAdClick();
      return;
    }

    // Check Cooldown buffer block to optimize reader UX
    const cooldownMins = adSettings.popunderCooldownMinutes || 0;
    if (cooldownMins > 0) {
      const lastTriggerStamp = localStorage.getItem("last_popunder_trigger_time");
      if (lastTriggerStamp) {
        const lastTime = parseInt(lastTriggerStamp, 10);
        const elapsedMins = (Date.now() - lastTime) / (60 * 1000);
        if (elapsedMins < cooldownMins) {
          // User is protected from spam redirections
          console.log(`Popunder blocked by active cooldown window. (${(cooldownMins - elapsedMins).toFixed(1)} mins left for next ad cycle)`);
          handleTriggerSimulatedAdClick();
          return;
        }
      }
    }

    // Log the active trigger timestamp
    localStorage.setItem("last_popunder_trigger_time", Date.now().toString());

    // Register click metrics
    handleTriggerSimulatedAdClick();

    // Redirection Delay Timer
    const delaySecs = adSettings.popunderDelaySeconds || 0;
    const directLink = adSettings.directLinkUrl || adSettings.customScriptUrl;

    if (delaySecs > 0) {
      setShowToast(`Redirection starts in ${delaySecs} seconds... Please wait`);
      setTimeout(() => {
        if (directLink) {
          window.open(directLink, "_blank");
        } else {
          window.open("https://adsterranetwork.com/redirect?key=demo-directlink", "_blank");
        }
        setShowToast(null);
      }, delaySecs * 1000);
    } else {
      // Instant redirection
      if (directLink) {
        window.open(directLink, "_blank");
      } else {
        window.open("https://adsterranetwork.com/redirect?key=demo-directlink", "_blank");
      }
      setShowToast("External link opened in new background tab");
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  // ==========================================
  // SECURE ADMIN AUTH SUBMIT & SESSIONS
  // ==========================================
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkingAuthLock) return;
    setAuthErrorMsg("");

    const term = adminPasswordInput.trim();
    if (!term) {
      setAuthErrorMsg("দয়া করে পাসওয়ার্ড প্রবেশ করুন");
      return;
    }

    setCheckingAuthLock(true);
    try {
      const securityDoc = await getAdminSecurity();

      // Check brute block
      if (securityDoc.blockedUntil) {
        const unt = Date.parse(securityDoc.blockedUntil);
        if (Date.now() < unt) {
          const diffSecs = Math.ceil((unt - Date.now()) / 1000);
          setLockoutSecs(diffSecs);
          setAuthErrorMsg("অনেকবার ভুল হয়েছে। 5 মিনিট পর চেষ্টা করুন।");
          setCheckingAuthLock(false);
          return;
        }
      }

      // Check if password matches
      if (term === securityDoc.password) {
        // Correct! Create session
        const randToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const sessionObj = {
          token: randToken,
          expiresAt: Date.now() + 1 * 60 * 60 * 1000 // 1 hour expiry
        };
        localStorage.setItem("viralbd99_admin_session", JSON.stringify(sessionObj));
        sessionStorage.setItem("viralbd99_session_active", "true");

        // Reset fail counter in DB
        await updateAdminSecurity({ failedAttempts: 0, blockedUntil: "" });

        setIsLoggedIn(true);
        setIsAdminMode(true);
        setAdminPasswordInput("");
        setLoginStep(1); // Reset step back to secret knock for future reload triggers

        await addActivityLog("Login", "Admin successfully authenticated from the security portal.");
        loadLogs();
        setShowToast("Authentication Successful. Welcome, Admin!");
        setTimeout(() => setShowToast(null), 3000);
      } else {
        // Wrong password!
        const nextFailed = (securityDoc.failedAttempts || 0) + 1;
        if (nextFailed >= 3) {
          const blockedTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
          await updateAdminSecurity({ failedAttempts: nextFailed, blockedUntil: blockedTime });
          setLockoutSecs(300);
          setAuthErrorMsg("অনেকবার ভুল হয়েছে। 5 মিনিট পর চেষ্টা করুন।");
          await addActivityLog("Block Triggered", "Portal blocked for 5 minutes after 3 consecutive password failures.");
        } else {
          await updateAdminSecurity({ failedAttempts: nextFailed, blockedUntil: "" });
          setAuthErrorMsg(`ভুল পাসওয়ার্ড! (Attempts: ${nextFailed}/3)`);
        }
      }
    } catch (err) {
      setAuthErrorMsg("কারিগরি ত্রুটি! আবার চেষ্টা করুন।");
    } finally {
      setCheckingAuthLock(false);
    }
  };

  const handleLogout = async () => {
    try {
      await addActivityLog("Logout", "Admin successfully disconnected and cleared active session tokens.");
    } catch (e) {
      console.warn("Could not write logout log:", e);
    }
    localStorage.removeItem("viralbd99_admin_session");
    sessionStorage.removeItem("viralbd99_session_active");
    setIsLoggedIn(false);
    setIsAdminMode(false);
    setLoginStep(1);
    window.location.replace("/");
  };

  // CRUD Actions
  const handleAddVideo = async (newVideo: Video) => {
    if (!newVideo.createdAt) {
      newVideo.createdAt = new Date().toISOString();
    }
    await addVideo(newVideo);
    // Push new video to the top and sort
    const updatedVideos = [newVideo, ...videos.filter(v => v.id !== newVideo.id)];
    updatedVideos.sort((a, b) => (new Date(b.createdAt || '') as any) - (new Date(a.createdAt || '') as any));
    setVideos(updatedVideos);
    await addActivityLog("Video Added", `Video titled "${newVideo.title}" was published successfully.`);
    loadLogs();
  };

  const handleUpdateVideo = async (id: string, fields: Partial<Video>) => {
    await updateVideo(id, fields);
    setVideos(videos.map((v) => (v.id === id ? { ...v, ...fields } : v)));
    // Sync activity logs only on manual edits rather than background view-count trackers
    if (fields.title || fields.embedUrl || fields.category || fields.description) {
      await addActivityLog("Video Updated", `Video titled "${fields.title || 'modified'}" was updated.`);
      loadLogs();
    }
  };

  const handleDeleteVideo = async (id: string) => {
    const videoTitle = videos.find(v => v.id === id)?.title || "Unknown Title";
    await deleteVideo(id);
    setVideos(videos.filter((v) => v.id !== id));
    await addActivityLog("Video Deleted", `Video titled "${videoTitle}" (ID: ${id}) was permanently purged.`);
    loadLogs();
  };

  const handleSaveCategory = async (cat: Category) => {
    await addCategory(cat);
    const freshCategories = await getCategories();
    setCategories(freshCategories);
    await addActivityLog("Category Modified", `Category "${cat.name}" (Slug: ${cat.slug}, Icon: ${cat.iconName || 'none'}) was updated.`);
    loadLogs();
  };

  const handleResetSeedData = async () => {
    await resetToSeedData();
    const [freshVideos, freshCategories] = await Promise.all([
      getVideos(),
      getCategories()
    ]);
    setVideos(freshVideos);
    setCategories(freshCategories);
    await addActivityLog("Database Reset", "Pristine database seed values were restored across all elements.");
    loadLogs();
  };

  // Video viewer increment action
  const handlePlayVideo = async (video: Video) => {
    // Safely trigger Adsterra popunder or direct link according to capping & timers
    triggerPopunderAction();

    setActivePlayingVideo(video);
    // Update view counters asynchronously
    try {
      const updatedViews = (video.views || 0) + 1;
      await handleUpdateVideo(video.id, { views: updatedViews });
    } catch (err) {
      console.warn("Views tracking skipped:", err);
    }
  };

  // Filter systems based on active filters and search queries
  const getFilteredVideos = () => {
    let result = [...videos];
    if (currentTab !== ViewTab.ADMIN) {
      result = result.filter(v => v.status !== "scheduled");
    }

    // Implement dynamic sorting: 'videos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))'
    result.sort((a, b) => (new Date(b.createdAt || '') as any) - (new Date(a.createdAt || '') as any));

    // Search bar filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          (v.description && v.description.toLowerCase().includes(q))
      );
    }

    // Horizontal Genre Filter
    if (selectedCategory !== "all") {
      if (selectedCategory === "latest") {
        // "Latest" section dynamically fetches and maps the most recent 10 videos
        return result.slice(0, 10);
      }
      if (selectedCategory === "trending") {
        // "Trending" section dynamically fetches category trending or isTrending flag
        return result.filter((v) => v.category === "trending" || v.isTrending === true);
      }
      result = result.filter((v) => v.category === selectedCategory);
    }

    return result;
  };

  const filteredList = getFilteredVideos();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] text-white flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-6 max-w-sm px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#f5c518] flex items-center justify-center shadow-[0_0_25px_rgba(245,197,24,0.35)] border border-[#f5c518]/25 animate-bounce">
            <Film className="w-7 h-7 text-black stroke-[2.5]" />
          </div>
          <div className="space-y-4 w-full">
            <div>
              <h2 className="text-xl font-black uppercase tracking-widest text-[#f5c518] font-sans drop-shadow-[0_0_15px_rgba(245,197,24,0.7)]">
                ViralBD99
              </h2>
              <div className="text-[10.5px] text-amber-100/90 font-medium px-4 py-1.5 rounded-xl bg-white/5 border border-white/5 inline-block mt-3.5 min-h-[22px] leading-relaxed">
                {selectedPreloaderMessage}
              </div>
            </div>
            {/* Slim progress loader animating cleanly */}
            <div className="w-44 h-1.5 bg-white/10 rounded-full mx-auto overflow-hidden relative">
              <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-red-500 via-[#f5c518] to-amber-500 rounded-full animate-progress-slide w-full h-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#F5F5F5] font-sans flex flex-col pb-12 overflow-x-hidden relative" id="cineflex-root-shell">
      
      {/* 18+ Age Verification Overlay */}
      {!isAgeVerified && (
        <div className="fixed inset-0 bg-[#070708]/95 z-[99999] flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md" id="age-verification-screen">
          <div className="max-w-md w-full bg-[#111115] border border-white/5 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
            {/* Warning visual symbol */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 via-[#f5c518] to-amber-500" />
            
            <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-6 scale-100 hover:scale-110 transition-transform duration-300">
              <span className="text-3xl font-black font-display tracking-tighter">18+</span>
            </div>

            <h1 className="text-2xl font-black font-display tracking-tight text-white mb-3">
              AGE VERIFICATION REQUIRED
            </h1>
            
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              This video network contains mature materials, media entries, and curated indexers intended strictly for <span className="font-bold text-slate-200">adult audiences aged 18 or older</span>. 
              <br />
              <span className="block mt-3 text-[10px] text-slate-500 font-mono">
                By entering, you confirm under penalty of perjury that you are of legal age (18+) to access mature streaming content in your region.
              </span>
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  try {
                    localStorage.setItem("viralbd99_age_verified", "true");
                  } catch (e) {
                    console.warn(e);
                  }
                  setIsAgeVerified(true);
                  setShowToast("Access Granted. Enjoy responsibly.");
                  setTimeout(() => setShowToast(null), 3000);
                }}
                className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs py-3.5 rounded-xl cursor-pointer active:scale-[0.98] transition-all uppercase tracking-wider shadow-lg shadow-red-600/10"
              >
                I AM 18 OR OLDER - ENTER SITE
              </button>
              
              <button
                onClick={() => {
                  window.location.href = "https://www.google.com";
                }}
                className="w-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-mono text-[11px] py-2.5 rounded-xl cursor-pointer transition-colors border border-white/5 uppercase"
              >
                LEAVE (UNDER 18)
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-red-500/70" />
              <span>SECURED & DECRYPTED WEB CHANNEL</span>
            </div>

          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-[#f5c518] text-black px-5 py-2.5 rounded-lg shadow-2xl text-xs font-bold font-mono tracking-wider flex items-center gap-2 whitespace-nowrap">
          <div className="w-2 h-2 rounded-full bg-black animate-ping" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Admin Mode top panel banner (Retained elegantly for testing and review uploads) */}
      {isAdminMode && (
        <div 
          style={{ display: user.role === "admin" ? "flex" : "none" }}
          className="bg-[#f5c518]/10 border-b border-[#f5c518]/30 text-[#f5c518] py-2 px-4 text-center text-xs font-mono flex items-center justify-center gap-2 select-none relative z-50"
        >
          <span>ADMINISTRATOR MODE ACTIVE — DIRECT VIDEO MANAGER ACCESSIBLE</span>
          <button 
            type="button"
            onClick={() => {
              setCurrentTab(currentTab === ViewTab.ADMIN ? ViewTab.HOME : ViewTab.ADMIN);
            }}
            className="bg-[#f5c518] text-black font-sans px-2 py-0.5 rounded font-black hover:opacity-90 transition-opacity ml-2"
          >
            {currentTab === ViewTab.ADMIN ? "Show Website" : "Manage Videos"}
          </button>
          <button 
            type="button"
            onClick={() => setIsAdminMode(false)}
            className="absolute right-4 hover:text-white font-sans text-xs underline cursor-pointer"
          >
            [Disconnect]
          </button>
        </div>
      )}

      {/* Primary Header */}
      <Header
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          // Return to home page if viewing admin configuration screen
          if (currentTab !== ViewTab.HOME) {
            setCurrentTab(ViewTab.HOME);
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (currentTab !== ViewTab.HOME) {
            setCurrentTab(ViewTab.HOME);
          }
        }}
        firebaseOnline={firebaseOnline}
        bookmarksCount={bookmarkedIds.length}
        onViewBookmarks={() => {
          setSelectedCategory("all");
          setSearchQuery("");
          setCurrentTab(ViewTab.BOOKMARKS);
        }}
      />

      {/* Sleek Live Viewer Broadcast Badge (Just Below Header) */}
      <div className="w-full max-w-7xl mx-auto px-4 mt-3 flex justify-end shrink-0" id="site-live-viewers-container">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md border border-[#10b981]/15 rounded-full text-emerald-400 text-[10px] sm:text-[11px] font-black select-none shadow-[0_2px_12px_rgba(16,185,129,0.05)] animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>🟢 {toBanglaNumber(appLiveViewers)} জন দেখছেন</span>
        </div>
      </div>

      {/* Switchable Viewport Ad Placement banner (Desktop 728x90 vs Mobile 320x50) */}
      {adSettings.isEnabled && adSettings.bannerHomeTopEnabled && (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-0 mt-2 mb-4" id="banner-space-top">
          <div className="hidden md:block">
            <AdPlacement code={adSettings.bannerHomeTopCode || adSettings.banner728x90Code || ""} type="728x90" />
          </div>
          <div className="block md:hidden">
            <AdPlacement code={adSettings.bannerMobileBottomCode || adSettings.banner320x50Code || ""} type="320x50" />
          </div>
        </div>
      )}

      {/* Switchable Viewport Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto py-2">
        {currentTab === ViewTab.BOOKMARKS ? (
          <div className="flex flex-col px-4 max-w-7xl mx-auto text-left animate-fade-in py-4">
            <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div>
                <h1 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#f5c518] fill-[#f5c518]" />
                  <span>সেভ করা ভিডিও (Saved Videos)</span>
                </h1>
                <p className="text-[11px] text-slate-400 mt-1">আপনার পছন্দের তালিকায় যুক্ত করা স্পেশাল ভিডিওসমূহ</p>
              </div>
              
              {bookmarkedIds.length > 0 && (
                <button
                  onClick={() => {
                    setBookmarkedIds([]);
                    localStorage.removeItem("viralbd99_bookmarks");
                    setShowToast("সকল বুকমার্ক মুছে ফেলা হয়েছে।");
                    setTimeout(() => setShowToast(null), 2500);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 text-xs font-bold transition duration-150 border border-red-500/25 cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>সব মুছুন (Clear All)</span>
                </button>
              )}
            </div>

            {videos.filter((v) => v.status !== "scheduled" && bookmarkedIds.includes(v.id)).length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/10 border border-dashed border-white/5 rounded-2xl" id="empty-bookmarks-slate">
                <Bookmark className="w-10 h-10 text-slate-505 mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-350">আপনি এখনো কোনো ভিডিও সেভ করেননি।</p>
                <span className="text-[10px] text-zinc-500 block mt-1">যেকোনো ভিডিওর বুকমার্ক আইকনে ক্লিক করে পরবর্তীতে দেখার সুবিধার্থে এখানে সেভ করুন।</span>
              </div>
            ) : (
              <VideoGrid
                videos={videos.filter((v) => v.status !== "scheduled" && bookmarkedIds.includes(v.id))}
                onPlayVideo={handlePlayVideo}
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={handleToggleBookmark}
                progressMap={progressMap}
              />
            )}
          </div>
        ) : currentTab === ViewTab.HOME ? (
          <div className="flex flex-col gap-6 animate-fade-in" id="imdb-movie-catalogue-dashboard">
            
            {/* 2. HERO SECTION */}
            {!searchQuery && (
              <HeroSlider
                trendingVideos={(() => {
                  const trendList = [...(selectedCategory === "all" ? videos : videos.filter(v => v.category === selectedCategory))]
                    .filter(v => v.status !== "scheduled")
                    .sort((a, b) => (b.views || 0) - (a.views || 0));
                  return trendList.slice(0, 5);
                })()}
                onPlayVideo={handlePlayVideo}
              />
            )}

            {/* 3. CATEGORY PILLS (RENDERED DYNAMICALLY IN HEADER) */}

            {/* Middle homepage banner spacing */}
            {adSettings.isEnabled && adSettings.bannerHomeMiddleEnabled && (adSettings.bannerHomeMiddleCode || adSettings.banner300x250Code) && (
              <div className="w-full flex flex-col justify-center items-center bg-[#121214] p-3.5 rounded-2xl border border-white/5 max-w-sm mx-auto shadow-xl select-none" id="banner-homepage-middle">
                <span className="text-[8px] font-mono text-[#f5c518] font-black mb-2 tracking-widest uppercase text-center shrink-0">SPONSORED LINKS / বিজ্ঞাপন</span>
                <div className="w-[300px] h-[250px] overflow-hidden flex items-center justify-center shrink-0">
                  <AdPlacement code={adSettings.bannerHomeMiddleCode || adSettings.banner300x250Code || ""} type="300x250" />
                </div>
              </div>
            )}

            {/* 4. TRENDING ROW */}
            {!searchQuery && (
              <div className="px-4 max-w-7xl mx-auto w-full text-left" id="home-trending-carousel-container">
                <div className="border-l-4 border-[#f5c518] pl-2.5 mb-3">
                  <h3 className="text-sm font-black uppercase text-white font-sans tracking-wide">
                    🎬 এখন ট্রেন্ডিং (Now Trending)
                  </h3>
                </div>
                
                <div 
                  ref={trendingScrollRef}
                  className="overflow-x-auto pb-4 flex gap-4 scroll-row no-scrollbar select-none scroll-smooth" 
                  id="trending-posters-row"
                >
                  {(() => {
                    const latestList = [...videos]
                      .filter(v => v.status !== "scheduled")
                      .sort((a, b) => {
                        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                        return dateB - dateA;
                      });
                    const activeTrend = latestList.slice(0, 10);
                    return activeTrend.map((vid) => {
                      const simulatedViewers = 110 + ((vid.views || 0) % 240);
                      return (
                        <div
                          key={vid.id}
                          onClick={() => handlePlayVideo(vid)}
                          className="inline-block w-[110px] shrink-0 cursor-pointer group select-none animate-fade-in"
                        >
                          <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#222222] group-hover:border-[#f5c518] transition-all">
                            <img
                              src={vid.thumbnailUrl}
                              alt={vid.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-102 transition duration-250"
                              loading="lazy"
                            />
                            {/* Top-Left: views */}
                            <div className="absolute top-1 left-1 bg-black/80 backdrop-blur-sm text-[7px] font-mono text-[#f5c518] px-1 py-0.5 rounded border border-[#222222]/50 font-bold">
                              👁️ {toBanglaNumber(formatViews(vid.views || 0))}
                            </div>

                            {/* Top-Right: live viewers */}
                            <div className="absolute top-1 right-1 bg-red-600/95 backdrop-blur-sm text-[7px] font-sans text-white px-1 py-0.5 rounded border border-red-500/30 font-bold flex items-center gap-0.5 animate-pulse">
                              <span className="w-1 h-1 rounded-full bg-white inline-block"></span>
                              {toBanglaNumber(simulatedViewers)}+ দেখছেন
                            </div>

                            {/* Center: Play floating pulsing icon */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:scale-110 transition duration-300">
                              <div className="bg-[#f5c518]/90 hover:bg-[#f5c518] text-black w-7 h-7 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(245,197,24,0.6)] border border-[#f5c518]/30 transition-all duration-300 transform animate-pulse">
                                <Play className="w-3.5 h-3.5 fill-black text-black ml-0.5" />
                              </div>
                            </div>

                            {/* Bottom high visibility badge */}
                            <div className="absolute bottom-1 inset-x-1 bg-amber-500 text-black text-[6.5px] font-black py-0.5 rounded text-center tracking-tighter uppercase font-sans border border-amber-400 shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                              ⚡ INSTANT PLAY (পাসওয়ার্ড নেই)
                            </div>
                          </div>
                          <h4 className="mt-1.5 text-white text-[10.5px] font-bold line-clamp-1 group-hover:text-[#f5c518] leading-tight text-left">
                            {vid.title}
                          </h4>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* SMART CATEGORY FILTER (REPOSITIONED DIRECTLY BELOW TRENDING AND ABOVE LATEST VIDEOS WITH AMPLE SPACING) */}
            <div className="pt-2 pb-1" id="repositioned-smart-filter-container">
              <SmartCategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={(slug) => {
                  setSelectedCategory(slug);
                  if (currentTab !== ViewTab.HOME) {
                    setCurrentTab(ViewTab.HOME);
                  }
                }}
              />
            </div>

            {/* 5. LATEST VIDEOS GRID */}
            <div className="w-full" id="home-latest-clips-grid">
              <VideoGrid
                title={
                  searchQuery
                    ? `🔍 সার্চ ফলাফল: "${searchQuery}"`
                    : selectedCategory === "all"
                      ? "📹 লেটেস্ট ভিডিও"
                      : `📹 লেটেস্ট ভিডিও - ${categories.find(c => c.slug === selectedCategory)?.name || "Videos"}`
                }
                videos={filteredList.slice(0, visibleCount)}
                onPlayVideo={handlePlayVideo}
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={handleToggleBookmark}
                progressMap={progressMap}
              />
              
              {/* Load More Indicator/Trigger for infinite scroll */}
              {visibleCount < filteredList.length && (
                <div className="py-6 flex justify-center">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 8)}
                    className="px-6 py-2 bg-[#1a1a1a] border border-[#222222] rounded-full text-xs text-[#aaaaaa] font-bold hover:bg-[#222222] hover:text-white transition cursor-pointer active:scale-95"
                  >
                    আরো লোড করুন (Load More)
                  </button>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Admin configuration viewport overlay */
          <div className="p-4">
            {!isLoggedIn ? (
              /* Two-Step Authentication Gate */
              loginStep === 1 ? (
                /* Step 1: Secret Knock (Blank screen with hidden input) */
                <div 
                  className="fixed inset-0 bg-[#060608] z-[100] flex flex-col items-center justify-center cursor-default select-none"
                  onClick={() => secretKnockInputRef.current?.focus()}
                >
                  <input
                    ref={secretKnockInputRef}
                    type="text"
                    autoFocus
                    className="absolute opacity-0 pointer-events-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = e.currentTarget.value.trim();
                        if (val === "viralbd99admin") {
                          setLoginStep(2);
                          // Pre-check lockouts when moving to Step 2
                          getAdminSecurity().then((docSec) => {
                            if (docSec.blockedUntil) {
                              const bTime = Date.parse(docSec.blockedUntil);
                              if (Date.now() < bTime) {
                                setLockoutSecs(Math.ceil((bTime - Date.now()) / 1000));
                              }
                            }
                          });
                          e.currentTarget.value = "";
                        } else {
                          // wrong word -> Redirect to homepage
                          window.history.replaceState(null, "", "/");
                          setCurrentTab(ViewTab.HOME);
                          setIsAdminMode(false);
                        }
                      }
                    }}
                  />
                  {/* Subtle visually pleasing indication only readable for the admin to type */}
                  <div className="text-[10px] text-zinc-950/20 font-mono select-none">PORTAL GATEWAY</div>
                </div>
              ) : (
                /* Step 2: Password Form with brute force locked checks */
                <div className="min-h-[70vh] flex items-center justify-center px-4" id="admin-secured-gate">
                  <div className="w-full max-w-sm bg-[#121214]/65 backdrop-blur-md border border-white/5 rounded-2xl p-7 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
                    
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
                        <Sliders className="w-5 h-5 animate-pulse" />
                      </div>
                      
                      <h2 className="text-base font-bold text-white tracking-tight font-sans">
                        VIRALBD99 Auth Studio
                      </h2>
                      <p className="text-xs text-slate-400 mt-1 pb-4 border-b border-white/5 w-full leading-relaxed">
                        এডমিন প্যানেলে প্রবেশ করতে আপনার পাসওয়ার্ড দিন
                      </p>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="mt-5 flex flex-col gap-4">
                      {lockoutSecs > 0 ? (
                        /* Blocked screen layout with Bengali warning and countdown clock */
                        <div className="p-4 bg-red-950/20 border border-red-500/25 rounded-xl text-center">
                          <AlertTriangle className="w-6 h-6 text-[#f33e3e] mx-auto mb-2 animate-bounce" />
                          <p className="text-xs font-bold text-red-400 font-sans leading-normal">
                            অনেকবার ভুল হয়েছে। 5 মিনিট পর চেষ্টা করুন।
                          </p>
                          <div className="mt-3 text-xs text-slate-400 font-mono">
                            অবশিষ্ট সময়: <span className="text-amber-400 font-bold text-sm font-mono ml-1">
                              {Math.floor(lockoutSecs / 60)}:{(lockoutSecs % 60).toString().padStart(2, "0")}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                              পাসওয়ার্ড দিন
                            </label>
                            <input
                              type="password"
                              required
                              placeholder="••••••••"
                              value={adminPasswordInput}
                              onChange={(e) => setAdminPasswordInput(e.target.value)}
                              className="w-full bg-[#18181b] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#f5c518] focus:border-[#f5c518]"
                            />
                          </div>

                          {authErrorMsg && (
                            <p className="text-xs text-red-400 font-medium font-sans flex items-center gap-1.5 leading-normal">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>{authErrorMsg}</span>
                            </p>
                          )}

                          <button
                            type="submit"
                            disabled={checkingAuthLock}
                            className="bg-[#f5c518] hover:bg-[#ffe042] text-black text-xs font-bold py-2.5 rounded-xl transition duration-150 active:scale-95 cursor-pointer disabled:opacity-50 mt-1"
                          >
                            {checkingAuthLock ? "ভেরিফাই করা হচ্ছে..." : "লগইন করুন"}
                          </button>
                        </>
                      )}
                    </form>
                  </div>
                </div>
              )
            ) : (
              /* Legitimate authorized workspace views */
              <div style={{ display: user.role === "admin" ? "block" : "none" }}>
                <React.Suspense fallback={<div className="text-zinc-500 font-mono text-xs w-full text-center py-12">Loading Admin Panel controls...</div>}>
                  <AdminPanel
                    videos={videos}
                    categories={categories}
                    adSettings={adSettings}
                    onAddVideo={handleAddVideo}
                    onUpdateVideo={handleUpdateVideo}
                    onDeleteVideo={handleDeleteVideo}
                    onResetSeedData={handleResetSeedData}
                    onUpdateAdSettings={handleUpdateAdSettings}
                    onTriggerSimulatedClick={handleTriggerSimulatedAdClick}
                    onResetSimulatedEarnings={handleResetSimulatedEarnings}
                    onLogout={handleLogout}
                    activityLogs={activityLogsList}
                    onSaveCategory={handleSaveCategory}
                  />
                </React.Suspense>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Cinema Live Overlay Modal */}
      {activePlayingVideo && (
        <React.Suspense fallback={<div className="fixed inset-0 z-[999999] bg-[#070708]/90 flex items-center justify-center text-white font-mono text-sm">Loading Premium Video Stream...</div>}>
          <VideoPlayerModal
            video={activePlayingVideo}
            allVideos={videos}
            onClose={() => setActivePlayingVideo(null)}
            onPlayVideo={handlePlayVideo}
            adSettings={adSettings}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            isAdmin={isLoggedIn}
          />
        </React.Suspense>
      )}

      {/* Dynamic Centered Dark Footer */}
      <footer className="w-full bg-[#08080a] border-t border-white/5 mt-10 md:mt-16 py-10 px-4 sm:px-8 select-none" id="app-footer">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-7">

          {/* More Categories Grid */}
          <div className="w-full text-left" id="more-categories-section">
            <div className="border-l-4 border-amber-500 pl-2.5 mb-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-black uppercase text-white font-sans tracking-wide">
                  🏷️ অন্যান্য ক্যাটাগরি (More Categories)
                </h3>
                <p className="text-[9px] text-[#aaaaaa] font-mono mt-0.5">পছন্দের বিভাগ এক্সপ্লোর করুন</p>
              </div>
              <span className="text-[9px] bg-white/5 text-[#aaaaaa] font-mono px-2 py-0.5 rounded-full select-none border border-white/5">EXPLORE-MODE</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.map((cat) => {
                const IconComponent = () => {
                  switch (cat.iconName?.toLowerCase()) {
                    case "flame": return <Flame className="w-4 h-4 text-[#f5c518]" />;
                    case "clock": return <Clock className="w-4 h-4 text-[#f5c518]" />;
                    case "sparkles": return <Sparkles className="w-4 h-4 text-[#f5c518]" />;
                    case "award": return <Award className="w-4 h-4 text-[#f5c518]" />;
                    case "heart": return <Heart className="w-4 h-4 text-[#f5c518]" />;
                    case "tv": return <Tv className="w-4 h-4 text-[#f5c518]" />;
                    case "globe": return <Globe className="w-4 h-4 text-[#f5c518]" />;
                    default: return <Film className="w-4 h-4 text-[#f5c518]" />;
                  }
                };
                
                const isSelected = selectedCategory === cat.slug;
                const videoCount = videos.filter(v => v.category === cat.slug && v.status !== "scheduled").length;

                return (
                  <button
                    key={cat.id || cat.slug}
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      setCurrentTab(ViewTab.HOME);
                      window.scrollTo({ top: 380, behavior: "smooth" });
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl transition-all duration-300 border text-left select-none cursor-pointer ${
                      isSelected 
                        ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/40 text-white shadow-[0_0_12px_rgba(245,197,24,0.15)]"
                        : "bg-[#141416]/90 hover:bg-[#1c1c1f] border-white/5 text-slate-300 hover:text-white hover:border-amber-500/20"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? "bg-amber-500/20" : "bg-white/5"}`}>
                      <IconComponent />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-black leading-tight block truncate">
                        {cat.name}
                      </span>
                      <span className="text-[8px] text-slate-500 font-mono block mt-0.5">
                        {toBanglaNumber(videoCount)} ভিডিও
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spacer & Divider */}
          <div className="w-full h-px bg-white/5 my-1 md:my-2 shrink-0 animate-fade-in" />
          
          {/* Curated Social Community Channels */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pb-1" id="social-community-channels">
            <a
              href={adSettings.telegramUrl || "https://t.me/viralbd99"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/15 text-[10px] sm:text-xs font-bold font-mono tracking-wide transition-all shadow-md active:scale-95 group cursor-pointer"
              title="Join Telegram Channel"
            >
              <Send className="w-3.5 h-3.5 text-sky-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              <span>Telegram</span>
            </a>
            <a
              href={adSettings.facebookUrl || "https://facebook.com/viralbd99"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/15 text-[10px] sm:text-xs font-bold font-mono tracking-wide transition-all shadow-md active:scale-95 group cursor-pointer"
              title="Follow Facebook Page"
            >
              <Facebook className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>Facebook</span>
            </a>
            <a
              href={adSettings.whatsappUrl || "https://whatsapp.com/channel/viralbd99"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/15 text-[10px] sm:text-xs font-bold font-mono tracking-wide transition-all shadow-md active:scale-95 group cursor-pointer"
              title="Join WhatsApp Channel"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Platform Title Descriptor */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              <span className="text-base font-black font-display text-white tracking-widest uppercase">ViralBD99</span>
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm sm:max-w-md leading-relaxed font-sans">
              The ultimate destination for premium video content. Stream the latest, trending, and exclusive videos in HD quality.
            </p>
          </div>

          {/* Ad Placement Inside Centered Container to Keep Responsive and Aligned */}
          {adSettings.isEnabled && adSettings.banner320x50Code && (
            <div className="w-full max-w-xs flex flex-col justify-center items-center bg-black/40 rounded-xl p-1.5 border border-white/5 mx-auto" id="ad-above-warning">
              <span className="text-[7px] font-mono text-amber-500/80 font-bold mb-1 tracking-widest leading-none">SPONSORED LINK</span>
              <div className="w-[320px] h-[50px] overflow-hidden flex items-center justify-center shrink-0">
                <AdPlacement code={adSettings.banner320x50Code} type="320x50" />
              </div>
            </div>
          )}

          {/* Centered Quick Information Links */}
          <div className="w-full border-t border-white/5 pt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-[11px] sm:text-xs">
            <button 
              onClick={() => setFooterModal("privacy")}
              className="flex items-center gap-1.5 text-slate-400 hover:text-[#f5c518] transition-colors cursor-pointer font-sans"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Privacy Policy</span>
            </button>
            <button 
              onClick={() => setFooterModal("terms")}
              className="flex items-center gap-1.5 text-slate-400 hover:text-[#f5c518] transition-colors cursor-pointer font-sans"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Terms of Service</span>
            </button>
            <button 
              onClick={() => setFooterModal("dmca")}
              className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer font-semibold font-sans"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-500/80 shrink-0" />
              <span>DMCA</span>
            </button>
            <button 
              onClick={() => setFooterModal("content_removal")}
              className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer font-sans text-left"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-500/80 shrink-0" />
              <span>Content Removal</span>
            </button>
            <button 
              onClick={() => setFooterModal("contact")}
              className="flex items-center gap-1.5 text-slate-400 hover:text-[#f5c518] transition-colors cursor-pointer font-sans"
            >
              <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Contact Us</span>
            </button>
          </div>

          {/* Mature Content Warning Emblem */}
          <div className="flex items-center gap-2.5 bg-red-500/5 border border-red-500/20 px-4 py-2 rounded-full max-w-xs mx-auto text-left sm:text-center mt-1">
            <span className="inline-flex items-center justify-center text-[10px] font-black text-red-500 bg-red-500/15 border border-red-500/30 w-7 h-7 rounded-full shrink-0">
              18+
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-bold text-slate-300">Adults only.</span>
              <span className="text-[8.5px] text-slate-500 font-sans">Must be 18 or older to browse.</span>
            </div>
          </div>

          {/* Centered copyright segment & exclusive secret desk option */}
          <div className="w-full border-t border-white/5 pt-6 flex flex-col items-center gap-4 text-xs font-mono text-slate-500 select-none">
            <p className="text-slate-400 text-center leading-relaxed">
              © 2026{" "}
              <span
                onClick={() => {
                  window.history.pushState(null, "", "/admin-shamim27");
                  setIsAdminMode(true);
                  setCurrentTab(ViewTab.ADMIN);
                }}
                className="hover:text-[#f5c518] cursor-pointer font-bold duration-150 select-none pb-0.5 border-b border-transparent hover:border-[#f5c518]/40"
                title="Secure System Hub"
              >
                ViralBD99
              </span>{" "}
              - All rights curated. Made with <span className="text-red-500">❤️</span> in Bangladesh
            </p>

            {isAdminMode && (
              <button 
                onClick={() => {
                  setCurrentTab(currentTab === ViewTab.ADMIN ? ViewTab.HOME : ViewTab.ADMIN);
                }}
                className="text-[#f5c518] hover:underline cursor-pointer bg-[#151515] px-3.5 py-1 border border-white/10 rounded-xl font-bold transition hover:bg-[#202020] text-[11px]"
              >
                {currentTab === ViewTab.ADMIN ? "Show Website" : "Open Control Desk"}
              </button>
            )}
          </div>

        </div>
      </footer>

      {/* Informative Footer Option Modals */}
      {footerModal && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto w-full">
          <div className="relative w-full max-w-lg bg-[#0e0e11] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 bg-[#121216]">
              <div className="flex items-center gap-2">
                {footerModal === "about" && <Info className="w-5 h-5 text-[#f5c518]" />}
                {footerModal === "contact" && <Mail className="w-5 h-5 text-[#f5c518]" />}
                {footerModal === "dmca" && <AlertTriangle className="w-5 h-5 text-[#f33e3e]" />}
                {footerModal === "content_removal" && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {footerModal === "terms" && <FileText className="w-5 h-5 text-slate-400" />}
                {footerModal === "privacy" && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
                
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  {footerModal === "about" && "About ViralBD99"}
                  {footerModal === "contact" && "Contact Us"}
                  {footerModal === "dmca" && "DMCA Notice"}
                  {footerModal === "content_removal" && "Content Removal Process"}
                  {footerModal === "terms" && "Terms of Service"}
                  {footerModal === "privacy" && "Privacy Policy"}
                </h3>
              </div>
              <button
                onClick={() => setFooterModal(null)}
                className="p-1 rounded bg-[#18181c] hover:bg-zinc-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-grow p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
              
              {footerModal === "about" && (
                <>
                  <p>
                    <strong>Welcome to ViralBD99!</strong> We are an elegant, fast-loading, community-driven digital video curation platform. We curate the finest full-quality entertainment streams, films, and informative video directories from across the public web.
                  </p>
                  <p>
                    Our ultimate mission is to offer premium, instant, click-and-watch accessibility on curated video entries in an eye-safe, responsive cinematically dark interface, absolutely safe from frustrating redirects or popups.
                  </p>
                  <p>
                    Every stream is embedded with highly optimized player references to ensure complete system performance, lightweight page footprints, and instantaneous playback across any smartphone, tablet, or desktop machine.
                  </p>
                </>
              )}

              {footerModal === "contact" && (
                <>
                  <p>
                    Have a high-quality stream recommendation? Want to report a broken link? We value user feedback and respond to queries with absolute priority.
                  </p>
                  <div className="bg-[#121216] border border-white/5 p-4 rounded-xl space-y-3 font-mono text-[11px] text-slate-400">
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500 uppercase col-span-1">Support Email:</span>
                      <strong className="text-white col-span-2">support@viralbd99.com</strong>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500 uppercase col-span-1">Response Window:</span>
                      <strong className="text-[#f5c518] col-span-2">Within 24 Hours</strong>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500 uppercase col-span-1">Headquarters:</span>
                      <strong className="text-white col-span-2">Dhaka, Bangladesh</strong>
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    *Please describe your issue or embed suggestion clearly so our metadata quality managers can serve you as efficiently as possible.
                  </p>
                </>
              )}

              {footerModal === "dmca" && (
                <>
                  <div className="border-l-4 border-[#f33e3e] bg-[#221213] p-3 text-[11px] text-red-200 rounded font-sans leading-relaxed">
                    <strong>IMPORTANT NOTICE:</strong> ViralBD99 is an information indexer and streaming curation directory. We do not host, store, download, or distribute proprietary media files or raw videos on our server infrastructure.
                  </div>
                  <p>
                    All video thumbnails, titles, and playables are composed exclusively of public hypermedia links and standard, unmodified embedded player frames pointing to servers on third-party platforms (such as Google Drive, YouTube, and standard web hostings).
                  </p>
                  <p>
                    If you represent a copyright owner and identify an embedded hyperlink index that violates intellectual property regulations, please notify us immediately. Our administrators will review and completely <strong>purge the metadata record</strong> from our database search results instantly.
                  </p>
                  <p className="font-mono text-[10px] text-slate-500">
                    Please mail details directly to: <span className="text-[#f33e3e]">copyright@viralbd99.com</span>
                  </p>
                </>
              )}

              {footerModal === "content_removal" && (
                <>
                  <div className="border-l-4 border-amber-500 bg-amber-500/10 p-3 text-[11px] text-amber-200 rounded font-sans leading-relaxed">
                    <strong>CONTENT REMOVAL PROCESS:</strong> ViralBD99 respects copyright laws and holds a strict policy against unauthorized media embeds.
                  </div>
                  <p>
                    If you are a copyright owner or licensing agent and wish to request the removal of any hyperlinked embedded content, please submit an official request.
                  </p>
                  <p>
                    Your request should include:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-1 text-[11px] text-slate-400">
                    <li>Identification of the copyrighted work claimed to have been infringed.</li>
                    <li>The exact page URL or video title on ViralBD99.</li>
                    <li>Your official contact information (email or active representation proof).</li>
                  </ul>
                  <p>
                    Upon validation of your request, we will remove and completely purge the metadata entry index within 12 to 24 hours. Contact our moderation desk directly at <span className="text-[#f33e3e]">copyright@viralbd99.com</span>.
                  </p>
                </>
              )}

              {footerModal === "terms" && (
                <>
                  <p>
                    These Terms of Service govern your access and utilization of the streaming search indexers offered at ViralBD99. By visiting our domain and running embeds:
                  </p>
                  <ul className="list-decimal list-inside space-y-1.5 pl-1">
                    <li>You agree to enjoy all media curations strictly for personal, non-commercial entertainment purposes.</li>
                    <li>You will not execute automated scripts, high-intensity database scraping, or raw scraper bots against our site nodes.</li>
                    <li>You will not duplicate, clone, or frame our exclusive admin dashboard templates.</li>
                  </ul>
                  <p>
                    ViralBD99 reserves the right to moderate, add, edit, or remove catalog records instantly at our absolute discretion.
                  </p>
                </>
              )}

              {footerModal === "privacy" && (
                <>
                  <p>
                    Our respect for your privacy is built directly into our codebase. ViralBD99 maintains an ultra-safe, zero-tracking browsing system:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-1">
                    <li><strong>No Tracking Cookies:</strong> We do not track your digital activities or build marketing profiles.</li>
                    <li><strong>Zero Account Profile Storing:</strong> We don't demand logins, sign-ups, or credentials to watch standard embeds.</li>
                    <li><strong>100% Client-Side State:</strong> Custom variables, search queries, and views are managed cleanly direct in your local browser storage.</li>
                  </ul>
                  <p>
                    We never sell, rent, or lease server registry logs or traffic analytics to any external marketing agencies.
                  </p>
                </>
              )}

            </div>

            {/* Footer with actions */}
            <div className="border-t border-white/5 py-3 px-6 bg-[#121216] flex items-center justify-end">
              <button
                onClick={() => setFooterModal(null)}
                className="px-4 py-1.5 rounded-lg bg-white text-black font-semibold text-xs transition cursor-pointer hover:bg-slate-200 active:scale-95"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Sticky Social Bar Ad Container */}
      {showSocialBar && adSettings.isEnabled && adSettings.socialBarEnabled && (
        <div 
          className={`fixed inset-x-0 z-[45] bg-[#0c0c0f]/95 border-[#f5c518]/20 border-t border-b p-1 flex items-center justify-center shadow-2xl transition-all duration-300 h-[50px] w-full ${
            adSettings.socialBarPosition === "top" ? "top-14" : "bottom-14 md:bottom-2"
          }`}
          id="sticky-social-bar"
        >
          <div className="w-full max-w-4xl relative px-4 flex items-center justify-between">
            {/* Script Embed wrapper */}
            <div className="flex-grow flex items-center justify-center overflow-hidden max-h-[44px]">
              {adSettings.socialBarCode ? (
                <AdPlacement code={adSettings.socialBarCode} type="728x90" />
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-300 font-sans font-semibold">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span>ExoClick Social Ad Bar Live integration (পাসওয়ার্ড দিয়ে ট্র্যাকিং সচল আছে)</span>
                </div>
              )}
            </div>

            {/* Close button dismiss */}
            <button
              onClick={() => {
                setShowSocialBar(false);
                localStorage.setItem("social_bar_dismissed_time", Date.now().toString());
              }}
              className="ml-2 bg-zinc-800 hover:bg-zinc-700 text-slate-300 hover:text-white p-1 rounded-full border border-white/5 active:scale-95 transition-all"
              title="Dismiss social bar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Dismissible Mobile Sticky Bottom Ad Banner (320x50) - Keeps users satisfied while maintaining high impressions */}
      {adSettings.isEnabled && adSettings.bannerMobileBottomEnabled && showStickyMobileAd && (
        <div className="fixed bottom-14 inset-x-0 z-40 bg-black/95 md:hidden border-t border-white/10 py-1.5 flex flex-col items-center justify-center shadow-2xl" id="banner-space-mobile-sticky">
          <div className="w-full max-w-[320px] relative px-2">
            
            {/* Red badge stating Ad block dismiss option */}
            <button
              onClick={() => setShowStickyMobileAd(false)}
              className="absolute -top-3 right-0 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full border border-white/15 cursor-pointer z-50 shadow-lg active:scale-95 transition-all"
              title="Close advertisement"
            >
              <X className="w-2.5 h-2.5" />
            </button>
            <AdPlacement code={adSettings.banner320x50Code} type="320x50" />
          </div>
        </div>
      )}

      {/* 7. BOTTOM NAVIGATION BAR (Mobile devices only) */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onToggleSearch={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          const inp = document.querySelector('input[placeholder="সার্চ করুন..."]') as HTMLInputElement;
          if (inp) inp.focus();
        }}
        onOpenProfile={() => setShowProfileModal(true)}
        bookmarksCount={bookmarkedIds.length}
      />

      {/* Beautiful custom user profile summary panel */}
      {showProfileModal && (
        <div 
          onClick={() => setShowProfileModal(false)}
          className="fixed inset-0 bg-black/80 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm"
          id="profile-overlay-modal"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#1a1a1a] border border-[#222222] rounded-2xl overflow-hidden p-6 text-center shadow-2xl relative animate-fade-in"
          >
            {/* Top Yellow Outline Line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-[#f5c518]" />
            
            <div className="w-16 h-16 rounded-full bg-[#f5c518]/10 border border-[#f5c518]/20 flex items-center justify-center mx-auto mb-4 text-[#f5c518]">
              <User className="w-8 h-8" />
            </div>

            <div style={{ display: user.role === "admin" ? "block" : "none" }}>
              <h3 className="text-base font-black text-white font-sans">
                VIP IMDb Portal Member
              </h3>
              <p className="text-[10px] text-[#f5c518] mt-1 font-mono tracking-widest font-black uppercase">
                VIRALBD99 PREMIUM VISITOR
              </p>
            </div>

            <div style={{ display: user.role !== "admin" ? "block" : "none" }}>
              <h3 className="text-base font-black text-white font-sans">
                IMDb Portal Guest
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 font-mono tracking-widest font-black uppercase">
                VIRALBD99 STANDARD VISITOR
              </p>
            </div>

            <div className="my-5 space-y-3.5 text-left border-t border-b border-[#222222] py-4 font-sans text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#aaaaaa] font-bold">18+ অ্যাক্সেস:</span>
                <span className="text-emerald-500 font-extrabold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> ভেরিফাইড
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#aaaaaa] font-bold">সেভড ভিডিওসমূহ:</span>
                <span className="text-[#f5c518] font-black font-mono bg-[#f5c518]/10 px-2 py-0.5 border border-[#f5c518]/20 rounded">
                  {bookmarkedIds.length} ক্লিপস
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#aaaaaa] font-bold">আইডি টোকেন:</span>
                <span className="text-white font-mono text-[10px] select-all bg-[#0f0f0f] px-2 py-0.5 border border-[#222222] rounded text-[#aaaaaa]">
                  #VBD99-{(bookmarkedIds.length * 153 + 9982).toString(16).toUpperCase()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setCurrentTab(ViewTab.BOOKMARKS);
                }}
                className="w-full bg-[#f5c518] hover:bg-[#ffe042] text-black font-black text-xs py-2.5 rounded-lg select-none cursor-pointer transition active:scale-95"
              >
                আমার বুকমার্কস তালিকা
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
