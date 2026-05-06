import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { BlockEditor } from './components/BlockEditor';
import { LandingPage } from './components/LandingPage';
import { NoteStore } from './store/noteStore';
import { Note } from './types';
import { downloadFile, cn } from './lib/utils';
import { Loader2, Menu } from 'lucide-react';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'app' | 'landing'>(
    window.location.hash === '#app' ? 'app' : 'landing'
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setView(window.location.hash === '#app' ? 'app' : 'landing');
    };
    
    window.addEventListener('hashchange', handleHashChange);
    loadNotes();
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    }
  }, []);

  const loadNotes = async () => {
    try {
      let loaded = await NoteStore.getNotes();
      
      setNotes(loaded);
      if (loaded.length > 0) {
        if (!activeNoteId) setActiveNoteId(loaded[0].id);
      }
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleLaunch = async () => {
    window.location.hash = 'app';
    setView('app');
    
    // Auto-create a first note if empty
    if (notes.length === 0) {
      const newNote = await NoteStore.createNote();
      setNotes([newNote]);
      setActiveNoteId(newNote.id);
    }
  };

  const handleCreateNote = async () => {
    const newNote = await NoteStore.createNote();
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setView('app');
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false); // Close sidebar on mobile after creating
    }
  };

  const handleDeleteNote = async (id: string, skipConfirm = false) => {
    if (!skipConfirm && !confirm('Are you sure you want to delete this note?')) return;
    await NoteStore.deleteNote(id);
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  };

  const handleUpdateNote = async (updates: Partial<Note>) => {
    if (!activeNoteId) return;
    const existing = notes.find(n => n.id === activeNoteId);
    if (!existing) return;
    
    const updatedClientNote = { ...existing, ...updates, updatedAt: Date.now() };
    setNotes(prev => prev.map(n => n.id === activeNoteId ? updatedClientNote : n));
    await NoteStore.saveNote(updatedClientNote);
  };

  const handleExportAll = async () => {
    const json = await NoteStore.exportNotes();
    downloadFile('nocturne_backup.json', json, 'application/json');
  };

  const activeNote = notes.find(n => n.id === activeNoteId) || null;

  // Update document title for context and PDF exports
  useEffect(() => {
    if (activeNote) {
      document.title = activeNote.title || 'Untitled Note';
    } else {
      document.title = 'Slate';
    }
  }, [activeNote?.title]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-zinc-50 dark:bg-[#030303] text-zinc-900 dark:text-white bg-grid-pattern relative transition-colors duration-300">
        <Loader2 className="animate-spin mr-3 text-zinc-500" size={24} />
        <span className="font-sans tracking-tight text-lg">Loading workspace...</span>
      </div>
    );
  }

  if (view === 'landing') {
    return <LandingPage onLaunch={handleLaunch} />;
  }

  return (
    <div className="flex h-[100dvh] w-full bg-zinc-50 dark:bg-[#030303] overflow-hidden transition-colors duration-300 relative">
      <div className="absolute inset-0 z-0 bg-grid-pattern pointer-events-none opacity-50 dark:opacity-100 print:hidden"></div>
      
      <div className="relative z-10 w-full h-full flex pt-safe pb-safe outline-none">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-zinc-900/20 dark:bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 transform md:relative md:transform-none transition-transform duration-300 ease-in-out md:block print:hidden shadow-2xl md:shadow-none bg-white dark:bg-[#070707] md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <Sidebar 
            notes={notes}
            activeNoteId={activeNoteId}
            onSelect={(id) => {
              setActiveNoteId(id);
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            onCreate={handleCreateNote}
            onDelete={handleDeleteNote}
            onExportAll={handleExportAll}
            onCloseMobile={() => setIsSidebarOpen(false)}
          />
        </div>
        
        <div className="flex-1 h-full flex flex-col min-w-0 relative bg-white dark:bg-[#0a0a0a] shadow-[-10px_0_30px_rgba(0,0,0,0.02)] dark:shadow-[-10px_0_30px_rgba(0,0,0,0.5)] md:border-l border-zinc-200 dark:border-white/5 transition-colors duration-300 z-20">
          {activeNote ? (
            <BlockEditor 
              note={activeNote}
              onChange={handleUpdateNote}
              onToggleSidebar={() => setIsSidebarOpen(true)}
              onDelete={handleDeleteNote}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center relative px-6 text-center">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="absolute top-6 left-6 md:hidden p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg shrink-0"
              >
                 <Menu size={20} />
              </button>
              
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.05] flex items-center justify-center mb-6 ring-1 ring-black/5 dark:ring-white/10 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-white/10 dark:via-white/10 dark:to-white/5 pointer-events-none"></div>
                <div className="w-6 h-6 bg-zinc-900 dark:bg-white relative z-10 shadow-lg rounded-[6px] flex items-center justify-center">
                   <div className="w-2 h-2 bg-white dark:bg-zinc-900 rounded-full"></div>
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-sans font-semibold text-zinc-900 dark:text-white mb-3 tracking-tight">Slate Workspace</h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-[320px] text-center mb-10 text-[15px] leading-relaxed">
                A clean, unhindered page for your thoughts. Block-based editing with limitless potential.
              </p>
              <button
                onClick={handleCreateNote}
                className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 font-medium px-8 py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-[15px]"
              >
                Create new document
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
