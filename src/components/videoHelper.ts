/**
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EmbedResult {
  type: "iframe" | "video";
  src: string;
}

/**
 * Smart auto-detect and convert system to support any video URL in ViralBD99.
 * Converts admin-submitted URLs into ready-to-render embed versions.
 */
export function convertToEmbed(url: string): EmbedResult {
  if (!url) {
    return { type: "iframe", src: "" };
  }

  const trimmed = url.trim();

  // GOOGLE DRIVE
  if (trimmed.includes("drive.google.com") || trimmed.includes("docs.google.com")) {
    const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    const id = match ? match[1] : matchId ? matchId[1] : null;
    if (id) {
      return {
        type: "iframe",
        src: `https://drive.google.com/file/d/${id}/preview`,
      };
    }
  }

  // STREAMTAPE
  if (trimmed.includes("streamtape")) {
    const match = trimmed.match(/streamtape[^\/]*\/(?:v|e)\/([a-zA-Z0-9]{15,})/i) || trimmed.match(/streamtape[^\/]*\/(?:v|e)\/([a-zA-Z0-9]+)/i);
    if (match) {
      const id = match[1].split(/[?#]/)[0].trim();
      return {
        type: "iframe",
        src: `https://streamtape.to/e/${id}`,
      };
    }
  }

  // YOUTUBE
  if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) {
    let id = "";
    if (trimmed.includes("watch?v=")) {
      id = trimmed.split("watch?v=")[1].split("&")[0];
    } else if (trimmed.includes("youtu.be/")) {
      id = trimmed.split("youtu.be/")[1].split("?")[0];
    } else if (trimmed.includes("/embed/")) {
      id = trimmed.split("/embed/")[1].split("?")[0];
    }
    if (id) {
      return {
        type: "iframe",
        src: `https://www.youtube.com/embed/${id}`,
      };
    }
  }

  // DOODSTREAM
  if (trimmed.includes("dood") || trimmed.includes("doodstream")) {
    const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      return {
        type: "iframe",
        src: `https://dood.watch/e/${match[1]}`,
      };
    }
  }

  // FILEMOON
  if (trimmed.includes("filemoon")) {
    // This will extract the exact 12-character ID 'LK0G10Yjz917' by splitting and filtering out 'en' or 'file'
    const parts = trimmed.split('/');
    const id = parts.find(p => p.length === 12 && /^[a-zA-Z0-9]+$/.test(p));
    if (id) {
      return {
        type: "iframe",
        src: `https://filemoon.sx/e/${id}`,
      };
    }
  }

  // ITERAPLAY
  if (trimmed.includes("iteraplay")) {
    const match = trimmed.match(/iteraplay[^\/]*\/(?:v|e)\/([a-zA-Z0-9_-]+)/i);
    if (match) {
      return {
        type: "iframe",
        src: `https://iteraplay.com/e/${match[1]}`,
      };
    }
  }

  // DIRECT MP4/VIDEO FILE
  if (trimmed.match(/\.(mp4|webm|ogg|mkv)(\?.*)?$/i)) {
    return {
      type: "video",
      src: trimmed,
    };
  }

  // DEFAULT - try as iframe
  return {
    type: "iframe",
    src: trimmed,
  };
}

/**
 * Returns a user-friendly detection string for UI indicators.
 */
export function getDetectionMessage(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  if (trimmed.includes("drive.google.com") || trimmed.includes("docs.google.com")) {
    return "✅ Google Drive link শনাক্ত হয়েছে";
  }
  if (trimmed.includes("streamtape")) {
    return "✅ Streamtape link শনাক্ত হয়েছে";
  }
  if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) {
    return "✅ YouTube link শনাক্ত হয়েছে";
  }
  if (trimmed.includes("dood") || trimmed.includes("doodstream")) {
    return "✅ Doodstream link শনাক্ত হয়েছে";
  }
  if (trimmed.includes("filemoon")) {
    return "✅ Filemoon link শনাক্ত হয়েছে";
  }
  if (trimmed.includes("iteraplay")) {
    return "✅ Iteraplay link শনাক্ত হয়েছে";
  }
  if (trimmed.match(/\.(mp4|webm|ogg|mkv)(\?.*)?$/i)) {
    return "✅ Direct video link শনাক্ত হয়েছে";
  }
  return "ℹ️ অন্য উৎস শনাক্ত হয়েছে (iframe হিসাবে প্লে হবে)";
}
