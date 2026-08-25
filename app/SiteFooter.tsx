export function SiteFooter() {
  return (
    <footer className="site-footer" id="contacts">
      <div className="footer-main">
        <div className="footer-brand">
          <a className="footer-wordmark" href="/" aria-label="ENTERO, начало страницы">ENTERO</a>
          <p>Профессиональное оборудование и комплексное оснащение HoReCa в Беларуси.</p>
        </div>

        <div className="footer-column footer-contacts">
          <h2>Связаться</h2>
          <a href="tel:+375445002929">+375 (44) 500-29-29</a>
          <a href="mailto:info@entero.by">info@entero.by</a>
          <p>Пн-Пт, 9:00-18:00</p>
        </div>

        <div className="footer-column footer-company">
          <h2>Компания</h2>
          <a href="https://entero.by" target="_blank" rel="noreferrer">Каталог entero.by</a>
          <nav className="footer-socials" aria-label="Мессенджеры ENTERO">
            <a
              href="https://t.me/EnteroMinsk"
              target="_blank"
              rel="noreferrer"
              aria-label="Открыть Telegram ENTERO"
            >
              Telegram
            </a>
            <a href="viber://chat?number=%2B375445002929" aria-label="Открыть Viber ENTERO">
              Viber
            </a>
          </nav>
          <p>Минск, ул. Макаёнка, 12Г</p>
        </div>
      </div>

      <div className="footer-legal">
        <span>© 2005-2026 ENTERO</span>
        <span>ООО «РЕСТОИМПОРТ» · УНП 193793677</span>
      </div>
    </footer>
  );
}
