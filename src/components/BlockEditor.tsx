import { useState, useRef, useEffect } from 'react';
import { generateId, cn } from '../lib/utils';
import { BlockData, BlockType, Note } from '../types';
import { GripVertical, Plus, MoreHorizontal, CheckSquare, Type, Heading1, Heading2, Heading3, ImageIcon, List, ListOrdered, FileCode, Quote } from 'lucide-react';

interface BlockEditorProps {
  note: Note;
  onChange: (updates: Partial<Note>) => void;
  onToggleSidebar?: () => void;
  onDelete?: (id: string) => void;
}

export function BlockEditor({ note, onChange, onToggleSidebar, onDelete }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<BlockData[]>(note.blocks?.length ? note.blocks : [{ id: generateId(), type: 'p', content: note.content || '' }]);
  const [showSettings, setShowSettings] = useState(false);
  
  // Font styles matching Notion
  const fontStyles = [
    { id: 'sans', label: 'Default', class: 'font-sans' },
    { id: 'serif', label: 'Serif', class: 'font-serif' },
    { id: 'mono', label: 'Mono', class: 'font-mono' },
  ];

  // Derive global settings from note
  const fontStyle = note.fontStyle || 'sans';
  const pageWidth = note.pageWidth || 'standard';

  useEffect(() => {
    // If the note context changes, update blocks
    setBlocks(note.blocks?.length ? note.blocks : [{ id: generateId(), type: 'p', content: note.content || '' }]);
  }, [note.id]);

  const updateBlocksState = (newBlocks: BlockData[]) => {
    setBlocks(newBlocks);
    onChange({ blocks: newBlocks });
  };

  const updateBlock = (id: string, updates: Partial<BlockData>) => {
    updateBlocksState(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const addBlock = (afterId: string, newBlockProps: Partial<BlockData> = {}) => {
    const idx = blocks.findIndex(b => b.id === afterId);
    if (idx === -1) return;
    
    const newId = generateId();
    const newBlock: BlockData = { id: newId, type: 'p', content: '', ...newBlockProps };
    
    const newBlocks = [...blocks.slice(0, idx + 1), newBlock, ...blocks.slice(idx + 1)];
    updateBlocksState(newBlocks);
    
    setTimeout(() => {
      focusBlockAt(newId, 'start');
    }, 10);
  };

  const removeBlock = (id: string, mergeToPrevious: boolean = false) => {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx <= 0) return; // Cannot remove first block this way usually, but handled carefully
    
    const blockToRemove = blocks[idx];
    const prevBlock = blocks[idx - 1];
    
    let newBlocks = [...blocks];
    
    if (mergeToPrevious && blockToRemove.content) {
      newBlocks[idx - 1] = { ...prevBlock, content: prevBlock.content + blockToRemove.content };
      newBlocks.splice(idx, 1);
      updateBlocksState(newBlocks);
      
      // Need to place caret exactly at the merge point. 
      // Simplified: just focus end of previous block
      setTimeout(() => focusBlockAt(prevBlock.id, 'end'), 10);
    } else {
      newBlocks.splice(idx, 1);
      updateBlocksState(newBlocks);
      setTimeout(() => focusBlockAt(prevBlock.id, 'end'), 10);
    }
  };

  const focusBlockAt = (id: string, position: 'start' | 'end') => {
    const el = document.getElementById(`block-${id}`);
    if (!el) return;
    el.focus();
    
    const selection = window.getSelection();
    const range = document.createRange();
    
    if (position === 'start') {
      range.selectNodeContents(el);
      range.collapse(true);
    } else {
      range.selectNodeContents(el);
      range.collapse(false);
    }
    
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const focusPrev = (id: string) => {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx > 0) focusBlockAt(blocks[idx - 1].id, 'end');
    else {
      // Focus title if at top
      document.getElementById('note-title')?.focus();
    }
  };

  const focusNext = (id: string) => {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx !== -1 && idx < blocks.length - 1) focusBlockAt(blocks[idx + 1].id, 'start');
  };

  return (
    <div className={cn(
      "flex-1 flex flex-col h-full bg-white dark:bg-[#111111] overflow-hidden",
      fontStyle === 'sans' ? 'font-sans' : fontStyle === 'serif' ? 'font-serif' : 'font-mono',
      note.smallText ? 'text-[14px]' : 'text-[16px]'
    )}>
      {/* Top Header / Context menu */}
      <div className="px-5 md:px-12 pt-6 pb-2 flex items-center justify-between shrink-0 sticky top-0 z-20 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button onClick={onToggleSidebar} className="md:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg">
              <List size={20} />
            </button>
          )}
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 transition-colors"
          >
            <MoreHorizontal size={20} />
          </button>
          
          {showSettings && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-[#1f1f1f] border border-zinc-200 dark:border-white/10 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 origin-top-right">
              <div className="px-2 py-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Style</div>
              <div className="flex bg-zinc-100 dark:bg-white/5 rounded-lg p-1 mx-2 mb-3">
                {fontStyles.map(font => (
                  <button
                    key={font.id}
                    onClick={() => onChange({ fontStyle: font.id as any })}
                    className={cn(
                      "flex-1 py-1.5 text-sm font-medium rounded-md transition-colors",
                      font.class,
                      fontStyle === font.id ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                    )}
                  >
                     Ag
                  </button>
                ))}
              </div>
              <div className="px-3 py-2 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors" onClick={() => onChange({ smallText: !note.smallText })}>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Small Text</span>
                <div className={cn("w-8 h-4 rounded-full transition-colors relative", note.smallText ? 'bg-blue-500' : 'bg-zinc-200 dark:bg-white/10')}>
                  <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all", note.smallText ? 'left-4' : 'left-0.5')} />
                </div>
              </div>
              <div className="px-3 py-2 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors" onClick={() => onChange({ pageWidth: pageWidth === 'full' ? 'standard' : 'full' })}>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Width</span>
                <div className={cn("w-8 h-4 rounded-full transition-colors relative", pageWidth === 'full' ? 'bg-blue-500' : 'bg-zinc-200 dark:bg-white/10')}>
                  <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all", pageWidth === 'full' ? 'left-4' : 'left-0.5')} />
                </div>
              </div>
              <div className="h-px bg-zinc-200 dark:bg-white/10 my-2"></div>
              <button className="w-full text-left px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-lg font-medium" onClick={() => { setShowSettings(false); window.print(); }}>
                Export to PDF
              </button>
              <button 
                className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg font-medium transition-colors" 
                onClick={() => { 
                  setShowSettings(false);
                  if (onDelete) onDelete(note.id);
                }}
              >
                Delete Note
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Editor Surface */}
      <div className="flex-1 overflow-y-auto pb-64 styled-scrollbar px-4 sm:px-12 pt-8 print:p-0 print:overflow-visible">
        <div className={cn(
          "mx-auto transition-all duration-300",
          pageWidth === 'full' ? 'max-w-7xl' : 'max-w-[700px]'
        )}>
          {/* Title block */}
          <div className="mb-8 group relative px-4 sm:px-10">
            <input
              id="note-title"
              type="text"
              value={note.title}
              onChange={(e) => onChange({ title: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (blocks.length > 0) focusBlockAt(blocks[0].id, 'start');
                }
              }}
              placeholder="Untitled"
              className="w-full bg-transparent border-none outline-none text-4xl sm:text-[40px] font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 tracking-tight"
            />
          </div>

          {/* Body blocks */}
          <div className="flex flex-col gap-0.5">
            {blocks.map((block) => (
              <BlockRow 
                key={block.id} 
                block={block} 
                updateBlock={(updates) => updateBlock(block.id, updates)}
                addBlock={(newProps) => addBlock(block.id, newProps)}
                removeBlock={(merge) => removeBlock(block.id, merge)}
                focusPrev={() => focusPrev(block.id)}
                focusNext={() => focusNext(block.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Individual Block Component
// ----------------------------------------------------

function BlockRow({ block, updateBlock, addBlock, removeBlock, focusPrev, focusNext }: {
  block: BlockData;
  updateBlock: (updates: Partial<BlockData>) => void;
  addBlock: (newProps?: Partial<BlockData>) => void;
  removeBlock: (mergeToPrevious: boolean) => void;
  focusPrev: () => void;
  focusNext: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Track slash command state
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Sync state to DOM only if not focused to avoid cursor jump
  useEffect(() => {
    if (contentRef.current && document.activeElement !== contentRef.current) {
      if (contentRef.current.innerHTML !== block.content) {
        contentRef.current.innerHTML = block.content;
      }
    }
  }, [block.content]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const html = e.currentTarget.innerHTML;
    const text = e.currentTarget.textContent || '';
    
    // Slash menu trigger
    if (text.startsWith('/')) {
       setShowSlashMenu(true);
       setSlashQuery(text.substring(1).toLowerCase());
       setSelectedIndex(0);
    } else {
       setShowSlashMenu(false);
       setSlashQuery('');
    }

    // Magic shortcuts
    if (html === '# ' || html === '&lt;h1&gt;# &lt;/h1&gt;') { updateBlock({ type: 'h1', content: '' }); setShowSlashMenu(false); e.currentTarget.innerHTML = ''; return; }
    if (html === '## ') { updateBlock({ type: 'h2', content: '' }); setShowSlashMenu(false); e.currentTarget.innerHTML = ''; return; }
    if (html === '### ') { updateBlock({ type: 'h3', content: '' }); setShowSlashMenu(false); e.currentTarget.innerHTML = ''; return; }
    if (html === '- ') { updateBlock({ type: 'ul', content: '' }); setShowSlashMenu(false); e.currentTarget.innerHTML = ''; return; }
    if (html === '1. ') { updateBlock({ type: 'ol', content: '' }); setShowSlashMenu(false); e.currentTarget.innerHTML = ''; return; }
    if (html === '&gt; ') { updateBlock({ type: 'quote', content: '' }); setShowSlashMenu(false); e.currentTarget.innerHTML = ''; return; }
    if (html === '[] ') { updateBlock({ type: 'todo', content: '' }); setShowSlashMenu(false); e.currentTarget.innerHTML = ''; return; }
    if (html === '---') { updateBlock({ type: 'divider', content: '' }); setShowSlashMenu(false); e.currentTarget.innerHTML = ''; addBlock({ type: 'p' }); return; }
    
    updateBlock({ content: html });
  };

  const applyCommand = (type: BlockType) => {
    updateBlock({ type, content: '' });
    if (contentRef.current) {
      contentRef.current.innerHTML = '';
      contentRef.current.focus();
    }
    setShowSlashMenu(false);
  };

  const allMenuItems = [
    { id: 'p', label: 'Text', icon: <Type size={16}/>, description: 'Just start writing with plain text.' },
    { id: 'h1', label: 'Heading 1', icon: <Heading1 size={16}/>, description: 'Big section heading.' },
    { id: 'h2', label: 'Heading 2', icon: <Heading2 size={16}/>, description: 'Medium section heading.' },
    { id: 'h3', label: 'Heading 3', icon: <Heading3 size={16}/>, description: 'Small section heading.' },
    { id: 'ul', label: 'Bulleted list', icon: <List size={16}/>, description: 'Create a simple bulleted list.' },
    { id: 'ol', label: 'Numbered list', icon: <ListOrdered size={16}/>, description: 'Create a list with numbering.' },
    { id: 'todo', label: 'To-do list', icon: <CheckSquare size={16}/>, description: 'Track tasks with a to-do list.' },
    { id: 'quote', label: 'Quote', icon: <Quote size={16}/>, description: 'Capture a quote.' },
    { id: 'code', label: 'Code', icon: <FileCode size={16}/>, description: 'Code block feature.' }
  ];

  const menuItems = allMenuItems.filter(item => 
    item.label.toLowerCase().includes(slashQuery) || item.id.includes(slashQuery)
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (showSlashMenu) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (menuItems.length > 0) applyCommand(menuItems[selectedIndex]?.id as BlockType || menuItems[0].id as BlockType);
        return;
      }
      if (e.key === 'Escape') {
        setShowSlashMenu(false);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : menuItems.length - 1));
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < menuItems.length - 1 ? prev + 1 : 0));
        return;
      }
    }

    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        e.preventDefault();
        // Simplified: push a new block, leaving current content behind
        // Advanced strategy to split block requires selection range extraction
        addBlock({ type: block.type === 'ul' || block.type === 'ol' || block.type === 'todo' ? block.type : 'p' });
      }
    } else if (e.key === 'Backspace') {
      const selection = window.getSelection();
      // If at start of block
      if (selection?.focusOffset === 0 && (e.currentTarget.textContent === '' || e.currentTarget.textContent === '\n')) {
        e.preventDefault();
        if (block.type !== 'p') {
           updateBlock({ type: 'p' }); // Downgrade to paragraph first
           setShowSlashMenu(false);
        } else {
           removeBlock(true); // Merge/remove
           setShowSlashMenu(false);
        }
      }
    } else if (e.key === 'ArrowUp') {
      // Basic nav
      if (!showSlashMenu) {
        e.preventDefault();
        focusPrev();
      }
    } else if (e.key === 'ArrowDown') {
      if (!showSlashMenu) {
        e.preventDefault();
        focusNext();
      }
    }
  };

  // Derive styles based on block type
  const isEmpty = !block.content || block.content === '<br>';
  let blockStyles = "min-h-[24px] outline-none break-words relative py-[2px] px-1 content-editor";
  if (isEmpty) blockStyles += " is-empty";
  
  let wrapperStyles = "w-full flex group px-3 sm:px-9 relative";
  let prefixNode = null;

  switch (block.type) {
    case 'h1': 
      blockStyles += " text-3xl font-bold mt-6 mb-2 text-zinc-900 dark:text-zinc-100 tracking-tight"; 
      break;
    case 'h2': 
      blockStyles += " text-2xl font-bold mt-5 mb-1 text-zinc-900 dark:text-zinc-100 tracking-tight border-b border-zinc-200 dark:border-zinc-800 pb-1"; 
      break;
    case 'h3': 
      blockStyles += " text-xl font-semibold mt-4 mb-1 text-zinc-900 dark:text-zinc-100 tracking-tight"; 
      break;
    case 'quote': 
      blockStyles += " text-lg border-l-4 border-zinc-900 dark:border-white pl-4 my-2 italic text-zinc-700 dark:text-zinc-300"; 
      break;
    case 'code': 
      blockStyles += " font-mono text-[14px] bg-zinc-50 dark:bg-[#1a1a1a] p-4 rounded-lg text-zinc-800 dark:text-zinc-300 whitespace-pre-wrap w-full"; 
      break;
    case 'ul': 
      blockStyles += " ml-6 sm:ml-8";
      prefixNode = <div className="absolute left-3 sm:left-9 top-[14px] w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white" />;
      break;
    case 'ol': 
      blockStyles += " ml-6 sm:ml-8";
      prefixNode = <div className="absolute left-1 sm:left-7 top-[6px] text-zinc-500 font-medium select-none">1.</div>;
      break;
    case 'todo': 
      blockStyles += " ml-7 sm:ml-9";
      prefixNode = (
        <div 
          className={cn("absolute left-2 sm:left-8 top-[6px] w-[16px] h-[16px] border rounded-[3px] flex items-center justify-center cursor-pointer transition-colors", 
            block.props?.checked ? 'bg-blue-500 border-blue-500' : 'border-zinc-400 dark:border-zinc-600')}
          onClick={() => updateBlock({ props: { checked: !block.props?.checked } })}
        >
          {block.props?.checked && <CheckSquare size={12} className="text-white relative right-[0.5px]" />}
        </div>
      );
      if (block.props?.checked) blockStyles += " line-through opacity-50";
      break;
    case 'divider':
      return (
        <div className={wrapperStyles}>
           <div className="w-full h-px bg-zinc-200 dark:bg-white/10 my-4" />
        </div>
      );
    default:
      blockStyles += " leading-relaxed text-zinc-800 dark:text-zinc-300 text-[16px]";
  }

  return (
    <div className={wrapperStyles}>
      {/* Affordance / Drag handle */}
      <div className="absolute left-0 sm:left-2 top-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 select-none pr-2">
        <button className="p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 rounded" onClick={() => addBlock({ type: 'p' })}>
          <Plus size={16} />
        </button>
        <button className="p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 rounded cursor-grab active:cursor-grabbing">
          <GripVertical size={16} />
        </button>
      </div>
      
      {prefixNode}
      
      <div
        id={`block-${block.id}`}
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={blockStyles}
        data-placeholder={block.type === 'p' ? "Press '/' for commands" : block.type === 'h1' ? "Heading 1" : "Type here..."}
        style={{ flex: 1, minWidth: 0 }}
      />
      
      {showSlashMenu && (
        <div contentEditable={false} className="absolute top-full left-0 sm:left-9 z-50 mt-1 w-72 bg-white dark:bg-[#1f1f1f] border border-zinc-200 dark:border-white/10 rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95 max-h-[300px] overflow-y-auto styled-scrollbar">
          {menuItems.length > 0 ? (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Basic blocks</div>
              <div className="flex flex-col gap-0.5">
                {menuItems.map((item, index) => (
                  <button
                    key={item.id}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent blur
                      applyCommand(item.id as BlockType);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-2 py-1.5 rounded-lg text-left transition-colors",
                      selectedIndex === index 
                        ? "bg-zinc-100 dark:bg-white/10" 
                        : "hover:bg-zinc-50 dark:hover:bg-white/5"
                    )}
                  >
                    <div className="w-10 h-10 rounded border border-zinc-200 dark:border-white/10 bg-white dark:bg-black/20 flex items-center justify-center text-zinc-600 dark:text-zinc-400 shadow-sm shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">{item.label}</span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{item.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="px-2 py-3 text-sm text-zinc-500 text-center">No blocks found</div>
          )}
        </div>
      )}
    </div>
  );
}
