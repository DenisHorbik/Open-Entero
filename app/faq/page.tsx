import type { Metadata } from "next";
import { allFaqItems, faqCategories, faqLastReviewed } from "../faq-content";
import { jsonLd, siteUrl } from "../seo-config";
import { SiteFooter } from "../SiteFooter";
import { SiteHeader } from "../SiteHeader";

export const metadata: Metadata = {
  title: "Вопросы об открытии и оснащении ресторана | ENTERO",
  description:
    "Короткие ответы ENTERO о проекте кухни, подборе оборудования, монтаже, пусконаладке и сервисе ресторанов в Беларуси.",
  alternates: { canonical: `${siteUrl}/faq` },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: allFaqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Главная", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Вопросы и ответы", item: `${siteUrl}/faq` },
  ],
};

export default function FaqPage() {
  return (
    <main className="site-shell faq-page">
      <SiteHeader currentPage="faq" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />

      <section className="faq-intro" aria-labelledby="faq-title">
        <div className="faq-intro-inner">
          <h1 id="faq-title">Вопросы об открытии и оснащении ресторана</h1>
          <div className="faq-intro-copy">
            <p>
              Отвечаем по своей части: проект кухни, оборудование, монтаж, запуск и сервис.
              Коротко и без обещаний «всё под ключ».
            </p>
            <p className="faq-review">
              Команда ENTERO · Проверено <time dateTime={faqLastReviewed}>26 августа 2026</time>
            </p>
          </div>
        </div>
      </section>

      <nav className="faq-topics" aria-label="Темы вопросов">
        <div className="faq-topics-inner">
          {faqCategories.map((category) => (
            <a href={`#${category.id}`} key={category.id}>{category.title}</a>
          ))}
        </div>
      </nav>

      <div className="faq-content">
        {faqCategories.map((category, categoryIndex) => (
          <section className="faq-category" id={category.id} key={category.id} aria-labelledby={`${category.id}-title`}>
            <header className="faq-category-heading">
              <h2 id={`${category.id}-title`}>{category.title}</h2>
              <p>{category.description}</p>
            </header>

            <div className="faq-list">
              {category.items.map((item, itemIndex) => (
                <details key={item.question} open={categoryIndex === 0 && itemIndex === 0}>
                  <summary>{item.question}</summary>
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="faq-cta" aria-labelledby="faq-cta-title">
        <div className="faq-cta-inner">
          <div>
            <h2 id="faq-cta-title">Есть вопрос по вашему объекту?</h2>
            <p>Разберём задачу и скажем, с чего начать.</p>
          </div>
          {/* Native navigation preserves the query reliably in the current Vinext runtime. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="button faq-cta-button" href="/?stage=idea&form=contact">
            Обсудить свою задачу
          </a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
