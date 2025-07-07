import type { Reference } from "@/lib/reference-type";
import { create } from "zustand";

interface ReferenceStore {
  reference: Reference,
  setReference: (ref: Reference) => void;
}

const useReferenceStore = create<ReferenceStore>((set) => ({
  reference: {
    bootstrap: null,
    bootstrapHistory: null,
    fixtures: [],
    fixturesHistory: [],
    liveEvents: []
  },
  setReference: (ref: Reference) => {
    set({
      reference: ref
    })
  }
}))

export default useReferenceStore;
