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
    assert.match(html, /href="\/services"/);
    assert.match(html, /Каталог Entero/);
    assert.match(html, /Почему ENTERO/);
    assert.match(html, /Знаем оборудование, рынок и реальные условия поставки/);
    assert.match(html, /id="contacts"/);
  }
});

test("server-renders the services page from the shared stage content", async () => {
  const response = await render("/services");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /Услуги ENTERO/);
  assert.match(html, /Помогаем пройти путь от идеи и бюджета/);
  assert.equal((html.match(/class="services-stage"/g) ?? []).length, 3);
  assert.equal((html.match(/class="services-stage-features"/g) ?? []).length, 3);
  assert.equal((html.match(/class="button services-stage-cta"/g) ?? []).length, 3);
  assert.match(html, /href="https:\/\/entero\.by"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /id="contacts"/);
});
