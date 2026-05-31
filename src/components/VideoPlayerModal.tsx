/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  X, Copy, Share2, Eye, Clock, Check, MessageCircle, Send, 
  Award, Film, Maximize, Flame, Monitor, Smartphone, RotateCcw,
  Play, Pause, FastForward, Rewind, Volume2, VolumeX, Maximize2, Minimize2, Tv, AlertTriangle,
  ThumbsUp, ThumbsDown, Bookmark, Heart, Trash2, MessageSquare, Flag, SkipBack, SkipForward,
  Star
} from "lucide-react";
import { Video, AdSettings, VideoComment, VideoCommentReply, VideoRatingStats } from "../types";
import AdPlacement from "./AdPlacement";
import { convertToEmbed } from "./videoHelper";
import { 
  incrementDailyAdStat, 
  getComments, 
  addComment, 
  updateComment, 
  deleteComment, 
  updateVideo,
  getVideoRatings,
  submitVideoRating
} from "../services/db";

interface VideoPlayerModalProps {
  video: Video;
  allVideos: Video[];
  onClose: () => void;
  onPlayVideo: (video: Video) => void;
  onTrackImpression?: () => void;
  adSettings: AdSettings;
  bookmarkedIds?: string[];
  onToggleBookmark?: (id: string, e: React.MouseEvent) => void;
  isAdmin?: boolean;
}

// Helper to parse "MM:SS" or "HH:MM:SS" into total seconds
const parseDurationToSeconds = (durationStr: string | undefined): number => {
  if (!durationStr) return 0;
  if (!isNaN(Number(durationStr))) return Number(durationStr);
  const parts = durationStr.split(":").map(Number);
  if (parts.some(isNaN)) return 0;
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
};

