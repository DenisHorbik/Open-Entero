import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders all ENTERO home stages with shared navigation and why section", async () => {
  for (const stage of ["idea", "space", "project"]) {
    const response = await render(`/?stage=${stage}`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

    const html = await response.text();
    assert.match(html, /Открываете ресторан/);
    assert.match(html, new RegExp(`data-stage="${stage}"`));
    assert.match(html, /href="\/faq"/);
    assert.match(html, /href="\/\?stage=idea"[^>]*>\s*<span>Главная<\/span>/);
    assert.match(html, /Каталог Entero/);
    assert.match(html, /Почему ENTERO/);
    assert.match(html, /Свяжитесь со мной/);
    assert.match(html, /Знаем оборудование, рынок и реальные условия поставки/);
    assert.match(html, /id="contacts"/);
    assert.match(html, /GTM-NB8M8MDJ/);
    assert.match(html, /href="\/favicon\.svg"/);
    assert.match(html, /6Lc6KpstAAAAAN5LtHEWMbjVZJkVTTMJyctNR4qS/);
  }
});

test("server-renders the FAQ page from shared visible and structured content", async () => {
  const response = await render("/faq");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /Вопросы об открытии и оснащении ресторана/);
  assert.match(html, /href="\/\?stage=idea"[^>]*>\s*<span>Главная<\/span>/);
  assert.equal((html.match(/class="faq-category"/g) ?? []).length, 7);
  assert.equal((html.match(/<details/g) ?? []).length, 46);
  assert.match(html, /От чего зависит срок поставки/);
  assert.match(html, /Где указан подтверждённый срок каждой позиции/);
  assert.match(html, /Рекомендуем согласовать выезд за 3–5 рабочих дней/);
  assert.match(html, /Есть ли рассрочка от ENTERO/);
  assert.match(html, /Какие документы понадобятся/);
  assert.match(html, /"@type":"FAQPage"/);
  assert.match(html, /\?stage=idea&amp;form=contact/);
  assert.match(html, /href="https:\/\/entero\.by"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /id="contacts"/);
});

test("services permanently redirects to the FAQ page", async () => {
  const response = await render("/services");
  assert.equal(response.status, 308);
  assert.equal(new URL(response.headers.get("location"), "http://localhost").pathname, "/faq");
});

test("server-renders the stage-specific one-step contact form on direct entry", async () => {
  const expectations = {
    idea: "Прикинуть бюджет оборудования",
    space: "Обсудить проект помещения",
    project: "Разобрать спецификацию и подобрать оборудование",
  };

  for (const [stage, title] of Object.entries(expectations)) {
    const response = await render(`/?stage=${stage}&form=contact`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, new RegExp(title));
    assert.doesNotMatch(html, /Демо-режим/);
    assert.match(html, /class="lead-honeypot"/);
    assert.match(html, /Пока не определился/);
    assert.match(html, /Прикрепить план или спецификацию/);
  }
});

test("server-renders the clean thanks page", async () => {
  const response = await render("/thanks");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Спасибо\. Мы получили ваши вводные/);
  assert.match(html, /class="wordmark" href="\/"/);
  assert.match(html, /ENTERO · Ваш запрос отправлен/);
  assert.match(html, /Свяжемся с Вами в течение 1 рабочего дня/);
  assert.match(html, /href="tel:\+375445002929"/);
  assert.match(html, /https:\/\/t\.me\/EnteroMinsk\?text=/);
  assert.match(html, /viber:\/\/chat\?number=%2B375445002929/);
  assert.match(html, /class="thanks-copy-status"/);
  assert.match(html, /Прикрепить документ дополнительно/);
  assert.doesNotMatch(html, /Демо-режим/);
});
