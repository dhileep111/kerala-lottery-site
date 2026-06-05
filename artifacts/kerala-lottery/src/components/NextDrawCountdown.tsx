import { useEffect, useState, useRef, useCallback } from "react";

/**
 * NextDrawCountdown
 * -----------------
 * Live countdown to the next Kerala State Lottery draw.
 * Kerala draws happen daily at 3:00 PM IST, so this counts down to the next
 * 3:00 PM IST and rolls over automatically once that time passes.
 *
 * Timing is computed in IST using fixed-offset UTC math (India has no DST),
 * so the countdown is correct for every visitor regardless of their own
 * device timezone.
 *
 * Drop-in: no external dependencies. All styling is inline so it won't clash
 * with Tailwind / CSS modules / global CSS in your app. Override colours and
 * the upcoming-lottery label via props.
 *
 * Usage:
 *   <NextDrawCountdown />
 *   <NextDrawCountdown lotteryName="Karunya KR-757" accentColor="#f5b301" />
 */

export interface NextDrawCountdownProps {
  /** Draw hour in IST (24h). Kerala = 15 (3 PM). Default: 15 */
  drawHourIST?: number;
  /** Draw minute in IST. Default: 0 */
  drawMinuteIST?: number;
  /**
   * Minutes after draw time during which results are still being published.
   * During this window the widget shows a "results being published" state
   * instead of jumping to tomorrow's draw. Default: 60
   */
  resultWindowMinutes?: number;
  /** Name of the upcoming lottery, e.g. "Karunya KR-757". Optional. */
  lotteryName?: string;
  /** Primary card colour. Default: deep emerald. */
  backgroundColor?: string;
  /** Accent colour for the digits. Default: warm gold. */
  accentColor?: string;
  /** Text colour for labels on the card. Default: near-white. */
  textColor?: string;
  /** Extra className for the outer wrapper, if you need it. */
  className?: string;
  /** Inline style overrides merged onto the outer wrapper. */
  style?: React.CSSProperties;
  /**
   * Fires once when the countdown reaches draw time.
   * NOTE: use this for UX only (e.g. show a "Result is out" banner, or a
   * manual "Refresh" button). Do NOT use it to auto-refresh ad units —
   * forced ad refreshes are invalid traffic under AdSense policy.
   */
  onDrawReached?: () => void;
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // UTC+05:30
const DAY_MS = 24 * 60 * 60 * 1000;

interface DrawState {
  diffMs: number; // ms until target draw
  inResultWindow: boolean;
}

function computeDrawState(
  drawHourIST: number,
  drawMinuteIST: number,
  resultWindowMinutes: number
): DrawState {
  const now = Date.now();

  // Shift "now" into IST wall-clock so UTC getters read IST values.
  const istNow = new Date(now + IST_OFFSET_MS);
  const istWallDrawMs = Date.UTC(
    istNow.getUTCFullYear(),
    istNow.getUTCMonth(),
    istNow.getUTCDate(),
    drawHourIST,
    drawMinuteIST,
    0,
    0
  );

  // Real UTC instant of today's IST draw time.
  const todayDrawUtc = istWallDrawMs - IST_OFFSET_MS;
  const windowEnd = todayDrawUtc + resultWindowMinutes * 60 * 1000;

  const inResultWindow = now >= todayDrawUtc && now < windowEnd;
  const targetUtc = now >= todayDrawUtc ? todayDrawUtc + DAY_MS : todayDrawUtc;

  return { diffMs: Math.max(0, targetUtc - now), inResultWindow };
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatHourLabel(hour24: number, minute: number): string {
  const period = hour24 >= 12 ? "PM" : "AM";
  let h = hour24 % 12;
  if (h === 0) h = 12;
  return minute === 0
    ? `${h}:00 ${period}`
    : `${h}:${pad(minute)} ${period}`;
}

export default function NextDrawCountdown({
  drawHourIST = 15,
  drawMinuteIST = 0,
  resultWindowMinutes = 60,
  lotteryName,
  backgroundColor = "#0c3b2e",
  accentColor = "#f5b301",
  textColor = "#f4f1e8",
  className,
  style,
  onDrawReached,
}: NextDrawCountdownProps) {
  const [state, setState] = useState<DrawState>(() =>
    computeDrawState(drawHourIST, drawMinuteIST, resultWindowMinutes)
  );
  const firedRef = useRef(false);

  const tick = useCallback(() => {
    const next = computeDrawState(drawHourIST, drawMinuteIST, resultWindowMinutes);
    setState(next);
    if (next.inResultWindow && !firedRef.current) {
      firedRef.current = true;
      onDrawReached?.();
    }
    if (!next.inResultWindow) {
      firedRef.current = false; // re-arm for the next day
    }
  }, [drawHourIST, drawMinuteIST, resultWindowMinutes, onDrawReached]);

  useEffect(() => {
    tick(); // sync immediately on mount / prop change
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  const totalSeconds = Math.floor(state.diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const drawTimeLabel = formatHourLabel(drawHourIST, drawMinuteIST);

  const wrapperStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 480,
    margin: "0 auto",
    boxSizing: "border-box",
    background: `radial-gradient(120% 140% at 50% 0%, ${backgroundColor} 0%, #07271d 100%)`,
    color: textColor,
    borderRadius: 16,
    padding: "clamp(16px, 4vw, 24px)",
    border: `1px solid rgba(245, 179, 1, 0.25)`,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    textAlign: "center",
    fontFamily:
      "inherit, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    ...style,
  };

  const kickerStyle: React.CSSProperties = {
    fontSize: "clamp(11px, 2.6vw, 13px)",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    opacity: 0.78,
    margin: 0,
    fontWeight: 600,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "clamp(18px, 5vw, 24px)",
    fontWeight: 800,
    margin: "4px 0 16px",
    lineHeight: 1.2,
    color: accentColor,
  };

  const boxesStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    gap: "clamp(6px, 2vw, 12px)",
    flexWrap: "nowrap",
  };

  const boxStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "clamp(8px, 2.4vw, 14px) clamp(6px, 2.4vw, 12px)",
    minWidth: "clamp(54px, 18vw, 76px)",
    boxSizing: "border-box",
  };

  const numStyle: React.CSSProperties = {
    fontSize: "clamp(26px, 9vw, 40px)",
    fontWeight: 800,
    lineHeight: 1,
    color: accentColor,
    fontVariantNumeric: "tabular-nums",
    fontFeatureSettings: '"tnum" 1',
  };

  const unitStyle: React.CSSProperties = {
    display: "block",
    marginTop: 6,
    fontSize: "clamp(9px, 2.4vw, 11px)",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    opacity: 0.7,
  };

  const footStyle: React.CSSProperties = {
    margin: "16px 0 0",
    fontSize: "clamp(11px, 2.8vw, 13px)",
    opacity: 0.72,
  };

  // ----- Results-window state (3 PM → 4 PM IST) -----
  if (state.inResultWindow) {
    return (
      <div className={className} style={wrapperStyle} role="status" aria-live="polite">
        <style>{`@keyframes ndc-pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
        <p style={kickerStyle}>Live Now</p>
        <p style={{ ...titleStyle, marginBottom: 8 }}>
          {lotteryName ? `${lotteryName} result` : "Today's result"} is being published
        </p>
        <span
          style={{
            display: "inline-block",
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: accentColor,
            animation: "ndc-pulse 1.1s ease-in-out infinite",
          }}
          aria-hidden="true"
        />
        <p style={footStyle}>Refresh in a moment to see the winning numbers.</p>
      </div>
    );
  }

  // ----- Countdown state -----
  const boxes: { value: number; unit: string; show: boolean }[] = [
    { value: days, unit: "Days", show: days > 0 },
    { value: hours, unit: "Hours", show: true },
    { value: minutes, unit: "Mins", show: true },
    { value: seconds, unit: "Secs", show: true },
  ];

  const liveText = `${days > 0 ? `${days} days ` : ""}${hours} hours ${minutes} minutes ${seconds} seconds until the next draw`;

  return (
    <div className={className} style={wrapperStyle} role="timer" aria-live="off">
      <p style={kickerStyle}>Next Draw In</p>
      <p style={titleStyle}>{lotteryName ?? "Kerala Lottery"}</p>

      <div style={boxesStyle} aria-hidden="true">
        {boxes
          .filter((b) => b.show)
          .map((b) => (
            <div key={b.unit} style={boxStyle}>
              <span style={numStyle}>{pad(b.value)}</span>
              <span style={unitStyle}>{b.unit}</span>
            </div>
          ))}
      </div>

      {/* Screen-reader friendly, non-jittery text */}
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        {liveText}
      </span>

      <p style={footStyle}>Draw daily at {drawTimeLabel} IST</p>
    </div>
  );
}
