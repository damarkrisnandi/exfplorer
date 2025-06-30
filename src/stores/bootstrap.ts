import type { Bootstrap, Event } from '@/lib/bootstrap-type'
import { create } from 'zustand'


interface BootstrapStore {
  bootstrap: Bootstrap | null;
  currentEvent: Event | null;
  nextEvent: Event | null;
  setBootstrap: (bootstrap: Bootstrap) => void;
}

const useBootstrapStore = create<BootstrapStore>((set) => ({
  bootstrap: null,
  currentEvent: null,
  nextEvent: null,
  setBootstrap: (bootstrap: Bootstrap) => {
    if (!bootstrap) {
      return
    }
    const currentEvent = bootstrap.events?.find((e) => e.is_current);
    const nextEvent = bootstrap.events?.find((e) => e.is_next);
    console.log('current event', currentEvent)
    set({
      bootstrap,
      currentEvent,
      nextEvent
    });
  },
}));

export default useBootstrapStore;
