import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950 min-h-screen">
      <main className="flex flex-1 w-full flex-col items-center justify-center py-16 px-8 bg-white dark:bg-zinc-900 shadow-2xl rounded-xl max-w-4xl m-auto text-center border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-5xl font-extrabold mb-6 text-black dark:text-white tracking-tight">
          AI Collaborative Workspace
        </h1>
        
        <p className="mb-12 text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Experience real-time document editing, powered by seamless Socket.io syncing, and augmented with intelligent AI summarization and inline suggestions.
        </p>

        <div className="flex gap-4">
          <Link href="/login" className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-lg shadow-lg hover:scale-105 transition transform">
            Sign In
          </Link>
          <Link href="/register" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 hover:scale-105 transition transform">
            Get Started
          </Link>
        </div>
      </main>
    </div>
  );
}
