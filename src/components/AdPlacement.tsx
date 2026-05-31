/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { getAdSettings } from "../services/db";

interface AdPlacementProps {
  code?: string;
  type: "728x90" | "300x250" | "320x50";
  dbField?: string;
}

export default function AdPlacement({ code, type, dbField }: AdPlacementProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [adCode, setAdCode] = useState<string>(code || "");

  // Sync state if prop changes
  useEffect(() => {
    if (code) {
      setAdCode(code);
    }
  }, [code]);

  // Automated instant fetch fallback function (Rule 1 & Rule 4 validation)
  const fetchDbFallback = async () => {
    try {
      const settings = await getAdSettings();
      if (settings) {
        let resolvedCode = "";
        if (dbField && settings[dbField as keyof typeof settings] !== undefined) {
          resolvedCode = String(settings[dbField as keyof typeof settings] || "");
        } else {
          // General type fallback
          if (type === "728x90") {
            resolvedCode = settings.bannerHomeTopCode || settings.banner728x90Code || settings.socialBarCode || "";
          } else if (type === "300x250") {
            resolvedCode = settings.bannerHomeMiddleCode || settings.banner300x250Code || "";
          } else {
            resolvedCode = settings.bannerSocialCode || settings.bannerMobileBottomCode || settings.banner320x50Code || "";
          }
        }
        if (resolvedCode) {
          setAdCode(resolvedCode);
        }
      }
    } catch (e) {
      console.warn("Active database validation fetch inside AdPlacement failed:", e);
    }
  };

  // If initial container or code is empty, re-fetch instantly from database (Rule 4 validation)
  useEffect(() => {
    if (!adCode || adCode.trim() === "") {
      fetchDbFallback();
    }
  }, [adCode]);

  // Dynamic Ad script injector and rendering structure
  const renderAd = () => {
    if (!containerRef.current || !adCode || adCode.trim() === "") return;

    // Clear previous elements
    containerRef.current.innerHTML = "";

    // 1. ACTIVE SCRIPT VALIDATION (Rule 4)
    // Extract and verify script tags are active in the primary document context (head or body)
    try {
      const parser = new DOMParser();
      const docHtml = parser.parseFromString(adCode, "text/html");
      const foundScripts = docHtml.querySelectorAll("script");
      
      foundScripts.forEach((script) => {
        const src = script.getAttribute("src");
        if (src) {
          // Target document head so script gets compiled and globally cached
          const selector = `script[src="${src}"]`;
          if (!document.querySelector(selector)) {
            const newScript = document.createElement("script");
            newScript.src = src;
            newScript.async = true;
            newScript.defer = true;
            // Retain extra key configurations
            Array.from(script.attributes).forEach(attr => {
              if (attr.name !== "src") {
                newScript.setAttribute(attr.name, attr.value);
              }
            });
            document.head.appendChild(newScript);
          }
        } else {
          // Inline script verification & active execution
          const inlineHash = script.innerText.trim().substring(0, 40).replace(/[^a-zA-Z0-9]/g, "");
          const scriptId = `viralbd99-ad-inline-${inlineHash}`;
          if (!document.getElementById(scriptId)) {
            const newScript = document.createElement("script");
            newScript.id = scriptId;
            newScript.text = script.innerText;
            document.body.appendChild(newScript);
          }
        }
      });
    } catch (parserErr) {
      console.warn("Script parsing preprocessing bypassed:", parserErr);
    }

    // 2. CREATE IMMUTABLE SANBDOX IFRAME WRAPPER (Rule 1 & Rule 2)
    const iframe = document.createElement("iframe");
    iframe.className = "sponsored-ad-slot-inner";
    iframe.style.width = "100%";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.style.display = "block";
    
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

    // Injected Adsterra HTML execution
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
              ${adCode}
            </body>
          </html>
        `);
        iframeDoc.close();
      }
    } catch (err) {
      console.warn("Iframe ad streaming blocked or sandboxed:", err);
    }
  };

  // 3. PERSISTENT MUTATION PROTECTOR: Anti-remove lock (Rule 3)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !adCode || adCode.trim() === "") return;

    // Perform initial render
    const hasIframe = container.querySelector("iframe");
    if (!hasIframe) {
      renderAd();
    }

    // Connect observer to override external removal actions
    const observer = new MutationObserver((mutations) => {
      let shouldRestore = false;
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          const currentIframe = container.querySelector("iframe");
          if (!currentIframe) {
            shouldRestore = true;
          }
        }
        if (mutation.type === "attributes") {
          // If style is changed to hide/display-none, forcefully restore flex display (Rule 1)
          const display = container.style.display;
          const visibility = container.style.visibility;
          if (display === "none" || visibility === "hidden") {
            container.style.setProperty("display", "flex", "important");
            container.style.setProperty("visibility", "visible", "important");
            container.style.setProperty("opacity", "1", "important");
          }
        }
      }

      if (shouldRestore) {
        renderAd();
      }
    });

    observer.observe(container, { childList: true, subtree: true, attributes: true });
    return () => observer.disconnect();
  }, [adCode, type]);

  // If there is no custom Adsterra code pasted, show a high-fidelity mock banner layout
  if (!adCode || adCode.trim() === "") {
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
          maxWidth: type === "728x90" ? "744px" : type === "300x250" ? "316px" : "336px",
          zIndex: 50,
          position: "relative"
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
      className="sponsored-ad-slot w-full flex justify-center items-center overflow-hidden mx-auto py-1.5"
      style={{
        maxWidth: type === "728x90" ? "728px" : type === "300x250" ? "300px" : "320px",
        height: type === "728x90" ? "90px" : type === "300x250" ? "250px" : "50px",
        zIndex: 50,
        position: "relative"
      }}
    />
  );
}
