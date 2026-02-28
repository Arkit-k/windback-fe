"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  TrendingDown,
  Users,
  DollarSign,
  AlertTriangle,
  Zap,
  Mail,
  BarChart3,
  Shield,
  type LucideIcon,
} from "lucide-react";

interface StatItem {
  icon: LucideIcon;
  value: string;
  label: string;
}

const registerStats: StatItem[] = [
  {
    icon: DollarSign,
    value: "$136B",
    label: "Annual SaaS revenue lost to churn globally",
  },
  {
    icon: Users,
    value: "30%",
    label: "Average annual churn rate for SaaS companies",
  },
  {
    icon: TrendingDown,
    value: "5-7x",
    label: "More expensive to acquire than retain a customer",
  },
  {
    icon: AlertTriangle,
    value: "67%",
    label: "Of churn is preventable with timely intervention",
  },
];

const loginFeatures: StatItem[] = [
  {
    icon: Zap,
    value: "Instant Detection",
    label: "Catch cancellations the moment they happen via webhooks",
  },
  {
    icon: Mail,
    value: "AI Winback Emails",
    label: "Personalized recovery emails crafted by AI for each customer",
  },
  {
    icon: BarChart3,
    value: "Recovery Analytics",
    label: "Track recovery rates, MRR saved, and campaign performance",
  },
  {
    icon: Shield,
    value: "Cancel Flow Widget",
    label: "Embeddable widget that intercepts cancellations before they happen",
  },
];

const registerContent = {
  heading: (
    <>
      Every churned customer
      <br />
      is revenue you can recover.
    </>
  ),
  description:
    "SaaS companies lose billions each year to preventable churn. Windback helps you win them back with AI\u2011powered recovery emails.",
  stats: registerStats,
  footer: "Sources: ProfitWell, Recurly Research, Bain & Company",
};

const loginContent = {
  heading: (
    <>
      Welcome back.
      <br />
      Your revenue is waiting.
    </>
  ),
  description:
    "Pick up where you left off. Monitor churn events, send recovery campaigns, and watch your MRR bounce back.",
  stats: loginFeatures,
  footer: "Trusted by SaaS teams recovering thousands in MRR",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname.startsWith("/login");
  const content = isLogin ? loginContent : registerContent;
  const panelBackground = isLogin ? "/gradient-signin.jfif" : "/gradient-signup.jfif";

  return (
    <div
      className="relative flex min-h-screen bg-cover bg-center lg:bg-none"
      style={{ backgroundImage: `url('${panelBackground}')` }}
    >
      <div className="absolute inset-0 bg-slate-900/25 lg:hidden" />
      {/* Left panel */}
      <div
        className="relative hidden lg:flex lg:w-1/2 flex-col justify-between bg-cover bg-center text-white p-12"
        style={{ backgroundImage: `url('${panelBackground}')` }}
      >
        <div className="absolute inset-0 bg-slate-900/25" />
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Link href="/" className="font-display text-2xl font-semibold text-white">
            Windback<span>.</span>
          </Link>
        </motion.div>

        <div className="relative z-10 space-y-10">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h2 className="text-3xl font-semibold leading-tight tracking-tight">
              {content.heading}
            </h2>
            <p className="mt-3 text-white/70 text-base max-w-md">
              {content.description}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-6">
            {content.stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.35 + i * 0.1,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <stat.icon className="h-4 w-4 text-white/60" />
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-white/60 leading-snug">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p
          className="relative z-10 text-xs text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          {content.footer}
        </motion.p>
      </div>

      {/* Right panel — form */}
      <div className="relative z-10 flex w-full lg:w-1/2 flex-col items-center justify-center bg-transparent lg:bg-background px-4 py-12">
        <motion.div
          className="mb-8 lg:hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Link href="/" className="font-display text-2xl font-semibold text-white">
            Windback<span>.</span>
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
