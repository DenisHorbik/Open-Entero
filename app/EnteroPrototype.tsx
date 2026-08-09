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
  selectorAction: string;
  description: string;
  supporting: string;
  primaryCta: string;
  secondaryCta?: string;
  panelTitle: string;
  panelItems: string[];
  panelNote: string;
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
    selectorAction: "Прикинуть бюджет",
    description:
      "Поможем понять, что вам действительно нужно для кухни и сколько это будет стоить.",
    supporting: "",
    primaryCta: "Прикинуть бюджет",
    secondaryCta: "Как мы работаем",
    panelTitle: "На что влияет бюджет",
    panelItems: [
      "Формат заведения",
      "Меню и процессы",
      "Количество мест",
      "Нагрузка кухни",
    ],
    panelNote: "Без выдуманных сумм. Сначала собираем вводные.",
    detailTitle: "Если у вас пока только идея, сначала важно понять порядок бюджета",
    detailIntro:
      "До выбора помещения полезно понять масштаб кухни, требования к процессам и порядок инвестиций в оборудование.",
    detailCta: "Получить ориентир по бюджету",
    features: [
      {
        icon: "format",
        title: "Формат и концепция",
        text: "Определяем формат заведения и уровень кухни, от этого зависит всё остальное.",
      },
      {
        icon: "menu",
        title: "Меню и оборудование",
        text: "Понимаем, какие блюда будут в меню и какое оборудование нужно для их приготовления.",
      },
      {
        icon: "seats",
        title: "Посадочные места",
        text: "Количество посадочных мест влияет на поток гостей и потребности кухни и зала.",
      },
      {
        icon: "budget",
        title: "Ориентир бюджета",
        text: "Дадим реалистичный диапазон бюджета и варианты сценариев под ваш проект.",
      },
    ],
  },
  space: {
    id: "space",
    number: "02",
    selectorTitle: "Есть помещение",
    selectorSubtitle: "Нужен проект и спецификация",
    selectorAction: "Обсудить проект",
    description:
      "Если помещение уже есть, поможем спроектировать кухню и сформировать спецификацию без дорогих ошибок.",
    supporting: "",
    primaryCta: "Обсудить проект",
    secondaryCta: "Что входит в этап 02",
    panelTitle: "Что проектируем",
    panelItems: [
      "Зоны кухни",
      "Технология",
      "Спецификация",
      "Мощности",
      "Вентиляция",
    ],
    panelNote: "Начинаем с помещения, меню и ограничений объекта.",
    detailTitle: "Если помещение уже есть, сначала нужен понятный проект и спецификация",
    detailIntro:
      "Проверяем пространство и инженерные ограничения до того, как оборудование окажется на объекте.",
    detailCta: "Пригласить специалиста на объект",
    features: [
      {
        icon: "format",
        title: "Концепция и меню",
        text: "Понимаем формат и объёмы, чтобы кухня соответствовала вашей концепции и целям.",
      },
      {
        icon: "zones",
        title: "Зонирование",
        text: "Выстраиваем логичные потоки и рабочие зоны без пересечений.",
      },
      {
        icon: "engineering",
        title: "Инженерные ограничения",
        text: "Проверяем вентиляцию, электромощности, воду, сливы и несущие конструкции.",
      },
      {
        icon: "specification",
        title: "Спецификация оборудования",
        text: "Подбираем оборудование по задачам и бюджету, без лишних позиций.",
      },
    ],
  },
  project: {
    id: "project",
    number: "03",
    selectorTitle: "Есть проект",
    selectorSubtitle: "Нужно подобрать бренды",
    selectorAction: "Подобрать оборудование",
    description:
      "Если проект уже есть, поможем подобрать бренды, сравнить варианты и не переплатить за оборудование.",
    supporting:
      "Берём вашу спецификацию и показываем разумные решения по цене, наличию, срокам и функциональности.",
    primaryCta: "Подобрать оборудование",
    secondaryCta: "Разобрать спецификацию",
    panelTitle: "Сравниваем варианты",
    panelItems: ["Рациональный", "Оптимальный", "Максимальный"],
    panelNote: "Объясняем выбор по функции, ресурсу, цене и срокам.",
    detailTitle: "Если проект уже есть, поможем подобрать бренды и собрать разумную комплектацию",
    detailIntro:
      "Проверяем спецификацию и подбираем решения под реальные задачи кухни, а не под один доступный бренд.",
    detailCta: "Отправить спецификацию",
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
          <div className="hero-inner">
            <div className="hero-copy" key={`copy-${activeId}`}>
              <p className="brand-line">ENTERO&nbsp; • &nbsp;Оснащение ресторанов</p>
              <h1 id="hero-title">
                <span>Открываете</span>
                <span>ресторан?</span>
              </h1>
              <p className="hero-description">{active.description}</p>
              {active.supporting && <p className="hero-supporting">{active.supporting}</p>}
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
                      <em>{stage.selectorAction}</em>
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
        <a href="#stage-detail">Услуги</a>
        <a href="#stages">Этапы</a>
        <a href="#stage-detail">Почему ENTERO</a>
        <a href="#stage-detail">Контакты</a>
      </nav>
      <div className="experience-mark">
        <ShieldCheck size={25} weight="light" aria-hidden="true" />
        <span>16 лет в профессиональном<br />оснащении HoReCa</span>
      </div>
      <div className="menu-mark" aria-hidden="true">
        <span />
        <span />
        <span />
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

const comparisonRows = [
  "Холодильное оборудование",
  "Тепловое оборудование",
  "Посудомоечное оборудование",
  "Вентиляция",
  "Льдогенераторы",
  "Кофейное оборудование",
];

function ComparisonPanel({ stage }: { stage: Stage }) {
  return (
    <aside className="context-panel comparison-panel" data-variant="comparison" aria-label={stage.panelTitle}>
      <div className="comparison-heading">
        <h2>{stage.panelTitle}</h2>
        <span aria-hidden="true">i</span>
      </div>
      <div className="comparison-columns" aria-hidden="true">
        <span />
        <span>Базовый</span>
        <strong>Оптимальный</strong>
        <span>Премиум</span>
      </div>
      <div className="comparison-table">
        {comparisonRows.map((item, index) => (
          <div className="comparison-row" key={item}>
            <span>{item}</span>
            <i data-on={index === 0} />
            <i data-on="optimal" />
            <i data-on={index > 1 && index < 5} />
          </div>
        ))}
      </div>
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
