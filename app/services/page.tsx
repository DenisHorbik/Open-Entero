import type { Metadata } from "next";
import { imagePath, stageOrder, stages } from "../entero-content";
import { SiteFooter } from "../SiteFooter";
import { SiteHeader } from "../SiteHeader";
import { ServiceArrow, ServiceFeatureIcon } from "./ServiceIcons";

export const metadata: Metadata = {
  title: "Услуги ENTERO | Оснащение HoReCa",
  description:
    "Услуги ENTERO для открытия ресторана: ориентир бюджета, проект кухни, спецификация и подбор профессионального оборудования.",
};

export default function ServicesPage() {
  return (
    <main className="site-shell services-page">
      <SiteHeader currentPage="services" />

      <section className="services-intro" aria-labelledby="services-title">
        <div className="services-intro-grid" aria-hidden="true" />
        <div className="services-intro-inner">
          <h1 id="services-title">Услуги ENTERO</h1>
          <p>
            Помогаем пройти путь от идеи и бюджета до проекта, подбора и поставки
            профессионального оборудования.
          </p>
        </div>
      </section>

      <div className="services-stages">
        {stageOrder.map((stageId, index) => {
          const stage = stages[stageId];
          return (
            <section
              className="services-stage"
              data-stage={stage.id}
              data-reverse={index % 2 === 1 || undefined}
              key={stage.id}
              aria-labelledby={`services-${stage.id}`}
            >
              <div className="services-stage-inner">
                <div className="services-stage-heading">
                  <span>{stage.number}</span>
                  <div>
                    <h2 id={`services-${stage.id}`}>{stage.selectorTitle}</h2>
                    <p>{stage.detailIntro}</p>
                  </div>
                </div>

                <div className="services-stage-features">
                  {stage.features.map((feature) => (
                    <article key={feature.title}>
                      <ServiceFeatureIcon name={feature.icon} />
                      <div>
                        <h3>{feature.title}</h3>
                        <p>{feature.text}</p>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="services-stage-visual">
                  <picture>
                    <source
                      media="(max-width: 700px)"
                      type="image/avif"
                      srcSet={`${imagePath(stage.id, "mobile")}.avif`}
                    />
                    <source type="image/avif" srcSet={`${imagePath(stage.id, "desktop")}.avif`} />
                    <img
                      src={`${imagePath(stage.id, "desktop")}.webp`}
                      width="1600"
                      height="900"
                      loading="lazy"
                      alt={`Профессиональная кухня — ${stage.selectorTitle.toLowerCase()}`}
                    />
                  </picture>
                  <div className="services-stage-plan" aria-hidden="true" />
                </div>

                <a className="button services-stage-cta" href={`/?stage=${stage.id}&form=contact`}>
                  <span>{stage.detailCta}</span>
                  <ServiceArrow />
                </a>
              </div>
            </section>
          );
        })}
      </div>

      <SiteFooter />
    </main>
  );
}
