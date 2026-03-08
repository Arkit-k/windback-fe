import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Desktop image */}
      <Image
        src="/404.jfif"
        alt="404"
        fill
        className="hidden object-cover object-center md:block"
        priority
      />

      {/* Mobile image */}
      <Image
        src="/404-mobile.jfif"
        alt="404"
        fill
        className="block object-cover object-center md:hidden"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content — centered on desktop, 50px from top on mobile */}
      <div className="relative z-10 flex min-h-screen flex-col items-center gap-6 pt-[50px] md:justify-center md:pt-0">
        <h1 className="text-[8rem] font-black leading-none tracking-tighter text-white drop-shadow-2xl md:text-[12rem]">
          404
        </h1>
        <p className="text-xl font-medium text-white/90 drop-shadow md:text-2xl">
          Looks like you&apos;re lost in space
        </p>
        <Link
          href="/"
          className="mt-2 rounded-full border border-white/40 bg-white/10 px-8 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
