"use client";

import { Input } from "@windback/ui";
import { Search } from "lucide-react";

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search by email...",
  children,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-64">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>
      {children}
    </div>
  );
}
