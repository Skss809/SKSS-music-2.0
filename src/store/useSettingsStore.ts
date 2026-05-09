import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  background: string;
  backgroundOpacity: number;
  setBackground: (background: string) => void;
  setBackgroundOpacity: (opacity: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      background: '',
      backgroundOpacity: 0.2,
      setBackground: (background) => set({ background }),
      setBackgroundOpacity: (opacity) => set({ backgroundOpacity: opacity }),
    }),
    {
      name: 'skss-settings',
    }
  )
);
