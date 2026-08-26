"use client";

import { ArrowRight, ShieldCheck } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { mobileNavigationItems, navigationItems } from "./navigation";

type MobileCta =
  | { label: string; href: string; onClick?: never }
  | { label: string; href?: never; onClick: () => void };

type SiteHeaderProps = {
  currentPage?: "home" | "services";
  mobileCta?: MobileCta;
  wordmarkHref?: string;
};

const defaultMobileCta: MobileCta = {
  label: "Свяжитесь со мной",
  href: "/?stage=idea&form=contact",
};

export function SiteHeader({
  currentPage = "home",
  mobileCta = defaultMobileCta,
  wordmarkHref,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const mobileMedia = window.matchMedia("(max-width: 760px)");
    const menuButton = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    if (mobileMedia.matches) document.body.style.overflow = "hidden";

    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }

      if (event.key !== "Tab" || !mobileMedia.matches) return;
      const focusable = [
        menuButton,
        ...Array.from(
          mobileMenuRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]') ?? [],
        ),
      ].filter((element): element is HTMLElement => Boolean(element));
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const onBreakpointChange = () => setMenuOpen(false);

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    mobileMedia.addEventListener("change", onBreakpointChange);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      mobileMedia.removeEventListener("change", onBreakpointChange);
      document.body.style.overflow = previousOverflow;
      menuButton?.focus();
    };
  }, [menuOpen]);

  const resolvedWordmarkHref = wordmarkHref ?? (currentPage === "home" ? "#stages" : "/");
  const closeMenu = () => setMenuOpen(false);

  const runMobileCta = () => {
    closeMenu();
    if (mobileCta.onClick) mobileCta.onClick();
  };

  return (
    <header className="header" ref={headerRef} data-menu-open={menuOpen || undefined}>
      <a className="wordmark" href={resolvedWordmarkHref} aria-label="ENTERO, начало страницы">ENTERO</a>
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
        ref={menuButtonRef}
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
      <div
        id="mobile-navigation"
        className="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-navigation-title"
        data-open={menuOpen || undefined}
        aria-hidden={!menuOpen}
        ref={mobileMenuRef}
      >
        <div className="mobile-navigation-inner">
          <p className="mobile-menu-kicker" id="mobile-navigation-title">Навигация</p>
          <nav className="mobile-navigation-links" aria-label="Мобильная навигация">
            {mobileNavigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                aria-current={item.page === currentPage ? "page" : undefined}
                tabIndex={menuOpen ? 0 : -1}
                onClick={closeMenu}
              >
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          <div className="mobile-navigation-contact">
            <p>Связаться</p>
            <a
              className="mobile-navigation-phone"
              href="tel:+375445002929"
              tabIndex={menuOpen ? 0 : -1}
              onClick={closeMenu}
            >
              +375 (44) 500-29-29
            </a>
            {mobileCta.href ? (
              <a
                className="mobile-navigation-cta"
                href={mobileCta.href}
                tabIndex={menuOpen ? 0 : -1}
                onClick={closeMenu}
              >
                <span>{mobileCta.label}</span>
                <ArrowRight size={24} weight="light" aria-hidden="true" />
              </a>
            ) : (
              <button
                className="mobile-navigation-cta"
                type="button"
                tabIndex={menuOpen ? 0 : -1}
                onClick={runMobileCta}
              >
                <span>{mobileCta.label}</span>
                <ArrowRight size={24} weight="light" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
