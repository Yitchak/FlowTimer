import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Plus, Globe, Shield, RotateCcw, MoreVertical, Download, Upload, RefreshCw } from 'lucide-react';
import { AnimatePresence, Reorder, motion } from 'framer-motion';
import TimerCard from './components/TimerCard';
import TimerEditor from './components/TimerEditor';
import AccessibilityMenu from './components/AccessibilityMenu';
import { mockTimers as initialMockTimers } from './data/mockTimers';
import type { Timer } from './types/timer';
import { toast, Toaster } from 'sonner';
import './App.css';

function App() {
  const [timers, setTimers] = useState<Timer[]>(() => {
    const saved = localStorage.getItem('timrflow_timers');
    return saved ? JSON.parse(saved) : initialMockTimers;
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('timrflow_theme');
    if (saved) return saved as 'dark' | 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTimer, setEditingTimer] = useState<Timer | undefined>(undefined);
  const [isAccessMenuOpen, setIsAccessMenuOpen] = useState(false);
  const [showGlobalMenu, setShowGlobalMenu] = useState(false);
  const globalMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (globalMenuRef.current && !globalMenuRef.current.contains(event.target as Node)) {
        setShowGlobalMenu(false);
      }
    };

    if (showGlobalMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGlobalMenu]);
  const [listKey, setListKey] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence & Theme Sync
  useEffect(() => {
    localStorage.setItem('timrflow_timers', JSON.stringify(timers));
  }, [timers]);

  useEffect(() => {
    localStorage.setItem('timrflow_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [theme]);

  // Data Integrity Check: Restore presets if missing (since they are undeletable)
  useEffect(() => {
    const missingPresets = initialMockTimers.filter(preset => !timers.find(t => t.id === preset.id));
    if (missingPresets.length > 0) {
      console.log('Restoring missing presets...', missingPresets);
      setTimers(prev => [...prev, ...missingPresets]);
      toast.success("Restored missing presets");
    }
  }, [timers.length]); // Check when length changes

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleResetOrder = () => {
    if (window.confirm('Reset timers to original order?')) {
      // Just sort or re-arrange? For now, let's just assume it means reset to initial set.
      setTimers([...initialMockTimers]);
      setListKey(prev => prev + 1);
      toast.success("Order reset to original");
    }
  };

  const handleRestorePresets = () => {
    if (window.confirm('Restore built-in presets? This will reset default timers to their original state (including colors) but keep your custom ones.')) {
      setTimers(prev => {
        // 1. Find purely custom timers (ids that don't exist in the initial mock set)
        const customTimers = prev.filter(t => !initialMockTimers.some(init => init.id === t.id));

        // 2. Return FRESH initial timers + existing custom timers
        // This forces an overwrite of any "broken" preset data in state
        return [...initialMockTimers, ...customTimers];
      });
      toast.success("Presets restored successfully");
    }
  };

  const handleExportTimers = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(timers, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "timrflow_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success("Timers exported successfully");
  };

  const handleStart = (id: string) => {
    setActiveTimerId(id);
  };

  const handlePause = (id: string) => {
    if (activeTimerId === id) {
      setActiveTimerId(null);
    }
  };

  const handleAddTimer = () => {
    setEditingTimer(undefined);
    setIsEditorOpen(true);
  };

  const handleEditTimer = (timer: Timer) => {
    if (timer.isPreset) {
      const duplicate = {
        ...timer,
        id: `copy-${Date.now()}`,
        name: `${timer.name} (Copy)`,
        isPreset: false,
        userId: 'current-user'
      };
      setEditingTimer(duplicate);
    } else {
      setEditingTimer(timer);
    }
    setIsEditorOpen(true);
  };

  const handleDeleteTimer = (id: string) => {
    const timer = timers.find(t => t.id === id);
    if (timer?.isPreset) {
      toast.error("Presets cannot be deleted.");
      return;
    }
    if (window.confirm('Are you sure you want to delete this timer?')) {
      setTimers(timers.filter(t => t.id !== id));
      if (activeTimerId === id) setActiveTimerId(null);
      toast.success("Timer deleted");
    }
  };

  const handleSaveTimer = (timer: Timer) => {
    // If we have an editingTimer in state that matches an existing timer ID, it's an update.
    // If editingTimer was a fresh copy (new ID), find won't succeed, so it goes to 'else' (Create New).
    const existingIndex = timers.findIndex(t => t.id === timer.id);

    if (existingIndex !== -1) {
      // Update existing
      const newTimers = [...timers];
      newTimers[existingIndex] = { ...timer, isPreset: false };
      setTimers(newTimers);
      toast.success("Timer updated");
    } else {
      // Create New
      // Ensure it appears at the end by giving it a high order
      const maxOrder = Math.max(...timers.map(t => t.order || 0), 0);
      setTimers([...timers, { ...timer, isPreset: false, order: maxOrder + 1 }]);
      toast.success("New timer created");
    }
    setIsEditorOpen(false);
  };

  const handleDuplicateTimer = (timer: Timer) => {
    const duplicate = {
      ...timer,
      id: `copy-${Date.now()}`,
      name: `${timer.name} (Copy)`,
      isPreset: false,
      userId: 'current-user',
      order: timers.length
    };
    setEditingTimer(duplicate);
    setIsEditorOpen(true);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(timers.filter(t => !t.isPreset), null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'timrflow-backups.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success("Backup exported");
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          const newTimers = [...timers];
          imported.forEach((t: Timer) => {
            if (!newTimers.find(ex => ex.id === t.id)) {
              newTimers.push(t);
            }
          });
          setTimers(newTimers);
          toast.success(`Imported ${imported.length} timers`);
        }
      } catch (err) {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app-container" dir="ltr">
      <Toaster position="bottom-right" theme={theme === 'dark' ? 'dark' : 'light'} />
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        style={{ display: 'none' }}
        accept=".json"
      />

      <AnimatePresence mode="wait">
        {isEditorOpen ? (
          <TimerEditor
            key="editor"
            timer={editingTimer}
            onSave={handleSaveTimer}
            onClose={() => setIsEditorOpen(false)}
          />
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col h-full overflow-hidden"
          >
            {/* App Header */}
            <header className="app-header">
              <div className="header-left">
                <h1 className="logo-text">Timr<span className="text-primary">Flow</span></h1>
              </div>

              <div className="header-right">
                <button
                  className="icon-btn-large"
                  onClick={toggleTheme}
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <button
                  className={`icon-btn-large ${isAccessMenuOpen ? 'bg-primary text-black' : ''}`}
                  onClick={() => setIsAccessMenuOpen(!isAccessMenuOpen)}
                  title="Accessibility"
                >
                  <Shield size={20} />
                </button>
                <button className="icon-btn-large hide-mobile" title="Language">
                  <Globe size={20} />
                </button>

                {/* Global Menu */}
                <div className="relative" ref={globalMenuRef}>
                  <button
                    className={`icon-btn-large ${showGlobalMenu ? 'bg-white/10 text-white' : ''}`}
                    title="More Actions"
                    onClick={() => setShowGlobalMenu(!showGlobalMenu)}
                  >
                    <MoreVertical size={20} />
                  </button>

                  <AnimatePresence>
                    {showGlobalMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="dropdown-menu"
                      >
                        <button
                          onClick={() => { handleExportTimers(); setShowGlobalMenu(false); }}
                          className="dropdown-item"
                        >
                          <Download size={16} />
                          <span>Export Data</span>
                        </button>
                        <button
                          onClick={() => { handleImport(); setShowGlobalMenu(false); }}
                          className="dropdown-item"
                        >
                          <Upload size={16} />
                          <span>Import Data</span>
                        </button>

                        <div className="dropdown-divider"></div>

                        <button
                          onClick={() => { handleRestorePresets(); setShowGlobalMenu(false); }}
                          className="dropdown-item"
                        >
                          <RefreshCw size={16} />
                          <span>Restore Presets</span>
                        </button>
                        <button
                          onClick={() => { handleResetOrder(); setShowGlobalMenu(false); }}
                          className="dropdown-item"
                        >
                          <RotateCcw size={16} />
                          <span>Reset Order</span>
                        </button>



                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button className="primary-btn" onClick={handleAddTimer}>
                  <Plus size={20} />
                  <span className="hide-mobile">Add Timer</span>
                </button>
              </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
              <Reorder.Group
                key={listKey}
                values={timers}
                onReorder={(newOrder) => {
                  const filtered = newOrder.filter(Boolean);
                  if (filtered.length === timers.length) {
                    setTimers(filtered);
                  }
                }}
                className="timer-grid-list"
                dir="ltr"
              >
                {timers.map((timer) => (
                  <Reorder.Item
                    key={timer.id}
                    value={timer}
                    layoutId={timer.id}
                    className="timer-reorder-item"
                    dragListener={!activeTimerId}
                    drag // Explicitly enable free dragging (2D)
                    whileDrag={{ scale: 1.05, zIndex: 100 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    layout
                  >
                    <TimerCard
                      timer={timer}
                      isActive={activeTimerId === timer.id}
                      onStart={handleStart}
                      onPause={handlePause}
                      onEdit={handleEditTimer}
                      onDuplicate={handleDuplicateTimer}
                      onDelete={handleDeleteTimer}
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAccessMenuOpen && (
          <AccessibilityMenu
            onClose={() => setIsAccessMenuOpen(false)}
            onExport={handleExport}
            onImport={handleImport}
          />
        )}
      </AnimatePresence>

      <div className="bg-glow"></div>
    </div>
  );
}

export default App;
