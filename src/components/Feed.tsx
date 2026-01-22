"use client";

import { useEffect, useState } from "react";
import ExplanationCard from "./ExplanationCard";

interface Explanation {
  id: string;
  topic: string;
  content: string;
  createdAt: string;
  upvotes: number;
  helpful: number;
  notHelpful: number;
}

interface FeedProps {
  refreshKey: number;
}

export default function Feed({ refreshKey }: FeedProps) {
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExplanations = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/explanations");
        if (!response.ok) {
          throw new Error("Failed to fetch explanations");
        }
        const data = await response.json();
        setExplanations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchExplanations();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="w-full text-center py-8 text-zinc-500 dark:text-zinc-400">
        Loading terrible explanations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  if (explanations.length === 0) {
    return (
      <div className="w-full text-center py-8 text-zinc-500 dark:text-zinc-400">
        No terrible explanations yet. Be the first to confuse everyone!
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {explanations.map((explanation) => (
        <ExplanationCard key={explanation.id} explanation={explanation} />
      ))}
    </div>
  );
}
