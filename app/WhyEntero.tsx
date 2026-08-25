const reasons = [
  {
    title: "Сильные условия по цене",
    text: "Большой объём продаж даёт ENTERO специальные условия у поставщиков. Если клиент нашёл дешевле, проверим предложение и предложим лучшие доступные условия.",
  },
  {
    title: "Выбор под задачу",
    text: "В одном месте собраны актуальные решения ведущих брендов. За 16 лет ENTERO знает, какое оборудование работает в профессиональной кухне.",
  },
  {
    title: "Полная документация",
    text: "Характеристики, инструкции и сертификаты собраны по официальным материалам производителей и доступны для изучения и скачивания.",
  },
  {
    title: "Официальные поставки",
    text: "ENTERO — официальный дилер ведущих брендов: оригинальная продукция, гарантия производителя и полный комплект документов.",
  },
];

export function WhyEntero() {
  return (
    <section className="why-entero" id="why-entero" aria-labelledby="why-entero-title">
      <div className="why-entero-grid" aria-hidden="true" />
      <div className="why-entero-inner">
        <div className="why-entero-heading">
          <h2 id="why-entero-title">Почему ENTERO</h2>
          <p>Знаем оборудование, рынок и реальные условия поставки</p>
        </div>
        <div className="why-entero-reasons">
          {reasons.map((reason) => (
            <article key={reason.title}>
              <h3>{reason.title}</h3>
              <p>{reason.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
