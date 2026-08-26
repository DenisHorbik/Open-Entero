import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import test from "node:test";

async function listen(server) {
  await new Promise((resolve, reject) => server.listen(0, "127.0.0.1", resolve).once("error", reject));
  return server.address().port;
}

async function close(server) {
  await new Promise((resolve) => server.close(resolve));
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

async function jsonBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function bitrixMock() {
  const state = {
    mode: "new",
    companies: [],
    deals: [],
    comments: [],
  };
  const server = createServer(async (request, response) => {
    const method = new URL(request.url, "http://localhost").pathname.split("/").at(-1)?.replace(/\.json$/, "");
    const params = await jsonBody(request);
    let result;

    if (method === "crm.deal.list") {
      result = state.deals
        .filter((deal) => deal.fields.ORIGIN_ID === params.filter?.ORIGIN_ID)
        .map((deal) => ({ ID: String(deal.id), COMPANY_ID: String(deal.fields.COMPANY_ID) }));
    } else if (method === "crm.company.list" && params.filter?.ORIGIN_ID) {
      result = state.companies
        .filter((company) => company.fields.ORIGIN_ID === params.filter.ORIGIN_ID)
        .map((company) => ({ ID: String(company.id), ...company.fields }));
    } else if (method === "crm.duplicate.findbycomm") {
      result = { COMPANY: state.mode === "existing" ? [42, 43] : [] };
    } else if (method === "crm.company.list") {
      result = state.mode === "existing"
        ? [
            { ID: "43", TITLE: "Существующий ресторан", ASSIGNED_BY_ID: "9", DATE_MODIFY: "2026-08-26T12:00:00+03:00" },
            { ID: "42", TITLE: "Старая карточка", ASSIGNED_BY_ID: "7", DATE_MODIFY: "2025-01-01T12:00:00+03:00" },
          ]
        : [];
    } else if (method === "crm.company.add") {
      const company = { id: 501, fields: params.fields };
      state.companies.push(company);
      result = company.id;
    } else if (method === "crm.deal.add") {
      const deal = { id: 701 + state.deals.length, fields: params.fields };
      state.deals.push(deal);
      result = deal.id;
    } else if (method === "crm.timeline.comment.list") {
      result = state.comments
        .filter((comment) => comment.fields.ENTITY_ID === Number(params.filter?.ENTITY_ID))
        .map((comment, index) => ({ ID: String(index + 1), COMMENT: comment.fields.COMMENT }));
    } else if (method === "crm.timeline.comment.add") {
      state.comments.push({ fields: params.fields });
      result = state.comments.length;
    } else {
      response.writeHead(404, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "UNKNOWN_METHOD", error_description: method }));
      return;
    }

    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ result }));
  });
  return { server, state };
}

function leadForm(requestId, overrides = {}) {
  const form = new FormData();
  const values = {
    stage: "idea",
    phone: "+375 44 700-51-11",
    contactMethod: "telegram",
    venueType: "restaurant",
    name: "TEST Денис",
    website: "",
    attribution: JSON.stringify({
      landingUrl: "https://open.entero.by/?stage=idea&utm_source=google&gclid=test-click",
      referrer: "https://google.com/",
      initialStage: "idea",
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "test-campaign",
      gclid: "test-click",
    }),
    ...overrides,
  };
  form.set("idempotencyKey", requestId);
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  form.set("file", new File(["test specification"], "test-specification.pdf", { type: "application/pdf" }));
  return form;
}

