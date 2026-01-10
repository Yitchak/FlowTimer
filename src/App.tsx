import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Plus, Globe, Shield, RotateCcw, MoreVertical, Download, Upload, RefreshCw, Info } from 'lucide-react';
import { AnimatePresence, Reorder, motion } from 'framer-motion';
import TimerCard from './components/TimerCard';
import TimerEditor from './components/TimerEditor';
import AccessibilityMenu from './components/AccessibilityMenu';
import { mockTimers as initialMockTimers } from './data/mockTimers';
import type { Timer } from './types/timer';
import { toast, Toaster } from 'sonner';
import { useAuth } from './contexts/AuthContext';
import { useTimerStorage } from './hooks/useTimerStorage';
import LoginModal from './components/LoginModal';
import { User, LogIn, LogOut } from 'lucide-react';
import './App.css';
import { useLanguage } from './contexts/LanguageContext';


function App() {
  /* 
    DATA PERSISTENCE:
    We now use the custom hook 'useTimerStorage' which handles:
    1. LocalStorage (offline/guest)
    2. Supabase Cloud (logged-in user)
    3. Merging/Syncing logic
  */
  const { user, signOut } = useAuth();
  const {
    timers,
    addTimer,
    updateTimer,
    deleteTimer,
    reorderTimers,
    setTimers // Exposed for special cases (Import/Restore)
  } = useTimerStorage(user);

  const { t, isRTL } = useLanguage();


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


  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success(t('messages.signedOut'));
    } catch (e) {
      toast.error("Error signing out");
    }
    setShowGlobalMenu(false);

  };

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
  // Active Tab Persistence
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('timrflow_active_tab') || 'custom';
  });

  // Recent Timers Logic
  const [recentTimerIds, setRecentTimerIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('timrflow_recents');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('timrflow_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('timrflow_recents', JSON.stringify(recentTimerIds));
  }, [recentTimerIds]);

  const addToRecents = (id: string) => {
    setRecentTimerIds(prev => {
      const filtered = prev.filter(tid => tid !== id);
      return [id, ...filtered].slice(0, 10); // Keep last 10
    });
  };

  const [listKey, setListKey] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence & Theme Sync


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
      toast.success(t('messages.restoreSuccess'));
    }

  }, [timers.length]); // Check when length changes

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // --- CLEANUP & MIGRATE PRESETS (AUTO) ---
  useEffect(() => {
    let hasChanges = false;
    let newTimers = [...timers];

    // 1. Remove Deprecated
    const deprecatedIds = [
      'preset-sun-salutation',
      'preset-morning-flow',
      'preset-evening-stretch',
      'preset-power-yoga',
      'preset-yin-yoga'
    ];

    if (newTimers.some(t => deprecatedIds.includes(t.id))) {
      console.log("Cleaning up deprecated presets...");
      newTimers = newTimers.filter(t => !deprecatedIds.includes(t.id));
      hasChanges = true;
    }

    // 2. Patch Tags for Yoga List (ensure they have 'yoga' tag)
    const timersToTagYoga = ['preset-alt-breath', 'preset-1min', 'preset-3min', 'preset-11min', 'preset-sat-kriya'];

    newTimers = newTimers.map(t => {
      if (timersToTagYoga.includes(t.id) && !t.tags.includes('yoga')) {
        console.log(`Patching 'yoga' tag to ${t.name}`);
        hasChanges = true;
        return { ...t, tags: [...t.tags, 'yoga'] };
      }
      return t;
    });

    // 3. Patch Alternate Breathing Steps (ensure full cycle)
    const altBreath = newTimers.find(t => t.id === 'preset-alt-breath');
    if (altBreath && altBreath.steps.length === 3) {
      console.log("Patching Alt Breath steps...");
      hasChanges = true;
      // Update to 6 steps
      newTimers = newTimers.map(t => {
        if (t.id === 'preset-alt-breath') {
          return {
            ...t,
            steps: [
              { id: 'b1', name: 'steps.inhale', duration: 4 },
              { id: 'b2', name: 'steps.hold', duration: 16 },
              { id: 'b3', name: 'steps.exhale', duration: 8 },
              { id: 'b4', name: 'steps.inhale', duration: 4 },
              { id: 'b5', name: 'steps.hold', duration: 16 },
              { id: 'b6', name: 'steps.exhale', duration: 8 }
            ]
          };
        }
        return t;
      });
    }


    // 4. Inject Missing 6 Plus 1
    if (!newTimers.some(t => t.id === 'preset-6-plus-1')) {
      const newPreset = initialMockTimers.find(t => t.id === 'preset-6-plus-1');
      if (newPreset) {
        console.log("Injecting 6 Plus 1 preset...");
        newTimers.push(newPreset);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      setTimers(newTimers);
      toast.success(t('messages.restoreSuccess')); // Notify update
    }
  }, [timers, setTimers, t]);


  const handleResetOrder = () => {
    if (window.confirm('Reset timers to original order?')) {
      // Just sort or re-arrange? For now, let's just assume it means reset to initial set.
      setTimers([...initialMockTimers]);
      setListKey(prev => prev + 1);
      toast.success(t('messages.orderReset'));
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
      toast.success(t('messages.restoreSuccess'));
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
    toast.success(t('messages.backupExported'));
  };


  const handleStart = (id: string) => {
    setActiveTimerId(id);
    addToRecents(id);
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
      toast.error(t('messages.presetDeleteError'));
      return;
    }
    if (window.confirm(t('messages.confirmDelete'))) {
      deleteTimer(id);
      if (activeTimerId === id) setActiveTimerId(null);
      toast.success(t('messages.timerDeleted'));
    }

  };

  const handleRemoveFromRecents = (id: string) => {
    setRecentTimerIds(prev => prev.filter(tid => tid !== id));
    toast.success(t('messages.timerDeleted'));
  };


  const handleSaveTimer = (timer: Timer) => {
    const existingIndex = timers.findIndex(t => t.id === timer.id);

    if (existingIndex !== -1) {
      // Update existing
      updateTimer({ ...timer, isPreset: false });
      toast.success(t('messages.timerUpdated'));
    } else {
      // Create New
      const maxOrder = Math.max(...timers.map(t => t.order || 0), 0);
      addTimer({ ...timer, isPreset: false, order: maxOrder + 1 });
      toast.success(t('messages.timerCreated'));
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
    toast.success(t('messages.backupExported'));
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
          toast.success(t('messages.importSuccess'));
        }
      } catch (err) {
        toast.error(t('messages.invalidJson'));
      }

    };
    reader.readAsText(file);
  };

  return (
    <div className="app-container" dir={isRTL ? 'rtl' : 'ltr'}>

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
                  title={t('actions.switchTheme')}
                >

                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <button
                  className={`icon-btn-large ${isAccessMenuOpen ? 'bg-primary text-black' : ''}`}
                  onClick={() => setIsAccessMenuOpen(!isAccessMenuOpen)}
                  title={t('actions.accessibility')}
                >

                  <Shield size={20} />
                </button>
                <button className="icon-btn-large hide-mobile" title={t('actions.language')}>
                  <Globe size={20} />
                </button>


                {/* Global Menu */}
                <div className="relative" ref={globalMenuRef}>
                  <button
                    className={`icon-btn-large ${showGlobalMenu ? 'bg-white/10 text-white' : ''} ${user ? 'text-green-400' : ''}`}
                    title={user ? `${t('actions.signedInAs')} ${user.email}` : t('actions.moreActions')}
                    onClick={() => setShowGlobalMenu(!showGlobalMenu)}
                  >


                    {user ? <User size={20} /> : <MoreVertical size={20} />}
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
                        {user ? (
                          <div className="px-3 py-2 text-[10px] text-text-dim border-b border-white/5 mb-1 truncate">
                            <div className="flex items-center gap-2">
                              <User size={12} />
                              <span className="truncate">{user.email}</span>
                            </div>
                          </div>
                        ) : null}

                        {user ? (
                          <button
                            onClick={handleSignOut}
                            className="dropdown-item text-red-400 hover:text-red-300"
                          >
                            <LogOut size={16} />
                            <span>{t('actions.signOut')}</span>

                          </button>
                        ) : (
                          <button
                            onClick={() => { setIsLoginOpen(true); setShowGlobalMenu(false); }}
                            className="dropdown-item text-primary"
                          >
                            <LogIn size={16} />
                            <span>{t('actions.signIn')}</span>

                          </button>
                        )}

                        <div className="dropdown-divider"></div>

                        <button
                          onClick={() => { handleExportTimers(); setShowGlobalMenu(false); }}
                          className="dropdown-item"
                        >
                          <Download size={16} />
                          <span>{t('actions.export')}</span>

                        </button>
                        <button
                          onClick={() => { handleImport(); setShowGlobalMenu(false); }}
                          className="dropdown-item"
                        >
                          <Upload size={16} />
                          <span>{t('actions.import')}</span>

                        </button>

                        <div className="dropdown-divider"></div>

                        <button
                          onClick={() => { handleRestorePresets(); setShowGlobalMenu(false); }}
                          className="dropdown-item"
                        >
                          <RefreshCw size={16} />
                          <span>{t('actions.restorePresets')}</span>

                        </button>
                        <button
                          onClick={() => { handleResetOrder(); setShowGlobalMenu(false); }}
                          className="dropdown-item"
                        >
                          <RotateCcw size={16} />
                          <span>{t('actions.resetOrder')}</span>

                        </button>

                        <div className="dropdown-divider"></div>

                        <button
                          onClick={() => {
                            toast.info(`FlowTimer v1.1.16\nReady for your next session!`);
                            setShowGlobalMenu(false);
                          }}
                          className="dropdown-item"
                        >
                          <Info size={16} />
                          <span>{t('app.about')}</span>

                        </button>

                        <div className="text-[10px] text-center text-text-dim py-2 opacity-50 border-t border-white/5 mt-1">
                          v1.1.26
                        </div>



                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button className="primary-btn" onClick={handleAddTimer}>
                  <Plus size={20} />
                  <span className="hide-mobile">{t('app.addTimer')}</span>

                </button>
              </div>
            </header>

            {/* Main Content */}
            {/* Filter Chips / Tabs (Color Coded & Larger) */}
            <div
              className="pr-8 overflow-x-auto no-scrollbar flex flex-nowrap items-center gap-3 mb-0 sticky top-0 z-50 w-full border-b border-white/5 pl-4 md:pl-16 pt-4 pb-4 md:pt-[60px] md:pb-6"
              style={{
                display: 'flex',
                flexWrap: 'nowrap', // Force single line
                overflowX: 'auto',
                justifyContent: 'flex-start',
                background: 'var(--glass)', // Match header
                backdropFilter: 'var(--glass-blur)', // Match header blur
                marginBottom: '-1px'
              }}
            >
              {[
                { id: 'recent', label: t('tabs.recent'), color: '#22d3ee' },
                { id: 'custom', label: t('tabs.myTimers'), color: 'var(--primary)' },
                { id: 'breathwork', label: t('tabs.breathwork'), color: '#4ade80' },
                { id: 'yoga', label: t('tabs.yoga'), color: '#fbbf24' },
                { id: 'workout', label: t('tabs.workout'), color: '#f87171' }
              ].map((tab) => {

                const isActive = activeTab === tab.id;
                // Calculate text color for active state:
                // Primary (Purple) is dark -> Needs White text.
                // Others (Green, Yellow, Red) are light -> Need Black text.
                const isDarkBg = tab.id === 'custom';
                const activeTextColor = isDarkBg ? '#ffffff' : '#000000';

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                        relative whitespace-nowrap transition-all duration-300 border-2 flex-shrink-0
                        ${isActive
                        ? 'shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] scale-105 border-transparent'
                        : 'bg-transparent border-transparent text-white hover:text-gray-200'
                      }
                      `}
                    style={{
                      backgroundColor: isActive ? tab.color : 'transparent',
                      // No explicit border color for inactive to ensure it looks like text only
                      borderColor: 'transparent',
                      color: isActive ? activeTextColor : 'var(--text)',
                      boxShadow: isActive ? `0 4px 20px ${tab.color}60` : 'none',
                      // Styling matches
                      fontSize: '20px',
                      padding: '12px 32px',
                      fontWeight: 800,
                      borderRadius: '999px',
                      letterSpacing: '0.01em',
                      // Ensure text alignment helps the visual
                      textAlign: 'center',
                      whiteSpace: 'nowrap', // Force no wrap
                      flexShrink: 0 // Prevent shrinking
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Main Content */}
            <main className="main-content pt-0">

              {/* --- RECENT TAB --- */}
              {activeTab === 'recent' && (
                <section className="timer-section mb-6">
                  {recentTimerIds.length === 0 ? (
                    <div className="py-8 text-center text-text-dim bg-white/5 rounded-xl border border-dashed border-white/10">
                      <p>{t('messages.emptyRecent')}</p>
                    </div>

                  ) : (
                    <div className="timer-grid-list" dir="ltr">
                      {recentTimerIds.map(id => {
                        const timer = timers.find(t => t.id === id);
                        if (!timer) return null;
                        return (
                          <div key={id} className="timer-reorder-item">
                            <TimerCard
                              timer={timer}
                              isActive={activeTimerId === timer.id}
                              onStart={handleStart}
                              onPause={handlePause}
                              onEdit={handleEditTimer}
                              onDuplicate={handleDuplicateTimer}
                              onDelete={handleRemoveFromRecents}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* --- MY TIMERS (Draggable) --- */}
              {(activeTab === 'all' || activeTab === 'custom') && (
                <section className="timer-section mb-6">
                  {/* Show header only in 'All' view to distinguish, or always? Keep it clean. */}
                  {activeTab === 'all' && (
                    <div className="flex items-center gap-3 mb-4 px-1">
                      <h2 className="text-xs font-bold text-text-dim uppercase tracking-widest">{t('tabs.myTimers')}</h2>
                      <span className="text-xs font-medium text-text-dim bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                        {timers.filter(t => !t.isPreset).length}

                      </span>
                    </div>
                  )}

                  {timers.filter(t => !t.isPreset).length === 0 ? (
                    <div className="py-8 px-4 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-center text-text-dim bg-white/5">
                      <p className="mb-2 text-sm">{t('messages.emptyCustom')}</p>
                      <button onClick={handleAddTimer} className="text-primary hover:text-primary-hover hover:underline text-xs font-bold uppercase tracking-wide transition-colors">{t('actions.createFirst')}</button>
                    </div>

                  ) : (
                    <Reorder.Group
                      key={listKey}
                      values={timers.filter(t => !t.isPreset)}
                      onReorder={(newCustomOrder) => {
                        const presets = timers.filter(t => t.isPreset);
                        // We use reorderTimers from hook
                        reorderTimers([...newCustomOrder, ...presets]);
                      }}
                      className="timer-grid-list"
                      dir="ltr"
                    >
                      {timers.filter(t => !t.isPreset).map((timer) => (
                        <Reorder.Item
                          key={timer.id}
                          value={timer}
                          layoutId={timer.id}
                          className="timer-reorder-item"
                          dragListener={!activeTimerId}
                          drag
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
                  )}
                </section>
              )}

              {/* Divider - Only show if in 'All' mode and followed by more sections */}
              {activeTab === 'all' && <div className="w-full h-px bg-white/5 mb-6"></div>}

              {/* --- BREATHWORK (Static) --- */}
              {(activeTab === 'all' || activeTab === 'breathwork') && (
                <section className="timer-section mb-6">
                  {activeTab === 'all' && (
                    <h2 className="text-xs font-bold text-text-dim uppercase tracking-widest mb-4 px-1">
                      {t('tabs.breathwork')}
                    </h2>
                  )}

                  <div className="timer-grid-list">
                    {timers.filter(t => t.isPreset && t.tags.includes('breathwork')).map((timer) => (
                      <div key={timer.id} className="timer-reorder-item">
                        <TimerCard
                          timer={timer}
                          isActive={activeTimerId === timer.id}
                          onStart={handleStart}
                          onPause={handlePause}
                          onEdit={handleEditTimer}
                          onDuplicate={handleDuplicateTimer}
                          onDelete={handleDeleteTimer}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Divider */}
              {activeTab === 'all' && <div className="w-full h-px bg-white/5 mb-6"></div>}

              {/* --- YOGA (Static) --- */}
              {(activeTab === 'all' || activeTab === 'yoga') && (
                <section className="timer-section mb-6">
                  {activeTab === 'all' && (
                    <h2 className="text-xs font-bold text-text-dim uppercase tracking-widest mb-4 px-1">
                      {t('tabs.yoga')}
                    </h2>
                  )}

                  <div className="timer-grid-list">
                    {timers.filter(t => t.isPreset && t.tags.includes('yoga')).map((timer) => (
                      <div key={timer.id} className="timer-reorder-item">
                        <TimerCard
                          timer={timer}
                          isActive={activeTimerId === timer.id}
                          onStart={handleStart}
                          onPause={handlePause}
                          onEdit={handleEditTimer}
                          onDuplicate={handleDuplicateTimer}
                          onDelete={handleDeleteTimer}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Divider */}
              {activeTab === 'all' && <div className="w-full h-px bg-white/5 mb-6"></div>}

              {/* --- WORKOUT (Static) --- */}
              {(activeTab === 'all' || activeTab === 'workout') && (
                <section className="timer-section mb-12">
                  {activeTab === 'all' && (
                    <h2 className="text-xs font-bold text-text-dim uppercase tracking-widest mb-4 px-1">
                      {t('tabs.workout')}
                    </h2>
                  )}

                  <div className="timer-grid-list">
                    {timers.filter(t => t.isPreset && (t.tags.includes('workout') || t.tags.includes('focus'))).map((timer) => (
                      <div key={timer.id} className="timer-reorder-item">
                        <TimerCard
                          timer={timer}
                          isActive={activeTimerId === timer.id}
                          onStart={handleStart}
                          onPause={handlePause}
                          onEdit={handleEditTimer}
                          onDuplicate={handleDuplicateTimer}
                          onDelete={handleDeleteTimer}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

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

      <AnimatePresence>
        {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} />}
      </AnimatePresence>

      <div className="bg-glow"></div>
    </div >
  );
}

export default App;
