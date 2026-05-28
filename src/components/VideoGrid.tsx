/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Play, Eye, Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { Video } from "../types";
import { convertToEmbed } from "./videoHelper";

interface VideoGridProps {
  title?: string;
  videos: Video[];
  onPlayVideo: (video: Video) => void;
  bookmarkedIds?: string[];
  onToggleBookmark?: (id: string, e: React.MouseEvent) => void;
  progressMap?: Record<string, number>; // videoId to decimal progress (e.g. 0.45)
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
      className={`bg-[#1a1a1a] rounded-lg overflow-hidden group border border-[#222222] cursor-pointer hover:border-[#f5c518] active:border-[#f5c518] transition-all duration-300 flex flex-col justify-between ${
        isHovered ? "shadow-lg shadow-[#f5c518]/5 scale-[1.01]" : ""
      }`}
    >
      {/* Thumbnail Container (16/9 ratio) */}
      <div className="relative aspect-[16/9] w-full bg-[#0f0f0f] overflow-hidden">
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
          <div className="w-10 h-10 rounded-full bg-[#f5c518] flex items-center justify-center text-black shadow-lg">
            <Play className="w-4 h-4 fill-black text-black ml-0.5" />
          </div>
        </div>

        {/* Category Badge on Top-Left */}
        <div className="absolute top-1.5 left-1.5 z-30">
          <span 
            className="text-[9px] font-black px-1.5 py-0.5 rounded shadow-md"
            style={{ backgroundColor: badge.bg, color: badge.text }}
          >
            {badge.label}
          </span>
        </div>

        {/* Duration Badge on Bottom-Right */}
        {vid.duration && (
          <div className="absolute bottom-1.5 right-1.5 z-30">
            <span className="bg-black/80 backdrop-blur-sm text-[8px] font-mono text-white px-1.5 py-0.5 rounded border border-[#222222]">
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
            className="absolute top-1.5 right-1.5 z-35 p-1 rounded-full bg-black/60 hover:bg-black/90 text-[#aaaaaa] hover:text-[#f5c518] border border-[#222222] transition-transform active:scale-95"
            title={isBookmarked ? "সংরক্ষণ থেকে সরান" : "সংরক্ষণ করুন"}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-[#f5c518] fill-[#f5c518]" />
            ) : (
              <Bookmark className="w-3.5 h-3.5 text-white" />
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
      <div className="p-2.5 flex flex-col justify-between flex-grow text-left">
        <h3 className={`text-white text-xs font-bold font-sans tracking-tight line-clamp-2 leading-snug transition-colors h-[2.5rem] ${
          isHovered ? "text-[#f5c518]" : ""
        }`}>
          {vid.title}
        </h3>
        
        <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-[#222]/40 text-[9px] font-mono text-[#aaaaaa]">
          <span className="flex items-center gap-1">
            <Eye className="w-2.5 h-2.5 text-[#aaaaaa]/60" />
            <span>{formatViews(vid.views || 0)} views</span>
          </span>
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
  progressMap = {}
}: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="w-full py-16 text-center text-[#aaaaaa] text-xs font-mono" id="empty-videos-notice">
        কোনো ভিডিও পাওয়া যায়নি। (No videos available)
      </div>
    );
  }

  // Bengali relative time calculation helper
  const getRelativeTimeBangla = (dateStr: string) => {
    const toBanglaNumberLocal = (n: number | string) => {
      const banglaNumbers = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
      return n.toString().replace(/\d/g, (match) => banglaNumbers[parseInt(match, 10)]);
    };

    const past = new Date(dateStr).getTime();
    const now = Date.now();
    const diff = now - past;
    const secs = Math.floor(diff / 1000);
    const mins = Math.floor(secs / 60);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (secs < 60) return "এইমাত্র";
    if (mins < 60) return `${toBanglaNumberLocal(mins)} মিনিট আগে`;
    if (hours < 24) return `${toBanglaNumberLocal(hours)} ঘণ্টা আগে`;
    if (days < 30) return `${toBanglaNumberLocal(days)} দিন আগে`;
    return new Date(dateStr).toLocaleDateString("bn-BD");
  };

  // Exact Badge Colors & Labels mapping as requested
  const getBadgeConfig = (categorySlug: string) => {
    const slug = (categorySlug || "exclusive").toLowerCase();
    switch (slug) {
      case "viral":
        return { label: "ভাইরাল", bg: "#e50914", text: "#ffffff" };
      case "premium":
        return { label: "প্রিমিয়াম", bg: "#f5c518", text: "#000000" };
      case "asian":
        return { label: "এশিয়ান", bg: "#7c5cfc", text: "#ffffff" };
      case "short-clips":
      case "short":
        return { label: "শর্ট", bg: "#00c897", text: "#ffffff" };
      case "exclusive":
        return { label: "এক্সক্লুসিভ", bg: "#ff6b00", text: "#ffffff" };
      case "bangladeshi":
        return { label: "বাংলাদেশি", bg: "#00c853", text: "#ffffff" };
      case "hd-videos":
      case "hd":
        return { label: "HD", bg: "#2196f3", text: "#ffffff" };
      case "latest":
      case "new":
        return { label: "নতুন", bg: "#00bcd4", text: "#ffffff" };
      case "gf-bf":
        return { label: "GF BF", bg: "#e84393", text: "#ffffff" };
      case "trending":
        return { label: "ট্রেন্ডিং", bg: "#ff5722", text: "#ffffff" };
      default:
        return { label: "প্রিমিয়াম", bg: "#f5c518", text: "#000000" };
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

      {/* Grid: 2 cols on mobile, 4 cols on desktop */}
      <div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 max-w-7xl mx-auto pb-4"
        id="viralbd99-video-grid"
      >
        {videos.map((vid) => {
          const isBookmarked = bookmarkedIds.includes(vid.id);
          const progress = progressMap[vid.id] || 0; // 0 to 1
          const badge = getBadgeConfig(vid.category);

          // Format created date display (fallbacks nicely)
          const dateStr = getRelativeTimeBangla(vid.createdAt || vid.scheduledAt || new Date().toISOString());

          return (
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
        })}
      </div>
    </div>
  );
}
