/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Play, Eye, Clock, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
import { Video } from "../types";

interface HeroSliderProps {
  trendingVideos: Video[];
  onPlayVideo: (video: Video) => void;
}

export default function HeroSlider({ trendingVideos, onPlayVideo }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Auto-rotate hero banners every 5 seconds for immersive movie look.
  // Including currentIndex in the dependency array auto-resets the interval when clicked/interacted.
  useEffect(() => {
    if (trendingVideos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trendingVideos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [trendingVideos, currentIndex]);

  if (trendingVideos.length === 0) {
    return null;
  }

  const currentVideo = trendingVideos[currentIndex];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % trendingVideos.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + trendingVideos.length) % trendingVideos.length);
  };

  // Swipe handlers for mobile touch swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swipe left -> next slide
      setCurrentIndex((prev) => (prev + 1) % trendingVideos.length);
    } else if (distance < -minSwipeDistance) {
      // Swipe right -> prev slide
      setCurrentIndex((prev) => (prev - 1 + trendingVideos.length) % trendingVideos.length);
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <section 
      id="hero-banner-section" 
      className="relative w-full h-[50vh] sm:h-[60vh] overflow-hidden bg-black border-b border-[#222222] group select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Graphic Content with Gorgeous Image Cross-Fade */}
      <div className="absolute inset-0 z-0">
        {trendingVideos.map((vid, idx) => (
          <img
            key={vid.id || idx}
            src={vid.thumbnailUrl}
            alt={vid.title}
            referrerPolicy="no-referrer"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? "opacity-60" : "opacity-0"
            }`}
          />
        ))}
        {/* Shadow Overlay Vibe (IMDb Gradient Vignette) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-transparent to-transparent z-10" />
      </div>

      {/* Manual Banner Controls with High Visibility & Dark Circle Backdrop */}
      {trendingVideos.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-25 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-[#f5c518] text-[#f5c518] hover:text-black transition-all duration-200 cursor-pointer border border-white/5 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.5)] scale-95 hover:scale-105 active:scale-90"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-25 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-[#f5c518] text-[#f5c518] hover:text-black transition-all duration-200 cursor-pointer border border-white/5 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.5)] scale-95 hover:scale-105 active:scale-90"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>
        </>
      )}

      {/* Video Curated Information Block */}
      <div className="absolute bottom-6 left-0 right-0 z-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col items-start gap-2.5 text-left">
        {/* Spotlight Badge */}
        <div className="flex gap-2" id="hero-featured-tag-container">
          <span className="bg-[#e50914] text-white text-[10px] tracking-wider font-extrabold px-2.5 py-1 rounded shadow-lg animate-pulse">
            🔥 TRENDING #1
          </span>
          <span className="bg-[#1a1a1a] border border-[#222222] text-[#aaaaaa] text-[10px] font-mono tracking-wider font-semibold px-2.5 py-1 rounded uppercase">
            {currentVideo.category.toUpperCase()}
          </span>
        </div>

        {/* Dynamic Title */}
        <h1 
          id="hero-title"
          className="text-2xl sm:text-4xl font-extrabold leading-tight text-white drop-shadow-md max-w-xl font-sans"
        >
          {currentVideo.title}
        </h1>

        {/* Visual Attributes Ribbon */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#aaaaaa] font-medium" id="hero-ribbon">
          <span className="font-bold text-[#f5c518]">HD</span>
          <span>•</span>
          <span className="font-bold text-red-500">18+</span>
          <span>•</span>
          <span>{currentVideo.duration || "4m 20s"}</span>
          <span>•</span>
          <span>{(currentVideo.views || 0).toLocaleString()} views</span>
        </div>

        {/* Short description */}
        <p className="text-[#aaaaaa] text-xs sm:text-sm max-w-md my-0.5 line-clamp-2 leading-relaxed pb-1">
          {currentVideo.description || "Enjoy exclusive high-definition video streams with zero-buffering premium playback technology on ViralBD99."}
        </p>

        {/* Action button */}
        <button
          id="hero-play-button"
          onClick={() => onPlayVideo(currentVideo)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#f5c518] hover:bg-[#ffe042] text-black font-extrabold text-xs rounded shadow-lg cursor-pointer transform duration-150 active:scale-95"
        >
          <Play className="w-4.5 h-4.5 fill-black text-black" />
          <span>▶ Play Now</span>
        </button>

        {/* Navigation Indicator Dots */}
        {trendingVideos.length > 1 && (
          <div className="flex gap-1.5 self-center sm:self-start mt-4" id="hero-slider-markers">
            {trendingVideos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? "w-6 bg-[#f5c518]" : "w-1.5 bg-[#222222] hover:bg-[#aaaaaa]"
                }`}
                title={`Jump to Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