test("lead API creates Company + Deal, reuses an existing company and supports later attachments", async () => {
  const mock = bitrixMock();
  const mockPort = await listen(mock.server);
  const siteProbe = createServer();
  const sitePort = await listen(siteProbe);
  await close(siteProbe);
  const child = spawn(process.execPath, ["server/index.mjs"], {
    cwd: new URL("..", import.meta.url),
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: String(sitePort),
      HOST: "127.0.0.1",
      BITRIX24_WEBHOOK_URL: `http://127.0.0.1:${mockPort}/rest/1/mock-secret/`,
      BITRIX24_ALLOW_INSECURE_LOCAL: "1",
      BITRIX24_DEAL_CATEGORY_ID: "0",
      BITRIX24_DEAL_STAGE_ID: "NEW",
      BITRIX24_SOURCE_ID: "WEB",
      LEAD_UPLOAD_SECRET: "test-only-secret-that-is-longer-than-thirty-two-characters",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  try {
    await ready(child);
    const origin = `http://127.0.0.1:${sitePort}`;

    const [first, simultaneous] = await Promise.all([
      fetch(`${origin}/api/leads`, {
        method: "POST",
        headers: { "x-forwarded-for": "198.51.100.10" },
        body: leadForm("request-new-0001"),
      }),
      fetch(`${origin}/api/leads`, {
        method: "POST",
        headers: { "x-forwarded-for": "198.51.100.11" },
        body: leadForm("request-new-0001"),
      }),
    ]);
    assert.equal(first.status, 200);
    assert.equal(simultaneous.status, 200);
    const firstResult = await first.json();
    assert.equal(firstResult.ok, true);
    assert.ok(firstResult.uploadToken);
    assert.equal(mock.state.companies.length, 1);
    assert.equal(mock.state.companies[0].fields.TITLE, "TEST Денис — открывает ресторан / кафе");
    assert.equal(mock.state.deals.length, 1);
    assert.equal(mock.state.deals[0].fields.CATEGORY_ID, 0);
    assert.equal(mock.state.deals[0].fields.STAGE_ID, "NEW");
    assert.equal(mock.state.deals[0].fields.SOURCE_DESCRIPTION, "open.entero.by:new-company");
    assert.equal(mock.state.deals[0].fields.UTM_SOURCE, "google");
    assert.equal(mock.state.deals[0].fields.ASSIGNED_BY_ID, undefined);
    assert.equal(mock.state.comments.length, 1);
    assert.equal(mock.state.comments[0].fields.FILES[0][0], "test-specification.pdf");

    const repeated = await fetch(`${origin}/api/leads`, {
      method: "POST",
      headers: { "x-forwarded-for": "198.51.100.13" },
      body: leadForm("request-new-0001"),
    });
    assert.equal(repeated.status, 200);
    assert.equal(mock.state.companies.length, 1);
    assert.equal(mock.state.deals.length, 1);
    assert.equal(mock.state.comments.length, 1);

    const attachment = new FormData();
    attachment.set("uploadToken", firstResult.uploadToken);
    attachment.set("attachmentId", "attachment-0001");
    attachment.set("file", new File(["extra"], "extra-plan.png", { type: "image/png" }));
    const attached = await fetch(`${origin}/api/leads/attachments`, { method: "POST", body: attachment });
    assert.equal(attached.status, 200);
    assert.equal((await attached.json()).ok, true);
    assert.equal(mock.state.comments.length, 2);
    assert.equal(mock.state.comments[1].fields.FILES[0][0], "extra-plan.png");

    mock.state.mode = "existing";
    const existing = await fetch(`${origin}/api/leads`, {
      method: "POST",
      headers: { "x-forwarded-for": "198.51.100.12" },
      body: leadForm("request-existing-0001", { stage: "project", venueType: "hotel" }),
    });
    assert.equal(existing.status, 200);
    assert.equal((await existing.json()).ok, true);
    assert.equal(mock.state.companies.length, 1, "no new company should be created for a matching phone");
    assert.equal(mock.state.deals.length, 2);
    const existingDeal = mock.state.deals[1].fields;
    assert.equal(existingDeal.COMPANY_ID, 43);
    assert.equal(existingDeal.ASSIGNED_BY_ID, 9);
    assert.equal(existingDeal.SOURCE_DESCRIPTION, "open.entero.by:existing-company");
    assert.match(existingDeal.COMMENTS, /Найдено компаний с таким телефоном: 2/);
  } finally {
    if (child.exitCode === null) {
      child.kill("SIGTERM");
      await new Promise((resolve) => child.once("exit", resolve));
    }
    await close(mock.server);
  }
});
