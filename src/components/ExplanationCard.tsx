"use client";

import { useState, useEffect, useRef } from "react";
import { showToast } from "./Toast";

interface Explanation {
  id: string;
  topic: string;
  content: string;
  description?: string | null;
  createdAt: string;
  upvotes: number;
  downvotes: number;
}

interface ExplanationCardProps {
  explanation: Explanation;
  index?: number;
  viewMode?: "comfortable" | "compact";
}

const RATE_LIMIT_MESSAGES = [
  "Whoa, slow down! Even bad explanations need a breather.",
  "Too much voting! Take a moment to contemplate life.",
  "Easy there, enthusiastic voter! The explanations aren't going anywhere.",
  "Your voting fingers need a quick rest. Try again soon!",
  "We love your enthusiasm! Just need a short cooldown.",
];

const HELPFUL_YES_RESPONSES = [
  "Wait, really? That's... unexpected. But we'll take it!",
  "Your standards for 'helpful' are delightfully low. Welcome!",
  "Technically correct is the best kind of correct!",
  "We're both proud and concerned. Mostly proud!",
  "Your five-year-old self would be so confused. Success!",
];

const HELPFUL_NO_RESPONSES = [
  "Exactly as planned! Confusion achieved.",
  "Perfect! That's the whole point.",
  "Mission accomplished! Educational chaos reigns.",
  "As expected! Our work here is done.",
  "You're catching on! 'Badly' is the goal.",
];

