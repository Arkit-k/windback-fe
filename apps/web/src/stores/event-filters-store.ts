"use client";

import { create } from "zustand";
import type { ChurnEventStatus } from "@/types/api";

interface EventFiltersState {
  statusFilter: ChurnEventStatus | "all";
  setStatusFilter: (status: ChurnEventStatus | "all") => void;
}

export const useEventFiltersStore = create<EventFiltersState>()((set) => ({
  statusFilter: "all",
  setStatusFilter: (statusFilter) => set({ statusFilter }),
}));
