"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import ExplanationCard from "./ExplanationCard";
import SkeletonCard from "./SkeletonCard";
import FeedHeader from "./FeedHeader";

interface Explanation {
  id: string;
  topic: string;
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
}

interface FeedProps {
  refreshKey: number;
}

type SortOption = "newest" | "oldest" | "top" | "controversial";
type FilterOption = "all" | "today" | "week" | "month";
type ViewMode = "comfortable" | "compact";

const LOADING_MESSAGES = [
  "Loading terrible explanations...",
  "Gathering questionable wisdom...",
  "Fetching beautifully bad (but never mean) content...",
  "Summoning creative chaos...",
  "Collecting hilariously oversimplified knowledge...",
];

const EMPTY_MESSAGES = [
  "No terrible explanations yet. Be the first to confuse everyone (kindly)!",
  "Nothing here yet. Time to share your silliest knowledge!",
  "Empty! Quick, explain something hilariously badly before anyone notices!",
  "The stage is empty! Your wonderfully terrible explanation could be the first.",
  "A blank canvas of confusion awaits! Share something silly and kind.",
  "No chaos yet? Be the hero who starts the creative confusion!",
];

const ERROR_MESSAGES = [
  "Oops! Even our errors are explained badly.",
  "Something went wrong. Probably quantum physics.",
  "Failed to load. The explanations were too terrible even for us.",
];

const ITEMS_PER_PAGE = 10;

