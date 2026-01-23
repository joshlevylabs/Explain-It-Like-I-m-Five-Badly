"use client";

import { useState, useEffect } from "react";

interface FeedStats {
  totalExplanations: number;
  totalVotes: number;
  hotTopics: string[];
}

interface FeedHeaderProps {
  stats: FeedStats;
  viewMode: "comfortable" | "compact";
  onViewModeChange: (mode: "comfortable" | "compact") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function FeedHeader({
  stats,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
}: FeedHeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [animatedCount, setAnimatedCount] = useState(0);

  // Animate the count up
  useEffect(() => {
    if (stats.totalExplanations > 0) {
      const duration = 1000;
      const steps = 30;
      const increment = stats.totalExplanations / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= stats.totalExplanations) {
          setAnimatedCount(stats.totalExplanations);
          clearInterval(timer);
        } else {
          setAnimatedCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [stats.totalExplanations]);

  return (
    <div className="mb-6 space-y-4 animate-fade-in">
      {/* Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-purple-50 via-white to-blue-50 dark:from-purple-900/20 dark:via-zinc-800 dark:to-blue-900/20 rounded-xl border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-6">
          {/* Total explanations */}
          <div className="text-center">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {animatedCount}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Terrible Explanations
            </div>
          </div>

          {/* Total votes */}
          <div className="text-center border-l border-zinc-200 dark:border-zinc-700 pl-6">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {stats.totalVotes}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Community Votes
            </div>
          </div>
        </div>

        {/* Hot topics */}
        {stats.hotTopics.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-orange-500"
              >
                <path
                  fillRule="evenodd"
                  d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z"
                  clipRule="evenodd"
                />
              </svg>
              Trending:
            </span>
            {stats.hotTopics.slice(0, 3).map((topic, i) => (
              <button
                key={topic}
                onClick={() => onSearchChange(topic)}
                className={`px-2 py-1 text-xs rounded-full transition-all press-effect ${
                  i === 0
                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-medium"
                    : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                } hover:scale-105`}
              >
                {topic}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <div
            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
              isSearchFocused ? "text-purple-500" : "text-zinc-400"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all ${
              isSearchFocused
                ? "border-purple-300 dark:border-purple-600 ring-2 ring-purple-100 dark:ring-purple-900/50"
                : "border-zinc-200 dark:border-zinc-700"
            } bg-white dark:bg-zinc-800 text-sm placeholder:text-zinc-400 focus:outline-none`}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          <button
            onClick={() => onViewModeChange("comfortable")}
            title="Comfortable view"
            className={`p-2 rounded-md transition-all ${
              viewMode === "comfortable"
                ? "bg-white dark:bg-zinc-700 shadow-sm text-purple-600 dark:text-purple-400"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm4.5 7.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zm.75-3.75a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange("compact")}
            title="Compact view"
            className={`p-2 rounded-md transition-all ${
              viewMode === "compact"
                ? "bg-white dark:bg-zinc-700 shadow-sm text-purple-600 dark:text-purple-400"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
