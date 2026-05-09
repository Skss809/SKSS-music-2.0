import React, { useState, useRef, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Settings as SettingsIcon, Image as ImageIcon, X, Upload, Check, Sliders, Palette, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export function SettingsDialog({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const { background, setBackground, backgroundOpacity, setBackgroundOpacity } = useSettingsStore();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    onOpenChange(false);
  };

  const presets = [
    '',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514525253361-bee8d4ca7274?q=80&w=2052&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1420161907993-95d8787c2a18?q=80&w=2070&auto=format&fit=crop',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setBackground(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-0 focus:outline-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl mx-4"
          >
            <div className="relative p-6 md:p-8">
              <Dialog.Close className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-zinc-400 transition-colors">
                <X size={20} />
              </Dialog.Close>

              <div className="mb-8">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4">
                  <SettingsIcon className="text-black" size={24} />
                </div>
                <Dialog.Title className="text-2xl font-bold text-white mb-1">
                  Settings
                </Dialog.Title>
                <Dialog.Description className="text-zinc-400 text-sm">
                  Personalize your experience and system preferences
                </Dialog.Description>
              </div>

              <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* User Profile Section */}
                {currentUser && (
                  <section className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="Avatar" className="w-12 h-12 rounded-xl object-cover border border-white/20" />
                      ) : (
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-xl">
                          {currentUser.displayName?.[0] || currentUser.email?.[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-bold">{currentUser.displayName || 'User'}</p>
                        <p className="text-xs text-zinc-500 font-mono tracking-tight">{currentUser.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors group"
                      title="Sign Out"
                    >
                      <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                  </section>
                )}

                {/* Background Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-xs">
                    <Palette size={16} className="text-indigo-500" />
                    Custom Background
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {presets.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setBackground(p)}
                        className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                          background === p ? 'border-white scale-[1.02]' : 'border-transparent hover:border-white/20'
                        }`}
                      >
                        {p ? (
                          <img src={p} className="w-full h-full object-cover" alt={`Preset ${i}`} />
                        ) : (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 uppercase">
                            Default
                          </div>
                        )}
                        {background === p && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Check size={20} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="relative aspect-video rounded-xl overflow-hidden border-2 border-dashed border-white/20 hover:border-white/40 flex flex-col items-center justify-center gap-2 transition-all text-zinc-400 hover:text-white"
                    >
                      <Upload size={20} />
                      <span className="text-[10px] font-bold uppercase">Upload</span>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        accept="image/*"
                      />
                    </button>
                  </div>

                  {background && (
                    <div className="space-y-3 pt-2">
                       <div className="flex justify-between items-center text-xs font-bold text-zinc-500 uppercase">
                        <span>Background Opacity</span>
                        <span className="text-white">{(backgroundOpacity * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={backgroundOpacity}
                        onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  )}
                </section>

                {/* System Section (Placeholder for future settings) */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-xs">
                    <Sliders size={16} className="text-indigo-500" />
                    System
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">High Quality Audio</p>
                        <p className="text-[10px] text-zinc-500">Enable 320kbps streaming (requires more data)</p>
                      </div>
                      <div className="w-10 h-5 bg-indigo-600 rounded-full relative">
                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between opacity-50">
                      <div>
                        <p className="text-sm font-bold text-white">Gapless Playback</p>
                        <p className="text-[10px] text-zinc-500">Experimental: crossfade between tracks</p>
                      </div>
                      <div className="w-10 h-5 bg-zinc-700 rounded-full relative">
                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => onOpenChange(false)}
                  className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-[0.98]"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