export default function Feed({ refreshKey }: FeedProps) {
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("comfortable");
  const [searchQuery, setSearchQuery] = useState("");
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [loadingMessage] = useState(() =>
    LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
  );

  const fetchExplanations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/explanations");
      if (!response.ok) {
        throw new Error("Failed to fetch explanations");
      }
      const data = await response.json();
      setExplanations(data);
      setDisplayCount(ITEMS_PER_PAGE);
      setHasMore(data.length > ITEMS_PER_PAGE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExplanations();
  }, [refreshKey, fetchExplanations]);

  // Filter by search query
  const filterBySearch = useCallback((items: Explanation[]) => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase().trim();
    return items.filter((item) =>
      item.topic.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Filter explanations by time
  const filterByTime = useCallback((items: Explanation[]) => {
    if (filterBy === "all") return items;

    const now = new Date();
    const cutoff = new Date();

    switch (filterBy) {
      case "today":
        cutoff.setHours(0, 0, 0, 0);
        break;
      case "week":
        cutoff.setDate(now.getDate() - 7);
        break;
      case "month":
        cutoff.setMonth(now.getMonth() - 1);
        break;
    }

    return items.filter((item) => new Date(item.createdAt) >= cutoff);
  }, [filterBy]);

  // Sort explanations
  const sortExplanations = useCallback((items: Explanation[]) => {
    const sorted = [...items];

    switch (sortBy) {
      case "newest":
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return sorted.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "top":
        return sorted.sort(
          (a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
        );
      case "controversial":
        // Most controversial = highest total votes with close to 50/50 split
        return sorted.sort((a, b) => {
          const aTotal = a.upvotes + a.downvotes;
          const bTotal = b.upvotes + b.downvotes;
          const aRatio = aTotal > 0 ? Math.min(a.upvotes, a.downvotes) / aTotal : 0;
          const bRatio = bTotal > 0 ? Math.min(b.upvotes, b.downvotes) / bTotal : 0;
          // Prioritize items with more votes and closer to 50/50
          const aScore = aTotal * aRatio;
          const bScore = bTotal * bRatio;
          return bScore - aScore;
        });
      default:
        return sorted;
    }
  }, [sortBy]);

  // Process explanations through search, filter and sort
  const processedExplanations = sortExplanations(filterByTime(filterBySearch(explanations)));
  const displayedExplanations = processedExplanations.slice(0, displayCount);

  // Calculate stats for header
  const feedStats = {
    totalExplanations: explanations.length,
    totalVotes: explanations.reduce((sum, e) => sum + e.upvotes + e.downvotes, 0),
    hotTopics: getHotTopics(explanations),
  };

  // Get trending topics based on recent activity and votes
  function getHotTopics(items: Explanation[]): string[] {
    const topicScores = new Map<string, number>();
    const now = new Date();

    items.forEach((item) => {
      const age = (now.getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60);
      const recencyBonus = Math.max(0, 48 - age) / 48; // Boost items from last 48 hours
      const score = (item.upvotes - item.downvotes + 1) * (1 + recencyBonus);

      const current = topicScores.get(item.topic) || 0;
      topicScores.set(item.topic, current + score);
    });

    return Array.from(topicScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);
  }

  // Infinite scroll using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
          setLoadingMore(true);
          // Simulate a small delay for smoother UX
          setTimeout(() => {
            setDisplayCount((prev) => {
              const newCount = prev + ITEMS_PER_PAGE;
              setHasMore(newCount < processedExplanations.length);
              return newCount;
            });
            setLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loadingMore, loading, processedExplanations.length]);

  // Reset display count when filter/sort/search changes
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
    setHasMore(processedExplanations.length > ITEMS_PER_PAGE);
  }, [sortBy, filterBy, searchQuery, processedExplanations.length]);

  const SortButton = ({ value, label }: { value: SortOption; label: string }) => (
    <button
      onClick={() => setSortBy(value)}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all press-effect ${
        sortBy === value
          ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm"
          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
      }`}
    >
      {label}
    </button>
  );

  const FilterButton = ({ value, label }: { value: FilterOption; label: string }) => (
    <button
      onClick={() => setFilterBy(value)}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all press-effect ${
        filterBy === value
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
      }`}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="text-center py-4 text-zinc-500 dark:text-zinc-400 animate-pulse-subtle">
          {loadingMessage}
        </div>
        {/* Skeleton loading cards */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-500 mb-2 font-medium">
          {ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)]}
        </p>
        <p className="text-xs text-zinc-400 mb-4">(Technical: {error})</p>
        <button
          onClick={fetchExplanations}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors press-effect"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (explanations.length === 0) {
    return (
      <div className="w-full text-center py-12 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 mb-4 animate-pulse-subtle">
          <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-2">
          {EMPTY_MESSAGES[Math.floor(Math.random() * EMPTY_MESSAGES.length)]}
        </p>
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Scroll up and submit your first terrible explanation!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Feed Header with Stats and Search */}
      <FeedHeader
        stats={feedStats}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Sort and Filter Controls */}
      <div className="mb-6 p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Sort options */}
          <div className="flex-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block">
              Sort by
            </label>
            <div className="flex flex-wrap gap-2">
              <SortButton value="newest" label="Newest" />
              <SortButton value="oldest" label="Oldest" />
              <SortButton value="top" label="Top Rated" />
              <SortButton value="controversial" label="Controversial" />
            </div>
          </div>

          {/* Filter options */}
          <div className="sm:border-l sm:border-zinc-200 sm:dark:border-zinc-700 sm:pl-4">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block">
              Time period
            </label>
            <div className="flex flex-wrap gap-2">
              <FilterButton value="all" label="All Time" />
              <FilterButton value="today" label="Today" />
              <FilterButton value="week" label="This Week" />
              <FilterButton value="month" label="This Month" />
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700 flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Showing {displayedExplanations.length} of {processedExplanations.length} explanation{processedExplanations.length !== 1 ? "s" : ""}
            {searchQuery && (
              <span className="ml-1 text-purple-600 dark:text-purple-400">
                matching &quot;{searchQuery}&quot;
              </span>
            )}
          </p>
          <div className="flex items-center gap-3">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
                Clear search
              </button>
            )}
            {(processedExplanations.length !== explanations.length || filterBy !== "all") && (
              <button
                onClick={() => {
                  setFilterBy("all");
                  setSearchQuery("");
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Show all {explanations.length}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Explanations list */}
      {processedExplanations.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <p className="mb-2 text-lg">No explanations match your {searchQuery ? "search" : "filters"}.</p>
          {searchQuery && (
            <p className="text-sm mb-3">
              Try a different search term or browse all explanations.
            </p>
          )}
          <button
            onClick={() => {
              setFilterBy("all");
              setSortBy("newest");
              setSearchQuery("");
            }}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors press-effect"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className={viewMode === "compact" ? "space-y-2" : "space-y-4"}>
          {displayedExplanations.map((explanation, index) => (
            <ExplanationCard
              key={explanation.id}
              explanation={explanation}
              index={index}
              viewMode={viewMode}
            />
          ))}

          {/* Infinite scroll trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="py-8 text-center">
              {loadingMore ? (
                <div className="flex items-center justify-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <span className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                  <span className="text-sm">Loading more chaos...</span>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Scroll for more terrible explanations
                </p>
              )}
            </div>
          )}

          {/* End of list message */}
          {!hasMore && displayedExplanations.length > ITEMS_PER_PAGE && (
            <div className="py-8 text-center animate-fade-in">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                You&apos;ve seen all {processedExplanations.length} terrible explanations!
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                Why not add your own to the collection?
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
