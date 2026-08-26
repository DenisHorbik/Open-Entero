export type NavigationItem = {
  label: string;
  href: string;
  external?: boolean;
  page?: "home" | "faq";
};

export const navigationItems: NavigationItem[] = [
  { label: "Вопросы и ответы", href: "/faq", page: "faq" },
  { label: "Каталог Entero", href: "https://entero.by", external: true },
  { label: "Почему ENTERO", href: "/#why-entero" },
  { label: "Контакты", href: "#contacts" },
];

export const mobileNavigationItems: NavigationItem[] = [
  { label: "Главная", href: "/?stage=idea", page: "home" },
  ...navigationItems,
];
