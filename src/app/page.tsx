"use client";

import { useState } from "react";
import SubmitForm from "@/components/SubmitForm";
import Feed from "@/components/Feed";
import { ToastContainer } from "@/components/Toast";
import ScrollToTop from "@/components/ScrollToTop";
import UserMenu from "@/components/UserMenu";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNewSubmission = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <ToastContainer />
      <ScrollToTop />
      {/* Navigation bar with user menu */}
      <nav className="sticky top-0 z-40 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            ELI5... Badly
          </span>
          <UserMenu />
        </div>
      </nav>
      <main className="max-w-2xl mx-auto px-4 py-12">
        <header className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center mb-4">
            <span className="text-5xl animate-wiggle">🤔</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Explain It Like I&apos;m Five...
            </span>
            <br />
            <span className="text-zinc-900 dark:text-zinc-100">Badly</span>
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
            Terrible explanations of serious things.
          </p>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 max-w-lg mx-auto shadow-sm hover-lift">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
              What does &quot;bad&quot; mean here?
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Hilariously oversimplified. Delightfully confusing. Technically-ish correct.
              <br />
              <span className="font-medium">NOT</span> mean, wrong, or hurtful. Be creative, be silly, be kind!
            </p>
          </div>
        </header>

        <section className="mb-12 p-6 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover-lift animate-fade-in stagger-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-purple-600 dark:text-purple-400">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Share Your Terrible Explanation
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                The worse it is, the better. Just keep it kind and creative!
              </p>
            </div>
          </div>
          <SubmitForm onSubmit={handleNewSubmission} />
        </section>

        <section className="mb-12 p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800 hover-lift animate-fade-in stagger-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📝</span>
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
              How to Be Wonderfully Terrible
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-2">Do this</p>
              <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                <li className="flex items-start gap-2 p-2 bg-white/50 dark:bg-zinc-800/50 rounded-lg">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                  <span>Oversimplify until it&apos;s almost (but not quite) wrong</span>
                </li>
                <li className="flex items-start gap-2 p-2 bg-white/50 dark:bg-zinc-800/50 rounded-lg">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                  <span>Use silly analogies that somehow still make sense</span>
                </li>
                <li className="flex items-start gap-2 p-2 bg-white/50 dark:bg-zinc-800/50 rounded-lg">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                  <span>Make people laugh while accidentally learning</span>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-2">Avoid this</p>
              <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                <li className="flex items-start gap-2 p-2 bg-white/50 dark:bg-zinc-800/50 rounded-lg">
                  <span className="text-red-500 mt-0.5 shrink-0">✗</span>
                  <span>Being mean, hurtful, or punching down</span>
                </li>
                <li className="flex items-start gap-2 p-2 bg-white/50 dark:bg-zinc-800/50 rounded-lg">
                  <span className="text-red-500 mt-0.5 shrink-0">✗</span>
                  <span>Spreading actual misinformation</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="animate-fade-in stagger-3">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                Recent Terrible Explanations
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Vote up the ones that made you laugh. We celebrate silly, not mean!
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <span className="inline-flex items-center gap-1.5 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1.5 rounded-full font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 4l-8 8h5v8h6v-8h5z" />
              </svg>
              Made me laugh
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 20l8-8h-5V4H9v8H4z" />
              </svg>
              Needs more chaos
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 italic flex items-center ml-auto">
              (not about right or wrong!)
            </span>
          </div>
          <Feed refreshKey={refreshKey} />
        </section>

        <footer className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-700 text-center animate-fade-in">
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm">
              <span className="text-base">🎭</span> Silly over serious
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm">
              <span className="text-base">💚</span> Kind over clever
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
              <span className="text-base">😂</span> Laughter over correctness
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
            &quot;Bad&quot; means wonderfully terrible, never mean.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">
            Be the confusion you wish to see in the world.
          </p>
        </footer>
      </main>
    </div>
  );
}