export default function ExplanationCard({
  explanation,
  index = 0,
  viewMode = "comfortable"
}: ExplanationCardProps) {
  const [upvotes, setUpvotes] = useState(explanation.upvotes);
  const [downvotes, setDownvotes] = useState(explanation.downvotes);
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState("");
  const [helpfulFeedback, setHelpfulFeedback] = useState<"yes" | "no" | null>(null);
  const [helpfulResponse, setHelpfulResponse] = useState("");
  const [voteAnimation, setVoteAnimation] = useState<"upvote" | "downvote" | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const score = upvotes - downvotes;
  const staggerClass = index <= 10 ? `stagger-${Math.min(index + 1, 10)}` : "";

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Fetch user's existing vote on mount
  useEffect(() => {
    const fetchUserVote = async () => {
      try {
        const response = await fetch(`/api/explanations/${explanation.id}/vote`);
        if (response.ok) {
          const data = await response.json();
          setUserVote(data.userVote);
          setUpvotes(data.upvotes);
          setDownvotes(data.downvotes);
        }
      } catch {
        // Silently fail - user just won't see their previous vote
      }
    };
    fetchUserVote();
  }, [explanation.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return minutes <= 1 ? "just now" : `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (isVoting) return;

    setIsVoting(true);
    setError("");
    setVoteAnimation(voteType);

    // Clear animation after it plays
    setTimeout(() => setVoteAnimation(null), 300);

    try {
      const response = await fetch(`/api/explanations/${explanation.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteType }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(RATE_LIMIT_MESSAGES[Math.floor(Math.random() * RATE_LIMIT_MESSAGES.length)]);
        }
        throw new Error(data.error || "Failed to vote");
      }

      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);
      setUserVote(data.userVote);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsVoting(false);
    }
  };

  const handleHelpfulFeedback = (response: "yes" | "no") => {
    setHelpfulFeedback(response);
    if (response === "yes") {
      setHelpfulResponse(HELPFUL_YES_RESPONSES[Math.floor(Math.random() * HELPFUL_YES_RESPONSES.length)]);
    } else {
      setHelpfulResponse(HELPFUL_NO_RESPONSES[Math.floor(Math.random() * HELPFUL_NO_RESPONSES.length)]);
    }
  };

  const getScoreColor = () => {
    if (score > 10) return "text-orange-500 dark:text-orange-400";
    if (score > 0) return "text-orange-500";
    if (score < -5) return "text-blue-500 dark:text-blue-400";
    if (score < 0) return "text-blue-500";
    return "text-zinc-500";
  };

  const getScoreBadge = () => {
    if (score >= 20) return { text: "Legendary", color: "bg-gradient-to-r from-orange-500 to-red-500 text-white" };
    if (score >= 10) return { text: "Popular", color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300" };
    if (score >= 5) return { text: "Rising", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" };
    return null;
  };

  const scoreBadge = getScoreBadge();

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showShareMenu]);

  const handleCopyToClipboard = async () => {
    const text = `"${explanation.content}" - A terrible explanation of ${explanation.topic}`;
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      showToast("Copied to clipboard!", "success");
      setTimeout(() => setIsCopied(false), 2000);
      setShowShareMenu(false);
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  const handleShare = async (platform: "twitter" | "copy") => {
    const text = `"${explanation.content}" - A terrible explanation of ${explanation.topic}`;
    const url = typeof window !== "undefined" ? window.location.href : "";

    if (platform === "twitter") {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, "_blank", "noopener,noreferrer");
      setShowShareMenu(false);
    } else {
      await handleCopyToClipboard();
    }
  };

  const isCompact = viewMode === "compact";

  return (
    <div
      ref={cardRef}
      className={`w-full bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex card-hover-effect opacity-0 ${
        isVisible ? `animate-fade-in-up ${staggerClass}` : ""
      } ${isCompact ? "compact-card" : ""}`}
    >
      {/* Vote column */}
      <div className={`flex flex-col items-center ${isCompact ? "py-2 px-2" : "py-4 px-3"} bg-zinc-50 dark:bg-zinc-900 rounded-l-xl border-r border-zinc-200 dark:border-zinc-700`}>
        <button
          onClick={() => handleVote("upvote")}
          disabled={isVoting}
          aria-label={userVote === "upvote" ? "Remove upvote" : "Upvote - this made me laugh"}
          title={userVote === "upvote" ? "Click to undo your upvote" : "This is hilariously bad! (in the best way)"}
          className={`p-1.5 rounded-lg vote-button-transition focus-ring ${
            userVote === "upvote"
              ? "text-orange-500 bg-orange-100 dark:bg-orange-900/30"
              : "text-zinc-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
          } ${isVoting ? "opacity-50 cursor-not-allowed" : ""} ${
            voteAnimation === "upvote" ? "animate-pop" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M12 4l-8 8h5v8h6v-8h5z" />
          </svg>
        </button>
        <div className="relative py-1">
          <span
            className={`text-sm font-bold score-transition ${getScoreColor()} ${
              voteAnimation ? "animate-bounce-subtle" : ""
            }`}
          >
            {score}
          </span>
        </div>
        <button
          onClick={() => handleVote("downvote")}
          disabled={isVoting}
          aria-label={userVote === "downvote" ? "Remove downvote" : "Downvote - not silly enough"}
          title={userVote === "downvote" ? "Click to undo your downvote" : "Not silly enough! Needs more creative chaos."}
          className={`p-1.5 rounded-lg vote-button-transition focus-ring ${
            userVote === "downvote"
              ? "text-blue-500 bg-blue-100 dark:bg-blue-900/30"
              : "text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          } ${isVoting ? "opacity-50 cursor-not-allowed" : ""} ${
            voteAnimation === "downvote" ? "animate-pop" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M12 20l8-8h-5V4H9v8H4z" />
          </svg>
        </button>
      </div>

      {/* Content column */}
      <div className={`flex-1 ${isCompact ? "p-3" : "p-4"}`}>
        <div className={`flex items-start justify-between ${isCompact ? "mb-2" : "mb-3"} flex-wrap gap-2`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-block ${isCompact ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"} bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 font-medium rounded-full badge-pop`}>
              {explanation.topic}
            </span>
            {scoreBadge && (
              <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${scoreBadge.color} animate-fade-in`}>
                {scoreBadge.text}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
              {formatDate(explanation.createdAt)}
            </span>
            {/* Share button */}
            <div className="relative" ref={shareMenuRef}>
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all"
                title="Share this explanation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z" clipRule="evenodd" />
                </svg>
              </button>
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-lg py-1 min-w-[140px] z-10 animate-fade-in">
                  <button
                    onClick={() => handleShare("copy")}
                    className="w-full px-3 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2 transition-colors"
                  >
                    {isCopied ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-500">
                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10.5 3A1.501 1.501 0 009 4.5h6A1.5 1.5 0 0013.5 3h-3zm-2.693.178A3 3 0 0110.5 1.5h3a3 3 0 012.694 1.678c.497.042.992.092 1.486.15 1.497.173 2.57 1.46 2.57 2.929V19.5a3 3 0 01-3 3H6.75a3 3 0 01-3-3V6.257c0-1.47 1.073-2.756 2.57-2.93.493-.057.989-.107 1.487-.15z" clipRule="evenodd" />
                      </svg>
                    )}
                    {isCopied ? "Copied!" : "Copy text"}
                  </button>
                  <button
                    onClick={() => handleShare("twitter")}
                    className="w-full px-3 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share on X
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* AI-generated description */}
        {explanation.description && (
          <p className={`text-zinc-500 dark:text-zinc-400 italic ${isCompact ? "text-xs mb-2" : "text-sm mb-3"}`}>
            {explanation.description}
          </p>
        )}

        <p className={`text-zinc-800 dark:text-zinc-200 ${isCompact ? "text-base" : "text-lg"} leading-relaxed`}>
          &ldquo;{explanation.content}&rdquo;
        </p>

        {/* Did this help? feedback - hide in compact mode */}
        {!isCompact && (
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-700">
            {helpfulFeedback === null ? (
              <div className="flex items-center gap-3 text-sm flex-wrap">
                <span className="text-zinc-500 dark:text-zinc-400">Did this help?</span>
                <button
                  onClick={() => handleHelpfulFeedback("yes")}
                  className="px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all text-xs font-medium press-effect hover:shadow-sm"
                >
                  Yes
                </button>
                <button
                  onClick={() => handleHelpfulFeedback("no")}
                  className="px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all text-xs font-medium press-effect hover:shadow-sm"
                >
                  Absolutely Not
                </button>
              </div>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 italic animate-fade-in">
                {helpfulResponse}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
