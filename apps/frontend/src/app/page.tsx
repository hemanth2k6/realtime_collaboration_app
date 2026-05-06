import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950 min-h-screen p-4">
      <main className="flex flex-col items-center justify-center py-12 px-6 md:py-20 md:px-12 bg-white dark:bg-zinc-900 shadow-2xl rounded-3xl max-w-4xl w-full text-center border border-zinc-200 dark:border-zinc-800">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-500/20">
          <span className="text-white text-3xl font-black">C</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black mb-6 text-zinc-900 dark:text-white tracking-tight leading-[1.1]">
          AI Powered <br className="hidden md:block" />
          <span className="text-indigo-600">Collaboration</span>
        </h1>
        
        <p className="mb-10 text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Create, edit, and collaborate in real-time. Augmented with high-performance AI summarization and intelligent inline suggestions.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-2xl shadow-xl hover:scale-105 transition-all active:scale-95">
            Sign In
          </Link>
          <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all active:scale-95 shadow-indigo-500/20">
            Get Started
          </Link>
        </div>
        
        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-8 opacity-50 grayscale">
           <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">Next.js 15</div>
           <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">Prisma</div>
           <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 hidden md:block">Socket.io</div>
        </div>
      </main>
    </div>
  );
}
