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
  ShieldCheck,
  SquaresFour,
  UsersThree,
  Wallet,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";

type StageId = "idea" | "space" | "project";
type FeatureIcon =
  | "format"
  | "menu"
  | "seats"
  | "budget"
  | "zones"
  | "engineering"
  | "specification"
  | "compare"
  | "timing"
  | "solution";

type Stage = {
  id: StageId;
  number: string;
  selectorTitle: string;
  selectorSubtitle: string;
  description: string;
  supporting: string;
  primaryCta: string;
  secondaryCta?: string;
  panelTitle: string;
  panelItems: string[];
  panelNote: string;
  technicalLabels: string[];
  detailTitle: string;
  detailIntro: string;
  detailCta: string;
  features: Array<{ icon: FeatureIcon; title: string; text: string }>;
};

const order: StageId[] = ["idea", "space", "project"];

const stages: Record<StageId, Stage> = {
  idea: {
    id: "idea",
    number: "01",
    selectorTitle: "Есть идея",
    selectorSubtitle: "Помещения пока нет",
    description:
      "Поможем понять, что действительно нужно профессиональной кухне и от чего зависит бюджет.",
    supporting:
      "Сначала формат, меню и нагрузка. Потом состав оборудования.",
    primaryCta: "Прикинуть бюджет",
    panelTitle: "На что влияет бюджет",
    panelItems: [
      "Формат заведения",
      "Меню и процессы",
      "Количество мест",
      "Нагрузка кухни",
    ],
    panelNote: "Без выдуманных сумм. Сначала собираем вводные.",
    technicalLabels: ["ФОРМАТ", "МЕНЮ", "НАГРУЗКА"],
    detailTitle: "Пока есть идея, начните с экономики",
    detailIntro:
      "До выбора помещения полезно понять масштаб кухни, требования к процессам и порядок инвестиций в оборудование.",
    detailCta: "Получить ориентир по бюджету",
    features: [
      {
        icon: "format",
        title: "Формат и концепция",
        text: "Определяем тип заведения и уровень кухни. От этого зависит всё остальное.",
      },
      {
        icon: "menu",
        title: "Меню и оборудование",
        text: "Связываем будущие блюда с реальными технологическими процессами.",
      },
      {
        icon: "seats",
        title: "Посадочные места",
        text: "Учитываем поток гостей и требуемую производительность кухни.",
      },
      {
        icon: "budget",
        title: "Ориентир бюджета",
        text: "Формируем реалистичный диапазон и сценарии без ложной точности.",
      },
    ],
  },
  space: {
    id: "space",
    number: "02",
    selectorTitle: "Есть помещение",
    selectorSubtitle: "Нужен проект и спецификация",
    description:
      "Спроектируем профессиональную кухню, учтём потоки, мощности и подготовим спецификацию.",
    supporting:
      "Ошибки в зонировании и инженерии особенно дорого исправлять после монтажа.",
    primaryCta: "Пригласить специалиста на объект",
    panelTitle: "Что проектируем",
    panelItems: [
      "Зоны кухни",
      "Технология",
      "Спецификация",
      "Мощности",
      "Вентиляция",
    ],
    panelNote: "Начинаем с помещения, меню и ограничений объекта.",
    technicalLabels: ["ГОРЯЧИЙ ЦЕХ", "МОЕЧНАЯ", "ХОЛОДНЫЙ ЦЕХ"],
    detailTitle: "Помещение уже есть, спроектируем кухню правильно",
    detailIntro:
      "Проверяем пространство и инженерные ограничения до того, как оборудование окажется на объекте.",
    detailCta: "Пригласить специалиста на объект",
    features: [
      {
        icon: "format",
        title: "Концепция и меню",
        text: "Фиксируем формат и объёмы, чтобы кухня соответствовала задачам бизнеса.",
      },
      {
        icon: "zones",
        title: "Зонирование",
        text: "Выстраиваем рабочие зоны и логичные потоки без пересечений.",
      },
      {
        icon: "engineering",
        title: "Инженерные ограничения",
        text: "Проверяем вентиляцию, мощности, воду, сливы и конструктив помещения.",
      },
      {
        icon: "specification",
        title: "Спецификация",
        text: "Подбираем оборудование по задачам и бюджету, без лишних позиций.",
      },
    ],
  },
  project: {
    id: "project",
    number: "03",
    selectorTitle: "Есть проект",
    selectorSubtitle: "Нужно подобрать бренды",
    description:
      "Сравним бренды и модели, найдём разумные аналоги и поможем не переплатить.",
    supporting:
      "Учитываем функцию, ресурс, наличие и реальные сроки открытия.",
    primaryCta: "Подобрать оборудование",
    secondaryCta: "Разобрать спецификацию",
    panelTitle: "Сравниваем варианты",
    panelItems: ["Рациональный", "Оптимальный", "Максимальный"],
    panelNote: "Объясняем выбор по функции, ресурсу, цене и срокам.",
    technicalLabels: ["РАЦИОНАЛЬНЫЙ", "ОПТИМАЛЬНЫЙ", "МАКСИМАЛЬНЫЙ"],
    detailTitle: "Проект уже есть, соберём разумную комплектацию",
    detailIntro:
      "Проверяем спецификацию и подбираем решения под реальные задачи кухни, а не под один доступный бренд.",
    detailCta: "Разобрать спецификацию",
    features: [
      {
        icon: "compare",
        title: "Сравнение вариантов",
        text: "Сопоставляем бренды и модели по ключевым параметрам и стоимости.",
      },
      {
        icon: "budget",
        title: "Оптимизация бюджета",
        text: "Показываем, где можно сэкономить без потери нужной функции.",
      },
      {
        icon: "timing",
        title: "Наличие и сроки",
        text: "Проверяем поставки и риски для запланированной даты открытия.",
      },
      {
        icon: "solution",
        title: "Подбор под задачу",
        text: "Учитываем концепцию, формат и ожидаемую загрузку ресторана.",
      },
    ],
  },
};

