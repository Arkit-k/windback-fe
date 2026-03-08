import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Full screen background image */}
      <Image
        src="/404.jfif"
        alt="404"
        fill
        className="object-cover object-center"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-6">
        <h1 className="text-[12rem] font-black leading-none tracking-tighter text-white drop-shadow-2xl">
          404
        </h1>
        <p className="text-2xl font-medium text-white/90 drop-shadow">
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
