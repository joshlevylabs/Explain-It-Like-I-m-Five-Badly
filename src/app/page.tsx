"use client";

import { useState } from "react";
import SubmitForm from "@/components/SubmitForm";
import Feed from "@/components/Feed";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNewSubmission = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <main className="max-w-2xl mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Explain It Like I&apos;m Five... Badly
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Terrible explanations of serious things.
          </p>
        </header>

        <section className="mb-12 p-6 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Share Your Terrible Explanation
          </h2>
          <SubmitForm onSubmit={handleNewSubmission} />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Recent Terrible Explanations
          </h2>
          <Feed refreshKey={refreshKey} />
        </section>
      </main>
    </div>
  );
}
