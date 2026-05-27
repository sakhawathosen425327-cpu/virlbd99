/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Search, Flame, Clock, Sparkles, Award, Globe, Video, ShieldAlert, Tv, Film, Bookmark,
  Heart, Play, Zap, Key, Eye, Music, Smile, Gamepad, Ghost, Crown, Siren, Camera, Lock
} from "lucide-react";
import { Category } from "../types";

interface HeaderProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  firebaseOnline: boolean;
  bookmarksCount?: number;
  onViewBookmarks?: () => void;
}

// Map slug/iconName to lucide icons
const IconMap: { [key: string]: React.ComponentType<any> } = {
  Flame,
  Clock,
  Sparkles,
  Award,
  Globe,
  Video,
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

export default function Header({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  bookmarksCount = 0,
  onViewBookmarks
}: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header id="app-header" className="sticky top-0 z-40 w-full bg-[#111111] border-b border-[#222222] shadow-md">
      <div className="px-4 py-3.5 flex items-center justify-between max-w-7xl mx-auto gap-4">
        
        {/* Branding */}
        <div className="flex items-center gap-2 flex-shrink-0" id="branding-container">
          <span className="text-2xl font-black tracking-tighter uppercase italic text-[#f5c518]">
            VIRALBD99
          </span>
          <span className="bg-[#f5c518] text-black text-[9px] font-black px-1.5 py-0.5 rounded ml-1 animate-pulse select-none">
            18+
          </span>
        </div>

        {/* Real-time Search Box (Centered) */}
        <div className={`flex-1 max-w-md transition-all duration-300 ${showSearch ? 'block' : 'hidden sm:block'}`} id="search-box-wrapper">
          <div className="relative">
            <input
              type="text"
              placeholder="সার্চ করুন..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#222222] rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-[#aaaaaa] focus:outline-[#f5c518] focus:border-[#f5c518] transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaaaaa]" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaaaaa] hover:text-white text-xs py-0.5 px-1.5"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Search toggle & Bookmarks */}
        <div className="flex items-center gap-2 flex-shrink-0" id="header-right-tools">
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="sm:hidden p-2 rounded-full hover:bg-[#1a1a1a] text-[#aaaaaa] transition-colors"
            title="Toggle Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Bookmarks view button */}
          <button
            onClick={() => onViewBookmarks && onViewBookmarks()}
            className="p-2 rounded-lg bg-[#1a1a1a] border border-[#222222] text-[#aaaaaa] hover:text-[#f5c518] flex items-center gap-1.5 cursor-pointer relative transition duration-150 active:scale-95"
            title="সেভ করা ভিডিও"
          >
            <Bookmark className="w-4 h-4 text-[#f5c518] fill-[#f5c518]" />
            <span className="text-[11px] font-bold hidden xs:inline text-white">সেভড</span>
            {bookmarksCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-[#f5c518] border border-[#111111] text-black text-[9px] font-black rounded-full flex items-center justify-center px-1">
                {bookmarksCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Dynamic Categories Row */}
      <div className="w-full bg-[#0a0a0a] py-1.5 border-t border-[#222222]" id="header-categories-row">
        <div className="px-4 max-w-7xl mx-auto overflow-x-auto whitespace-nowrap flex gap-2 pb-1.5 select-none scrollbar-none scroll-row">
          <button
            onClick={() => onSelectCategory("all")}
            className={`px-3 py-1.5 font-bold text-[11px] rounded-full whitespace-nowrap transition cursor-pointer select-none flex items-center gap-1.5 border ${
              selectedCategory === "all"
                ? "bg-[#f5c518] text-black border-[#f5c518] font-black"
                : "bg-[#181818] text-[#aaaaaa] border-[#222222] hover:text-white"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>সব ভিডিও</span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            const SelectedIcon = (cat.iconName && IconMap[cat.iconName]) || Film;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`px-3 py-1.5 font-bold text-[11px] rounded-full whitespace-nowrap transition cursor-pointer select-none flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-[#f5c518] text-black border-[#f5c518] font-black"
                    : "bg-[#1a1a1a] text-[#aaaaaa] border-[#222222] hover:text-white"
                }`}
              >
                <SelectedIcon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
