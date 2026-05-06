import { Plus, Trash2, FileText, Download, Sun, Moon, X, Github } from 'lucide-react';
import { Note } from '../types';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { useTheme } from '../providers/ThemeProvider';

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onExportAll: () => void;
  onCloseMobile: () => void;
}

export function Sidebar({ notes, activeNoteId, onSelect, onCreate, onDelete, onExportAll, onCloseMobile }: SidebarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="w-72 sm:w-80 h-full flex flex-col flex-shrink-0 bg-zinc-50 dark:bg-[#0f0f0f] z-10 transition-colors print:hidden">
      <div className="p-4 md:p-5 flex items-center justify-between border-b border-zinc-200 dark:border-white/10">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
             window.location.hash = '';
          }}
        >
          <div className="w-5 h-5 rounded-[4px] bg-zinc-900 dark:bg-white flex items-center justify-center">
             <div className="w-1.5 h-1.5 bg-white dark:bg-zinc-900 rounded-[2px]"></div>
          </div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg md:text-xl font-sans font-semibold tracking-tight text-zinc-950 dark:text-white leading-none">
              Slate
            </h1>
            <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-[8px] font-bold uppercase tracking-widest px-1 py-0.5 rounded leading-none relative top-[-1px]">BETA</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            className="p-1.5 md:p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-zinc-100 dark:bg-transparent hover:bg-zinc-200 dark:hover:bg-white/5 rounded-md md:rounded-lg transition-all" 
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button 
            onClick={onExportAll} 
            className="p-1.5 md:p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-zinc-100 dark:bg-transparent hover:bg-zinc-200 dark:hover:bg-white/5 rounded-md md:rounded-lg transition-all hidden md:block" 
            title="Export Backup"
          >
            <Download size={16} />
          </button>
          <button 
            onClick={onCloseMobile} 
            className="md:hidden p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md" 
            title="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <button 
          onClick={onCreate}
          className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 px-4 py-3 rounded-xl font-medium transition-all shadow-sm text-[15px]"
        >
          <Plus size={18} />
          New Note
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-1 pb-6 styled-scrollbar">
        {notes.length === 0 ? (
          <div className="text-center mt-12 flex flex-col items-center flex-1 px-4">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/[0.02] flex items-center justify-center mb-4">
              <FileText size={20} className="text-zinc-400 dark:text-zinc-600" />
            </div>
            <p className="text-zinc-500 dark:text-zinc-500 text-[15px]">No notes yet.</p>
          </div>
        ) : (
          notes.map(note => (
            <div 
              key={note.id}
              onClick={() => onSelect(note.id)}
              className={cn(
                "group cursor-pointer rounded-xl p-3.5 transition-all duration-200 border",
                activeNoteId === note.id 
                  ? "bg-zinc-100 border-zinc-200 shadow-sm dark:bg-white/10 dark:border-white/10 text-zinc-900 dark:text-white" 
                  : "bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-white/[0.03] text-zinc-600 dark:text-zinc-400"
              )}
            >
              <div className="flex items-start justify-between mb-1.5">
                <h3 className={cn("font-medium truncate pr-2 w-full text-[15px]", activeNoteId === note.id ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-700 dark:text-zinc-300")}>
                  {note.title || "Untitled Note"}
                </h3>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                  className="text-zinc-400 dark:text-zinc-600 md:opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 p-1 rounded-md transition-all shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-500 line-clamp-2 pr-2">
                {note.content.replace(/[#*`_\]\[\n]/g, ' ').substring(0, 100) || "Empty content..."}
              </p>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-zinc-200 dark:border-white/10 mt-auto bg-zinc-100 dark:bg-transparent flex flex-wrap items-center justify-between gap-2">
        <a href="https://github.com/bylokesh/slate" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[13px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-white/5 font-medium">
          <Github size={14} />
          <span>Open Source</span>
        </a>
        <div className="text-[10px] font-semibold tracking-wider uppercase text-green-600 dark:text-emerald-400 bg-green-500/10 px-2 py-1 rounded inline-flex items-center">
           Local Only
        </div>
      </div>
    </div>
  );
}
