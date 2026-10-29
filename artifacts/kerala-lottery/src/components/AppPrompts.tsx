import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useLang, t, ALT_LOCALES, type Lang } from "../lib/i18n";

type PageKind = "home" | "result" | "other" | "none";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_MS = 14 * 24 * 60 * 60 * 1000;
const RESULT_VIEW_MS = 8000;
const KEY_INSTALL_DISMISSED = "ktr_install_dismissed_until";
const KEY_PUSH_DISMISSED = "ktr_push_dismissed_until";
const KEY_INSTALLED = "ktr_pwa_installed";
const KEY_RESULT_VIEWED = "ktr_result_viewed";
const KEY_OS_LANG = "ktr_os_lang";

const NO_CHIP_PATHS = new Set(["/about", "/contact", "/disclaimer", "/privacy-policy", "/terms"]);

function pageKind(path: string): PageKind {
  const segs = path.split(/[?#]/)[0].split("/").filter(Boolean);
  if (segs[0] && (ALT_LOCALES as string[]).includes(segs[0])) segs.shift();
  const p = "/" + segs.join("/");
  if (p === "/") return "home";
  if (segs[0] === "results" || p === "/yesterday-result" || p === "/check-ticket") return "result";
  if (NO_CHIP_PATHS.has(p)) return "none";
  return "other";
}

function readStore(store: "local" | "session", key: string): string | null {
  try {
    return (store === "local" ? localStorage : sessionStorage).getItem(key);
  } catch {
    return null;
  }
}

function writeStore(store: "local" | "session", key: string, value: string) {
  try {
    (store === "local" ? localStorage : sessionStorage).setItem(key, value);
  } catch {
    /* storage blocked: fall back to in-memory state only */
  }
}

function isDismissed(key: string): boolean {
  return Number(readStore("local", key) || 0) > Date.now();
}

function isStandalone(): boolean {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
}

function track(event: string, lang: Lang) {
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, page_lang: lang });
}

// beforeinstallprompt can fire before React mounts, so capture it at module load.
let deferredInstall: BeforeInstallPromptEvent | null = null;
let installedThisLoad = false;
const installListeners = new Set<() => void>();
const notifyInstall = () => installListeners.forEach((fn) => fn());
let currentLang: Lang = "en";
let installShownTracked = false;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstall = e as BeforeInstallPromptEvent;
    notifyInstall();
  });
  window.addEventListener("appinstalled", () => {
    deferredInstall = null;
    if (!installedThisLoad && readStore("local", KEY_INSTALLED) !== "1") {
      track("pwa_installed", currentLang);
    }
    installedThisLoad = true;
    writeStore("local", KEY_INSTALLED, "1");
    notifyInstall();
  });
}

function withOneSignal(fn: (os: any) => void | Promise<void>) {
  const w = window as any;
  w.OneSignalDeferred = w.OneSignalDeferred || [];
  w.OneSignalDeferred.push(fn);
}

function syncLangTag(os: any, lang: Lang, force: boolean) {
  if (!force && readStore("local", KEY_OS_LANG) === lang) return;
  os.User.addTag("lang", lang);
  writeStore("local", KEY_OS_LANG, lang);
}

interface AdLayout {
  offset: number;
  rects: DOMRect[];
}

function hasFixedAncestor(el: Element | null): boolean {
  for (let i = 0; el && i < 6; i++, el = el.parentElement) {
    const pos = getComputedStyle(el).position;
    if (pos === "fixed" || pos === "sticky") return true;
  }
  return false;
}

// Fixed bars the chips must not cover: AdSense anchor ads, the mobile quickbar and the sticky header.
function measureAds(): AdLayout {
  const vh = window.innerHeight;
  const found = new Set<Element>();
  document
    .querySelectorAll(
      'header.header, nav.mobile-quickbar, ins.adsbygoogle[data-anchor-status], ins.adsbygoogle[data-anchor-shown], [id^="google_ads"], [id*="anchor-ad"], [class*="anchor-ad"]'
    )
    .forEach((el) => found.add(el));
  document.querySelectorAll('iframe[id^="aswift"]').forEach((f) => {
    if (f.parentElement) found.add(f.parentElement);
  });
  let offset = 0;
  const rects: DOMRect[] = [];
  found.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") return;
    if (!hasFixedAncestor(el)) return;
    rects.push(r);
    if (r.bottom >= vh - 24 && r.top > vh / 2) offset = Math.max(offset, vh - r.top + 8);
  });
  return { offset, rects };
}

