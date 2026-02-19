"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ConfettiBurst } from "@/components/animations/confetti-burst";
import {
  ArrowUpRight,
  Mail,
  CheckCircle2,
  TrendingUp,
  Webhook,
} from "lucide-react";

/* ── Types ── */
interface CardPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CardConfig {
  id: string;
  label: string;
  defaultX: number;
  defaultY: number;
}

/* ── Card default positions (relative to container) ── */
const CARD_DEFAULTS: CardConfig[] = [
  { id: "detect", label: "DETECT", defaultX: 20, defaultY: 16 },
  { id: "analyze", label: "ANALYZE", defaultX: 310, defaultY: 60 },
  { id: "send", label: "SEND", defaultX: 30, defaultY: 240 },
  { id: "recover", label: "RECOVER", defaultX: 300, defaultY: 320 },
];

/* ── Compute a smooth bezier curve between connector dots on card edges ── */
function computePath(
  from: CardPosition,
  to: CardPosition,
  containerW: number,
  containerH: number
): string {
  // Connect from right-edge dot of "from" card to left-edge dot of "to" card
  const rawX1 = from.x + from.width; // right edge
  const rawY1 = from.y + from.height / 2; // vertical center
  const rawX2 = to.x; // left edge
  const rawY2 = to.y + to.height / 2; // vertical center

  // Scale DOM pixel positions into SVG viewBox (0 0 520 420)
  const scaleX = containerW > 0 ? 520 / containerW : 1;
  const scaleY = containerH > 0 ? 420 / containerH : 1;

  const x1 = rawX1 * scaleX;
  const y1 = rawY1 * scaleY;
  const x2 = rawX2 * scaleX;
  const y2 = rawY2 * scaleY;

  const dx = x2 - x1;
  const dy = y2 - y1;

  // Control points for a smooth S-curve
  const cx1 = x1 + dx * 0.45;
  const cy1 = y1;
  const cx2 = x2 - dx * 0.45;
  const cy2 = y2;

  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
}

