"use client";

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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
      <div className="flex items-center gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-700">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Did this help?
        </span>
        <button className="text-sm px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition-colors">
          Yes ({explanation.helpful})
        </button>
        <button className="text-sm px-3 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors">
          Absolutely Not ({explanation.notHelpful})
        </button>
      </div>
    </div>
  );
}
