export type StageId = "idea" | "space" | "project";
export type BudgetIcon = "equipment" | "neutral" | "inventory" | "ventilation";
export type FeatureIconName =
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

export type Stage = {
  id: StageId;
  number: string;
  selectorTitle: string;
  selectorSubtitle: string;
  selectorAction: string;
  description: string;
  mobileDescription: string;
  supporting: string;
  primaryCta: string;
  secondaryCta?: string;
  panelTitle: string;
  panelItems: string[];
  panelNote: string;
  detailTitle: string;
  mobileDetailTitle: string;
  detailIntro: string;
  detailCta: string;
  features: Array<{ icon: FeatureIconName; title: string; text: string; mobileText: string }>;
};

export const stageOrder: StageId[] = ["idea", "space", "project"];

export const stages: Record<StageId, Stage> = {
  idea: {
    id: "idea",
    number: "01",
    selectorTitle: "Есть идея",
    selectorSubtitle: "Помещения пока нет",
    selectorAction: "Прикинуть бюджет",
    description:
      "Поможем определить состав оборудования и понять, от чего зависит бюджет профессиональной кухни.",
    mobileDescription: "Поможем понять, какое оборудование нужно кухне и от чего зависит бюджет.",
    supporting: "",
    primaryCta: "Прикинуть бюджет",
    secondaryCta: "Как мы работаем",
    panelTitle: "Что влияет на бюджет",
    panelItems: ["Формат заведения", "Меню и процессы", "Количество мест", "Нагрузка кухни"],
    panelNote: "Без выдуманных сумм. Сначала собираем вводные.",
    detailTitle: "Если у вас пока только идея, сначала важно понять порядок бюджета",
    mobileDetailTitle: "Сначала определим формат кухни и порядок бюджета",
    detailIntro:
      "До выбора помещения полезно понять масштаб кухни, требования к процессам и порядок инвестиций в оборудование.",
    detailCta: "Получить ориентир по бюджету",
    features: [
      {
        icon: "format",
        title: "Формат и концепция",
        text: "Определяем формат заведения и уровень кухни, от этого зависит всё остальное.",
        mobileText: "Определим формат заведения и уровень кухни.",
      },
      {
        icon: "menu",
        title: "Меню и оборудование",
        text: "Понимаем, какие блюда будут в меню и какое оборудование нужно для их приготовления.",
        mobileText: "Свяжем меню с необходимым оборудованием.",
      },
      {
        icon: "seats",
        title: "Посадочные места",
        text: "Количество посадочных мест влияет на поток гостей и потребности кухни и зала.",
        mobileText: "Учтём поток гостей и нагрузку кухни.",
      },
      {
        icon: "budget",
        title: "Ориентир бюджета",
        text: "Дадим реалистичный диапазон бюджета и варианты сценариев под ваш проект.",
        mobileText: "Покажем реалистичный порядок бюджета.",
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
      "Спроектируем кухню под ваше помещение и подготовим спецификацию оборудования без дорогих ошибок.",
    mobileDescription: "Расстановка или\nпроект оборудования\nпод Ваше\nпомещение",
    supporting: "",
    primaryCta: "Обсудить проект",
    secondaryCta: "Что входит в этап",
    panelTitle: "Что проектируем",
    panelItems: ["Зоны кухни", "Технология", "Спецификация", "Мощности", "Вентиляция"],
    panelNote: "Начинаем с помещения, меню и ограничений объекта.",
    detailTitle: "Если помещение уже есть, сначала нужен понятный проект и спецификация",
    mobileDetailTitle: "Сначала — проект кухни и спецификация",
    detailIntro:
      "Проверяем пространство и инженерные ограничения до того, как оборудование окажется на объекте.",
    detailCta: "Пригласить специалиста на объект",
    features: [
      {
        icon: "format",
        title: "Концепция и меню",
        text: "Понимаем формат и объёмы, чтобы кухня соответствовала вашей концепции и целям.",
        mobileText: "Свяжем формат, меню и объёмы кухни.",
      },
      {
        icon: "zones",
        title: "Зонирование",
        text: "Выстраиваем логичные потоки и рабочие зоны без пересечений.",
        mobileText: "Выстроим рабочие зоны без пересечений.",
      },
      {
        icon: "engineering",
        title: "Инженерные ограничения",
        text: "Проверяем вентиляцию, электромощности, воду, сливы и несущие конструкции.",
        mobileText: "Проверим сети и ограничения помещения.",
      },
      {
        icon: "specification",
        title: "Спецификация оборудования",
        text: "Подбираем оборудование по задачам и бюджету, без лишних позиций.",
        mobileText: "Соберём спецификацию без лишних позиций.",
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
      "Сравним оборудование по задачам, цене и срокам, чтобы подобрать решение без лишней переплаты.",
    mobileDescription: "Сравним оборудование по задаче, цене и срокам — без переплаты.",
    supporting: "",
    primaryCta: "Подобрать оборудование",
    secondaryCta: "Разобрать спецификацию",
    panelTitle: "Сравниваем варианты",
    panelItems: ["Рациональный", "Оптимальный", "Максимальный"],
    panelNote: "Объясняем выбор по функции, ресурсу, цене и срокам.",
    detailTitle: "Если проект уже есть, поможем подобрать бренды и собрать разумную комплектацию",
    mobileDetailTitle: "Подберём оборудование под задачи проекта",
    detailIntro:
      "Проверяем спецификацию и подбираем решения под реальные задачи кухни, а не под один доступный бренд.",
    detailCta: "Отправить спецификацию",
    features: [
      {
        icon: "compare",
        title: "Сравнение вариантов",
        text: "Сопоставляем бренды и модели по ключевым параметрам и стоимости.",
        mobileText: "Сопоставим модели по ключевым параметрам.",
      },
      {
        icon: "budget",
        title: "Оптимизация бюджета",
        text: "Показываем, где можно сэкономить без потери нужной функции.",
        mobileText: "Найдём экономию без потери функции.",
      },
      {
        icon: "timing",
        title: "Наличие и сроки",
        text: "Проверяем поставки и риски для запланированной даты открытия.",
        mobileText: "Проверим наличие и реальные сроки.",
      },
      {
        icon: "solution",
        title: "Подбор под задачу",
        text: "Учитываем концепцию, формат и ожидаемую загрузку ресторана.",
        mobileText: "Учтём формат и нагрузку ресторана.",
      },
    ],
  },
};

export const imagePath = (stage: StageId, viewport: "desktop" | "mobile") =>
  `/media/hero/${stage}-${viewport}`;
