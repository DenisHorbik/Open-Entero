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
    assert.match(html, /href="\/faq"/);
    assert.match(html, /href="https:\/\/entero\.by"/);

    const faqPage = await fetch(`${origin}/faq`);
    assert.equal(faqPage.status, 200);
    const faqHtml = await faqPage.text();
    assert.match(faqHtml, /<title>Вопросы об открытии и оснащении ресторана \| ENTERO<\/title>/);
    assert.match(faqHtml, /Как мы работаем/);
    assert.match(faqHtml, /Поставка и монтаж/);
    assert.match(faqHtml, /Пусконаладка и сервис/);
    assert.match(faqHtml, /Кредит и лизинг/);
    assert.match(faqHtml, /"@type":"FAQPage"/);
    assert.match(faqHtml, /href="\/\?stage=idea&amp;form=contact"/);

    const servicesPage = await fetch(`${origin}/services`, { redirect: "manual" });
    assert.equal(servicesPage.status, 308);
    assert.equal(new URL(servicesPage.headers.get("location"), origin).pathname, "/faq");

    const robots = await fetch(`${origin}/robots.txt`);
    assert.equal(robots.status, 200);
    assert.match(await robots.text(), /Disallow: \//);
    const stylesheetPath = html.match(/href="([^"]+\.css)"/)?.[1];
    assert.ok(stylesheetPath, "rendered HTML must include a stylesheet");
    const stylesheet = await fetch(`${origin}${stylesheetPath}`);
    assert.equal(stylesheet.status, 200);
    assert.match(stylesheet.headers.get("content-type"), /text\/css/);
    assert.match(await stylesheet.text(), /context-panel/);

    const oversized = await fetch(`${origin}/api/leads`, {
      method: "POST",
      body: Buffer.alloc(22 * 1024 * 1024),
    });
    assert.equal(oversized.status, 413);
    assert.equal((await oversized.json()).code, "validation");
  } finally {
    if (child.exitCode === null) {
      child.kill("SIGTERM");
      await new Promise((resolve) => child.once("exit", resolve));
    }
  }
});
