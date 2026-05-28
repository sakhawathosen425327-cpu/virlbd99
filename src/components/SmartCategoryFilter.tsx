/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Clock, Flame, Zap } from "lucide-react";

interface SmartCategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
}

export default function SmartCategoryFilter({
  selectedCategory,
  onSelectCategory,
}: SmartCategoryFilterProps) {
  const filters = [
    {
      slug: "latest",
      label: "⏱️ লেটেস্ট (Latest)",
      desc: "সদ্য আপলোড করা ভিডিও",
      icon: Clock,
      color: "from-blue-500 to-indigo-600",
      glowColor: "rgba(59, 130, 246, 0.45)",
    },
    {
      slug: "trending",
      label: "🔥 ট্রেন্ডিং (Trending)",
      desc: "জনপ্রিয় ও সর্বোচ্চ ভিউড",
      icon: Flame,
      color: "from-orange-500 to-red-600",
      glowColor: "rgba(239, 68, 68, 0.45)",
    },
    {
      slug: "viral",
      label: "⚡ ভাইরাল (Viral)",
      desc: "চরম কাঁপানো ভাইরাল ক্লিপস",
      icon: Zap,
      color: "from-[#f5c518] to-amber-500",
      glowColor: "rgba(245, 197, 24, 0.45)",
    },
  ];

  return (
    <div className="w-full px-4 max-w-7xl mx-auto mb-2" id="smart-category-filter-widget">
      <div className="bg-[#141416]/90 border border-white/5 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl backdrop-blur-md">
        
        {/* Left Section: Info Badge */}
        <div className="flex items-center gap-3 w-full sm:w-auto text-left">
          <div className="w-2.5 h-8 bg-gradient-to-b from-[#f5c518] to-amber-500 rounded-full shrink-0" />
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-sans">
              স্মার্ট ফিল্টার (Smart Filter)
            </h4>
            <p className="text-[10px] text-[#aaaaaa] font-mono">
              ক্লিপ ক্যাটাগরি সুইচ করুন
            </p>
          </div>
        </div>

        {/* Right Section: Interactive Pills */}
        <div className="grid grid-cols-3 gap-2 w-full sm:w-auto sm:flex sm:items-center">
          {filters.map((filter) => {
            const isActive = selectedCategory === filter.slug;
            const Icon = filter.icon;

            return (
              <button
                key={filter.slug}
                onClick={() => onSelectCategory(filter.slug)}
                className={`group flex flex-col items-center justify-center sm:flex-row sm:gap-2 px-3 py-2 sm:py-2.5 rounded-xl text-center select-none cursor-pointer transition-all duration-300 border font-semibold ${
                  isActive
                    ? `bg-gradient-to-r ${filter.color} text-black border-transparent shadow-lg scale-102`
                    : "bg-[#1f1f23]/60 hover:bg-[#27272c] border-white/5 text-[#aaaaaa] hover:text-white hover:border-[#f5c518]/30 hover:scale-101"
                }`}
                style={{
                  boxShadow: isActive ? `0 0 16px ${filter.glowColor}` : "none",
                }}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-black' : 'text-[#f5c518]'}`} />
                <div className="text-left mt-1 sm:mt-0">
                  <span className={`text-[10px] sm:text-[11px] block leading-none font-black ${isActive ? 'text-black' : 'text-slate-100'}`}>
                    {filter.label}
                  </span>
                  <span className={`text-[8px] font-medium block mt-0.5 leading-none ${isActive ? 'text-black/80' : 'text-slate-400 font-mono'}`}>
                    {filter.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
