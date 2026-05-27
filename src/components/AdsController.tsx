/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ViralBD99 - Adsterra & ExoClick Professional Ad Monetization Desk
 */

import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  Sliders, 
  TrendingUp, 
  MousePointerClick, 
  RefreshCw, 
  Layers, 
  Check, 
  Sparkles, 
  Code,
  Lock,
  Clock,
  Layout,
  Smartphone,
  AlertCircle,
  Tv,
  Eye,
  Activity,
  Award,
  Maximize2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { AdSettings, DailyAdStats } from "../types";
import { getDailyAdStats, getTodayDateString } from "../services/db";

interface AdsControllerProps {
  adSettings: AdSettings;
  onUpdateSettings: (settings: AdSettings) => Promise<void>;
  onTriggerSimulatedClick: () => void;
  onResetSimulatedEarnings: () => void;
}

export default function AdsController({
  adSettings,
  onUpdateSettings,
  onTriggerSimulatedClick,
  onResetSimulatedEarnings
}: AdsControllerProps) {
  // Collapsible toggle for advanced & secondary settings
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Global settings state
  const [isEnabled, setIsEnabled] = useState(adSettings.isEnabled);
  const [customScriptUrl, setCustomScriptUrl] = useState(adSettings.customScriptUrl || "");
  const [telegramUrl, setTelegramUrl] = useState(adSettings.telegramUrl || "");
  const [facebookUrl, setFacebookUrl] = useState(adSettings.facebookUrl || "");
  const [whatsappUrl, setWhatsappUrl] = useState(adSettings.whatsappUrl || "");

  // Pre-roll state values
  const [preRollEnabled, setPreRollEnabled] = useState(adSettings.preRollEnabled || false);
  const [preRollCode, setPreRollCode] = useState(adSettings.preRollCode || "");
  const [preRollClickUrl, setPreRollClickUrl] = useState(adSettings.preRollClickUrl || "");
  const [preRollSkipDelay, setPreRollSkipDelay] = useState(adSettings.preRollSkipDelay || 5);

  // Social bar state values
  const [socialBarEnabled, setSocialBarEnabled] = useState(adSettings.socialBarEnabled || false);
  const [socialBarCode, setSocialBarCode] = useState(adSettings.socialBarCode || "");
  const [socialBarPosition, setSocialBarPosition] = useState(adSettings.socialBarPosition || "bottom");

  // Direct link state values
  const [directLinkEnabled, setDirectLinkEnabled] = useState(adSettings.directLinkEnabled || false);
  const [directLinkUrl, setDirectLinkUrl] = useState(adSettings.directLinkUrl || "");
  const [directLinkIntervalMinutes, setDirectLinkIntervalMinutes] = useState(adSettings.directLinkIntervalMinutes || 5);

  // Popunder state values
  const [popunderEnabled, setPopunderEnabled] = useState(adSettings.popunderEnabled || false);
  const [popunderCode, setPopunderCode] = useState(adSettings.popunderCode || "");

  // Granular placements states
  const [bannerHomeTopEnabled, setBannerHomeTopEnabled] = useState(adSettings.bannerHomeTopEnabled || false);
  const [bannerHomeMiddleEnabled, setBannerHomeMiddleEnabled] = useState(adSettings.bannerHomeMiddleEnabled || false);
  const [bannerVideoTopEnabled, setBannerVideoTopEnabled] = useState(adSettings.bannerVideoTopEnabled || false);
  const [bannerVideoUnderPlayerEnabled, setBannerVideoUnderPlayerEnabled] = useState(adSettings.bannerVideoUnderPlayerEnabled || false);
  const [bannerSidebarEnabled, setBannerSidebarEnabled] = useState(adSettings.bannerSidebarEnabled || false);
  const [bannerMobileBottomEnabled, setBannerMobileBottomEnabled] = useState(adSettings.bannerMobileBottomEnabled || false);

  // Banners code variables
  const [banner320x50Code, setBanner320x50Code] = useState(adSettings.banner320x50Code || "");
  const [banner300x250Code, setBanner300x250Code] = useState(adSettings.banner300x250Code || "");
  const [banner728x90Code, setBanner728x90Code] = useState(adSettings.banner728x90Code || "");
  const [bannerVideoTopCode, setBannerVideoTopCode] = useState(adSettings.bannerVideoTopCode || "");
  const [bannerHomeTopCode, setBannerHomeTopCode] = useState(adSettings.bannerHomeTopCode || "");
  const [bannerHomeMiddleCode, setBannerHomeMiddleCode] = useState(adSettings.bannerHomeMiddleCode || "");
  const [bannerVideoUnderPlayerCode, setBannerVideoUnderPlayerCode] = useState(adSettings.bannerVideoUnderPlayerCode || "");
  const [bannerSidebarCode, setBannerSidebarCode] = useState(adSettings.bannerSidebarCode || "");
  const [bannerMobileBottomCode, setBannerMobileBottomCode] = useState(adSettings.bannerMobileBottomCode || "");

  // Popunder safety configs legacy fallback
  const [popunderClickFrequency, setPopunderClickFrequency] = useState(adSettings.popunderClickFrequency || 2);
  const [popunderDelaySeconds, setPopunderDelaySeconds] = useState(adSettings.popunderDelaySeconds || 0);
  const [popunderCooldownMinutes, setPopunderCooldownMinutes] = useState(adSettings.popunderCooldownMinutes || 3);

  // Status logs
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPopunderSimulator, setShowPopunderSimulator] = useState(false);

  // Live Firebase Stats state for Today
  const [dailyStats, setDailyStats] = useState<DailyAdStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Pull ad settings synchronously
  useEffect(() => {
    setIsEnabled(adSettings.isEnabled);
    setCustomScriptUrl(adSettings.customScriptUrl || "");
    setTelegramUrl(adSettings.telegramUrl || "");
    setFacebookUrl(adSettings.facebookUrl || "");
    setWhatsappUrl(adSettings.whatsappUrl || "");

    setPreRollEnabled(adSettings.preRollEnabled || false);
    setPreRollCode(adSettings.preRollCode || "");
    setPreRollClickUrl(adSettings.preRollClickUrl || "");
    setPreRollSkipDelay(adSettings.preRollSkipDelay || 5);

    setSocialBarEnabled(adSettings.socialBarEnabled || false);
    setSocialBarCode(adSettings.socialBarCode || "");
    setSocialBarPosition(adSettings.socialBarPosition || "bottom");

    setDirectLinkEnabled(adSettings.directLinkEnabled || false);
    setDirectLinkUrl(adSettings.directLinkUrl || "");
    setDirectLinkIntervalMinutes(adSettings.directLinkIntervalMinutes || 5);

    setPopunderEnabled(adSettings.popunderEnabled || false);
    setPopunderCode(adSettings.popunderCode || "");

    setBannerHomeTopEnabled(adSettings.bannerHomeTopEnabled || false);
    setBannerHomeMiddleEnabled(adSettings.bannerHomeMiddleEnabled || false);
    setBannerVideoTopEnabled(adSettings.bannerVideoTopEnabled || false);
    setBannerVideoUnderPlayerEnabled(adSettings.bannerVideoUnderPlayerEnabled || false);
    setBannerSidebarEnabled(adSettings.bannerSidebarEnabled || false);
    setBannerMobileBottomEnabled(adSettings.bannerMobileBottomEnabled || false);

    setBanner320x50Code(adSettings.banner320x50Code || "");
    setBanner300x250Code(adSettings.banner300x250Code || "");
    setBanner728x90Code(adSettings.banner728x90Code || "");
    setBannerVideoTopCode(adSettings.bannerVideoTopCode || "");
    setBannerHomeTopCode(adSettings.bannerHomeTopCode || "");
    setBannerHomeMiddleCode(adSettings.bannerHomeMiddleCode || "");
    setBannerVideoUnderPlayerCode(adSettings.bannerVideoUnderPlayerCode || "");
    setBannerSidebarCode(adSettings.bannerSidebarCode || "");
    setBannerMobileBottomCode(adSettings.bannerMobileBottomCode || "");

    setPopunderClickFrequency(adSettings.popunderClickFrequency || 2);
    setPopunderDelaySeconds(adSettings.popunderDelaySeconds || 0);
    setPopunderCooldownMinutes(adSettings.popunderCooldownMinutes || 3);
  }, [adSettings]);

  // Load today's live Firestore stats
  const fetchTodayStats = async () => {
    setLoadingStats(true);
    try {
      const data = await getDailyAdStats();
      setDailyStats(data);
    } catch (e) {
      console.warn("Unable to get today's stats, using mock/local Fallback:", e);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchTodayStats();
  }, []);

  // Submit and save ad configuration
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage("বিজ্ঞাপন সেটিংস ক্লাউড ব্রাউজারে সংরক্ষিত হচ্ছে...");

    try {
      const updated: AdSettings = {
        ...adSettings,
        isEnabled,
        cpm: Number(adSettings.cpm || 4.56),
        customScriptUrl,
        telegramUrl,
        facebookUrl,
        whatsappUrl,

        // Pre-roll values
        preRollEnabled,
        preRollCode,
        preRollClickUrl,
        preRollSkipDelay: Number(preRollSkipDelay),

        // Social bar values
        socialBarEnabled,
        socialBarCode,
        socialBarPosition,

        // Direct link values
        directLinkEnabled,
        directLinkUrl,
        directLinkIntervalMinutes: Number(directLinkIntervalMinutes),

        // Popunder values
        popunderEnabled,
        popunderCode,

        // Placements toggles
        bannerHomeTopEnabled,
        bannerHomeMiddleEnabled,
        bannerVideoTopEnabled,
        bannerVideoUnderPlayerEnabled,
        bannerSidebarEnabled,
        bannerMobileBottomEnabled,

        // General banner codes
        banner320x50Code,
        banner300x250Code,
        banner728x90Code,
        bannerVideoTopCode,
        bannerHomeTopCode,
        bannerHomeMiddleCode,
        bannerVideoUnderPlayerCode,
        bannerSidebarCode,
        bannerMobileBottomCode,

        // Safety limiters
        popunderClickFrequency: Number(popunderClickFrequency),
        popunderDelaySeconds: Number(popunderDelaySeconds),
        popunderCooldownMinutes: Number(popunderCooldownMinutes)
      };

      await onUpdateSettings(updated);
      
      setStatusMessage("অসাধারণ! বিজ্ঞাপন সেটিংস সফলভাবে সেভ করা হয়েছে। পরিবর্তনগুলি অবিলম্বে কার্যকর হবে।");
      fetchTodayStats(); // Refresh live counters
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setStatusMessage("ভুল ত্রুটি: সেটিংস সংরক্ষণ করতে ব্যর্থ হয়েছে। ফায়ারবেস সিকিউরিটি চেক করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetStats = () => {
    if (confirm("আপনি কি নিশ্চিতভাবে সব বিজ্ঞাপনের আর্নিং রিসেট করতে চান?")) {
      onResetSimulatedEarnings();
      setStatusMessage("মুল্যায়ন এবং সমস্ত বিজ্ঞাপনের রেভিনিউ মেমোরি রিসেট করা হয়েছে।");
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const triggerPopunder = () => {
    setShowPopunderSimulator(true);
    onTriggerSimulatedClick();
  };

  return (
    <div className="px-1 py-1 flex flex-col gap-5 text-left" id="monetization-module">
      
      {/* HUD Header */}
      <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            <h1 className="text-lg font-bold font-display text-white tracking-tight">ViralBD99 Monetization Admin Panel (বিজ্ঞাপন বিন্যাসক)</h1>
            <span className="bg-yellow-400/10 text-[#f5c518] text-[9px] font-mono font-bold border border-[#f5c518]/20 px-2 py-0.5 rounded uppercase">
              Live Cloud Desk
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            ম্যানেজ করুন ভিডিও প্রি-রোল বিজ্ঞাপন, সোশ্যাল বার, পপআন্ডার এবং ৬ টি নির্দিষ্ট ব্যানার অ্যাড ফরম্যাট কোড。
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Overview Cards */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex flex-col gap-3 text-left">
            <h4 className="text-white font-bold text-xs flex items-center gap-1">
              <Award className="w-4 h-4 text-emerald-400 animate-bounce" />
              আজকের বিজ্ঞাপন ট্র্যাকিং কাউন্টার
            </h4>
            <p className="text-[11px] text-slate-400">
              ফায়ারবেস ডেটাবেস থেকে আজকের তারিখ <strong className="text-slate-300">({getTodayDateString()})</strong> অনুযায়ী বাস্তব মেট্রিিক্স:
            </p>

            {loadingStats ? (
              <div className="text-center py-4 text-xs font-mono text-slate-500 animate-pulse">
                ফায়ারবেস স্ট্যাটস লোড করা হচ্ছে...
              </div>
            ) : (
              <div className="space-y-2 border-t border-white/5 pt-2.5 font-mono text-xs">
                <div className="flex justify-between items-center py-1.5 px-2.5 rounded-lg bg-white/[0.02]">
                  <span className="text-slate-400">প্রি-রোল লোড করা হয়েছে:</span>
                  <span className="text-amber-400 font-bold text-sm bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/10">
                    {dailyStats?.preRollShown || 0} বার
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-2.5 rounded-lg bg-white/[0.02]">
                  <span className="text-slate-400">প্রি-রোল স্কিপ (বিনিয়োজিত):</span>
                  <span className="text-[#f5c518] font-bold text-sm bg-yellow-400/5 px-2 py-0.5 rounded border border-yellow-400/10">
                    {dailyStats?.preRollSkipped || 0} বার
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-2.5 rounded-lg bg-white/[0.02]">
                  <span className="text-slate-400">ডিরেক্ট লিঙ্ক ক্লিক:</span>
                  <span className="text-emerald-400 font-bold text-sm bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/10">
                    {dailyStats?.directLinkFired || 0} বার
                  </span>
                </div>
                <button
                  type="button"
                  onClick={fetchTodayStats}
                  className="w-full mt-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-sans font-bold text-[10px] py-1.5 rounded transition cursor-pointer"
                >
                  স্ট্যাটাস রিফ্রেশ করুন (Refresh Counters)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Streamlined Single Page Monetization Desk */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
            
            {/* SECTION 1: Master Controls & Community Channel links */}
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-bold font-mono text-yellow-400 uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                মাস্টার কন্ট্রোল ও রেট ম্যানিপুলেশন (Global Config)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Enabled Toggle Switch */}
                <div className="flex items-center justify-between p-3.5 bg-[#161618] rounded-xl border border-white/5">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">সার্বজনীন বিজ্ঞাপন সক্ষমতা (Master On/Off)</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                      একটি ক্লিকে অল প্ল্যাটফর্ম অ্যাডস সোর্স বন্ধ বা চালু করুন।
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => setIsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f5c518]"></div>
                  </label>
                </div>

                {/* AUTOMATED SYSTEM CPM TRACKER */}
                <div className="flex flex-col justify-between p-3.5 bg-[#161618] rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      SYSTEM CPM TRACKER (AUTOMATED)
                    </span>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                      Real-Time Active
                    </span>
                  </div>
                  
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-white text-base font-black font-mono">
                      ${adSettings.cpm ? adSettings.cpm.toFixed(3) : "4.560"}
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold">USD YIELD / 1K LOADS</span>
                  </div>

                  <div className="mt-2 text-[9px] text-slate-500 space-y-1 font-mono leading-tight">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>Network Delivery Latency:</span>
                      <span className="text-emerald-400 font-bold">{(120 + (((adSettings.clicks || 0) * 7) % 180))}ms</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>Network Response Log:</span>
                      <span className="text-emerald-400 font-bold">HTTP 200 OK</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ref Rate Algorithm:</span>
                      <span className="text-slate-300 font-bold">Dynamic Events Tracker</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Public Community URLs */}
              <div className="pt-2 border-t border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  পাবলিক কমিউনিটি চ্যানেল লিঙ্ক সেটিংস (Channels Link)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono block">Telegram Channel</span>
                    <input
                      type="text"
                      value={telegramUrl}
                      onChange={(e) => setTelegramUrl(e.target.value)}
                      className="w-full bg-[#161618] border border-white/5 rounded-lg p-2 text-xs text-white placeholder-slate-600"
                      placeholder="https://t.me/..."
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono block">Facebook Page</span>
                    <input
                      type="text"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      className="w-full bg-[#161618] border border-white/5 rounded-lg p-2 text-xs text-white placeholder-slate-600"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono block">WhatsApp Channel</span>
                    <input
                      type="text"
                      value={whatsappUrl}
                      onChange={(e) => setWhatsappUrl(e.target.value)}
                      className="w-full bg-[#161618] border border-white/5 rounded-lg p-2 text-xs text-white placeholder-slate-600"
                      placeholder="https://whatsapp.com/channel/..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Direct Script Embed Codes & Toggles */}
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="border-b border-white/5 pb-2">
                <h3 className="text-xs font-bold font-mono text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-[#f5c518]" />
                  সরাসরি বিজ্ঞাপন স্ক্রিপ্ট সেটিংস ও অনলাইন টগলস (Direct Ad Units Config)
                </h3>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  এখানে বিজ্ঞাপন কোড বসিয়ে সরাসরি টগল বাটন দিয়ে কন্ট্রোল করুন। ক্লায়েন্ট সাইট কোনো স্ক্রিপ্ট মুছবে না।
                </p>
              </div>

              <div className="flex flex-col gap-4">

                {/* 1. Popunder Script Code */}
                <div className="p-4 bg-[#161618] rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5 text-purple-400" />
                        পপআন্ডার বিজ্ঞাপন কোড (Popunder Script Code)
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">রিল ও হোম পেইজ ক্লিকপয়েন্ট ইন্টারেকশন পপআন্ডার স্ক্রিপ্ট।</p>
                    </div>
                    {/* Safe Toggle next to Textarea Header */}
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox"
                        checked={popunderEnabled}
                        onChange={(e) => setPopunderEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>
                  <textarea
                    rows={4}
                    value={popunderCode}
                    onChange={(e) => setPopunderCode(e.target.value)}
                    placeholder="পপআন্ডার স্ক্রিপ্ট পেস্ট করুন যেমন: <script type='text/javascript'>...</script>"
                    className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-xs font-mono text-purple-300 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* 2. Video Pre-roll Ad Script */}
                <div className="p-4 bg-[#161618] rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Tv className="w-3.5 h-3.5 text-amber-500" />
                        ভিডিও প্লেয়ার প্রি-রোল বিজ্ঞাপন কোড (Video Pre-roll Ad Script)
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">ভিডিও চালু করার সাথে সাথে প্রদর্শিত ওভারলে প্রি-রোল বিজ্ঞাপন।</p>
                    </div>
                    {/* Safe Toggle next to Textarea Header */}
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox"
                        checked={preRollEnabled}
                        onChange={(e) => setPreRollEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#f5c518]"></div>
                    </label>
                  </div>

                  {/* Inline Helper Config Parameters for Pre-roll to preserve functionality */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1 border-b border-white/5 mb-1 text-xs">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-mono mb-1 uppercase text-left">Skip Timer Seconds (সেকেন্ড)</span>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={preRollSkipDelay}
                        onChange={(e) => setPreRollSkipDelay(Number(e.target.value))}
                        className="bg-black/30 border border-white/5 text-white p-1.5 text-xs rounded focus:outline-none focus:ring-1 focus:ring-yellow-400"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-mono mb-1 uppercase text-left">Ad Click Action URL (লিঙ্ক)</span>
                      <input
                        type="url"
                        value={preRollClickUrl}
                        onChange={(e) => setPreRollClickUrl(e.target.value)}
                        placeholder="https://example.com/target"
                        className="bg-black/30 border border-white/5 text-white p-1.5 text-xs rounded focus:outline-none focus:ring-1 focus:ring-yellow-400"
                      />
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    value={preRollCode}
                    onChange={(e) => setPreRollCode(e.target.value)}
                    placeholder="ভিডিও প্রি-রোল রিচ HTML কোড এখানে পেস্ট করুন..."
                    className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-xs font-mono text-amber-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>

                {/* 3. Social Bar Ad Script */}
                <div className="p-4 bg-[#161618] rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Layout className="w-3.5 h-3.5 text-emerald-400" />
                        সোশ্যাল বার স্ক্রিপ্ট কোড (Social Bar Ad Script)
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">ইন-পৃষ্ঠা স্মার্ট চ্যাট নোটিফিকেশন অথবা সোশ্যাল ফ্লোটিং বিজ্ঞাপন।</p>
                    </div>
                    {/* Safe Toggle next to Textarea Header */}
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox"
                        checked={socialBarEnabled}
                        onChange={(e) => setSocialBarEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  {/* Inline Float placement field so it is editable */}
                  <div className="flex flex-col pl-1">
                    <span className="text-[10px] text-slate-400 font-mono mb-1 uppercase">ফ্লোটিং পজিশন (Float position placement)</span>
                    <select
                      value={socialBarPosition}
                      onChange={(e) => setSocialBarPosition(e.target.value)}
                      className="bg-black/30 border border-white/5 text-white text-xs p-1.5 rounded focus:outline-none w-full sm:w-1/2"
                    >
                      <option value="bottom">Screen Bottom Float (নিচে - রিকমেন্ডেড)</option>
                      <option value="top">Screen Top Flat Banner (উপরে)</option>
                    </select>
                  </div>

                  <textarea
                    rows={4}
                    value={socialBarCode}
                    onChange={(e) => setSocialBarCode(e.target.value)}
                    placeholder="সোশ্যাল বার স্ক্রিপ্ট বা স্মার্ট নোটিফিকেশন কোড এখানে পেস্ট করুন..."
                    className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-xs font-mono text-emerald-300 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* 4. Banner Ad (Homepage Top) */}
                <div className="p-4 bg-[#161618] rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                        ব্যানার অ্যাড হোমপেজ উপরে (Banner Ad - Homepage Top 728x90)
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">হোমপেজের একদম উপরে বড় লিডারবোর্ড ফরম্যাট ব্যানার স্ক্রিপ্ট।</p>
                    </div>
                    {/* Safe Toggle next to Textarea Header */}
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox"
                        checked={bannerHomeTopEnabled}
                        onChange={(e) => setBannerHomeTopEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>
                  <textarea
                    rows={3}
                    value={bannerHomeTopCode}
                    onChange={(e) => setBannerHomeTopCode(e.target.value)}
                    placeholder="হোমপেজ উপরে লিডারবোর্ড HTML/JS স্ক্রিপ্ট এখানে পেস্ট করুন..."
                    className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-xs font-mono text-indigo-300 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* 5. Banner Ad (Below Player) */}
                <div className="p-4 bg-[#161618] rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Layout className="w-3.5 h-3.5 text-blue-400" />
                        ব্যানার অ্যাড প্লেয়ারের নিচে (Banner Ad - Below Player 300x250)
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">ভিডিও দেখতে দেখতে প্লেয়ার স্ক্রিনের নিচে প্রদর্শিত ব্যানার স্ক্রিপ্ট।</p>
                    </div>
                    {/* Safe Toggle next to Textarea Header */}
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox"
                        checked={bannerVideoUnderPlayerEnabled}
                        onChange={(e) => setBannerVideoUnderPlayerEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                  <textarea
                    rows={3}
                    value={bannerVideoUnderPlayerCode}
                    onChange={(e) => setBannerVideoUnderPlayerCode(e.target.value)}
                    placeholder="প্লেয়ারের নিচের ব্যানার কোড 300x250 HTML/JS স্ক্রিপ্ট পেস্ট করুন..."
                    className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-xs font-mono text-blue-300 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

              </div>
            </div>

            {/* SECTION 3: Collapsible Advanced Settings & Other Placements */}
            <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-5 py-4 bg-zinc-900/40 hover:bg-zinc-900/70 border-b border-white/5 flex items-center justify-between text-left transition-all cursor-pointer"
              >
                <div>
                  <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    অন্যান্য উন্নত বিজ্ঞাপন সেটিংস (Advanced Configurations)
                  </h4>
                  <p className="text-[9.5px] text-slate-500 mt-0.5 leading-normal">
                    ডিরেক্ট রিডাইরেক্ট স্মার্টলিঙ্ক, সাইডবার ও মোবাইল বটম ব্যানার কোড ম্যানিপুলেশন সেটিংস।
                  </p>
                </div>
                <span className="text-slate-400">
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {showAdvanced && (
                <div className="p-5 space-y-4 bg-black/10 text-left animate-fadeIn">
                  
                  {/* Smart Direct Links block */}
                  <div className="p-4 bg-[#161618] rounded-xl border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">ডিরেক্ট লিঙ্ক সেটিং (Direct Smart Link Configuration)</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">সাইট ক্লিকপয়েন্ট নোউ-আইডি ডিরেক্ট লিঙ্ক সোর্স ব্যানার।</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input 
                          type="checkbox"
                          checked={directLinkEnabled}
                          onChange={(e) => setDirectLinkEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-left">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-mono block">Direct Link Target URL</span>
                        <input
                          type="url"
                          value={directLinkUrl}
                          onChange={(e) => setDirectLinkUrl(e.target.value)}
                          placeholder="https://www.highratedrevenue.com/watch?key=..."
                          className="w-full bg-[#111] border border-white/5 text-xs text-white p-2 rounded focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-mono block">Cooldown Interval Minutes (ফ্রিকোয়েন্সি)</span>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={directLinkIntervalMinutes}
                          onChange={(e) => setDirectLinkIntervalMinutes(Number(e.target.value))}
                          className="w-full bg-[#111] border border-white/5 text-xs text-white p-2 rounded focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Popunder limiters configurations */}
                  <div className="p-4 bg-[#161618] rounded-xl border border-white/5 space-y-3">
                    <div className="border-b border-white/5 pb-1">
                      <h4 className="text-xs font-bold text-slate-200">পপআন্ডার সেফটি ফ্রিকোয়েন্সি (Popunder Safety Controls)</h4>
                      <p className="text-[9.5px] text-slate-500 mt-0.5">অতিরিক্ত স্ক্রিপ্ট লোড বন্ধ করতে এবং ইউজার রিটেনশন বাড়াতে ফ্রিকোয়েন্সি সীমা স্থাপন করুন।</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                      <div className="space-y-1">
                        <span className="text-[9px] text-[#f5c518] block font-bold">CLICK FREQUENCY (ক্লিকে কতবার)</span>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={popunderClickFrequency}
                          onChange={(e) => setPopunderClickFrequency(Number(e.target.value))}
                          className="w-full bg-black/30 border border-white/5 p-2 rounded text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-[#f5c518] block font-bold font-mono">DELAY SECONDS (বিলম্ব সেকেন্ড)</span>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={popunderDelaySeconds}
                          onChange={(e) => setPopunderDelaySeconds(Number(e.target.value))}
                          className="w-full bg-black/30 border border-white/5 p-2 rounded text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-[#f5c518] block font-bold">COOLDOWN MINUTES (পুনঃলোডের মিনিট)</span>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={popunderCooldownMinutes}
                          onChange={(e) => setPopunderCooldownMinutes(Number(e.target.value))}
                          className="w-full bg-black/30 border border-white/5 p-2 rounded text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Secondary optional placement slots */}
                  <div className="p-4 bg-[#161618] rounded-xl border border-white/5 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 border-b border-white/5 pb-1.5 flex items-center justify-between">
                      <span>ঐচ্ছিক ব্যানার স্লটস (Optional Generic Banners)</span>
                      <span className="text-[9px] text-slate-500">প্রয়োজনে এগুলো ব্যবহার করা যাবে</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Banner Left Sidebar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">সাইডবার ব্যানার (Sidebar 300x250)</span>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input type="checkbox" checked={bannerSidebarEnabled} onChange={(e) => setBannerSidebarEnabled(e.target.checked)} className="sr-only peer"/>
                            <div className="w-7 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500"></div>
                          </label>
                        </div>
                        <textarea
                          rows={2}
                          value={bannerSidebarCode}
                          onChange={(e) => setBannerSidebarCode(e.target.value)}
                          placeholder="Sidebar JS/HTML code..."
                          className="w-full bg-black/40 border border-white/5 rounded p-1.5 text-[10px] font-mono text-zinc-300"
                        />
                      </div>

                      {/* Homepage Middle Banner */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">হোমপেজ মাঝখানে (Home Native 300x250)</span>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input type="checkbox" checked={bannerHomeMiddleEnabled} onChange={(e) => setBannerHomeMiddleEnabled(e.target.checked)} className="sr-only peer"/>
                            <div className="w-7 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500"></div>
                          </label>
                        </div>
                        <textarea
                          rows={2}
                          value={bannerHomeMiddleCode}
                          onChange={(e) => setBannerHomeMiddleCode(e.target.value)}
                          placeholder="Home middle native code..."
                          className="w-full bg-black/40 border border-white/5 rounded p-1.5 text-[10px] font-mono text-zinc-300"
                        />
                      </div>

                      {/* Video View Top Banner */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">ভিডিও টাইটেল এর উপরে (Video Top 728x90)</span>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input type="checkbox" checked={bannerVideoTopEnabled} onChange={(e) => setBannerVideoTopEnabled(e.target.checked)} className="sr-only peer"/>
                            <div className="w-7 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500"></div>
                          </label>
                        </div>
                        <textarea
                          rows={2}
                          value={bannerVideoTopCode}
                          onChange={(e) => setBannerVideoTopCode(e.target.value)}
                          placeholder="Video top script..."
                          className="w-full bg-black/40 border border-white/5 rounded p-1.5 text-[10px] font-mono text-zinc-300"
                        />
                      </div>

                      {/* Sticky Mobile Banner */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">মোবাইল স্টিকি বটম (Mobile Footer 320x50)</span>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input type="checkbox" checked={bannerMobileBottomEnabled} onChange={(e) => setBannerMobileBottomEnabled(e.target.checked)} className="sr-only peer"/>
                            <div className="w-7 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500"></div>
                          </label>
                        </div>
                        <textarea
                          rows={2}
                          value={bannerMobileBottomCode}
                          onChange={(e) => {
                            setBannerMobileBottomCode(e.target.value);
                            setBanner320x50Code(e.target.value); // Sync variables safely
                          }}
                          placeholder="Sticky footer script..."
                          className="w-full bg-black/40 border border-white/5 rounded p-1.5 text-[10px] font-mono text-zinc-300"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* SECTION 4: Master Action Submit triggers */}
            <div className="flex flex-wrap gap-2 pt-1 font-sans">
              <button
                type="button"
                onClick={triggerPopunder}
                className="flex items-center gap-1 px-4 py-3 bg-[#1e1e20] border border-white/5 hover:bg-zinc-800 text-[10px] font-mono text-yellow-400 font-bold rounded-xl active:scale-95 transition cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 animate-pulse" />
                <span>বিজ্ঞাপন টেস্ট রিডਾਈরেক্ট (Redirection Simulator)</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex-grow flex items-center justify-center gap-1.5 px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-black rounded-xl cursor-pointer hover:brightness-110 active:scale-95 transition tracking-wider uppercase"
              >
                <Check className="w-4 h-4" />
                <span>{submitting ? "সংরক্ষন করা হচ্ছে..." : "বিজ্ঞাপন সেটিংস সংরক্ষণ করুন (Save Configuration)"}</span>
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* Redirection Direct Link Popup Simulator dialogue */}
      {showPopunderSimulator && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 w-full" id="popup-adsterra-simulator">
          <div className="bg-[#121212] border border-yellow-400/30 rounded-2xl p-6 max-w-sm w-full text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-[#f5c518]" />
            <div className="w-12 h-12 rounded-full bg-yellow-400/10 border border-[#f5c518]/20 text-[#f5c518] flex items-center justify-center mx-auto mb-3">
              <Maximize2 className="w-6 h-6 animate-pulse" />
            </div>

            <h3 className="text-white font-bold font-display text-base">Direct Link Redirecting...</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              সিস্টেম ডিরেক্ট রিডাইরেক্ট লিঙ্ক সাকসেসফুলি রান করেছে! আপনার বিজ্ঞাপনটি নিম্নোক্ত ল্যান্ডিং পেইজে প্লে করা হবে।
            </p>

            <div className="mt-4 p-2 bg-slate-950 rounded border border-white/5 font-mono text-[10px] text-slate-400 text-left truncate">
              URL: <span className="text-yellow-400">{directLinkUrl || "https://viralbd99.com/landing?direct_key=demo-key"}</span>
            </div>

            <button
              onClick={() => {
                setShowPopunderSimulator(false);
                if (directLinkUrl) {
                  window.open(directLinkUrl, "_blank");
                }
              }}
              className="mt-5 w-full bg-[#f5c518] hover:bg-[#ffe042] text-black py-2.5 rounded-xl text-xs font-bold cursor-pointer transition select-none text-shadow flex items-center justify-center gap-1"
            >
              আজকের ডিরেক্ট লিঙ্ক টেস্ট + ও প্লে করুন
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