/* ── Connector dot on the edge of a card ── */
function ConnectorDot({
  side,
  active,
}: {
  side: "right" | "left";
  active: boolean;
}) {
  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full border-2 transition-all duration-300 ${
        active
          ? "border-[var(--accent)] bg-[var(--accent)] scale-110"
          : "border-[var(--accent)]/40 bg-card"
      } ${side === "right" ? "-right-1.5" : "-left-1.5"}`}
    />
  );
}

/* ── Draggable Card wrapper ── */
function DraggableCard({
  id,
  defaultX,
  defaultY,
  constraintsRef,
  onPositionChange,
  children,
}: {
  id: string;
  defaultX: number;
  defaultY: number;
  constraintsRef: React.RefObject<HTMLDivElement | null>;
  onPositionChange: (id: string, rect: CardPosition) => void;
  children: React.ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const reportPosition = useCallback(() => {
    if (!cardRef.current || !constraintsRef.current) return;
    const containerRect = constraintsRef.current.getBoundingClientRect();
    const cardRect = cardRef.current.getBoundingClientRect();
    onPositionChange(id, {
      x: cardRect.left - containerRect.left,
      y: cardRect.top - containerRect.top,
      width: cardRect.width,
      height: cardRect.height,
    });
  }, [id, onPositionChange, constraintsRef]);

  // Report initial position after mount
  useEffect(() => {
    const timer = setTimeout(reportPosition, 100);
    return () => clearTimeout(timer);
  }, [reportPosition]);

  return (
    <motion.div
      ref={cardRef}
      className="absolute z-10 cursor-grab active:cursor-grabbing select-none"
      style={{ left: defaultX, top: defaultY, x, y }}
      drag
      dragConstraints={constraintsRef}
      dragElastic={0.05}
      dragMomentum={false}
      onDrag={reportPosition}
      onDragEnd={reportPosition}
      whileDrag={{ scale: 1.05, zIndex: 50 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

/* ── Animated traveling dot along a path ── */
function TravelingDot({
  pathData,
  duration,
  delay,
  size,
  opacity,
}: {
  pathData: string;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
}) {
  return (
    <circle r={size} fill="var(--accent)" opacity={opacity}>
      <animateMotion
        dur={`${duration}s`}
        repeatCount="indefinite"
        begin={`${delay}s`}
        path={pathData}
      />
    </circle>
  );
}

/* ── Main Component ── */
export function AbstractVisual({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Record<string, CardPosition>>({});
  const [containerSize, setContainerSize] = useState({ w: 520, h: 420 });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [celebrationFired, setCelebrationFired] = useState(false);

  // Track container size for SVG coordinate scaling
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ w: rect.width, h: rect.height });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const handlePositionChange = useCallback(
    (id: string, pos: CardPosition) => {
      setPositions((prev) => ({ ...prev, [id]: pos }));
      if (!hasInteracted) setHasInteracted(true);
    },
    [hasInteracted]
  );

  // Build paths between sequential cards
  const connections = [
    { from: "detect", to: "analyze" },
    { from: "analyze", to: "send" },
    { from: "send", to: "recover" },
  ];

  const paths = connections
    .map((conn) => {
      const fromPos = positions[conn.from];
      const toPos = positions[conn.to];
      if (!fromPos || !toPos) return null;
      return {
        ...conn,
        d: computePath(fromPos, toPos, containerSize.w, containerSize.h),
      };
    })
    .filter(Boolean) as { from: string; to: string; d: string }[];

  const allConnected = paths.length === 3;

  // Fire confetti once when all cards connect
  useEffect(() => {
    if (allConnected && !celebrationFired) {
      setCelebrationFired(true);
    }
  }, [allConnected, celebrationFired]);

  return (
    <div className={`relative ${className ?? ""}`}>
      <div
        ref={containerRef}
        className="relative h-[360px] w-[440px] sm:h-[420px] sm:w-[520px] overflow-hidden"
      >
        {/* ── SVG layer: connectors + grid ── */}
        <svg
          viewBox="0 0 520 420"
          fill="none"
          className="absolute inset-0 h-full w-full pointer-events-none"
          style={{ zIndex: 2 }}
        >
          <defs>
            <linearGradient
              id="flowGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor="var(--accent)"
                stopOpacity="0.4"
              />
              <stop
                offset="100%"
                stopColor="var(--accent)"
                stopOpacity="0.1"
              />
            </linearGradient>
            <linearGradient
              id="flowGradActive"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor="var(--accent)"
                stopOpacity="0.6"
              />
              <stop
                offset="100%"
                stopColor="var(--accent)"
                stopOpacity="0.25"
              />
            </linearGradient>
          </defs>

          {/* Dot grid background */}
          <pattern
            id="dotGrid"
            x="0"
            y="0"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="1"
              cy="1"
              r="0.8"
              fill="var(--accent)"
              opacity="0.08"
            />
          </pattern>
          <rect width="520" height="420" fill="url(#dotGrid)" />

          {/* Dynamic connector paths */}
          {paths.map((path, i) => (
            <g key={`${path.from}-${path.to}`}>
              {/* Path line */}
              <motion.path
                d={path.d}
                stroke={allConnected ? "url(#flowGradActive)" : "url(#flowGrad)"}
                strokeWidth={allConnected ? 2 : 1.5}
                strokeDasharray={allConnected ? "none" : "6 4"}
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
              />

              {/* Traveling dots — only when all connected */}
              {allConnected && (
                <>
                  <TravelingDot
                    pathData={path.d}
                    duration={4}
                    delay={i * 1.3}
                    size={3}
                    opacity={0.7}
                  />
                  <TravelingDot
                    pathData={path.d}
                    duration={4}
                    delay={i * 1.3 + 2}
                    size={2}
                    opacity={0.35}
                  />
                </>
              )}
            </g>
          ))}
        </svg>

        {/* ── Step labels ── */}
        {allConnected && (
          <>
            <motion.div
              className="absolute left-[42%] top-[2%] z-[3] text-[9px] font-medium uppercase tracking-wider text-[var(--accent)]/60"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              detect
            </motion.div>
            <motion.div
              className="absolute right-[12%] top-[38%] z-[3] text-[9px] font-medium uppercase tracking-wider text-[var(--accent)]/60"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              analyze
            </motion.div>
            <motion.div
              className="absolute left-[18%] bottom-[28%] z-[3] text-[9px] font-medium uppercase tracking-wider text-[var(--accent)]/60"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              send
            </motion.div>
          </>
        )}

        {/* ── Hint text ── */}
        {!hasInteracted && (
          <motion.div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 text-[10px] text-muted-foreground/60 bg-card/80 backdrop-blur-sm px-3 py-1 rounded-full border border-border/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Drag cards to explore the flow
          </motion.div>
        )}

        {/* ── Confetti burst when all connected ── */}
        <ConfettiBurst trigger={celebrationFired} count={24} duration={1800} />

        {/* ── Celebration pulse when all connected ── */}
        {allConnected && (
          <motion.div
            className="absolute inset-0 z-[1] rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(ellipse at center, var(--accent), transparent 70%)",
            }}
          />
        )}

        {/* ── Draggable Cards ── */}

        {/* Card 1: Cancellation detected */}
        <DraggableCard
          id="detect"
          defaultX={20}
          defaultY={16}
          constraintsRef={containerRef}
          onPositionChange={handlePositionChange}
        >
          <div className="rounded-sm border border-border/50 bg-card px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow">
            <ConnectorDot side="right" active={!!positions["analyze"]} />
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-amber-50">
                <Webhook className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">
                  Cancellation detected
                </p>
                <p className="text-[11px] font-medium text-foreground">
                  sarah@acme.co
                </p>
              </div>
            </div>
          </div>
        </DraggableCard>

        {/* Card 2: Recovery Rate */}
        <DraggableCard
          id="analyze"
          defaultX={310}
          defaultY={60}
          constraintsRef={containerRef}
          onPositionChange={handlePositionChange}
        >
          <div className="rounded-sm border border-border/50 bg-card px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
            <ConnectorDot side="left" active={!!positions["detect"]} />
            <ConnectorDot side="right" active={!!positions["send"]} />
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[var(--accent-light)]">
                <TrendingUp className="h-4 w-4 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">
                  Recovery Rate
                </p>
                <p className="text-lg font-semibold leading-tight text-foreground">
                  26.6%
                </p>
              </div>
              <span className="ml-1 rounded-sm bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-600">
                +4.2%
              </span>
            </div>
          </div>
        </DraggableCard>

        {/* Card 3: Email sent */}
        <DraggableCard
          id="send"
          defaultX={30}
          defaultY={240}
          constraintsRef={containerRef}
          onPositionChange={handlePositionChange}
        >
          <div className="rounded-sm border border-border/50 bg-card px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow">
            <ConnectorDot side="left" active={!!positions["analyze"]} />
            <ConnectorDot side="right" active={!!positions["recover"]} />
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-blue-50">
                <Mail className="h-4 w-4 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-foreground">
                  Recovery email sent
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Winback variant #3 of 9
                </p>
              </div>
            </div>
          </div>
        </DraggableCard>

        {/* Card 4: Customer recovered */}
        <DraggableCard
          id="recover"
          defaultX={300}
          defaultY={320}
          constraintsRef={containerRef}
          onPositionChange={handlePositionChange}
        >
          <div className={`rounded-sm border border-green-200/60 bg-green-50/95 px-4 py-2.5 shadow-sm hover:shadow-md transition-all ${allConnected ? "shadow-green-200/50 shadow-lg" : ""}`}>
            <ConnectorDot side="left" active={!!positions["send"]} />
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`h-4 w-4 text-green-600 ${allConnected ? "animate-bounce" : ""}`} />
              <div>
                <p className="text-[11px] font-medium text-green-800">
                  Customer recovered!
                </p>
                <div className="flex items-baseline gap-1">
                  <p className="text-[10px] text-green-600/70">
                    $99/mo MRR restored
                  </p>
                  <ArrowUpRight className="h-2.5 w-2.5 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        </DraggableCard>
      </div>
    </div>
  );
}
