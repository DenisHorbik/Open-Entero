import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import test from "node:test";

async function unusedPort() {
  const probe = createServer();
  await new Promise((resolve, reject) => probe.listen(0, "127.0.0.1", resolve).once("error", reject));
  const { port } = probe.address();
  await new Promise((resolve) => probe.close(resolve));
  return port;
}

function ready(child) {
  return new Promise((resolve, reject) => {
    let stderr = "";
    const timer = setTimeout(() => reject(new Error(`Node entrypoint did not start: ${stderr}`)), 12_000);
    child.stderr.on("data", (chunk) => { stderr += String(chunk); });
    child.stdout.on("data", (chunk) => {
      if (String(chunk).includes("ENTERO listening")) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Node entrypoint exited (${code}): ${stderr}`));
    });
  });
}

test("Domain.by Node entrypoint serves HTML, assets and stage query state", async () => {
  const port = await unusedPort();
  const child = spawn(process.execPath, ["server/index.mjs"], {
    cwd: new URL("..", import.meta.url),
    env: { ...process.env, NODE_ENV: "production", PORT: String(port), HOST: "127.0.0.1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  try {
    await ready(child);
    const origin = `http://127.0.0.1:${port}`;
    const health = await fetch(`${origin}/healthz`);
    assert.equal(await health.text(), "ok");

    const page = await fetch(`${origin}/?stage=project`);
    assert.equal(page.status, 200);
    const html = await page.text();
    assert.match(html, /Открываете ресторан/);
    assert.match(html, /Есть проект/);
    assert.match(html, />Базовый</);
    assert.match(html, />Экон\.</);
    assert.match(html, />Премиум</);
    assert.match(html, />Прем\.</);
    assert.match(html, /Подробнее о подходе ENTERO к подбору оборудования/);
    assert.match(html, /где компромиссы недопустимы/);
    assert.match(html, /Профессиональное оборудование и комплексное оснащение HoReCa в Беларуси/);
    assert.match(html, /\+375 \(44\) 500-29-29/);
    assert.match(html, /ООО «РЕСТОИМПОРТ»/);
    assert.match(html, /Знаем оборудование, рынок и реальные условия поставки/);
    assert.match(html, /href="\/services"/);
    assert.match(html, /href="https:\/\/entero\.by"/);

    const servicesPage = await fetch(`${origin}/services`);
    assert.equal(servicesPage.status, 200);
    const servicesHtml = await servicesPage.text();
    assert.match(servicesHtml, /<title>Услуги ENTERO \| Оснащение HoReCa<\/title>/);
    assert.match(servicesHtml, /Помогаем пройти путь от идеи и бюджета/);
    for (const heading of [
      "Формат и концепция",
      "Меню и оборудование",
      "Посадочные места",
      "Ориентир бюджета",
      "Концепция и меню",
      "Зонирование",
      "Инженерные ограничения",
      "Спецификация оборудования",
      "Сравнение вариантов",
      "Оптимизация бюджета",
      "Наличие и сроки",
      "Подбор под задачу",
    ]) {
      assert.match(servicesHtml, new RegExp(heading));
    }
    assert.match(servicesHtml, /href="\/\?stage=idea&amp;form=contact"/);
    assert.match(servicesHtml, /href="\/\?stage=space&amp;form=contact"/);
    assert.match(servicesHtml, /href="\/\?stage=project&amp;form=contact"/);
    const stylesheetPath = html.match(/href="([^"]+\.css)"/)?.[1];
    assert.ok(stylesheetPath, "rendered HTML must include a stylesheet");
    const stylesheet = await fetch(`${origin}${stylesheetPath}`);
    assert.equal(stylesheet.status, 200);
    assert.match(stylesheet.headers.get("content-type"), /text\/css/);
    assert.match(await stylesheet.text(), /context-panel/);
  } finally {
    if (child.exitCode === null) {
      child.kill("SIGTERM");
      await new Promise((resolve) => child.once("exit", resolve));
    }
  }
});
