import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  background: string;
  backgroundOpacity: number;
  blurBackground: boolean;
  setBackground: (background: string) => void;
  setBackgroundOpacity: (opacity: number) => void;
  setBlurBackground: (blur: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      background: '',
      backgroundOpacity: 0.2,
      blurBackground: true,
      setBackground: (background) => set({ background }),
      setBackgroundOpacity: (opacity) => set({ backgroundOpacity: opacity }),
      setBlurBackground: (blur) => set({ blurBackground: blur }),
    }),
    {
      name: 'skss-settings',
    }
  )
);
