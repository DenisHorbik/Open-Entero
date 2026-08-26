export type NavigationItem = {
  label: string;
  href: string;
  external?: boolean;
  page?: "home" | "services";
};

export const navigationItems: NavigationItem[] = [
  { label: "Услуги", href: "/services", page: "services" },
  { label: "Каталог Entero", href: "https://entero.by", external: true },
  { label: "Почему ENTERO", href: "/#why-entero" },
  { label: "Контакты", href: "#contacts" },
];

export const mobileNavigationItems: NavigationItem[] = [
  { label: "Главная", href: "/?stage=idea", page: "home" },
  ...navigationItems,
];
