/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Play, Eye, Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { Video } from "../types";
import { convertToEmbed } from "./videoHelper";
import AdPlacement from "./AdPlacement";

interface VideoGridProps {
  title?: string;
  videos: Video[];
  onPlayVideo: (video: Video) => void;
  bookmarkedIds?: string[];
  onToggleBookmark?: (id: string, e: React.MouseEvent) => void;
  progressMap?: Record<string, number>; // videoId to decimal progress (e.g. 0.45)
  adSettings?: any;
}

const formatViews = (num: number) => {
  if (!num) return "0";
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
};

interface VideoCardProps {
  key?: string;
  vid: Video;
  onPlayVideo: (video: Video) => void;
  isBookmarked: boolean;
  onToggleBookmark?: (id: string, e: React.MouseEvent) => void;
  progress: number;
  badge: { label: string; bg: string; text: string };
  dateStr: string;
}

function VideoCard({
  vid,
  onPlayVideo,
  isBookmarked,
  onToggleBookmark,
  progress,
  badge,
  dateStr
}: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    // Only premium desktop players trigger hover previews to save mobile bandwidth
    if (window.innerWidth < 640) return;

    setIsHovered(true);
    // Slight delay of 150ms to ensure the user actually intended to hover
    hoverTimerRef.current = setTimeout(() => {
      setShouldPlay(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShouldPlay(false);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const embedInfo = convertToEmbed(vid.embedUrl);
  
  // Decide what to play
  let previewElement = null;
  if (shouldPlay) {
    if (embedInfo.type === "video") {
      previewElement = (
        <video
          src={embedInfo.src}
          muted
          loop
          playsInline
          autoPlay
          className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none transition-opacity duration-300"
        />
      );
    } else {
      // For external iframe URLs, render gorgeous ambient cinematic looping preview clips corresponding to the category
      const ambientPreviews: Record<string, string> = {
        viral: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4",
        premium: "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-32124-large.mp4",
        asian: "https://assets.mixkit.co/videos/preview/mixkit-purple-and-blue-neon-light-stripes-background-40019-large.mp4",
        exclusive: "https://assets.mixkit.co/videos/preview/mixkit-orange-and-red-paint-blending-in-water-43187-large.mp4",
        bangladeshi: "https://assets.mixkit.co/videos/preview/mixkit-green-abstract-background-of-blurred-lights-40058-large.mp4"
      };
      const fallbackUrl = ambientPreviews[vid.category?.toLowerCase()] || "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-32124-large.mp4";
      
      previewElement = (
        <video
          src={fallbackUrl}
          muted
          loop
          playsInline
          autoPlay
          className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none transition-opacity duration-300"
        />
      );
    }
  }

  return (
    <div
      id={`video-card-${vid.id}`}
      onClick={() => onPlayVideo(vid)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`bg-[#141414] rounded-xl overflow-hidden group border border-[#1e1e1e] cursor-pointer hover:border-[#f5c518] active:border-[#f5c518] transition-all duration-300 flex flex-col justify-between w-full hover:-translate-y-1 hover:shadow-xl hover:shadow-[#f5c518]/5 ${
        isHovered ? "scale-[1.02]" : ""
      }`}
    >
      {/* Thumbnail Container (16/9 ratio) */}
      <div className="relative aspect-[16/9] w-full min-h-[180px] sm:min-h-[200px] bg-[#0f0f0f] overflow-hidden">
        <img
          src={vid.thumbnailUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=85&w=400"}
          alt={vid.title}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isHovered ? "scale-105" : ""
          }`}
          loading="lazy"
        />

        {/* Dynamic preview overlay */}
        {previewElement}
        
        {/* Play Button Overlay */}
        <div className={`absolute inset-0 bg-black/40 ${isHovered && shouldPlay ? "opacity-0" : "opacity-0 group-hover:opacity-100"} transition-opacity flex items-center justify-center z-25`}>
          <div className="w-12 h-12 rounded-full bg-[#f5c518] flex items-center justify-center text-black shadow-lg shadow-[#f5c518]/25 transition-all duration-300 group-hover:scale-110">
            <Play className="w-5 h-5 fill-black text-black ml-0.5" />
          </div>
        </div>

        {/* Category Badge on Top-Left */}
        <div className="absolute top-2.5 left-2.5 z-30">
          <span 
            className="text-[10px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-wider"
            style={{ backgroundColor: badge.bg, color: badge.text }}
          >
            {badge.label}
          </span>
        </div>

        {/* Duration Badge on Bottom-Right */}
        {vid.duration && (
          <div className="absolute bottom-2.5 right-2.5 z-30">
            <span className="bg-black/85 backdrop-blur-md text-[10px] font-mono font-bold text-white px-2 py-0.5 rounded border border-[#222222]">
              {vid.duration}
            </span>
          </div>
        )}

        {/* Bookmark Icon in Top-Right */}
        {onToggleBookmark && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(vid.id, e);
            }}
            className="absolute top-2.5 right-2.5 z-35 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-[#aaaaaa] hover:text-[#f5c518] border border-[#222222] transition-transform active:scale-95"
            title={isBookmarked ? "Remove Bookmark" : "Save Video"}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 text-[#f5c518] fill-[#f5c518]" />
            ) : (
              <Bookmark className="w-4 h-4 text-white" />
            )}
          </button>
        )}

        {/* Continue Watching Linear Progress Bar */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30 overflow-hidden">
            <div 
              className="h-full bg-[#f5c518] transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Title & Information Details */}
      <div className="p-4 flex flex-col justify-between flex-grow text-left">
        <h3 className={`text-white text-sm md:text-base font-bold font-sans tracking-tight line-clamp-2 leading-snug transition-colors min-h-[2.5rem] md:min-h-[2.8rem] ${
          isHovered ? "text-[#f5c518]" : ""
        }`}>
          {vid.title}
        </h3>
        
        <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400 font-sans">
          <Eye className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{formatViews(vid.views || 0)} views</span>
          <span className="text-slate-600 font-bold select-none">•</span>
          <span>{dateStr}</span>
        </div>
      </div>
    </div>
  );
}

export default function VideoGrid({ 
  title, 
  videos, 
  onPlayVideo,
  bookmarkedIds = [],
  onToggleBookmark,
  progressMap = {},
  adSettings
}: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="w-full py-16 text-center text-[#aaaaaa] text-xs font-mono" id="empty-videos-notice">
        কোনো ভিডিও পাওয়া যায়নি
      </div>
    );
  }

  // English relative time calculation helper
  const getRelativeTimeEnglish = (dateStr: string) => {
    const past = new Date(dateStr).getTime();
    const now = Date.now();
    const diff = now - past;
    const secs = Math.floor(diff / 1000);
    const mins = Math.floor(secs / 60);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (secs < 60) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US");
  };

  // Exact Badge Colors & Labels mapping in English
  const getBadgeConfig = (categorySlug: string) => {
    const slug = (categorySlug || "exclusive").toLowerCase();
    switch (slug) {
      case "viral":
        return { label: "Viral", bg: "#e50914", text: "#ffffff" };
      case "premium":
        return { label: "Premium", bg: "#f5c518", text: "#000000" };
      case "asian":
        return { label: "Asian", bg: "#7c5cfc", text: "#ffffff" };
      case "short-clips":
      case "short":
        return { label: "Short", bg: "#00c897", text: "#ffffff" };
      case "exclusive":
        return { label: "Exclusive", bg: "#ff6b00", text: "#ffffff" };
      case "bangladeshi":
        return { label: "Bangladeshi", bg: "#00c853", text: "#ffffff" };
      case "hd-videos":
      case "hd":
        return { label: "HD", bg: "#2196f3", text: "#ffffff" };
      case "latest":
      case "new":
        return { label: "New", bg: "#00bcd4", text: "#ffffff" };
      case "gf-bf":
        return { label: "GF BF", bg: "#e84393", text: "#ffffff" };
      case "trending":
        return { label: "Trending", bg: "#ff5722", text: "#ffffff" };
      default:
        return { label: "Premium", bg: "#f5c518", text: "#000000" };
    }
  };

  return (
    <div className="w-full py-4 text-left" id="video-grid-container">
      {title && (
        <div className="px-4 mb-4 flex items-center gap-3 max-w-7xl mx-auto">
          <h2 className="text-base font-black text-white flex-shrink-0 font-sans border-l-4 border-[#f5c518] pl-2.5">
            {title}
          </h2>
          <div className="h-px flex-1 bg-[#222222]"></div>
          <span className="text-[10px] text-[#f5c518] font-bold tracking-wider font-mono uppercase select-none bg-[#111] border border-[#222] px-2 py-0.5 rounded">
            {videos.length} clips
          </span>
        </div>
      )}

      {/* Grid: 1 col on mobile, 2 cols on tablet, 3 cols on desktop */}
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 max-w-7xl mx-auto pb-4"
        id="viralbd99-video-grid"
      >
        {(() => {
          const elements: React.ReactNode[] = [];
          const insertIndex = videos.length > 4 ? 4 : Math.max(0, Math.floor(videos.length / 2));
          
          videos.forEach((vid, idx) => {
            const isBookmarked = bookmarkedIds.includes(vid.id);
            const progress = progressMap[vid.id] || 0;
            const badge = getBadgeConfig(vid.category);
            const dateStr = getRelativeTimeEnglish(vid.createdAt || vid.scheduledAt || new Date().toISOString());
 
            // Render the Grid Ad container if enabled (Rule 1, Immutable Z-Index Rule 2)
            if (adSettings?.isEnabled && adSettings.bannerHomeMiddleEnabled && idx === insertIndex) {
              const codeString = adSettings.bannerHomeMiddleCode || adSettings.banner300x250Code || "";
              elements.push(
                <div 
                  key="grid-sponsored-inner-ad"
                  className="sponsored-ad-slot col-span-1 sm:col-span-2 lg:col-span-3 bg-[#121214]/95 rounded-2xl p-3 border border-[#f5c518]/20 flex flex-col justify-center items-center min-h-[268px] relative text-center mx-auto w-full select-none"
                  style={{ zIndex: 50, position: "relative" }}
                  id="sponsored-ad-grid-spot"
                >
                  <span className="text-[8px] font-mono text-[#f5c518] font-black mb-2 tracking-widest uppercase text-center shrink-0">
                    SPONSORED LINK / ADVERTISEMENT
                  </span>
                  <div className="w-[300px] h-[250px] overflow-hidden flex items-center justify-center shrink-0">
                    <AdPlacement code={codeString} type="300x250" dbField="bannerHomeMiddleCode" />
                  </div>
                </div>
              );
            }

            elements.push(
              <VideoCard
                key={vid.id}
                vid={vid}
                onPlayVideo={onPlayVideo}
                isBookmarked={isBookmarked}
                onToggleBookmark={onToggleBookmark}
                progress={progress}
                badge={badge}
                dateStr={dateStr}
              />
            );
          });
          return elements;
        })()}
      </div>
    </div>
  );
}
