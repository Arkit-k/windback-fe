"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@windback/ui";
import { useState, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
const navLinks = [
  { href: "/#features", label: "Features", section: "features" },
  { href: "/#how-it-works", label: "How it Works", section: "how-it-works" },
  { href: "/pricing", label: "Pricing", section: "" },
  { href: "/docs", label: "Docs", section: "" },
];

function WindbackLogo() {
  return (
    <span id="navbar-logo" className="font-display text-xl font-semibold tracking-tight text-[var(--accent)] select-none">
      Windback<span className="text-[var(--accent)]">.</span>
    </span>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  // Detect active section in viewport
  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("");
      return;
    }

    const sectionIds = navLinks.map((l) => l.section).filter(Boolean);
    if (sectionIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [pathname]);

  // Close mobile menu on outside click
  const handleBackdropClick = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <>
      <motion.nav
        className="fixed left-0 right-0 top-0 z-40 transition-[background-color,border-color,box-shadow] duration-300"
        style={{
          backgroundColor: scrolled ? "var(--surface-1)" : "transparent",
          backdropFilter: scrolled ? "blur(8px)" : "none",
          borderBottom: scrolled
            ? "1px solid var(--border)"
            : "1px solid transparent",
          boxShadow: scrolled
            ? "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)"
            : "none",
        }}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center">
            <WindbackLogo />
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
              >
                <Link
                  href={link.href}
                  className="nav-link group relative py-1 text-sm transition-colors"
                  style={{
                    color:
                      activeSection === link.section
                        ? "var(--accent)"
                        : undefined,
                  }}
                  onClick={(e) => {
                    if (link.section) {
                      if (pathname !== "/") return;
                      e.preventDefault();
                      document.getElementById(link.section)?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  <span
                    className={
                      activeSection === link.section
                        ? "text-[var(--accent)]"
                        : "text-muted-foreground group-hover:text-foreground"
                    }
                  >
                    {link.label}
                  </span>
                  {/* Animated underline */}
                  <span
                    className="absolute bottom-0 left-0 h-[1.5px] bg-[var(--accent)] transition-[width] duration-200 ease-out group-hover:w-full"
                    style={{
                      width: activeSection === link.section ? "100%" : "0%",
                    }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {!authLoading && (
              isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Button
                    size="sm"
                    asChild
                    className="bg-gradient-to-r from-[var(--gradient-to)] to-[var(--gradient-from)] border-0 text-white shadow-[0_2px_12px_rgba(75,63,199,0.4)] hover:shadow-[0_4px_20px_rgba(75,63,199,0.55)] transition-all duration-200"
                  >
                    <Link href="/dashboard/projects">Dashboard</Link>
                  </Button>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/login">Log in</Link>
                    </Button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.45, duration: 0.3 }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Button
                      size="sm"
                      asChild
                      className="bg-gradient-to-r from-[var(--gradient-to)] to-[var(--gradient-from)] border-0 text-white shadow-[0_2px_12px_rgba(75,63,199,0.4)] hover:shadow-[0_4px_20px_rgba(75,63,199,0.55)] hover:scale-[1.03] transition-all duration-200"
                    >
                      <Link href="/register">Get Started</Link>
                    </Button>
                  </motion.div>
                </>
              )
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="overflow-hidden border-t border-border bg-card md:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="px-4 pb-4 pt-2">
                <div className="space-y-2">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.25 }}
                    >
                      <Link
                        href={link.href}
                        className="block rounded-sm px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                        onClick={(e) => {
                          setMobileOpen(false);
                          if (link.section) {
                            if (pathname !== "/") return;
                            e.preventDefault();
                            setTimeout(() => {
                              document.getElementById(link.section)?.scrollIntoView({ behavior: "smooth" });
                            }, 300);
                          }
                        }}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {isAuthenticated ? (
                    <Button asChild>
                      <Link href="/dashboard/projects">Dashboard</Link>
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" asChild>
                        <Link href="/login">Log in</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/register">Get Started</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      <div className="h-14" aria-hidden="true" />

      {/* Mobile backdrop overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
}
