"use client";

import {
  ArrowRight,
  Blueprint,
  CalendarBlank,
  Check,
  ClipboardText,
  Cube,
  Fan,
  ForkKnife,
  Gauge,
  Lightbulb,
  Scales,
  SquaresFour,
  UsersThree,
  Wallet,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  imagePath,
  stageOrder as order,
  stages,
  type BudgetIcon,
  type FeatureIconName,
  type Stage,
  type StageId,
} from "./entero-content";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { WhyEntero } from "./WhyEntero";
import { ContactForm } from "./ContactForm";
import { collectLeadAttribution } from "./lead-attribution";

export function EnteroPrototype({
  initialStage,
  initialFormOpen = false,
}: {
  initialStage: StageId;
  initialFormOpen?: boolean;
}) {
  const [activeId, setActiveId] = useState<StageId>(initialStage);
  const [requestedId, setRequestedId] = useState<StageId>(initialStage);
  const [fromId, setFromId] = useState<StageId | null>(null);
  const [incomingId, setIncomingId] = useState<StageId | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const startTime = useRef(0);
  const activePointerId = useRef<number | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const gestureActive = useRef(false);
  const suppressClick = useRef(false);
  const [transitionDirection, setTransitionDirection] = useState<"next" | "previous" | "idle">("idle");
  const [formOpen, setFormOpen] = useState(initialFormOpen);
  const imageCache = useRef(new Map<string, Promise<void>>());
  const selectionToken = useRef(0);
  const transitionToken = useRef(0);
  const runningAnimations = useRef<Animation[]>([]);
  const contentSwapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = stages[activeId];

  const openForm = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("form", "contact");
    window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("form");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    setFormOpen(false);
  }, []);

  useEffect(() => {
    collectLeadAttribution(initialStage);
  }, [initialStage]);

  useEffect(() => {
    const onPopState = () => setFormOpen(new URL(window.location.href).searchParams.get("form") === "contact");
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const loadImage = useCallback((url: string) => {
    const cached = imageCache.current.get(url);
    if (cached) return cached;

    const pending = new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = async () => {
        try {
          await image.decode();
          resolve();
        } catch {
          if (image.naturalWidth > 0) resolve();
          else reject(new Error(`Unable to decode ${url}`));
        }
      };
      image.onerror = () => reject(new Error(`Unable to load ${url}`));
      image.src = url;
    }).catch((error) => {
      imageCache.current.delete(url);
      throw error;
    });

    imageCache.current.set(url, pending);
    return pending;
  }, []);

  const prepareStageImage = useCallback(async (stage: StageId) => {
    const viewport = window.matchMedia("(max-width: 700px)").matches ? "mobile" : "desktop";
    try {
      await loadImage(`${imagePath(stage, viewport)}.avif`);
    } catch {
      await loadImage(`${imagePath(stage, viewport)}.webp`);
    }
  }, [loadImage]);

  const finishRunningAnimations = useCallback(() => {
    if (contentSwapTimer.current) {
      clearTimeout(contentSwapTimer.current);
      contentSwapTimer.current = null;
    }
    for (const animation of runningAnimations.current) {
      try {
        animation.finish();
        animation.cancel();
      } catch {
        animation.cancel();
      }
    }
    runningAnimations.current = [];
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const current = order.indexOf(activeId);
      const adjacent = [order[current - 1], order[current + 1]].filter(Boolean) as StageId[];
      for (const id of adjacent) void prepareStageImage(id);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [activeId, prepareStageImage]);

  useEffect(() => () => finishRunningAnimations(), [finishRunningAnimations]);

  useLayoutEffect(() => {
    if (!fromId || !incomingId || transitionDirection === "idle" || !carouselRef.current) return;

    const root = carouselRef.current;
    const picture = root.querySelector<HTMLElement>('.scene-picture[data-state="active"]');
    const copy = root.querySelector<HTMLElement>(".hero-copy");
    const dim = root.querySelector<HTMLElement>(".scene-transition-dim");
    const light = root.querySelector<HTMLElement>(".scene-transition-light");
    if (!picture || !copy || !dim) return;

    finishRunningAnimations();
    const currentTransition = ++transitionToken.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sign = transitionDirection === "next" ? 1 : -1;
    const animate = (
      element: HTMLElement,
      keyframes: Keyframe[],
      options: KeyframeAnimationOptions,
      easing = "cubic-bezier(0.16, 1, 0.3, 1)",
    ) => {
      element.style.willChange = "opacity, transform";
      const animation = element.animate(keyframes, { fill: "both", easing, ...options });
      runningAnimations.current.push(animation);
      return animation;
    };

    const pictureAnimation = animate(
      picture,
      reduceMotion
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            {
              opacity: 0,
              transform: `translate3d(${sign * 5}px, 0, 0) scale(1.008)`,
              offset: 0,
              easing: "cubic-bezier(0.77, 0, 0.175, 1)",
            },
            {
              opacity: 0.78,
              transform: `translate3d(${sign * 2}px, 0, 0) scale(1.0035)`,
              offset: 0.62,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            },
            { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
          ],
      { duration: reduceMotion ? 180 : 1800, delay: reduceMotion ? 0 : 200 },
      "linear",
    );

    animate(
      dim,
      reduceMotion
        ? [{ opacity: 0 }, { opacity: 0.3 }]
        : [{ opacity: 0 }, { opacity: 0.55 }],
      { duration: reduceMotion ? 90 : 420 },
      "cubic-bezier(0.77, 0, 0.175, 1)",
    );

    animate(
      copy,
      [{ opacity: 1 }, { opacity: reduceMotion ? 0.86 : 0.72 }],
      { duration: reduceMotion ? 90 : 360 },
      "cubic-bezier(0.77, 0, 0.175, 1)",
    );

    if (light && !reduceMotion) {
      animate(light, [
        { opacity: 0, transform: `translate3d(${sign * -120}%, 0, 0) skewX(-10deg)` },
        { opacity: 0.1, offset: 0.52 },
        { opacity: 0, transform: `translate3d(${sign * 120}%, 0, 0) skewX(-10deg)` },
      ], { duration: 1500, delay: 260 });
    }

    const transitionStage = incomingId;
    contentSwapTimer.current = setTimeout(() => {
      if (transitionToken.current === currentTransition) setActiveId(transitionStage);
    }, reduceMotion ? 90 : 210);

    void pictureAnimation.finished.then(() => {
      if (transitionToken.current !== currentTransition) return;
      picture.style.willChange = "";
      copy.style.willChange = "";
      dim.style.willChange = "";
      finishRunningAnimations();
      setActiveId(transitionStage);
      setFromId(null);
      setIncomingId(null);
      setTransitionDirection("idle");
    }).catch(() => undefined);
  }, [finishRunningAnimations, fromId, incomingId, transitionDirection]);

  useLayoutEffect(() => {
    if (transitionDirection === "idle" || !carouselRef.current || activeId !== incomingId) return;
    const root = carouselRef.current;
    const copy = root.querySelector<HTMLElement>(".hero-copy");
    const panel = root.querySelector<HTMLElement>(".context-panel");
    const detail = root.querySelector<HTMLElement>(".detail-inner");
    if (!copy || !panel || !detail) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sign = transitionDirection === "next" ? 1 : -1;
    const animate = (element: HTMLElement, opacity: number, duration: number, delay: number, offset: number) => {
      element.style.willChange = "opacity, transform";
      const animation = element.animate(
        reduceMotion
          ? [{ opacity }, { opacity: 1 }]
          : [{ opacity, transform: `translate3d(${sign * offset}px, 0, 0)` }, { opacity: 1, transform: "translate3d(0, 0, 0)" }],
        { duration: reduceMotion ? 90 : duration, delay: reduceMotion ? 0 : delay, fill: "both", easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      );
      runningAnimations.current.push(animation);
    };
    animate(copy, 0.88, 1050, 0, 5);

    panel.style.willChange = "opacity";
    const panelAnimation = panel.animate(
      [{ opacity: reduceMotion ? 0.82 : 0.9 }, { opacity: 1 }],
      {
        duration: reduceMotion ? 160 : 1200,
        delay: reduceMotion ? 0 : 70,
        fill: "both",
        easing: "cubic-bezier(0.23, 1, 0.32, 1)",
      },
    );
    runningAnimations.current.push(panelAnimation);

    const panelParts = panel.dataset.variant === "comparison"
      ? Array.from(panel.querySelectorAll<HTMLElement>(
          ":scope > .comparison-heading, :scope > .comparison-columns, :scope > .comparison-table > .comparison-row, :scope > p",
        ))
      : panel.dataset.variant === "budget"
        ? Array.from(panel.querySelectorAll<HTMLElement>(
            ":scope > .context-heading, :scope > .budget-list > .budget-row, :scope > .budget-total",
          ))
      : Array.from(panel.querySelectorAll<HTMLElement>(
          ":scope > .context-heading, :scope > ul > li, :scope > p",
        ));
    const stagger = 80;
    const partDuration = Math.max(900, 1830 - Math.max(0, panelParts.length - 1) * stagger);

    panelParts.forEach((part, index) => {
      part.style.willChange = "opacity, transform";
      const partAnimation = part.animate(
        reduceMotion
          ? [{ opacity: 0.72 }, { opacity: 1 }]
          : [
              { opacity: 0.08, transform: "translate3d(0, 8px, 0)" },
              { opacity: 1, transform: "translate3d(0, 0, 0)" },
            ],
        {
          duration: reduceMotion ? 160 : partDuration,
          delay: reduceMotion ? index * 18 : 120 + index * stagger,
          fill: "both",
          easing: "cubic-bezier(0.23, 1, 0.32, 1)",
        },
      );
      runningAnimations.current.push(partAnimation);
    });

    animate(detail, 0.9, 1300, 180, 4);
  }, [activeId, incomingId, transitionDirection]);

  const select = useCallback(
    async (nextId: StageId, focus = false, direction: "next" | "previous" | "idle" = "idle") => {
      if (nextId === requestedId) return;
      const token = ++selectionToken.current;
      setRequestedId(nextId);
      const resolvedDirection = direction === "idle"
        ? order.indexOf(nextId) > order.indexOf(requestedId) ? "next" : "previous"
        : direction;

      try {
        await prepareStageImage(nextId);
      } catch {
        if (token === selectionToken.current) setRequestedId(activeId);
        return;
      }
      if (token !== selectionToken.current) return;
      const transitionFrom = incomingId ?? activeId;
      transitionToken.current += 1;
      finishRunningAnimations();
      setActiveId(transitionFrom);
      setFromId(transitionFrom);
      setIncomingId(nextId);
      setTransitionDirection(resolvedDirection);

      const url = new URL(window.location.href);
      url.searchParams.set("stage", nextId);
      window.history.replaceState({}, "", `${url.pathname}${url.search}`);

      const index = order.indexOf(nextId);
      if (focus) requestAnimationFrame(() => tabRefs.current[index]?.focus());
    },
    [activeId, finishRunningAnimations, incomingId, prepareStageImage, requestedId],
  );

  const move = (direction: 1 | -1) => {
    const current = order.indexOf(requestedId);
    const next = Math.max(0, Math.min(order.length - 1, current + direction));
    if (next === current) return false;
    void select(order[next], false, direction > 0 ? "next" : "previous");
    return true;
  };

  const resetSwipe = () => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.style.setProperty("--gesture-progress", "0");
      carousel.removeAttribute("data-dragging");
      carousel.removeAttribute("data-swipe");
    }
    startX.current = null;
    startY.current = null;
    activePointerId.current = null;
    gestureActive.current = false;
  };

  const onCarouselPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(max-width: 760px)").matches || event.pointerType === "mouse") return;
    if ((event.target as HTMLElement).closest('[data-swipe-ignore="true"], a, button')) {
      suppressClick.current = false;
      return;
    }
    if (event.clientX < 18 || event.clientX > window.innerWidth - 18) return;
    if (activePointerId.current !== null) return;
    suppressClick.current = false;
    activePointerId.current = event.pointerId;
    startX.current = event.clientX;
    startY.current = event.clientY;
    startTime.current = performance.now();
  };

  const onCarouselPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== event.pointerId || startX.current === null || startY.current === null) return;
    const dx = event.clientX - startX.current;
    const dy = event.clientY - startY.current;
    if (!gestureActive.current) {
      if (Math.abs(dy) > 9 && Math.abs(dy) > Math.abs(dx) * 1.15) {
        resetSwipe();
        return;
      }
      if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy) * 0.82) return;
      gestureActive.current = true;
      suppressClick.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.setAttribute("data-dragging", "true");
    }
    const currentIndex = order.indexOf(activeId);
    const atEdge = (currentIndex === 0 && dx > 0) || (currentIndex === order.length - 1 && dx < 0);
    const resistance = atEdge ? 0.28 : 1;
    const progress = Math.min(1, Math.abs(dx) * resistance / 72);
    event.currentTarget.dataset.swipe = dx < 0 ? "next" : "previous";
    event.currentTarget.style.setProperty("--gesture-progress", progress.toFixed(3));
  };

  const onCarouselPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== event.pointerId || startX.current === null) return;
    const dx = event.clientX - startX.current;
    const elapsed = Math.max(1, performance.now() - startTime.current);
    const velocity = Math.abs(dx) / elapsed;
    if (gestureActive.current && (Math.abs(dx) >= 34 || (Math.abs(dx) >= 20 && velocity > 0.35))) {
      move(dx < 0 ? 1 : -1);
    }
    resetSwipe();
  };

  const onCarouselClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClick.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick.current = false;
  };

  const keyNav = (event: React.KeyboardEvent, index: number) => {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % order.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + order.length) % order.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = order.length - 1;
    else return;
    event.preventDefault();
    void select(order[next], true);
  };

  return (
    <main className="site-shell">
      <SiteHeader mobileCta={{ label: "Свяжитесь со мной", onClick: openForm }} />

      <div
        ref={carouselRef}
        className="stage-carousel"
        data-direction={transitionDirection}
        onPointerDown={onCarouselPointerDown}
        onPointerMove={onCarouselPointerMove}
        onPointerUp={onCarouselPointerUp}
        onPointerCancel={resetSwipe}
        onClickCapture={onCarouselClickCapture}
      >
      <section className="hero" id="stages" aria-labelledby="hero-title">
        <div className="scene" data-stage={activeId} data-direction={transitionDirection}>
          {fromId && <ScenePicture stage={fromId} state="leaving" />}
          <ScenePicture key={incomingId ?? activeId} stage={incomingId ?? activeId} state="active" />
          <div className="scene-transition-dim" aria-hidden="true" />
          <div className="scene-scrim" aria-hidden="true" />
          <div className="blueprint-grid" aria-hidden="true" />
          <div className="scene-transition-light" aria-hidden="true" />
          <div className="hero-inner">
            <div className="hero-copy" key={`copy-${activeId}`}>
              <p className="brand-line">ENTERO&nbsp; • &nbsp;Оснащение ресторанов</p>
              <h1 id="hero-title">
                <span>Открываете</span>
                <span>ресторан?</span>
              </h1>
              <p className="hero-description desktop-copy">{active.description}</p>
              <p className="hero-description mobile-copy">{active.mobileDescription}</p>
              {active.supporting && <p className="hero-supporting desktop-copy">{active.supporting}</p>}
              <div className="hero-actions">
                <button className="button button-primary" type="button" onClick={openForm}>
                  <span>{active.primaryCta}</span>
                  <ArrowRight size={21} weight="light" aria-hidden="true" />
                </button>
                {active.secondaryCta && (
                  active.id === "project" ? (
                    <button className="button button-secondary" type="button" onClick={openForm}>
                      <ClipboardText size={19} weight="light" aria-hidden="true" />
                      <span>{active.secondaryCta}</span>
                    </button>
                  ) : (
                    <a className="button button-secondary" href="#stage-detail">
                      <ClipboardText size={19} weight="light" aria-hidden="true" />
                      <span>{active.secondaryCta}</span>
                    </a>
                  )
                )}
              </div>
            </div>

            <ContextPanel key={`panel-${activeId}`} stage={active} />
          </div>
        </div>

        <div className="selector-wrap">
          <div className="selector-viewport">
            <div className="stage-tabs" role="tablist" aria-label="Этап открытия ресторана">
              {order.map((id, index) => {
                const stage = stages[id];
                const selected = id === requestedId;
                return (
                  <button
                    key={id}
                    ref={(node) => { tabRefs.current[index] = node; }}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    tabIndex={selected ? 0 : -1}
                    className="stage-tab"
                    data-active={selected}
                    onClick={() => void select(id)}
                    onKeyDown={(event) => keyNav(event, index)}
                  >
                    <span className="stage-number">{stage.number}</span>
                    <StageIcon stage={id} />
                    <span className="stage-tab-copy">
                      <strong>{stage.selectorTitle}</strong>
                      <small>{stage.selectorSubtitle}</small>
                      <em>{stage.selectorAction}</em>
                    </span>
                    <ArrowRight className="stage-arrow" size={22} weight="light" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mobile-pagination" aria-hidden="true">
            {order.map((id) => <span key={id} data-active={id === requestedId} />)}
          </div>
        </div>
      </section>

      <StageDetail stage={active} onOpenForm={openForm} />
      </div>
      <WhyEntero />
      <SiteFooter />
      <ContactForm open={formOpen} stage={active.id} onClose={closeForm} />
    </main>
  );
}

function ScenePicture({ stage, state }: { stage: StageId; state: "active" | "leaving" }) {
  return (
    <picture className="scene-picture" data-stage={stage} data-state={state}>
      <source media="(max-width: 700px)" type="image/avif" srcSet={`${imagePath(stage, "mobile")}.avif`} />
      <source media="(max-width: 700px)" type="image/webp" srcSet={`${imagePath(stage, "mobile")}.webp`} />
      <source type="image/avif" srcSet={`${imagePath(stage, "desktop")}.avif`} />
      <img
        src={`${imagePath(stage, "desktop")}.webp`}
        width="1600"
        height="900"
        alt=""
        loading="eager"
        fetchPriority="high"
      />
    </picture>
  );
}

function ContextPanel({ stage }: { stage: Stage }) {
  if (stage.id === "idea") return <BudgetPanel />;
  if (stage.id === "project") return <ComparisonPanel stage={stage} />;

  return (
    <aside className="context-panel" data-variant="list" aria-label={stage.panelTitle}>
      <div className="context-heading">
        <StageIcon stage={stage.id} />
        <h2>{stage.panelTitle}</h2>
        <span aria-hidden="true">i</span>
      </div>
      <ul>
        {stage.panelItems.map((item) => (
          <li key={item}>
            <Check size={18} weight="light" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p>{stage.panelNote}</p>
    </aside>
  );
}

const budgetRows: Array<{ label: string; amount: string; icon: BudgetIcon }> = [
  { label: "Оборуд.", amount: "30 000 BYN", icon: "equipment" },
  { label: "Нейтралка", amount: "8 200 BYN", icon: "neutral" },
  { label: "Инвентарь", amount: "7 000 BYN", icon: "inventory" },
  { label: "Вентиляция", amount: "21 000 BYN", icon: "ventilation" },
];

function BudgetPanel() {
  return (
    <aside className="context-panel budget-panel" data-variant="budget" aria-label="Оценка бюджета">
      <div className="context-heading">
        <Gauge size={31} weight="light" aria-hidden="true" />
        <h2>Оценка бюджета</h2>
        <span aria-hidden="true">i</span>
      </div>
      <div className="budget-list">
        {budgetRows.map((item) => (
          <div className="budget-row" key={item.label}>
            <BudgetRowIcon name={item.icon} />
            <span>{item.label}</span>
            <strong>{item.amount}</strong>
          </div>
        ))}
      </div>
      <div className="budget-total">
        <span>Итого ориентировочно</span>
        <strong>66 200 BYN</strong>
      </div>
    </aside>
  );
}

const comparisonRows = [
  { id: "cold", desktop: "Холодильное оборудование", mobile: "Холод", base: true, premium: false },
  { id: "thermal", desktop: "Тепловое оборудование", mobile: "Тепловое", base: false, premium: false },
  { id: "neutral", desktop: "Нейтральное оборудование", mobile: "Нейтралка", base: false, premium: true },
  { id: "bar", desktop: "Барное оборудование", mobile: "Барное", base: false, premium: true, hideOnMobile: true },
  { id: "wash", desktop: "Посудомоечное оборудование", mobile: "Моечное", base: false, premium: true },
  { id: "ventilation", desktop: "Вентиляция", mobile: "Вентиляция", base: false, premium: false },
];

function ComparisonPanel({ stage }: { stage: Stage }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const infoButtonRef = useRef<HTMLButtonElement | null>(null);
  const infoPopoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!infoOpen) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      const target = event.target as Node;
      if (infoButtonRef.current?.contains(target) || infoPopoverRef.current?.contains(target)) return;
      setInfoOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setInfoOpen(false);
      infoButtonRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [infoOpen]);

  return (
    <aside
      className="context-panel comparison-panel"
      data-info-open={infoOpen || undefined}
      data-swipe-ignore="true"
      data-variant="comparison"
      aria-label={stage.panelTitle}
    >
      <div className="comparison-heading">
        <h2>{stage.panelTitle}</h2>
        <button
          ref={infoButtonRef}
          className="comparison-info-button"
          type="button"
          aria-controls="comparison-info-popover"
          aria-expanded={infoOpen}
          aria-label="Подробнее о подходе ENTERO к подбору оборудования"
          onClick={() => setInfoOpen((open) => !open)}
        >
          <span aria-hidden="true">i</span>
        </button>
      </div>
      <div className="comparison-columns" aria-hidden="true">
        <span />
        <span className="comparison-tier comparison-tier-base">
          <span className="desktop-copy">Базовый</span>
          <span className="mobile-copy">Экон.</span>
        </span>
        <strong className="comparison-tier comparison-tier-optimal">Оптимальный</strong>
        <span className="comparison-tier comparison-tier-premium">
          <span className="desktop-copy">Премиум</span>
          <span className="mobile-copy">Прем.</span>
        </span>
      </div>
      <div className="comparison-table">
        {comparisonRows.map((item) => (
          <div className="comparison-row" data-mobile-hidden={item.hideOnMobile || undefined} key={item.id}>
            <span className="desktop-copy">{item.desktop}</span>
            <span className="mobile-copy">{item.mobile}</span>
            <i data-on={item.base} />
            <i data-on="optimal" />
            <i data-on={item.premium} />
          </div>
        ))}
      </div>
      <p>{stage.panelNote}</p>
      <div
        ref={infoPopoverRef}
        id="comparison-info-popover"
        className="comparison-info-popover"
        data-open={infoOpen || undefined}
        role="note"
        aria-hidden={!infoOpen}
      >
        <p>
          Знаем оборудование и подбираем под задачу: где можно упростить, а где компромиссы недопустимы.
        </p>
      </div>
    </aside>
  );
}

function StageDetail({ stage, onOpenForm }: { stage: Stage; onOpenForm: () => void }) {
  return (
    <section className="stage-detail" id="stage-detail" data-stage={stage.id}>
      <div className="detail-blueprint" aria-hidden="true" />
      <div className="detail-inner" key={`detail-${stage.id}`}>
        <p className="detail-stage">
          <span>ЭТАП</span>
          <strong>{stage.number}</strong>
        </p>
        <div className="detail-heading">
          <h2><span className="desktop-copy">{stage.detailTitle}</span><span className="mobile-copy">{stage.mobileDetailTitle}</span></h2>
          <p>{stage.detailIntro}</p>
        </div>
        <div className="detail-body">
          <div className="feature-list">
            {stage.features.map((feature) => (
              <article key={feature.title}>
                <FeatureIcon name={feature.icon} />
                <div>
                  <h3>{feature.title}</h3>
                  <p><span className="desktop-copy">{feature.text}</span><span className="mobile-copy">{feature.mobileText}</span></p>
                </div>
              </article>
            ))}
          </div>
          <div className="editorial-board" aria-hidden="true">
            <div className="board-photo" style={{ backgroundImage: `url(${imagePath(stage.id, "desktop")}.webp)` }} />
            <div className="board-plan" />
            <div className="board-note">
              <span>ENTERO</span>
              <strong>{stage.selectorTitle}</strong>
              <small>задача&nbsp;&nbsp; решение&nbsp;&nbsp; результат</small>
            </div>
          </div>
        </div>
        <button className="button detail-cta" type="button" onClick={onOpenForm}>
          <span>{stage.detailCta}</span>
          <ArrowRight size={22} weight="light" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function StageIcon({ stage }: { stage: StageId }) {
  const props = { size: 31, weight: "light" as const, "aria-hidden": true as const };
  if (stage === "idea") return <Lightbulb {...props} />;
  if (stage === "space") return <Blueprint {...props} />;
  return <ClipboardText {...props} />;
}

function FeatureIcon({ name }: { name: FeatureIconName }) {
  const props = { size: 31, weight: "light" as const, "aria-hidden": true as const };
  if (name === "format") return <SquaresFour {...props} />;
  if (name === "menu") return <ForkKnife {...props} />;
  if (name === "seats") return <UsersThree {...props} />;
  if (name === "budget") return <Wallet {...props} />;
  if (name === "zones") return <Blueprint {...props} />;
  if (name === "engineering") return <Fan {...props} />;
  if (name === "specification") return <ClipboardText {...props} />;
  if (name === "compare") return <Scales {...props} />;
  if (name === "timing") return <CalendarBlank {...props} />;
  if (name === "solution") return <Cube {...props} />;
  return <Gauge {...props} />;
}

function BudgetRowIcon({ name }: { name: BudgetIcon }) {
  const props = { size: 20, weight: "light" as const, "aria-hidden": true as const };
  if (name === "equipment") return <ForkKnife {...props} />;
  if (name === "neutral") return <Cube {...props} />;
  if (name === "inventory") return <ClipboardText {...props} />;
  return <Fan {...props} />;
}
