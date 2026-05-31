import React from "react";
import { Home, Search, Flame, Bookmark, User } from "lucide-react";
import { ViewTab } from "../types";

interface BottomNavProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onToggleSearch: () => void;
  onOpenProfile: () => void;
  bookmarksCount: number;
}

export default function BottomNav({
  currentTab,
  onTabChange,
  selectedCategory,
  onSelectCategory,
  onToggleSearch,
  onOpenProfile,
  bookmarksCount
}: BottomNavProps) {
  
  return (
    <nav 
      id="bottom-mobile-nav" 
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#111111] border-t border-[#222222] md:hidden block shadow-[0_-4px_12px_rgba(0,0,0,0.5)] pb-safe"
    >
      <div className="flex h-14 items-center justify-around px-2">
        {/* হোম (Home) */}
        <button
          onClick={() => {
            onSelectCategory("all");
            onTabChange(ViewTab.HOME);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex flex-col items-center justify-center w-14 h-full cursor-pointer group"
        >
          <Home 
            className={`w-5 h-5 transition-transform duration-150 ${
              currentTab === ViewTab.HOME && selectedCategory !== "trending"
                ? "text-[#f5c518] scale-110"
                : "text-[#aaaaaa] group-hover:text-white"
            }`} 
          />
          <span 
            className={`text-[10px] mt-1 font-bold ${
              currentTab === ViewTab.HOME && selectedCategory !== "trending"
                ? "text-[#f5c518]"
                : "text-[#aaaaaa]"
            }`}
          >
            Home
          </span>
        </button>

        {/* সার্চ (Search) */}
        <button
          onClick={() => {
            onTabChange(ViewTab.HOME);
            onToggleSearch();
          }}
          className="flex flex-col items-center justify-center w-14 h-full cursor-pointer group"
        >
          <Search className="w-5 h-5 text-[#aaaaaa] group-hover:text-white transition-transform active:scale-90" />
          <span className="text-[10px] mt-1 text-[#aaaaaa] font-bold">Search</span>
        </button>

        {/* ট্রেন্ডিং (Trending) */}
        <button
          onClick={() => {
            onSelectCategory("trending");
            onTabChange(ViewTab.HOME);
            window.scrollTo({ top: 400, behavior: "smooth" });
          }}
          className="flex flex-col items-center justify-center w-14 h-full cursor-pointer group"
        >
          <Flame 
            className={`w-5 h-5 transition-transform duration-150 ${
              currentTab === ViewTab.HOME && selectedCategory === "trending"
                ? "text-[#f5c518] scale-110"
                : "text-[#aaaaaa] group-hover:text-white"
            }`} 
          />
          <span 
            className={`text-[10px] mt-1 font-bold ${
              currentTab === ViewTab.HOME && selectedCategory === "trending"
                ? "text-[#f5c518]"
                : "text-[#aaaaaa]"
            }`}
          >
            Trending
          </span>
        </button>

        {/* সেভ (Saved) */}
        <button
          onClick={() => {
            onTabChange(ViewTab.BOOKMARKS);
          }}
          className="flex flex-col items-center justify-center w-14 h-full cursor-pointer group relative"
        >
          <Bookmark 
            className={`w-5 h-5 transition-transform duration-150 ${
              currentTab === ViewTab.BOOKMARKS
                ? "text-[#f5c518] scale-110"
                : "text-[#aaaaaa] group-hover:text-white"
            }`} 
          />
          <span 
            className={`text-[10px] mt-1 font-bold ${
              currentTab === ViewTab.BOOKMARKS
                ? "text-[#f5c518]"
                : "text-[#aaaaaa]"
            }`}
          >
            Saved
          </span>
          {bookmarksCount > 0 && (
            <span className="absolute top-1 right-2 min-w-[14px] h-3.5 bg-[#f5c518] text-black text-[8px] font-black rounded-full flex items-center justify-center px-0.5">
              {bookmarksCount}
            </span>
          )}
        </button>

        {/* প্রোফাইল (Profile) */}
        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center justify-center w-14 h-full cursor-pointer group"
        >
          <User className="w-5 h-5 text-[#aaaaaa] group-hover:text-white active:scale-90" />
          <span className="text-[10px] mt-1 text-[#aaaaaa] font-bold">Profile</span>
        </button>
      </div>
    </nav>
  );
}