export default function VideoPlayerModal({
  video,
  allVideos,
  onClose,
  onPlayVideo,
  onTrackImpression,
  adSettings,
  bookmarkedIds = [],
  onToggleBookmark,
  isAdmin = false
}: VideoPlayerModalProps) {
  const [copied, setCopied] = useState(false);
  const [socialShared, setSocialShared] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<"auto/perfect" | "16/9" | "9/16">(() => {
    const isMobile = typeof window !== "undefined" && (window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent));
    return isMobile ? "9/16" : "auto/perfect";
  });
  
  const topRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ----------------------------------------------------
  // HTML5 CUSTOM VIDEO PLAYER STATES
  // ----------------------------------------------------
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // ----------------------------------------------------
  // WATERMARK POSITION STATE (🔄 ROTATES EVERY 30s)
  // ----------------------------------------------------
  const [watermarkPosOffset, setWatermarkPosOffset] = useState<number>(0);

  // ----------------------------------------------------
  // VIDEO PRE-ROLL STATE & COUNTDOWN
  // ----------------------------------------------------
  const [showPreRoll, setShowPreRoll] = useState(false);
  const [preRollCountdown, setPreRollCountdown] = useState(adSettings.preRollSkipDelay || 5);

  const toBanglaNumber = (num: number) => {
    return Number(num || 0).toLocaleString("en-US");
  };

  // ----------------------------------------------------
  // VIDEO ECOSYSTEM ADDITIONS: LIKES, HISTORY, AUTOPLAY, COMMENTS
  // ----------------------------------------------------
  const [likesCount, setLikesCount] = useState(video.likes || 0);
  const [dislikesCount, setDislikesCount] = useState(video.dislikes || 0);
  const [userReaction, setUserReaction] = useState<"like" | "dislike" | null>(null);

  const [autoplayEnabled, setAutoplayEnabled] = useState(() => {
    return localStorage.getItem("viralbd99_autoplay_enabled") !== "false";
  });
  const [autoplayCountdownActive, setAutoplayCountdownActive] = useState(false);
  const [autoplayTimeLeft, setAutoplayTimeLeft] = useState(5);

  const [comments, setComments] = useState<VideoComment[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showCommentSuccess, setShowCommentSuccess] = useState(false);

  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyName, setReplyName] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [commentLikeStatuses, setCommentLikeStatuses] = useState<Record<string, boolean>>({});

  // RATINGS STATES
  const [ratingSessionId] = useState<string>(() => {
    let id = localStorage.getItem("viralbd99_rating_session");
    if (!id) {
      id = "sess_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
      localStorage.setItem("viralbd99_rating_session", id);
    }
    return id;
  });
  const [ratingStats, setRatingStats] = useState<VideoRatingStats>({
    averageRating: 0,
    totalRatings: 0,
    userRating: null
  });
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Real-time live viewer counter logic
  const [liveViewers, setLiveViewers] = useState(() => {
    return Math.floor(Math.random() * (1150 - 650 + 1)) + 650;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveViewers((current) => {
        const isAddition = Math.random() > 0.5;
        const amount = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
        let nextValue = isAddition ? current + amount : current - amount;
        if (nextValue < 650) nextValue = 650 + (650 - nextValue);
        if (nextValue > 1150) nextValue = 1150 - (nextValue - 1150);
        return nextValue;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLiveViewers(Math.floor(Math.random() * (1150 - 650 + 1)) + 650);
  }, [video.id]);

  // Related videos algorithm prioritizing Same Category first, Same Tags second, Most Viewed third
  const getRelatedVideos = () => {
    return [...allVideos]
      .filter((v) => v.id !== video.id)
      .map((v) => {
        const isSameCategory = v.category === video.category ? 1 : 0;
        
        // Tag matching
        const currentTags = (video.tags || "").split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
        const vTags = (v.tags || "").split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
        const tagMatches = currentTags.filter(t => vTags.includes(t)).length;
        
        return { video: v, isSameCategory, tagMatches };
      })
      .sort((a, b) => {
        if (b.isSameCategory !== a.isSameCategory) {
          return b.isSameCategory - a.isSameCategory;
        }
        if (b.tagMatches !== a.tagMatches) {
          return b.tagMatches - a.tagMatches;
        }
        return (b.video.views || 0) - (a.video.views || 0);
      })
      .map(x => x.video)
      .slice(0, 8); // 8 Related Videos Limit as requested
  };

  const relatedVideos = getRelatedVideos();
  const nextVideo = relatedVideos[0];

  const currentIndex = allVideos.findIndex((v) => v.id === video.id);
  const prevVideo = currentIndex > 0 ? allVideos[currentIndex - 1] : null;
  const sequentialNextVideo = currentIndex >= 0 && currentIndex < allVideos.length - 1 ? allVideos[currentIndex + 1] : null;

  const handlePlayPrev = () => {
    if (prevVideo) {
      onPlayVideo(prevVideo);
    }
  };

  const handlePlayNext = () => {
    if (sequentialNextVideo) {
      onPlayVideo(sequentialNextVideo);
    } else if (nextVideo) {
      onPlayVideo(nextVideo);
    }
  };

  // Watch history persistence recorder (local limit 20)
  const saveToWatchHistory = (vidId: string) => {
    try {
      const historyJson = localStorage.getItem("viralbd99_history") || "[]";
      const history = JSON.parse(historyJson);
      const updated = [
        { id: vidId, watchedAt: Date.now() },
        ...history.filter((h: any) => h.id !== vidId)
      ].slice(0, 20);
      localStorage.setItem("viralbd99_history", JSON.stringify(updated));
    } catch (e) {
      console.warn("Watch history persistence skipped:", e);
    }
  };

  // Comments loader
  const loadComments = async () => {
    const fetched = await getComments(video.id);
    setComments(fetched);
  };

  // Ratings loader
  const loadRatings = async () => {
    try {
      const stats = await getVideoRatings(video.id, ratingSessionId);
      setRatingStats(stats);
    } catch (e) {
      console.error("loadRatings error:", e);
    }
  };

  const handleRatingClick = async (star: number) => {
    if (isSubmittingRating) return;
    setIsSubmittingRating(true);
    try {
      const stats = await submitVideoRating(video.id, ratingSessionId, star);
      setRatingStats(stats);
    } catch (error) {
      console.error("submitRating error:", error);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkPosOffset((prev) => (prev + 1) % 4);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sync like counters, watch history and load progress adjustments on video switch
  useEffect(() => {
    setLikesCount(video.likes || 0);
    setDislikesCount(video.dislikes || 0);

    const matchReactions = JSON.parse(localStorage.getItem("viralbd99_reactions") || "{}");
    setUserReaction(matchReactions[video.id] || null);

    loadComments();
    loadRatings();
    saveToWatchHistory(video.id);

    // Cancel dynamic countdown on active load
    setAutoplayCountdownActive(false);

    // Resume video progress if configured
    const savedProgress = localStorage.getItem(`video_progress_${video.id}`);
    if (savedProgress && !showPreRoll) {
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = parseFloat(savedProgress);
        }
      }, 500);
    }
  }, [video.id]);

  // Autoplay countdown effect runner
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoplayCountdownActive && autoplayTimeLeft > 0) {
      interval = setInterval(() => {
        setAutoplayTimeLeft((prev) => {
          if (prev <= 1) {
            setAutoplayCountdownActive(false);
            if (nextVideo) {
              onPlayVideo(nextVideo);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [autoplayCountdownActive, autoplayTimeLeft, nextVideo]);

  // Pre-roll timer routine
  useEffect(() => {
    if (adSettings.isEnabled && adSettings.preRollEnabled && showPreRoll) {
      incrementDailyAdStat("preRollShown").catch(err => console.error("Preroll click track failed:", err));

      const timer = setInterval(() => {
        setPreRollCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [adSettings, showPreRoll]);

  // Sync fullscreen state
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!(document as any).webkitFullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    document.addEventListener("mozfullscreenchange", onFullscreenChange);
    document.addEventListener("MSFullscreenChange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
      document.removeEventListener("mozfullscreenchange", onFullscreenChange);
      document.removeEventListener("MSFullscreenChange", onFullscreenChange);
    };
  }, []);

  // Auto-detect aspect ratio based on video keywords
  useEffect(() => {
    const isMobile = typeof window !== "undefined" && (window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent));
    if (isMobile) {
      setAspectRatio("9/16");
      return;
    }
    const title = (video.title || "").toLowerCase();
    const isVertical = 
      title.includes("tik") || 
      title.includes("tok") || 
      title.includes("reel") || 
      title.includes("short") || 
      title.includes("portrait") || 
      title.includes("মোবাইল") || 
      title.includes("গোপন") || 
      title.includes("মেয়ে") || 
      title.includes("viral");
    
    setAspectRatio(isVertical ? "9/16" : "16/9");
  }, [video]);

  // Core description formatter
  const getHotDescription = () => {
    const title = video.title || "Premium Video";
    const cat = video.category ? video.category.replace("-", " ").toUpperCase() : "HOT";
    return `🔥 Hot & Viral Release! Watch "${title}" exclusively streaming on ViralBD99. This trending release under ${cat} collection is loaded with direct optimized links for a flawless, lag-free premium experience. Check it out now!`;
  };

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
    if (onTrackImpression) {
      onTrackImpression();
    }
  }, [video, onTrackImpression]);

  const handleClose = () => {
    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      } catch (e) {}
    }
    onClose();
  };

  const toggleManualFullscreen = async () => {
    try {
      const el = playerContainerRef.current;
      if (el) {
        if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
          if (el.requestFullscreen) {
            await el.requestFullscreen();
          } else if ((el as any).webkitRequestFullscreen) {
            await (el as any).webkitRequestFullscreen();
          }

          if (window.screen && (window.screen as any).orientation && (window.screen as any).orientation.lock) {
            try {
              await (window.screen as any).orientation.lock("landscape").catch(() => {});
            } catch (orientationErr) {
              console.debug("Orientation locking omitted:", orientationErr);
            }
          }
        } else {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if ((document as any).webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen();
          }

          // Restore normal screen orientation
          if (window.screen && (window.screen as any).orientation && (window.screen as any).orientation.unlock) {
            try {
              (window.screen as any).orientation.unlock();
            } catch (unlockErr) {}
          }
        }
      }
    } catch (err) {
      console.error("Fullscreen toggle error:", err);
    }
  };

  const handleCopyLink = () => {
    // Generate unique param compatible with client search extract parameters
    const shareUrl = `${window.location.origin}/?v=${video.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error("Clipboard blocked:", err);
    });
  };

  const handleShare = (platform?: string) => {
    const shareUrl = `${window.location.origin}/?v=${video.id}`;
    const shareTitle = `শরম গরম ভিডিও: ${video.title} এখনই দেখুন ViralBD99-এ!`;

    if (!platform && navigator.share) {
      navigator.share({
        title: shareTitle,
        text: video.description || "ViralBD99 exclusive viral clip streaming stream.",
        url: shareUrl,
      }).catch(err => console.debug("Share discarded", err));
    } else {
      let url = "";
      switch (platform) {
        case "whatsapp":
          url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`;
          break;
        case "telegram":
          url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
          break;
        case "facebook":
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
          break;
        default:
          handleCopyLink();
          return;
      }
      window.open(url, "_blank", "referrerPolicy=no-referrer");
      setSocialShared(platform);
      setTimeout(() => setSocialShared(null), 3500);
    }
  };

  // Reactions toggling
  const handleToggleReaction = async (type: "like" | "dislike") => {
    const reactionHistory = JSON.parse(localStorage.getItem("viralbd99_reactions") || "{}");
    const currentReaction = reactionHistory[video.id] || null;

    let newReaction: "like" | "dislike" | null = null;
    let likesDelta = 0;
    let dislikesDelta = 0;

    if (currentReaction === type) {
      newReaction = null;
      if (type === "like") likesDelta = -1;
      else dislikesDelta = -1;
    } else {
      newReaction = type;
      if (type === "like") {
        likesDelta = 1;
        if (currentReaction === "dislike") dislikesDelta = -1;
      } else {
        dislikesDelta = 1;
        if (currentReaction === "like") likesDelta = -1;
      }
    }

    const nextLikes = Math.max(0, likesCount + likesDelta);
    const nextDislikes = Math.max(0, dislikesCount + dislikesDelta);

    setLikesCount(nextLikes);
    setDislikesCount(nextDislikes);
    setUserReaction(newReaction);

    if (newReaction) {
      reactionHistory[video.id] = newReaction;
    } else {
      delete reactionHistory[video.id];
    }
    localStorage.setItem("viralbd99_reactions", JSON.stringify(reactionHistory));

    try {
      await updateVideo(video.id, { likes: nextLikes, dislikes: nextDislikes });
    } catch (e) {
      console.warn("Reactions database sync bypassed:", e);
    }
  };

  // Submit main video comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) {
      setCommentError("দয়া করে নাম এবং মন্তব্য লিখুন।");
      return;
    }
    setCommentError("");
    setIsSubmittingComment(true);
    try {
      const commentId = `comment_${Date.now()}`;
      const newComment: VideoComment = {
        id: commentId,
        videoId: video.id,
        name: commentName.trim(),
        comment: commentText.trim(),
        timestamp: new Date().toISOString(),
        likes: 0,
        replies: [],
        isApproved: true, // displayed instantly matching prompt expectations
        reported: false
      };
      await addComment(newComment);
      setCommentText("");
      setShowCommentSuccess(true);
      setTimeout(() => setShowCommentSuccess(false), 6000);
      loadComments();
    } catch (err) {
      console.error("Comment submit error:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Reply submit logic
  const handleReplySubmit = async (e: React.FormEvent, parentComm: VideoComment) => {
    e.preventDefault();
    if (!replyName.trim() || !replyText.trim()) return;
    setIsSubmittingReply(true);
    try {
      const newReply: VideoCommentReply = {
        id: `reply_${Date.now()}`,
        name: replyName.trim(),
        comment: replyText.trim(),
        timestamp: new Date().toISOString()
      };
      const currentReplies = parentComm.replies || [];
      const updatedReplies = [...currentReplies, newReply];
      await updateComment(parentComm.id, { replies: updatedReplies }, video.id);
      setReplyText("");
      setReplyingToCommentId(null);
      loadComments();
    } catch (err) {
      console.error("Reply submit error:", err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Like comment
  const handleLikeComment = async (comm: VideoComment) => {
    if (commentLikeStatuses[comm.id]) return;
    try {
      const updatedLikes = (comm.likes || 0) + 1;
      await updateComment(comm.id, { likes: updatedLikes }, video.id);
      setCommentLikeStatuses(prev => ({ ...prev, [comm.id]: true }));
      setComments(prev => prev.map(c => c.id === comm.id ? { ...c, likes: updatedLikes } : c));
    } catch (e){}
  };

  // Report comment
  const handleReportComment = async (commId: string) => {
    try {
      await updateComment(commId, { reported: true }, video.id);
      alert("মন্তব্যটি রিপোর্টেড করা হয়েছে। অ্যাডমিন এটি খুব শীঘ্রই রিভিউ করবেন।");
    } catch (e) {}
  };

  // Bengali relative time calculation helper
  const getRelativeTimeBangla = (dateStr: string) => {
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

  // Run our smart auto-detect and convert system
  const embedResult = convertToEmbed(video.embedUrl);
  const processedUrl = embedResult.src;
  const isDirectMp4 = embedResult.type === "video";

  // Live Iframe Timestamp Listener and Emulator Fallback
  useEffect(() => {
    if (isDirectMp4) return;

    // A. Parse and set total seconds from native duration metadata
    const totalSecs = parseDurationToSeconds(video.duration);
    if (totalSecs > 0) {
      setDuration(totalSecs);
    } else {
      setDuration(0);
    }

    // B. Reset to saved progress if available, otherwise start from 0
    const savedProgress = localStorage.getItem(`video_progress_${video.id}`);
    if (savedProgress && !showPreRoll) {
      const savedSecs = parseFloat(savedProgress);
      if (savedSecs > 0 && (totalSecs === 0 || savedSecs < totalSecs)) {
        setCurrentTime(savedSecs);
      } else {
        setCurrentTime(0);
      }
    } else {
      setCurrentTime(0);
    }

    // C. Register iframe event/postMessage window listener
    const handleIframeMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data) {
          // Detect fields sent by HTML5 embeds or custom postMessage loops
          const cur = data.currentTime ?? data.time ?? data.seconds ?? data.position ?? data.current_time;
          const dur = data.duration ?? data.totalTime ?? data.length ?? data.total_time;

          if (typeof cur === "number" && cur >= 0) {
            setCurrentTime(cur);
            // Handle save progress matching native video saving limits inside modal
            if (cur > 5 && dur > 0) {
              const ratio = cur / dur;
              if (ratio >= 0.90) {
                localStorage.removeItem(`video_progress_${video.id}`);
                localStorage.removeItem(`video_progress_percent_${video.id}`);
                try {
                  const cwList = JSON.parse(localStorage.getItem("viralbd99_continue_watching") || "[]");
                  const updated = cwList.filter((id: string) => id !== video.id);
                  localStorage.setItem("viralbd99_continue_watching", JSON.stringify(updated));
                } catch (_) {}
              } else {
                localStorage.setItem(`video_progress_${video.id}`, cur.toString());
                localStorage.setItem(`video_progress_percent_${video.id}`, ratio.toString());
                try {
                  const cwList = JSON.parse(localStorage.getItem("viralbd99_continue_watching") || "[]");
                  const updated = [video.id, ...cwList.filter((id: string) => id !== video.id)].slice(0, 5);
                  localStorage.setItem("viralbd99_continue_watching", JSON.stringify(updated));
                } catch (_) {}
              }
            }
          }
          if (typeof dur === "number" && dur > 0) {
            setDuration(dur);
          }
        }
      } catch (_) {}
    };

    window.addEventListener("message", handleIframeMessage);

    // D. Failsafe simulated fallback loop for iframe playback tracking
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && !showPreRoll) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const nextVal = prev + 1;
          const limit = totalSecs > 0 ? totalSecs : 1800; // default to 30 mins if duration is undefined
          if (nextVal >= limit) {
            if (interval) clearInterval(interval);
            setIsPlaying(false);
            localStorage.removeItem(`video_progress_${video.id}`);
            localStorage.removeItem(`video_progress_percent_${video.id}`);
            try {
              const cwList = JSON.parse(localStorage.getItem("viralbd99_continue_watching") || "[]");
              const updated = cwList.filter((id: string) => id !== video.id);
              localStorage.setItem("viralbd99_continue_watching", JSON.stringify(updated));
            } catch (_) {}
            
            if (autoplayEnabled && nextVideo) {
              setAutoplayTimeLeft(5);
              setAutoplayCountdownActive(true);
            }
            return limit;
          }

          // Persist progress to local storage periodically matches HTML5 save interval
          if (nextVal > 5) {
            const ratio = limit > 0 ? nextVal / limit : 0;
            localStorage.setItem(`video_progress_${video.id}`, nextVal.toString());
            localStorage.setItem(`video_progress_percent_${video.id}`, ratio.toString());
            try {
              const cwList = JSON.parse(localStorage.getItem("viralbd99_continue_watching") || "[]");
              const updated = [video.id, ...cwList.filter((id: string) => id !== video.id)].slice(0, 5);
              localStorage.setItem("viralbd99_continue_watching", JSON.stringify(updated));
            } catch (_) {}
          }
          return nextVal;
        });
      }, 1000);
    }

    return () => {
      window.removeEventListener("message", handleIframeMessage);
      if (interval) clearInterval(interval);
    };
  }, [video, isDirectMp4, isPlaying, showPreRoll, autoplayEnabled, nextVideo]);

  // ----------------------------------------------------
  // HTML5 VIDEO PLAYER CUSTOM ROUTINES & TRIGGERS
  // ----------------------------------------------------
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const togglePlay = () => {
    if (showPreRoll) return; // Prevent playing background video during pre-roll ad
    const v = videoRef.current;
    if (v) {
      if (v.paused) {
        v.play().catch(() => {});
        setIsPlaying(true);
      } else {
        v.pause();
        setIsPlaying(false);
      }
      resetControlsTimeout();
    }
  };

  const handleProgressBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (v) {
      const targetTime = parseFloat(e.target.value);
      v.currentTime = targetTime;
      setCurrentTime(targetTime);
      resetControlsTimeout();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (v) {
      const val = parseFloat(e.target.value);
      v.volume = val;
      setVolume(val);
      if (val === 0) {
        v.muted = true;
        setIsMuted(true);
      } else {
        v.muted = false;
        setIsMuted(false);
      }
      resetControlsTimeout();
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (v) {
      const nextMute = !isMuted;
      v.muted = nextMute;
      setIsMuted(nextMute);
      if (!nextMute && volume === 0) {
        v.volume = 0.5;
        setVolume(0.5);
      }
      resetControlsTimeout();
    }
  };

  const seek = (amount: number) => {
    const v = videoRef.current;
    if (v) {
      let t = v.currentTime + amount;
      if (t < 0) t = 0;
      if (t > v.duration) t = v.duration;
      v.currentTime = t;
      setCurrentTime(t);
      resetControlsTimeout();
    }
  };

  const changeSpeed = (rate: number) => {
    const v = videoRef.current;
    if (v) {
      v.playbackRate = rate;
      setPlaybackRate(rate);
      resetControlsTimeout();
    }
  };

  const togglePiP = async () => {
    const v = videoRef.current;
    if (v && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await v.requestPictureInPicture();
        }
      } catch (err) {
        console.warn("PiP error:", err);
      }
    }
  };

  // Keyboard Shortcuts Binding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (!isDirectMp4 || showPreRoll) return;

      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "arrowleft":
          e.preventDefault();
          seek(-10);
          break;
        case "arrowright":
          e.preventDefault();
          seek(10);
          break;
        case "arrowup":
          e.preventDefault();
          const up = Math.min(1, volume + 0.1);
          if (videoRef.current) {
            videoRef.current.volume = up;
            setVolume(up);
            videoRef.current.muted = false;
            setIsMuted(false);
          }
          resetControlsTimeout();
          break;
        case "arrowdown":
          e.preventDefault();
          const down = Math.max(0, volume - 0.1);
          if (videoRef.current) {
            videoRef.current.volume = down;
            setVolume(down);
            if (down === 0) {
              videoRef.current.muted = true;
              setIsMuted(true);
            }
          }
          resetControlsTimeout();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          toggleManualFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, volume, isMuted, isDirectMp4, showPreRoll]);

  // Touch Swipe gestures trackers for mobile
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
    resetControlsTimeout();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    resetControlsTimeout();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current && e.changedTouches.length === 1 && !showPreRoll) {
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
      
      // Horizontal swipe
      if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 35) {
        if (deltaX > 0) {
          seek(10); // Swipe Right -> Forward 10s
        } else {
          seek(-10); // Swipe Left -> Rewind 10s
        }
      }
    }
    touchStartRef.current = null;
  };

  const handleVideoTap = (e: React.MouseEvent) => {
    if (e.detail === 2) {
      toggleManualFullscreen();
      return;
    }
    // Single Tap
    if (isDirectMp4) {
      togglePlay();
    } else {
      setShowControls(prev => !prev);
    }
    resetControlsTimeout();
  };

  // Convert seconds to human display clock format
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Watermark styling helper
  const watermarkClassMap = {
    "top-right": "top-14 right-4",
    "bottom-left": "bottom-20 left-4",
    "top-left": "top-14 left-4",
    "bottom-right": "bottom-20 right-4"
  };

  return (
    <div 
      id="video-player-modal" 
      className="fixed inset-0 z-50 overflow-y-auto bg-[#050505] flex flex-col font-sans"
    >
      <div ref={topRef} />
      
      {/* Dynamic responsive & fullscreen styling overrides */}
      <style>{`
        .video-player-wrapper {
          background: #000 !important;
          position: relative !important;
          overflow: hidden !important;
          border-radius: 8px !important;
          pointer-events: auto !important;
          z-index: 10 !important;
        }

        /* 1. FORCE Z-INDEX: Unblock player control bar and control-related wrappers completely */
        #youtube-style-control-bar,
        .vjs-control-bar,
        .youtube-style-control-bar,
        .player-controls,
        [id*="control-bar"],
        [class*="control-bar"],
        [id*="player-controls"],
        [class*="player-controls"] {
          z-index: 999999 !important;
          pointer-events: auto !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        /* For absolutely-positioned elements within player controls */
        div.vjs-control-bar.absolute,
        div.player-controls.absolute,
        div.youtube-style-control-bar.absolute {
          position: absolute !important;
          z-index: 999999 !important;
          pointer-events: auto !important;
        }

        /* 2. DISABLE AD OVERLAYS: Forcefully set pointer-events none on overlays, allowing clicks to bypass them */
        .video-player-wrapper * {
          pointer-events: none !important;
        }

        /* EXCEPT the actual video viewport elements, controller HUD controls, next-video counters/buttons, and player items which MUST remain interactive */
        .video-player-wrapper video,
        .video-player-wrapper iframe,
        .video-player-wrapper .video-iframe,
        .video-player-wrapper #drive-iframe-player,
        .video-player-wrapper #native-html5-player,
        .video-player-wrapper button,
        .video-player-wrapper input,
        .video-player-wrapper select,
        .video-player-wrapper a,
        .video-player-wrapper svg,
        .video-player-wrapper .pointer-events-auto,
        .video-player-wrapper [class*="pointer-events-auto"],
        .video-player-wrapper .player-controls,
        .video-player-wrapper .vjs-control-bar,
        .video-player-wrapper .youtube-style-control-bar,
        .video-player-wrapper [class*="controllers-hud"],
        .video-player-wrapper .player-wrap,
        .video-player-wrapper .player-wrap *,
        .video-player-wrapper .animate-fade-in,
        .video-player-wrapper .max-w-sm,
        .video-player-wrapper .max-w-sm * {
          pointer-events: auto !important;
        }

        /* 3. AD ISOLATION: Force and isolate all ad components into the "SPONSORED LINKS" container with z-index: 1 */
        #responsive-ad-banners-wrapper,
        #banner-desktop-container,
        #banner-mobile-container,
        [id*="banner-container"],
        [class*="ad-placement"],
        [class*="sponsor"],
        .ad-placement,
        .adplacement {
          z-index: 1 !important;
          position: relative !important;
          pointer-events: auto !important;
        }

        /* 4. CLEANUP: Force hide and isolate absolute iframe and div overlay intruders */
        .video-player-wrapper > div:not(.player-wrap):not(.group):not([class*="controllers"]):not([class*="spinner"]):not([class*="Error"]):not([class*="countdown"]):not([class*="masking"]):not(.animate-fade-in):not(#viraldb99-watermark),
        .video-player-wrapper iframe:not(#drive-iframe-player):not(#native-html5-player) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          width: 0px !important;
          height: 0px !important;
          z-index: -99999 !important;
          position: absolute !important;
          top: -9999px !important;
          left: -9999px !important;
        }

        .video-player-wrapper.aspect-auto-perfect {
          width: 100% !important;
          aspect-ratio: 16/9 !important;
        }

        .video-player-wrapper.aspect-16-9 {
          width: 100% !important;
          aspect-ratio: 16/9 !important;
        }

        .video-player-wrapper.aspect-9-16 {
          width: 100% !important;
          max-width: 420px !important;
          margin: 0 auto !important;
          aspect-ratio: 9/16 !important;
          border-radius: 16px !important;
        }

        @media (max-width: 768px) {
          .video-player-wrapper.aspect-9-16 {
            width: 100% !important;
            max-width: min(340px, calc(60vh * 9 / 16)) !important;
            aspect-ratio: 9/16 !important;
            margin: 0 auto !important;
            border-radius: 12px !important;
            transition: all 0.3s ease-in-out;
          }
        }

        @media (max-width: 640px) {
          .video-player-wrapper.aspect-auto-perfect {
            width: calc(100% + 2rem) !important;
            margin-left: -1rem !important;
            margin-right: -1rem !important;
            aspect-ratio: 16/9 !important;
            border-radius: 0px !important;
          }
        }

        .video-player-wrapper:fullscreen {
          width: 100vw !important;
          height: 100vh !important;
          max-width: none !important;
          max-height: none !important;
          border-radius: 0px !important;
          aspect-ratio: auto !important;
        }

        /* Fullscreen adjustments for iframes in fullscreen */
        .video-player-wrapper:fullscreen iframe, 
        .video-player-wrapper:fullscreen video {
          width: 100% !important;
          height: 100% !important;
        }

        .video-player-wrapper iframe, 
        .video-player-wrapper video {
          width: 100% !important;
          height: 100% !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border: none !important;
          pointer-events: auto !important;
          z-index: 1 !important;
        }
      `}</style>

      {/* Modern Player Header - Yellow Branding */}
      <div className="px-4 py-3 sticky top-0 bg-[#050505] border-b border-white/5 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-[#f5c518] text-black py-0.5 px-2 rounded font-mono font-black tracking-wider uppercase">
            ViralBD99 Secure Player
          </span>
          <span className="text-slate-300 text-xs font-semibold line-clamp-1 max-w-[180px] sm:max-w-xl font-sans">
            {video.title}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-sans">
          <button
            onClick={handleClose}
            id="close-player-button"
            className="p-1.5 rounded-lg bg-[#141416] hover:bg-zinc-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Exit Player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main split view container */}
      <div className="w-full flex-grow flex flex-col lg:flex-row max-w-7xl mx-auto pb-12">
        
        {/* Playback Stage Column */}
        <div className={`flex flex-col p-4 transition-all duration-300 ${isFullscreen ? "w-full" : "w-full lg:w-8/12"}`}>

          <div 
            ref={playerContainerRef} 
            onMouseMove={resetControlsTimeout}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`relative bg-black select-none pointer-events-auto overflow-hidden shadow-2xl flex items-center justify-center transition-all duration-300 video-player-wrapper ${
              isFullscreen 
                ? "fixed inset-0 w-screen h-screen z-[9999] rounded-none border-none bg-black" 
                : aspectRatio === "auto/perfect"
                  ? "aspect-auto-perfect"
                  : aspectRatio === "9/16" 
                    ? "aspect-9-16" 
                    : "aspect-16-9"
            }`}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* ----------------------------------------------------
                🟢 REAL-TIME LIVE VIEWER COUNTER BADGE
                ---------------------------------------------------- */}
            <div 
              style={{
                top: "16px",
                right: "16px",
                pointerEvents: "none",
              }}
              className="absolute z-50 select-none px-2.5 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-lg text-white font-sans text-[11px] font-black tracking-wide flex items-center gap-1.5 transition-all duration-300"
              id="live-viewer-player-badge"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>🟢 {toBanglaNumber(liveViewers)} watching now</span>
            </div>

            {/* ----------------------------------------------------
                VIRALBD99 TEXT WATERMARK (🔄 SHIFTING WITHIN TOP-RIGHT DRUM)
                ---------------------------------------------------- */}
            <div 
              style={{
                top: watermarkPosOffset === 0 ? "68px" : watermarkPosOffset === 1 ? "75px" : watermarkPosOffset === 2 ? "68px" : "80px",
                right: watermarkPosOffset === 0 ? "16px" : watermarkPosOffset === 1 ? "28px" : watermarkPosOffset === 2 ? "40px" : "16px",
                opacity: 0.7,
                pointerEvents: "none",
              }}
              className="absolute transition-all duration-500 text-white font-bold font-mono text-[10px] sm:text-xs z-50 select-none tracking-wider px-2 py-0.5 bg-black/50 rounded border border-white/5 shadow-md"
              id="viraldb99-watermark"
            >
              ViralBD99
            </div>



            {/* ----------------------------------------------------
                MEDIA PLAYER CORE RENDERERS
                ---------------------------------------------------- */}
            {isDirectMp4 ? (
              <div className="relative w-full h-full flex items-center justify-center group">
                <video
                  ref={videoRef}
                  src={processedUrl}
                  playsInline
                  autoPlay
                  controlsList="nodownload"
                  onClick={handleVideoTap}
                  className="w-full h-full object-contain"
                  id="native-html5-player"
                  onWaiting={() => setIsBuffering(true)}
                  onPlaying={() => {
                    setIsBuffering(false);
                    setIsPlaying(true);
                  }}
                  onCanPlay={() => setIsBuffering(false)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={() => {
                    if (videoRef.current) {
                      const curr = videoRef.current.currentTime;
                      const dur = videoRef.current.duration;
                      setCurrentTime(curr);

                      if (dur > 0) {
                        const ratio = curr / dur;
                        if (ratio >= 0.90) {
                          localStorage.removeItem(`video_progress_${video.id}`);
                          localStorage.removeItem(`video_progress_percent_${video.id}`);
                          try {
                            const cwList = JSON.parse(localStorage.getItem("viralbd99_continue_watching") || "[]");
                            const updated = cwList.filter((id: string) => id !== video.id);
                            localStorage.setItem("viralbd99_continue_watching", JSON.stringify(updated));
                          } catch (e) {}
                        } else if (curr > 5) {
                          localStorage.setItem(`video_progress_${video.id}`, curr.toString());
                          localStorage.setItem(`video_progress_percent_${video.id}`, ratio.toString());
                          try {
                            const cwList = JSON.parse(localStorage.getItem("viralbd99_continue_watching") || "[]");
                            const updated = [video.id, ...cwList.filter((id: string) => id !== video.id)].slice(0, 5);
                            localStorage.setItem("viralbd99_continue_watching", JSON.stringify(updated));
                          } catch (e) {}
                        }
                      }
                    }
                  }}
                  onEnded={() => {
                    setIsPlaying(false);
                    if (autoplayEnabled && nextVideo) {
                      setAutoplayTimeLeft(5);
                      setAutoplayCountdownActive(true);
                    }
                  }}
                  onDurationChange={() => {
                    if (videoRef.current) {
                      setDuration(videoRef.current.duration);
                    }
                  }}
                  onError={() => {
                    setIsBuffering(false);
                    setHasError(true);
                  }}
                />

                {/* Center Big Play/Pause Button Overlay on Hover/Tap */}
                <div 
                  onClick={togglePlay}
                  className={`absolute inset-0 flex items-center justify-center bg-black/15 z-30 cursor-pointer transition-opacity duration-300 ${
                    showControls ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <button className="p-4 rounded-full bg-black/60 border border-white/10 text-[#f5c518] hover:bg-[#f5c518] hover:text-black hover:scale-110 active:scale-95 transition-all duration-200 shadow-2xl">
                    {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-0.5" />}
                  </button>
                </div>

                {/* Loading buffering spinner */}
                {isBuffering && (
                  <div className="absolute inset-0 flex items-center justify-center p-3 bg-black/60 z-30 pointer-events-none">
                    <div className="w-10 h-10 rounded-full border-4 border-[#f5c518] border-t-transparent animate-spin" />
                  </div>
                )}

                {/* Error Box display */}
                {hasError && (
                  <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-4 text-center z-45">
                    <AlertTriangle className="w-12 h-12 text-[#f33e3e] mb-2" />
                    <h3 className="text-white text-sm font-bold">ভিডিও রেকর্ড প্লে করতে ব্যর্থ হয়েছে!</h3>
                    <p className="text-slate-500 text-xs mt-1 max-w-sm">
                      দুঃখিত, এই মিডিয়া ডাটা প্লে করার সময় ত্রুটি ঘটেছে। পুনরায় চেষ্টা করার জন্য রিলোড দিন।
                    </p>
                    <button
                      onClick={() => {
                        setHasError(false);
                        if (videoRef.current) {
                          videoRef.current.load();
                          videoRef.current.play().catch(() => {});
                        }
                      }}
                      className="mt-4 px-4 py-2 bg-[#f5c518] hover:bg-yellow-400 text-black text-xs font-bold rounded-lg transition"
                    >
                      রিলোড প্লেয়ার (Try Reload)
                    </button>
                  </div>
                )}

                {/* HTML5 CONTROLLERS HUD */}
                <div 
                  className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 flex flex-col gap-2.5 z-40 transition-opacity duration-300 pointer-events-auto player-controls vjs-control-bar youtube-style-control-bar ${
                    showControls ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* PROGRESS BAR BAR (YELLOW #f5c518 TRACK FILL) */}
                  <div className="flex items-center gap-2 group/progress relative">
                    <span className="text-[10px] font-mono text-zinc-400 select-none">
                      {formatTime(currentTime)}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleProgressBarChange}
                      className="flex-grow h-1 rounded-lg appearance-none cursor-pointer bg-white/20 hover:h-1.5 duration-100 accent-[#f5c518]"
                      style={{
                        background: `linear-gradient(to right, #f5c518 0%, #f5c518 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) 100%)`
                      }}
                    />
                    <span className="text-[10px] font-mono text-zinc-400 select-none">
                      {formatTime(duration)}
                    </span>
                  </div>

                  {/* CONTROLS HUD MAIN RAIL */}
                  <div className="flex items-center justify-between gap-4">
                    
                    {/* LEFT HUD ACTIONS */}
                    <div className="flex items-center gap-4">
                      {/* Play pauses */}
                      <button 
                        onClick={togglePlay}
                        className="text-white hover:text-[#f5c518] transition-colors focus:outline-none"
                        title={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? <Pause className="w-5 h-5 fill-white hover:fill-[#f5c518]" /> : <Play className="w-5 h-5 fill-white hover:fill-[#f5c518]" />}
                      </button>

                      {/* Rewinds */}
                      <button 
                        onClick={() => seek(-10)}
                        className="text-white hover:text-[#f5c518] transition"
                        title="Rewind 10s"
                      >
                        <Rewind className="w-4.5 h-4.5" />
                      </button>

                      {/* Forwards */}
                      <button 
                        onClick={() => seek(10)}
                        className="text-white hover:text-[#f5c518] transition"
                        title="Forward 10s"
                      >
                        <FastForward className="w-4.5 h-4.5" />
                      </button>

                      {/* Volume items & Slider */}
                      <div className="flex items-center gap-1.5 group/volume">
                        <button onClick={toggleMute} className="text-white hover:text-[#f5c518]">
                          {isMuted || volume === 0 ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-14 sm:w-18 h-1 bg-white/30 rounded appearance-none cursor-pointer accent-[#f5c518]"
                        />
                      </div>
                    </div>

                    {/* RIGHT HUD ACTIONS */}
                    <div className="flex items-center gap-4 relative">
                      
                      {/* Live Speed Toggle */}
                      <button 
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="text-white hover:text-[#f5c518] text-xs font-mono font-bold leading-none bg-zinc-800 px-2 py-1 rounded"
                        title="Playback speed"
                      >
                        {playbackRate}x
                      </button>

                      {showSpeedMenu && (
                        <div className="absolute bottom-9 right-18 bg-black/95 border border-white/10 rounded-lg p-1.5 flex flex-col gap-0.5 z-50 text-[10px] font-mono text-white max-h-[140px] overflow-y-auto">
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                            <button
                              key={rate}
                              onClick={() => {
                                changeSpeed(rate);
                                setShowSpeedMenu(false);
                              }}
                              className={`px-3 py-1 rounded hover:bg-yellow-400 hover:text-black font-semibold text-left ${
                                playbackRate === rate ? "bg-[#f5c518] text-black" : ""
                              }`}
                            >
                              {rate}x
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Picture in Picture */}
                      {document.pictureInPictureEnabled && (
                        <button onClick={togglePiP} className="text-white hover:text-[#f5c518]" title="Picture in Picture">
                          <Tv className="w-4.5 h-4.5" />
                        </button>
                      )}

                      {/* Fullscreen Button */}
                      <button onClick={toggleManualFullscreen} className="text-[#f5c518] hover:text-[#ffe249] transition duration-150">
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ) : (
              /* Google Drive, YouTube, Streamtape Iframe Embed wrapper with shielding absolute cards */
              <div className="relative w-full h-full player-wrap bg-black overflow-hidden" style={{ position: "relative", width: "100%", height: "100%" }}>
                <iframe
                  src={processedUrl}
                  title={video.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; fullscreen"
                  id="drive-iframe-player"
                  referrerPolicy="no-referrer"
                  className="video-iframe"
                />
                
                {/* 
                  Stealth Shields for Google Drive only: covers Google Drive's top and bottom bars to hide downloadable link. 
                */}
                {(video.embedUrl.includes("drive.google.com") || video.embedUrl.includes("docs.google.com") || processedUrl.includes("drive.google.com")) && (
                  <>
                    {/* Top Stealth Cloak Masking Overlay */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-[40px] bg-black select-none pointer-events-auto"
                      style={{ zIndex: 50 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    />
                    {/* Bottom Stealth Cloak Masking Overlay */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-[40px] bg-black select-none pointer-events-auto"
                      style={{ zIndex: 50 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    />
                  </>
                )}
              </div>
            )}

            {/* Autoplay Countdown Overlay Card */}
            {autoplayCountdownActive && nextVideo && (
              <div className="absolute inset-0 bg-black/95 z-40 flex flex-col items-center justify-center p-4 text-center animate-fade-in font-sans">
                <div className="max-w-sm w-full bg-zinc-900 border border-white/10 p-5 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
                  <span className="text-yellow-400 font-bold text-[10px] uppercase tracking-wider animate-pulse">UP NEXT</span>
                  
                  {/* Thumbnail frame */}
                  <div className="w-40 aspect-video rounded-lg overflow-hidden border border-white/10 relative shadow-md">
                    <img 
                      src={nextVideo.thumbnailUrl || "/placeholder.jpg"} 
                      alt={nextVideo.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white animate-pulse" />
                    </div>
                  </div>

                  <div className="text-center">
                    <h4 className="text-xs font-bold text-slate-300 line-clamp-1 mb-1">{nextVideo.title}</h4>
                    <p className="text-zinc-500 text-[10px] font-mono">⏱️ {nextVideo.duration || "0:00"}</p>
                  </div>

                  <div className="text-[#f5c518] text-xs font-extrabold bg-[#f5c518]/10 px-4 py-1.5 rounded-full border border-[#f5c518]/20 animate-pulse">
                    Next video starting in {toBanglaNumber(autoplayTimeLeft)}s
                  </div>

                  <button 
                    onClick={() => setAutoplayCountdownActive(false)}
                    className="mt-1 px-4 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 text-[11px] font-bold transition duration-150 active:scale-95 border border-red-500/20"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Clean, slim horizontal YouTube-Style control bar directly fixed underneath the video screen */}
          <div 
            className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 font-sans text-xs select-none shadow-xl mt-2.5" 
            id="youtube-style-control-bar"
          >
            {/* LEFT ACTIONS ROW */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* Play/Pause Button */}
              <button 
                onClick={isDirectMp4 ? togglePlay : () => {
                  const nextVal = !isPlaying;
                  setIsPlaying(nextVal);
                  try {
                    const iframe = document.getElementById("drive-iframe-player") as HTMLIFrameElement;
                    if (iframe && iframe.contentWindow) {
                      iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: nextVal ? "playVideo" : "pauseVideo" }), "*");
                    }
                  } catch (e) {}
                }}
                className="p-1.5 text-zinc-400 hover:text-[#f5c518] rounded transition active:scale-95 cursor-pointer flex items-center justify-center bg-black/35 border border-white/5 shadow-md"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-[#f5c518] fill-[#f5c518]" /> : <Play className="w-3.5 h-3.5 text-white fill-white" />}
              </button>

              {/* Previous Episode Button */}
              <button
                onClick={handlePlayPrev}
                disabled={!prevVideo}
                className={`p-1.5 rounded transition active:scale-95 flex items-center justify-center bg-black/35 border border-white/5 shadow-md ${
                  prevVideo 
                    ? "text-zinc-400 hover:text-[#f5c518] cursor-pointer" 
                    : "text-zinc-600 opacity-40 cursor-not-allowed"
                }`}
                title="Previous Video"
              >
                <SkipBack className="w-3.5 h-3.5 fill-current" />
              </button>

              {/* Next Episode Button */}
              <button
                onClick={handlePlayNext}
                disabled={!sequentialNextVideo && !nextVideo}
                className={`p-1.5 rounded transition active:scale-95 flex items-center justify-center bg-black/35 border border-white/5 shadow-md ${
                  (sequentialNextVideo || nextVideo) 
                    ? "text-zinc-400 hover:text-[#f5c518] cursor-pointer" 
                    : "text-zinc-600 opacity-40 cursor-not-allowed"
                }`}
                title="Next Video"
              >
                <SkipForward className="w-3.5 h-3.5 fill-current" />
              </button>

              {/* Volume Toggle Button */}
              <button 
                onClick={toggleMute}
                className="p-1.5 text-zinc-400 hover:text-[#f5c518] rounded transition active:scale-95 cursor-pointer flex items-center justify-center bg-black/35 border border-white/5 shadow-md"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
              </button>

              {/* Live Current Time / Duration Monospace display */}
              <div className="text-[10px] sm:text-xs font-mono text-zinc-300 select-none bg-black/45 px-2.5 py-1.5 rounded border border-white/5 font-semibold">
                {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : (video.duration || "0:00")}
              </div>

              {/* Reload Stream Button */}
              <button 
                onClick={() => {
                  try {
                    const iframe = document.getElementById("drive-iframe-player") as HTMLIFrameElement;
                    if (iframe) {
                      iframe.src = processedUrl;
                    }
                    if (videoRef.current) {
                      videoRef.current.load();
                      videoRef.current.play().catch(() => {});
                    }
                  } catch (e) {}
                }}
                className="p-1.5 text-zinc-400 hover:text-[#f5c518] rounded transition active:rotate-180 duration-500 cursor-pointer flex items-center justify-center bg-black/35 border border-white/5 shadow-md"
                title="Reload and Refresh Stream"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* MIDDLE (Hidden on small screens for spacing) */}
            <div className="hidden md:flex items-center text-[10px] text-zinc-500 font-mono tracking-wider font-semibold uppercase">
              <span>🎦 VIP Streaming</span>
            </div>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-3">
              {/* Autoplay toggling preference switch */}
              <div className="flex items-center gap-1.5 bg-black/35 px-2.5 py-1.5 border border-white/5 rounded-lg select-none shadow-md">
                <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-wider hidden xs:inline">AUTOPLAY</span>
                <button
                  onClick={() => {
                    const nextVal = !autoplayEnabled;
                    setAutoplayEnabled(nextVal);
                    localStorage.setItem("viralbd99_autoplay_enabled", nextVal ? "true" : "false");
                  }}
                  className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 flex items-center relative cursor-pointer outline-none ${
                    autoplayEnabled ? "bg-emerald-500" : "bg-zinc-700"
                  }`}
                  title="Toggle Autoplay"
                >
                  <div 
                    className={`w-3.5 h-3.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                      autoplayEnabled ? "translate-x-3.5" : "translate-x-0"
                    }`} 
                  />
                </button>
              </div>

              {/* Dynamic Aspect Ratio Switcher */}
              <button
                onClick={() => {
                  setAspectRatio((prev) => {
                    if (prev === "auto/perfect") return "16/9";
                    if (prev === "16/9") return "9/16";
                    return "auto/perfect";
                  });
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-black/35 hover:bg-black/55 border border-white/5 hover:border-white/10 rounded-lg text-zinc-400 hover:text-[#f5c518] transition text-[10px] font-black cursor-pointer font-mono select-none shadow-md"
                title="Toggle Aspect Ratio"
              >
                {aspectRatio === "auto/perfect" ? (
                  <>
                    <Monitor className="w-3 h-3 text-[#f5c518]" />
                    <span>Auto Fit</span>
                  </>
                ) : aspectRatio === "16/9" ? (
                  <>
                    <Monitor className="w-3 h-3 text-white" />
                    <span>16:9</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3 h-3 text-white" />
                    <span>9:16</span>
                  </>
                )}
              </button>

              {/* Fullscreen icon */}
              <button 
                onClick={toggleManualFullscreen}
                className="p-1.5 text-zinc-400 hover:text-[#f5c518] rounded transition active:scale-95 cursor-pointer flex items-center justify-center bg-black/35 border border-white/5 shadow-md"
                title="Toggle Fullscreen"
              >
                <Maximize className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 text-left animate-fade-in">
            <div>
              <span className="text-[9px] bg-[#f5c518]/10 text-[#f5c518] px-2 py-0.5 rounded font-mono font-black uppercase tracking-wider">
                {(video.category || "Exclusive").toUpperCase()}
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-white leading-tight mt-1 px-0.5">
                {video.title}
              </h1>
            </div>



            <div className="flex flex-wrap items-center gap-3 justify-between py-1.5 border-b border-t border-white/5 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>{(video.views || 0).toLocaleString()} views</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{getRelativeTimeBangla(video.createdAt || video.scheduledAt || new Date().toISOString())}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>🟢 {toBanglaNumber(liveViewers)} watching now</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>{video.duration || "Exclusive Length"}</span>
                </span>
                {video.rating && (
                  <>
                    <span>•</span>
                    <span className="px-1.5 text-[9px] bg-[#f5c518]/15 text-[#f5c518] rounded font-black border border-[#f5c518]/20">
                      {video.rating}
                    </span>
                  </>
                )}
              </div>

              {/* Interaction Likes/Dislikes & Save Bookmark System */}
              <div className="flex flex-wrap items-center gap-2.5 my-1 md:my-0">
                {/* LIKE Button */}
                <button
                  onClick={() => handleToggleReaction("like")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition text-xs font-bold cursor-pointer select-none active:scale-95 ${
                    userReaction === "like"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-[#141416] hover:bg-zinc-800 text-slate-300 border-white/5"
                  }`}
                  title="Like"
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${userReaction === "like" ? "fill-emerald-450" : ""}`} />
                  <span>{toBanglaNumber(likesCount)}</span>
                </button>

                {/* DISLIKE Button */}
                <button
                  onClick={() => handleToggleReaction("dislike")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition text-xs font-bold cursor-pointer select-none active:scale-95 ${
                    userReaction === "dislike"
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "bg-[#141416] hover:bg-zinc-800 text-slate-300 border-white/5"
                  }`}
                  title="Dislike"
                >
                  <ThumbsDown className={`w-3.5 h-3.5 ${userReaction === "dislike" ? "fill-red-450" : ""}`} />
                  {isAdmin && (
                    <span className="text-[9px] bg-red-500/10 text-red-500 px-1 rounded">
                      {toBanglaNumber(dislikesCount)} (Admin View)
                    </span>
                  )}
                </button>

                {/* BOOKMARK/SAVE Button */}
                {onToggleBookmark && (
                  <button
                    onClick={(e) => onToggleBookmark(video.id, e)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition text-xs font-bold cursor-pointer select-none active:scale-95 ${
                      bookmarkedIds.includes(video.id)
                        ? "bg-yellow-400/20 text-yellow-500 border-yellow-400/30 font-extrabold"
                        : "bg-[#141416] hover:bg-zinc-800 text-slate-300 border-white/5"
                    }`}
                    title="Bookmark"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${bookmarkedIds.includes(video.id) ? "fill-yellow-500" : ""}`} />
                    <span>{bookmarkedIds.includes(video.id) ? "Saved" : "Save Video"}</span>
                  </button>
                )}
              </div>

              {/* Share and Embed tools */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-xs select-none hover:bg-[#ffe042] hover:text-black transition cursor-pointer"
                >
                  {copied ? "✓ Copied" : "Copy Link"}
                </button>

                <div className="flex items-center bg-zinc-900 border border-white/5 p-0.5 rounded-lg">
                  <button 
                    onClick={() => handleShare("whatsapp")}
                    className="p-1.5 text-slate-400 hover:text-green-500 transition cursor-pointer"
                    title="WA Share"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleShare("telegram")}
                    className="p-1.5 text-slate-400 hover:text-sky-400 transition cursor-pointer"
                    title="Tele Share"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Star Rating Section */}
            <div className="bg-[#121214] border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-mono text-slate-400 font-bold tracking-wider uppercase">User Rating</span>
                  <div className="flex items-center gap-2.5 mt-1">
                    <div className="text-3xl font-black text-white font-mono tracking-tight">
                      {ratingStats.averageRating}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFull = star <= Math.round(ratingStats.averageRating);
                          return (
                            <Star 
                              key={`avg-star-${star}`} 
                              className={`w-3.5 h-3.5 ${
                                isFull ? "text-[#f5c518] fill-[#f5c518]" : "text-zinc-600 fill-zinc-800"
                              }`} 
                            />
                          );
                        })}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        {toBanglaNumber(ratingStats.totalRatings)} ratings
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-end gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {ratingStats.userRating ? "Your Rating" : "Rate this video"}
                </span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isSelected = star <= (hoverRating !== null ? hoverRating : (ratingStats.userRating || 0));
                    return (
                      <button
                        key={`rate-star-${star}`}
                        type="button"
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        disabled={isSubmittingRating}
                        className="group relative focus:outline-none cursor-pointer p-0.5"
                      >
                        <Star 
                          className={`w-5.5 h-5.5 transition-all duration-200 transform group-hover:scale-125 ${
                            isSelected 
                              ? "text-[#f5c518] fill-[#f5c518] filter drop-shadow-[0_0_8px_rgba(245,197,24,0.5)]" 
                              : "text-zinc-600 hover:text-zinc-400"
                          } ${isSubmittingRating ? "opacity-50" : ""}`}
                        />
                      </button>
                    );
                  })}
                </div>
                {ratingStats.userRating && (
                  <span className="text-[9px] text-emerald-400 font-medium font-mono">
                    Thanks for voting! (Rated {ratingStats.userRating}/5)
                  </span>
                )}
              </div>
            </div>

             {/* Responsive Sponsored Ad placements */}
            {adSettings.isEnabled && (
              <div className="w-full flex flex-col gap-4 mt-3 mb-3 transition-all" id="responsive-ad-banners-wrapper">
                {/* Desktop Users banner: hidden md:block */}
                <div className="hidden md:block w-full">
                  <div className="w-full flex flex-col items-center justify-center bg-zinc-900 rounded-xl p-3 border border-white/5 overflow-hidden shadow-sm animate-fade-in" id="banner-desktop-container">
                    <span className="text-[9px] font-mono text-yellow-500 font-extrabold mb-2.5 tracking-widest uppercase">SPONSORED LINKS</span>
                    <div className="w-[728px] h-[90px] bg-white rounded-lg border border-zinc-200 shadow-inner flex items-center justify-center overflow-hidden">
                      <AdPlacement code={adSettings.preRollCode || adSettings.bannerVideoTopCode || adSettings.banner728x90Code || ""} type="728x90" />
                    </div>
                  </div>
                </div>

                {/* Mobile Users banner: block md:hidden */}
                <div className="block md:hidden w-full">
                  <div className="w-full flex flex-col items-center justify-center bg-zinc-900 rounded-xl p-2.5 border border-white/5 overflow-hidden shadow-sm animate-fade-in" id="banner-mobile-container">
                    <span className="text-[9px] font-mono text-yellow-400 font-extrabold mb-2.5 tracking-widest uppercase">SPONSORED LINKS</span>
                    <div className="bg-white rounded-lg border border-zinc-200 shadow-inner flex flex-col items-center justify-center max-w-full overflow-hidden shrink-0">
                      {adSettings.preRollCode || adSettings.bannerMobileBottomCode || adSettings.banner320x50Code ? (
                        <div className="w-[320px] h-[50px] overflow-hidden flex items-center justify-center">
                          <AdPlacement code={adSettings.preRollCode || adSettings.bannerMobileBottomCode || adSettings.banner320x50Code || ""} type="320x50" />
                        </div>
                      ) : (
                        <div className="w-[300px] h-[250px] overflow-hidden flex items-center justify-center">
                          <AdPlacement code={adSettings.banner300x250Code || ""} type="300x250" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Synopsis overview */}
            <div className="bg-[#121214] border border-white/5 p-4 rounded-xl space-y-3">
              <div className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                {video.description && !video.description.includes("Streaming source live from secure Google")
                  ? video.description
                  : getHotDescription()}
              </div>
            </div>

            {/* Related Videos */}
            <div className="mt-6 flex flex-col gap-4 text-left" id="related-videos-section">
              <h3 className="text-sm font-bold tracking-wider text-[#f5c518] uppercase flex items-center gap-2 border-b border-white/5 pb-2.5">
                <span>Related Videos</span>
                <span className="text-[10px] bg-yellow-400/10 text-[#f5c518] px-2 py-0.5 rounded font-mono font-bold">
                  {toBanglaNumber(relatedVideos.length)}
                </span>
              </h3>

              {relatedVideos.length === 0 ? (
                <div className="text-zinc-500 font-mono text-[11px] py-12 text-center bg-[#111] rounded-xl border border-dashed border-white/5">
                  No related videos found.
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {relatedVideos.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onPlayVideo(item)}
                      className="flex flex-col bg-[#121214] border border-white/5 hover:border-[#f5c518]/40 rounded-xl overflow-hidden cursor-pointer transition-all duration-150 group"
                    >
                      {/* Thumbnail framework */}
                      <div className="relative aspect-video w-full bg-black overflow-hidden select-none">
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {item.duration && (
                          <span className="absolute bottom-1 right-1 text-[9px] bg-black/85 text-[#f5c518] px-1.5 py-0.5 rounded-md font-mono font-black">
                            {item.duration}
                          </span>
                        )}
                      </div>
                      {/* Content metadata */}
                      <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between">
                        <h4 className="text-slate-200 text-xs font-bold line-clamp-2 leading-tight group-hover:text-[#f5c518] [word-break:break-word]">
                          {item.title}
                        </h4>
                        <span className="text-[9px] font-mono text-slate-500 mt-1.5 flex flex-wrap items-center gap-1 shrink-0">
                          <span>👁️ {toBanglaNumber(item.views || 0)} views</span>
                          <span>•</span>
                          <span>{getRelativeTimeBangla(item.createdAt || item.scheduledAt || new Date().toISOString())}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="mt-8 flex flex-col gap-5 text-left border-t border-white/5 pt-6" id="comments-section">
              <h3 className="text-sm font-bold tracking-wider text-[#f5c518] uppercase flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>Comments ({toBanglaNumber(comments.filter(c => c.isApproved || isAdmin).length)})</span>
              </h3>

              {/* Comment submitted notice */}
              {showCommentSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Your comment was submitted successfully! It will appear publicly after approval.</span>
                </div>
              )}

              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="bg-[#121214] border border-white/5 rounded-2xl p-4 flex flex-col gap-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Enter your name..."
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    className="bg-black/40 border border-white/5 focus:border-[#f5c518] rounded-xl px-4 py-2 text-xs text-white outline-none transition"
                    required
                  />
                </div>
                <textarea
                  placeholder="Write your comment here..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  className="bg-black/40 border border-white/5 focus:border-[#f5c518] rounded-xl px-4 py-2.5 text-xs text-white outline-none transition resize-none"
                  required
                />
                {commentError && <span className="text-[11px] text-red-500">{commentError}</span>}
                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="self-end flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-[#f5c518] hover:bg-yellow-450 text-black text-xs font-bold transition duration-150 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Comment</span>
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.filter(c => c.isApproved || isAdmin).length === 0 ? (
                  <p className="text-zinc-500 text-xs py-5 text-center bg-[#111] rounded-xl border border-dashed border-white/5">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                ) : (
                  comments
                    .filter(c => c.isApproved || isAdmin)
                    .map((comm) => (
                      <div key={comm.id} className="bg-[#121214] border border-white/5 rounded-2xl p-4 space-y-3 relative">
                        
                        {/* Name & Timeago */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-[#f5c518]/15 text-[#f5c518] border border-[#f5c518]/10 rounded-full flex items-center justify-center text-xs font-black uppercase">
                              {comm.name.charAt(0)}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-200">
                                {comm.name}
                              </span>
                              {!comm.isApproved && isAdmin && (
                                <span className="ml-2 text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded">
                                  Pending approval
                                </span>
                              )}
                              <span className="block text-[9px] font-mono text-zinc-500 mt-0.5">
                                {getRelativeTimeBangla(comm.timestamp)}
                              </span>
                            </div>
                          </div>

                          {/* Report & React actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleLikeComment(comm)}
                              disabled={commentLikeStatuses[comm.id]}
                              className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer ${
                                commentLikeStatuses[comm.id]
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "text-slate-400 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>{toBanglaNumber(comm.likes || 0)}</span>
                            </button>
                            
                            <button
                              onClick={() => handleReportComment(comm.id)}
                              className="text-slate-500 hover:text-red-500 transition p-1 cursor-pointer"
                              title="Report Comment"
                            >
                              <Flag className="w-3.5 h-3.5" />
                            </button>

                            {isAdmin && (
                              <button
                                onClick={async () => {
                                  if (confirm("Are you sure you want to delete this comment?")) {
                                    await deleteComment(comm.id, video.id);
                                    loadComments();
                                  }
                                }}
                                className="text-red-500 hover:text-red-450 transition p-1 cursor-pointer"
                                title="Delete Comment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 pl-9 leading-relaxed [word-break:break-word]">
                          {comm.comment}
                        </p>

                        {/* 1-Level Replies Display list */}
                        {comm.replies && comm.replies.length > 0 && (
                          <div className="pl-9 space-y-2.5 pt-2 border-t border-white/5 mt-2">
                            {comm.replies.map((reply) => (
                              <div key={reply.id} className="bg-black/30 border border-white/5 p-3 rounded-xl flex flex-col gap-1.5 text-left">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-[#f5c518]">{reply.name}</span>
                                  <span className="text-[9px] font-mono text-zinc-500">{getRelativeTimeBangla(reply.timestamp)}</span>
                                </div>
                                <p className="text-[11px] text-slate-300 leading-relaxed [word-break:break-word]">{reply.comment}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comment Reply Form */}
                        <div className="pl-9 select-none">
                          {replyingToCommentId === comm.id ? (
                            <form
                              onSubmit={(e) => handleReplySubmit(e, comm)}
                              className="bg-black/30 border border-white/5 p-3 rounded-xl flex flex-col gap-2 mt-2"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Respondent's name..."
                                  value={replyName}
                                  onChange={(e) => setReplyName(e.target.value)}
                                  className="bg-[#121214] border border-white/5 focus:border-[#f5c518] rounded-lg px-3 py-1.5 text-[11px] text-white outline-none"
                                  required
                                />
                              </div>
                              <textarea
                                placeholder="Write your reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={2}
                                className="bg-[#121214] border border-white/5 focus:border-[#f5c518] rounded-lg px-3 py-1.5 text-[11px] text-white outline-none resize-none"
                                required
                              />
                              <div className="flex items-center justify-end gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setReplyingToCommentId(null)}
                                  className="px-3 py-1 rounded-lg text-slate-400 hover:text-white text-[10px] font-bold cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={isSubmittingReply}
                                  className="px-4 py-1.5 rounded-lg bg-[#f5c518] hover:bg-yellow-450 text-black text-[10px] font-bold cursor-pointer"
                                >
                                  Reply
                                </button>
                              </div>
                            </form>
                          ) : (
                            <button
                              onClick={() => {
                                setReplyName("");
                                setReplyText("");
                                setReplyingToCommentId(comm.id);
                              }}
                              className="text-[10px] font-semibold text-yellow-500 hover:text-yellow-400 hover:underline cursor-pointer"
                            >
                              Reply
                            </button>
                          )}
                        </div>

                      </div>
                    ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Aspect: Recommended columns */}
        <div className="w-full lg:w-4/12 p-4 flex flex-col gap-4 text-left">
          
          {/* Sidebar ad relocated only under player sponsor links */}

          {/* Popular Videos This Week Sidebar Widget */}
          <div className="bg-[#111113] border border-white/5 rounded-2xl p-4 flex flex-col gap-3.5 text-left" id="popular-this-week-sidebar">
            <h3 className="text-xs font-black tracking-widest text-[#f5c518] uppercase font-mono border-b border-white/5 pb-2.5 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-yellow-400" />
              <span>Trending This Week</span>
            </h3>

            <div className="flex flex-col gap-3">
              {[...allVideos]
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .slice(0, 5)
                .map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => onPlayVideo(item)}
                    className="flex gap-2.5 bg-[#121214] p-2 rounded-xl border border-white/5 hover:border-[#f5c518]/30 cursor-pointer transition select-none group"
                  >
                    <div className="w-6 h-6 rounded-full bg-zinc-850 border border-white/5 flex items-center justify-center font-mono font-black text-xs text-yellow-500 shrink-0 self-center">
                      {idx + 1}
                    </div>

                    <div className="w-16 aspect-video rounded-lg overflow-hidden shrink-0 bg-black">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                    </div>
                    
                    <div className="min-w-0 flex flex-col justify-center">
                      <h4 className="text-slate-200 text-xs font-bold line-clamp-1 group-hover:text-[#f5c518] tracking-tight [word-break:break-word]">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500 mt-1 flex flex-wrap items-center gap-1">
                        <span>👁️ {toBanglaNumber(item.views || 0)} views</span>
                        <span>•</span>
                        <span>{getRelativeTimeBangla(item.createdAt || item.scheduledAt || new Date().toISOString())}</span>
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
