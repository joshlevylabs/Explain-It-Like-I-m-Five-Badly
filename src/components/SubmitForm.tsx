"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface SubmitFormProps {
  onSubmit: () => void;
}

export default function SubmitForm({ onSubmit }: SubmitFormProps) {
  const { data: session } = useSession();
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);

  // Check if user has an API key
  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/api-key")
        .then((res) => res.json())
        .then((data) => setHasApiKey(data.hasApiKey))
        .catch(() => setHasApiKey(false));
    } else {
      setHasApiKey(false);
    }
  }, [session]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic first");
      return;
    }

    setError("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: topic.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate");
      }

      setContent(data.explanation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/explanations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, content }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit");
      }

      setTopic("");
      setContent("");
      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canGenerate = session?.user && hasApiKey && topic.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div>
        <label
          htmlFor="topic"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
        >
          Topic (the serious thing)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Blockchain, Quantum Physics, Taxes..."
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            title={
              !session?.user
                ? "Sign in to use AI generation"
                : !hasApiKey
                ? "Add your OpenAI API key in Account Settings"
                : !topic.trim()
                ? "Enter a topic first"
                : "Generate a bad explanation with AI"
            }
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating...
              </span>
            ) : (
              "Generate"
            )}
          </button>
        </div>
        {!session?.user && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Sign in and add your OpenAI API key to use AI generation
          </p>
        )}
        {session?.user && !hasApiKey && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Add your OpenAI API key in{" "}
            <a href="/settings" className="text-blue-500 hover:underline">
              Account Settings
            </a>{" "}
            to use AI generation
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
        >
          Your terrible explanation
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Explain it like you're a confused 5-year-old who just learned some big words..."
          rows={4}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          required
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting || isGenerating}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
      >
        {isSubmitting ? "Submitting..." : "Submit Terrible Explanation"}
      </button>
    </form>
  );
}
