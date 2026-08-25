"use client";

import { ArrowRight, ArrowUpRight, ShieldCheck } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { navigationItems } from "./navigation";

type SiteHeaderProps = {
  currentPage?: "home" | "services";
};

export function SiteHeader({ currentPage = "home" }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    firstMobileLinkRef.current?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const wordmarkHref = currentPage === "home" ? "#stages" : "/";

  return (
    <header className="header" ref={headerRef} data-menu-open={menuOpen || undefined}>
      <a className="wordmark" href={wordmarkHref} aria-label="ENTERO, начало страницы">ENTERO</a>
      <nav className="desktop-navigation" aria-label="Основная навигация">
        {navigationItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noreferrer" : undefined}
            aria-current={item.page === currentPage ? "page" : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="experience-mark">
        <ShieldCheck size={25} weight="light" aria-hidden="true" />
        <span>16 лет в профессиональном<br />оснащении HoReCa</span>
      </div>
      <button
        className="menu-mark"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
        aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav
        id="mobile-navigation"
        className="mobile-navigation"
        aria-label="Мобильная навигация"
        data-open={menuOpen || undefined}
        aria-hidden={!menuOpen}
      >
        {navigationItems.map((item, index) => (
          <a
            key={item.label}
            ref={index === 0 ? firstMobileLinkRef : undefined}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noreferrer" : undefined}
            aria-current={item.page === currentPage ? "page" : undefined}
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => setMenuOpen(false)}
          >
            <span>{item.label}</span>
            {item.external ? (
              <ArrowUpRight size={20} weight="light" aria-hidden="true" />
            ) : (
              <ArrowRight size={20} weight="light" aria-hidden="true" />
            )}
          </a>
        ))}
      </nav>
    </header>
  );
}
