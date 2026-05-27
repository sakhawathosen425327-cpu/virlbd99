/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";

interface AdPlacementProps {
  code?: string;
  type: "728x90" | "300x250" | "320x50";
}

export default function AdPlacement({ code, type }: AdPlacementProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !code) return;

    // Clear previous elements
    containerRef.current.innerHTML = "";

    // Create a shadow iframe to safely parse and execute the raw Adsterra script
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    
    // Set size depending on type
    if (type === "728x90") {
      iframe.style.height = "90px";
      iframe.style.maxWidth = "728px";
    } else if (type === "300x250") {
      iframe.style.height = "250px";
      iframe.style.maxWidth = "300px";
    } else {
      iframe.style.height = "50px";
      iframe.style.maxWidth = "320px";
    }
    
    containerRef.current.appendChild(iframe);

    // Write the raw javascript and HTML code inside the iframe context
    try {
      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  background: transparent;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  overflow: hidden;
                }
              </style>
            </head>
            <body>
              ${code}
            </body>
          </html>
        `);
        iframeDoc.close();
      }
    } catch (err) {
      console.warn("Iframe ad streaming blocked or sandboxed:", err);
    }
  }, [code, type]);

  // If there is no custom Adsterra code pasted, show a high-fidelity mock banner layout
  if (!code || code.trim() === "") {
    const bgGradient = 
      type === "728x90" 
        ? "from-emerald-500/5 to-teal-500/5 hover:from-emerald-500/10 hover:to-teal-500/10" 
        : type === "300x250"
        ? "from-indigo-500/5 to-purple-500/5 hover:from-indigo-500/10 hover:to-purple-500/10"
        : "from-amber-500/5 to-red-500/5 hover:from-amber-500/10 hover:to-red-500/10";
    
    const textColor = 
      type === "728x90" ? "text-emerald-400" : type === "300x250" ? "text-indigo-400" : "text-amber-400";

    const borderColor = 
      type === "728x90" ? "border-emerald-500/20" : type === "300x250" ? "border-indigo-500/20" : "border-amber-500/20";

    const labelSize = 
      type === "728x90" 
        ? "728 x 90 Leaderboard Banner" 
        : type === "300x250" 
        ? "300 x 250 Content Banner" 
        : "320 x 50 Mobile Sticky Banner";

    return (
      <div 
        className={`w-full flex items-center justify-center p-2 rounded-2xl border ${borderColor} bg-gradient-to-r ${bgGradient} border-dashed duration-300 font-sans mx-auto flex-col select-none`}
        style={{
          height: type === "728x90" ? "106px" : type === "300x250" ? "266px" : "66px",
          maxWidth: type === "728x90" ? "744px" : type === "300x250" ? "316px" : "336px"
        }}
      >
        <span className={`text-[9px] font-mono tracking-widest ${textColor} font-black uppercase flex items-center gap-1`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
          ADSTERRA LIVE SPACE AVAILABLE
        </span>
        <span className="text-[10px] text-slate-300 font-bold mt-1">
          {labelSize}
        </span>
        <span className="text-[8px] text-slate-500 mt-0.5 text-center leading-normal">
          Paste Adsterra script inside Admin monetization panel to deploy live ad.
        </span>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full flex justify-center items-center overflow-hidden mx-auto py-1.5"
      style={{
        maxWidth: type === "728x90" ? "728px" : type === "300x250" ? "300px" : "320px",
        height: type === "728x90" ? "90px" : type === "300x250" ? "250px" : "50px"
      }}
    />
  );
}
