import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans">
      {/* Desktop image — anchored left */}
      <Image
        src="/404.jfif"
        alt="404"
        fill
        className="hidden object-cover object-left md:block"
        priority
      />

      {/* Mobile image — anchored left */}
      <Image
        src="/404-mobile.jfif"
        alt="404"
        fill
        className="block object-cover object-left md:hidden"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Header with logo — Instrument Serif */}
      <header className="absolute top-0 left-0 z-20 flex w-full items-center px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icon.svg" alt="Windback" width={28} height={28} />
          <span className="font-display text-xl font-semibold text-white">Windback</span>
        </Link>
      </header>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-start gap-3 pl-[80px] pt-[50px] md:items-start md:justify-center md:pl-[120px] md:pt-0">
        <h1 className="font-display text-[5rem] font-semibold leading-none tracking-tight text-white drop-shadow-2xl md:text-[10rem]">
          404
        </h1>
        <p className="font-display text-base font-semibold text-white/90 drop-shadow md:text-xl">
          Looks like you&apos;re lost in space
        </p>
        <Link
          href="/"
          className="mt-2 rounded-full border border-white/40 bg-white/10 px-6 py-2.5 font-sans text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