export default function AppPrompts() {
  const lang = useLang();
  const [location] = useLocation();
  const kind = pageKind(location);
  const boxRef = useRef<HTMLDivElement>(null);

  const [, setInstallTick] = useState(0);
  const [installDismissed, setInstallDismissed] = useState(true);
  const [standalone, setStandalone] = useState(true);
  const [pushEligible, setPushEligible] = useState(false);
  const [pushDismissed, setPushDismissed] = useState(true);
  const [resultViewed, setResultViewed] = useState(false);
  const [ad, setAd] = useState<AdLayout>({ offset: 0, rects: [] });
  const [overlapHidden, setOverlapHidden] = useState(false);

  currentLang = lang;
  const langRef = useRef(lang);
  langRef.current = lang;

  useEffect(() => {
    setInstallDismissed(isDismissed(KEY_INSTALL_DISMISSED));
    setPushDismissed(isDismissed(KEY_PUSH_DISMISSED));
    setResultViewed(readStore("session", KEY_RESULT_VIEWED) === "1");
    setStandalone(isStandalone());
    const mq = window.matchMedia?.("(display-mode: standalone)");
    const onMq = () => setStandalone(isStandalone());
    mq?.addEventListener?.("change", onMq);
    const onInstall = () => setInstallTick((n) => n + 1);
    installListeners.add(onInstall);

    const pushCapable =
      "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
    let cancelled = false;
    const timers: number[] = [];

    withOneSignal((os) => {
      if (cancelled) return;
      const refreshEligible = () =>
        setPushEligible(
          pushCapable &&
            os.Notifications.isPushSupported() &&
            Notification.permission === "default" &&
            !os.User.PushSubscription.optedIn
        );
      refreshEligible();
      os.Notifications.addEventListener("permissionChange", refreshEligible);
      os.User.PushSubscription.addEventListener("change", (e: any) => {
        const was = !!e?.previous?.optedIn;
        const now = !!e?.current?.optedIn;
        if (!was && now) {
          track("push_subscribed", langRef.current);
          syncLangTag(os, langRef.current, true);
        } else if (was && !now) {
          track("push_unsubscribed", langRef.current);
        }
        refreshEligible();
      });
      // optedIn reads false until init finishes restoring state, so re-check briefly.
      if (pushCapable && Notification.permission === "granted") {
        [0, 3000, 10000].forEach((ms) =>
          timers.push(
            window.setTimeout(() => {
              if (!cancelled && os.User.PushSubscription.optedIn) syncLangTag(os, langRef.current, false);
            }, ms)
          )
        );
      }
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      mq?.removeEventListener?.("change", onMq);
      installListeners.delete(onInstall);
    };
  }, []);

  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    withOneSignal((os) => {
      if (os.User.PushSubscription.optedIn) syncLangTag(os, lang, false);
    });
  }, [lang]);

  useEffect(() => {
    if (kind !== "result" || resultViewed) return;
    const id = window.setTimeout(() => {
      writeStore("session", KEY_RESULT_VIEWED, "1");
      setResultViewed(true);
    }, RESULT_VIEW_MS);
    return () => clearTimeout(id);
  }, [kind, resultViewed]);

  const showInstall =
    kind !== "none" && !!deferredInstall && !standalone && !installDismissed && !installedThisLoad;
  const showPush = kind !== "none" && resultViewed && pushEligible && !pushDismissed;
  const anyChip = showInstall || showPush;

  const relayout = useCallback(() => {
    const next = measureAds();
    const sig = (l: AdLayout) =>
      l.offset + "|" + l.rects.map((r) => `${r.left},${r.top},${r.right},${r.bottom}`).join(";");
    setAd((prev) => (sig(prev) === sig(next) ? prev : next));
  }, []);

  useEffect(() => {
    if (!anyChip) return;
    relayout();
    let timer = 0;
    const schedule = () => {
      clearTimeout(timer);
      timer = window.setTimeout(relayout, 100);
    };
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "data-anchor-status"],
    });
    window.addEventListener("resize", schedule);
    return () => {
      clearTimeout(timer);
      mo.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [anyChip, relayout]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) {
      setOverlapHidden(false);
      return;
    }
    const b = box.getBoundingClientRect();
    const overlaps = ad.rects.some(
      (r) => b.left < r.right && b.right > r.left && b.top < r.bottom && b.bottom > r.top
    );
    setOverlapHidden(overlaps || b.top < 0);
  }, [ad, showInstall, showPush]);

  useEffect(() => {
    if (showInstall && !overlapHidden && !installShownTracked) {
      installShownTracked = true;
      track("pwa_install_prompt_shown", lang);
    }
  }, [showInstall, overlapHidden, lang]);

  if (!anyChip) return null;

  const onInstall = async () => {
    const evt = deferredInstall;
    if (!evt) return;
    deferredInstall = null;
    await evt.prompt();
    const choice = await evt.userChoice.catch(() => null);
    if (choice?.outcome === "dismissed") {
      writeStore("local", KEY_INSTALL_DISMISSED, String(Date.now() + DISMISS_MS));
      setInstallDismissed(true);
    }
    notifyInstall();
  };

  const onDismissInstall = () => {
    writeStore("local", KEY_INSTALL_DISMISSED, String(Date.now() + DISMISS_MS));
    setInstallDismissed(true);
  };

  const onPush = () => {
    track("push_prompt_clicked", lang);
    withOneSignal((os) => os.Slidedown.promptPush({ force: true }));
  };

  const onDismissPush = () => {
    writeStore("local", KEY_PUSH_DISMISSED, String(Date.now() + DISMISS_MS));
    setPushDismissed(true);
  };

  const wrap: React.CSSProperties = {
    position: "fixed",
    left: 12,
    bottom: ad.offset ? ad.offset : "calc(12px + env(safe-area-inset-bottom, 0px))",
    zIndex: 60,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
    maxWidth: "calc(100vw - 24px)",
    visibility: overlapHidden ? "hidden" : "visible",
    pointerEvents: overlapHidden ? "none" : "auto",
  };
  const chip: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    borderRadius: 999,
    boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
    overflow: "hidden",
    maxWidth: "100%",
  };
  const mainBtn: React.CSSProperties = {
    border: 0,
    background: "transparent",
    color: "inherit",
    font: "inherit",
    cursor: "pointer",
    padding: "10px 6px 10px 16px",
    textAlign: "left",
    lineHeight: 1.2,
    minHeight: 44,
  };
  const closeBtn: React.CSSProperties = {
    border: 0,
    background: "transparent",
    color: "inherit",
    font: "inherit",
    fontSize: 18,
    cursor: "pointer",
    width: 40,
    minHeight: 44,
    opacity: 0.75,
  };

  return (
    <div ref={boxRef} style={wrap} data-app-prompts="">
      {showPush && (
        <div style={{ ...chip, background: "#15803d", color: "#ffffff" }}>
          <button type="button" style={mainBtn} onClick={onPush}>
            <span style={{ display: "block", fontWeight: 700, fontSize: 14 }}>
              🔔 {t(lang, "pushGetAlerts")}
            </span>
            <span style={{ display: "block", fontSize: 12, opacity: 0.85 }}>
              {t(lang, "pushGetAlertsSub")}
            </span>
          </button>
          <button type="button" style={closeBtn} onClick={onDismissPush} aria-label={t(lang, "pushDismiss")}>
            ×
          </button>
        </div>
      )}
      {showInstall && (
        <div style={{ ...chip, background: "#ffffff", color: "#15803d", border: "1px solid #15803d" }}>
          <button type="button" style={{ ...mainBtn, fontWeight: 700, fontSize: 14 }} onClick={onInstall}>
            ⬇ {t(lang, "pwaInstall")}
          </button>
          <button type="button" style={closeBtn} onClick={onDismissInstall} aria-label={t(lang, "pwaInstallDismiss")}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
