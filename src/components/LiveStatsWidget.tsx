/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { 
  subscribeNotifications
} from "../services/db";
import { NotificationItem } from "../types";

export default function LiveStatsWidget({ welcomeMessage = "🟢 Welcome to ViralBD99" }: { welcomeMessage?: string }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    // Subscribe to unified live-updating notifications collection
    const unsubscribeNotifications = subscribeNotifications((data) => {
      setNotifications(data);
    });

    return () => {
      if (typeof unsubscribeNotifications === "function") {
        unsubscribeNotifications();
      }
    };
  }, []);

  const activeNotifications = notifications.filter(n => n.active);
  const tickerText = activeNotifications.length > 0 
    ? activeNotifications.map(n => n.text).join("  •  ") 
    : welcomeMessage;

  return (
    <div className="w-full flex flex-col font-sans select-none">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee-scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee-text {
          display: inline-block;
          white-space: nowrap;
          animation: marquee-scroll 25s linear infinite;
        }
        .animate-marquee-text:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* Scrolling Live Announcements Ticker */}
      <div 
        id="live-announcements-ticker" 
        className="w-full bg-[#040406] border-b border-white/5 py-2 px-4 overflow-hidden relative flex items-center h-8"
      >
        <div className="w-full relative overflow-hidden">
          <div className="animate-marquee-text font-semibold text-[11px] md:text-xs text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)] tracking-wide">
            {tickerText}
          </div>
        </div>
      </div>
    </div>
  );
}
