"use client";

import { Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@windback/ui";
import { useAuth } from "@/hooks/use-auth";
import { User, LogOut, BookOpen, Menu, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { DOCS_URL } from "@/lib/constants";
import { useMobileSidebar, useDashboardTheme } from "@/app/dashboard/layout";

export function Topbar() {
  const { user, logout } = useAuth();
  const { setOpen } = useMobileSidebar();
  const { isDark, toggle } = useDashboardTheme();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card text-foreground px-4 md:px-6">
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden md:block" />

      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={() => toggle()}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <Button variant="ghost" size="sm" asChild>
          <Link href={DOCS_URL} target="_blank">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Docs</span>
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className="hidden sm:inline">{user?.name || "User"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <User className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout.mutate()}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
