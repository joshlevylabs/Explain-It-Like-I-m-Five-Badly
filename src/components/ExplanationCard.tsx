"use client";

import { useState } from "react";

interface Explanation {
  id: string;
  topic: string;
  content: string;
  createdAt: string;
  upvotes: number;
  helpful: number;
  notHelpful: number;
}

interface ExplanationCardProps {
  explanation: Explanation;
}

export default function ExplanationCard({ explanation }: ExplanationCardProps) {
  const [helpfulCount, setHelpfulCount] = useState(explanation.helpful);
  const [notHelpfulCount, setNotHelpfulCount] = useState(explanation.notHelpful);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleVote = async (voteType: "helpful" | "notHelpful") => {
    if (hasVoted || isVoting) return;

    setIsVoting(true);
    setError("");

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
          throw new Error(data.error || "Too many votes. Please wait.");
        }
        if (response.status === 409) {
          setHasVoted(true);
          throw new Error("You've already voted on this one!");
        }
        throw new Error(data.error || "Failed to vote");
      }

      setHelpfulCount(data.helpful);
      setNotHelpfulCount(data.notHelpful);
      setHasVoted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="w-full p-6 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
          {explanation.topic}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {formatDate(explanation.createdAt)}
        </span>
      </div>
      <p className="text-zinc-800 dark:text-zinc-200 text-lg leading-relaxed mb-4">
        &ldquo;{explanation.content}&rdquo;
      </p>
      <div className="flex flex-col gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-700">
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Did this help?
          </span>
          <button
            onClick={() => handleVote("helpful")}
            disabled={hasVoted || isVoting}
            className={`text-sm px-3 py-1 rounded-full transition-colors ${
              hasVoted
                ? "bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800"
            }`}
          >
            {isVoting ? "..." : `Yes (${helpfulCount})`}
          </button>
          <button
            onClick={() => handleVote("notHelpful")}
            disabled={hasVoted || isVoting}
            className={`text-sm px-3 py-1 rounded-full transition-colors ${
              hasVoted
                ? "bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
            }`}
          >
            {isVoting ? "..." : `Absolutely Not (${notHelpfulCount})`}
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}
