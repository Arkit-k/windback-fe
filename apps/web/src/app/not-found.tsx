import Link from "next/link";
import Image from "next/image";
import { WindbackLogo } from "@/components/marketing/windback-logo";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
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

      {/* Header with logo */}
      <header className="absolute top-0 left-0 z-20 flex w-full items-center px-6 py-5">
        <Link href="/">
          <WindbackLogo variant="light" />
        </Link>
      </header>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-start gap-3 pl-[80px] pt-[50px] md:items-start md:justify-center md:pl-[120px] md:pt-0">
        <h1
          className="text-[5rem] font-semibold leading-none tracking-tight text-white drop-shadow-2xl md:text-[10rem]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          404
        </h1>
        <p
          className="text-base font-semibold tracking-tight text-white/90 drop-shadow md:text-xl"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Looks like you&apos;re lost in space
        </p>
        <Link
          href="/"
          className="mt-2 rounded-full border border-white/40 bg-white/10 px-6 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