const imagePath = (stage: StageId, viewport: "desktop" | "mobile") =>
  `/media/hero/${stage}-${viewport}`;

export function EnteroPrototype({ initialStage }: { initialStage: StageId }) {
  const [activeId, setActiveId] = useState<StageId>(initialStage);
  const [previousId, setPreviousId] = useState<StageId | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const startX = useRef<number | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = stages[activeId];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const mobile = window.matchMedia("(max-width: 700px)").matches;
      for (const id of order) {
        if (id === activeId) continue;
        const image = new Image();
        image.decoding = "async";
        image.src = `${imagePath(id, mobile ? "mobile" : "desktop")}.webp`;
      }
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [activeId]);

  useEffect(() => () => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
  }, []);

  const select = useCallback(
    (nextId: StageId, focus = false) => {
      if (nextId === activeId) return;
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      setPreviousId(activeId);
      setActiveId(nextId);

      const url = new URL(window.location.href);
      url.searchParams.set("stage", nextId);
      window.history.replaceState({}, "", `${url.pathname}${url.search}`);

      transitionTimer.current = setTimeout(() => setPreviousId(null), 620);
      const index = order.indexOf(nextId);
      requestAnimationFrame(() => {
        tabRefs.current[index]?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          block: "nearest",
          inline: "center",
        });
        if (focus) tabRefs.current[index]?.focus();
      });
    },
    [activeId],
  );

  const move = (direction: 1 | -1) => {
    const current = order.indexOf(activeId);
    select(order[Math.max(0, Math.min(order.length - 1, current + direction))]);
  };

  const keyNav = (event: React.KeyboardEvent, index: number) => {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % order.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + order.length) % order.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = order.length - 1;
    else return;
    event.preventDefault();
    select(order[next], true);
  };

  return (
    <main className="site-shell">
      <Header />

      <section className="hero" id="stages" aria-labelledby="hero-title">
        <div className="scene" data-stage={activeId}>
          {previousId && <ScenePicture stage={previousId} state="leaving" />}
          <ScenePicture key={activeId} stage={activeId} state="active" />
          <div className="scene-scrim" aria-hidden="true" />
          <div className="blueprint-grid" aria-hidden="true" />
          <div className="technical-labels" data-stage={activeId} aria-hidden="true">
            {active.technicalLabels.map((label) => <span key={label}>{label}</span>)}
          </div>

          <div className="hero-inner">
            <div className="hero-copy" key={`copy-${activeId}`}>
              <p className="brand-line">ENTERO&nbsp;&nbsp; Оснащение ресторанов</p>
              <h1 id="hero-title">
                <span>Открываете</span>
                <span>ресторан?</span>
              </h1>
              <p className="hero-description">{active.description}</p>
              <p className="hero-supporting">{active.supporting}</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#stage-detail">
                  <span>{active.primaryCta}</span>
                  <ArrowRight size={21} weight="light" aria-hidden="true" />
                </a>
                {active.secondaryCta && (
                  <a className="button button-secondary" href="#stage-detail">
                    <ClipboardText size={19} weight="light" aria-hidden="true" />
                    <span>{active.secondaryCta}</span>
                  </a>
                )}
              </div>
            </div>

            <ContextPanel key={`panel-${activeId}`} stage={active} />
          </div>
        </div>

        <div className="selector-wrap">
          <div className="selector-intro">
            <p>Выберите, на каком этапе вы сейчас</p>
            <span>Покажем следующий разумный шаг</span>
          </div>
          <div
            className="selector-viewport"
            onPointerDown={(event) => { startX.current = event.clientX; }}
            onPointerUp={(event) => {
              if (startX.current === null) return;
              const distance = event.clientX - startX.current;
              startX.current = null;
              if (Math.abs(distance) < 55) return;
              move(distance < 0 ? 1 : -1);
            }}
          >
            <div className="stage-tabs" role="tablist" aria-label="Этап открытия ресторана">
              {order.map((id, index) => {
                const stage = stages[id];
                const selected = id === activeId;
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
                    onClick={() => select(id)}
                    onKeyDown={(event) => keyNav(event, index)}
                  >
                    <span className="stage-number">{stage.number}</span>
                    <StageIcon stage={id} />
                    <span className="stage-tab-copy">
                      <strong>{stage.selectorTitle}</strong>
                      <small>{stage.selectorSubtitle}</small>
                    </span>
                    <ArrowRight className="stage-arrow" size={22} weight="light" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mobile-pagination" aria-hidden="true">
            {order.map((id) => <span key={id} data-active={id === activeId} />)}
          </div>
        </div>
      </section>

      <StageDetail stage={active} />
    </main>
  );
}

function Header() {
  return (
    <header className="header">
      <a className="wordmark" href="#stages" aria-label="ENTERO, начало страницы">ENTERO</a>
      <nav aria-label="Основная навигация">
        <a href="#stages">Этапы</a>
        <a href="#stage-detail">Подход</a>
      </nav>
      <div className="experience-mark">
        <ShieldCheck size={25} weight="light" aria-hidden="true" />
        <span>16 лет в профессиональном<br />оснащении HoReCa</span>
      </div>
    </header>
  );
}

function ScenePicture({ stage, state }: { stage: StageId; state: "active" | "leaving" }) {
  return (
    <picture className="scene-picture" data-state={state}>
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
  return (
    <aside className="context-panel" aria-label={stage.panelTitle}>
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

function StageDetail({ stage }: { stage: Stage }) {
  return (
    <section className="stage-detail" id="stage-detail" data-stage={stage.id}>
      <div className="detail-blueprint" aria-hidden="true" />
      <div className="detail-inner" key={`detail-${stage.id}`}>
        <p className="detail-stage">ЭТАП {stage.number}</p>
        <div className="detail-heading">
          <h2>{stage.detailTitle}</h2>
          <p>{stage.detailIntro}</p>
        </div>
        <div className="detail-body">
          <div className="feature-list">
            {stage.features.map((feature) => (
              <article key={feature.title}>
                <FeatureIcon name={feature.icon} />
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
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
        <a className="button detail-cta" href="#stages">
          <span>{stage.detailCta}</span>
          <ArrowRight size={22} weight="light" aria-hidden="true" />
        </a>
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

function FeatureIcon({ name }: { name: FeatureIcon }) {
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
