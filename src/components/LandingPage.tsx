import { ArrowRight, Lock, HardDrive, FileTerminal } from 'lucide-react';

interface LandingPageProps {
  onLaunch: () => void;
}

export function LandingPage({ onLaunch }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0A0A0A] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Navbar */}
      <nav className="p-6 md:px-12 flex items-center justify-between w-full shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-black dark:bg-white flex items-center justify-center rounded-[4px]">
             <div className="w-1.5 h-1.5 bg-white dark:bg-black rounded-[2px]"></div>
          </div>
          <div className="flex items-center gap-2 relative top-[1px]">
            <span className="font-semibold tracking-tight text-lg leading-none">Slate</span>
            <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded leading-none">Beta</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
             GitHub
          </a>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center w-full max-w-4xl mx-auto py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-8 mt-10">
          <Lock size={12} />
          <span>Local-first. Total privacy.</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-8 leading-[1.1] text-zinc-900 dark:text-zinc-50">
          The blank page, <br />
          reimagined.
        </h1>
        
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mb-12 leading-relaxed">
          Slate is a block-based editor designed for absolute clarity. Create, organize, and write without the noise of modern software.
        </p>
        
        <button 
          onClick={onLaunch}
          className="group bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 px-8 py-3.5 font-medium transition-all flex items-center gap-2 text-sm mx-auto rounded-full"
        >
          Open Editor
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Minimalist Feature List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-32 text-left border-t border-zinc-100 dark:border-white/5 pt-16">
          <div className="flex flex-col gap-3">
             <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-900 dark:text-white mb-2">
               <HardDrive size={16} />
             </div>
             <h3 className="font-semibold text-[15px]">Zero Cloud</h3>
             <p className="text-[14px] text-zinc-500 dark:text-zinc-400 leading-relaxed">All your data stays securely on your device leveraging local IndexedDB. No accounts, no tracking.</p>
          </div>
          <div className="flex flex-col gap-3">
             <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-900 dark:text-white mb-2">
               <Lock size={16} />
             </div>
             <h3 className="font-semibold text-[15px]">Absolute Privacy</h3>
             <p className="text-[14px] text-zinc-500 dark:text-zinc-400 leading-relaxed">We don't collect analytics, read your notes, or share your content with third-party LLMs.</p>
          </div>
          <div className="flex flex-col gap-3">
             <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-900 dark:text-white mb-2">
               <FileTerminal size={16} />
             </div>
             <h3 className="font-semibold text-[15px]">Frictionless Export</h3>
             <p className="text-[14px] text-zinc-500 dark:text-zinc-400 leading-relaxed">Your content is never locked in. Export to beautifully formatted, high-resolution PDFs instantly.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 shrink-0 text-center text-zinc-400 dark:text-zinc-600 text-xs">
        <p>Built for privacy & focus. &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

