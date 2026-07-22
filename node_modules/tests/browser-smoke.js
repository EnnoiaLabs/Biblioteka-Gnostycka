#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const trace = message => process.stderr.write(`[browser] ${message}\n`);
const mimeTypes = {
  ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8", ".png": "image/png",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};

function staticServer() {
  return http.createServer((request, response) => {
    const requestUrl = new URL(request.url, "http://127.0.0.1");
    const relative = decodeURIComponent(requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname);
    const target = path.resolve(root, `.${relative}`);
    if (!target.startsWith(`${root}${path.sep}`) || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }
    if (process.env.GNOSTYK_LIGHT_BROWSER_TEST === "1" && path.extname(target).toLowerCase() === ".png") {
      response.writeHead(204, { "cache-control": "no-store" }).end();
      return;
    }
    if (process.env.GNOSTYK_LIGHT_BROWSER_TEST === "1" && relative === "/coptic-dictionary.js") {
      response.writeHead(200, { "cache-control": "no-store", "content-type": mimeTypes[".js"] });
      response.end("window.COPTIC_DICTIONARY={};");
      return;
    }
    if (process.env.GNOSTYK_LIGHT_BROWSER_TEST === "1" && relative === "/books/pistis-sophia/data.js") {
      response.writeHead(200, { "cache-control": "no-store", "content-type": mimeTypes[".js"] });
      response.end("window.PISTIS_SOPHIA_DATA={title:'Pistis Sophia',source:'browser fixture',pageCount:2,chapters:[{number:1,page:48,title:'Chapter 1',subtitle:''},{number:2,page:49,title:'Chapter 2',subtitle:''}],pages:[{page:48,text:'Introduction. [THE FIRST BOOK OF] Browser fixture page forty eight with enough source text for the reader smoke test.'},{page:49,text:'Browser fixture page forty nine with enough source text for navigation verification.'}]};window.GNOSTYK_BOOK_MODULES=window.GNOSTYK_BOOK_MODULES||{};window.GNOSTYK_BOOK_MODULES['pistis-sophia']={id:'pistis-sophia',title:'Pistis Sophia',status:'fixture',type:'page-reader',language:'pl',sourceLanguageLayers:['en','cop'],data:window.PISTIS_SOPHIA_DATA,coptic:window.PISTIS_SOPHIA_COPTIC||{meta:{},pages:{}}};");
      return;
    }
    if (process.env.GNOSTYK_LIGHT_BROWSER_TEST === "1" && relative === "/books/pistis-sophia/polish-translations.js") {
      response.writeHead(200, { "cache-control": "no-store", "content-type": mimeTypes[".js"] });
      response.end("window.GNOSTYK_POLISH_TRANSLATIONS={48:'Wprowadzenie. [KSIĘGA PIERWSZA] Próbny tekst strony czterdziestej ósmej dla testu przeglądarkowego.',49:'Próbny tekst strony czterdziestej dziewiątej dla testu nawigacji.'};");
      return;
    }
    if (process.env.GNOSTYK_LIGHT_BROWSER_TEST === "1" && relative === "/books/gospel-of-thomas/data.js") {
      response.writeHead(200, { "cache-control": "no-store", "content-type": mimeTypes[".js"] });
      response.end("window.GNOSTYK_BOOK_MODULES=window.GNOSTYK_BOOK_MODULES||{};window.GNOSTYK_BOOK_MODULES['gospel-of-thomas']={id:'gospel-of-thomas',title:'Ewangelia Tomasza',status:'fixture',type:'logion-reader',language:'pl/en/cop',readerModes:['pl','source','coptic','interlinear'],unitName:'logion',data:{title:'Ewangelia Tomasza',source:'browser fixture',pageCount:2,chapters:[{number:1,page:1,title:'Logion 1',subtitle:''},{number:2,page:2,title:'Logion 2',subtitle:''}],pages:[{page:1,text:'These are the hidden sayings for the browser smoke test.',en:'These are the hidden sayings for the browser smoke test.',polish:'To są ukryte słowa przygotowane dla testu przeglądarkowego.'},{page:2,text:'The second browser fixture logion.',en:'The second browser fixture logion.',polish:'Drugi próbny logion testu przeglądarkowego.'}]},coptic:{meta:{},pages:{}}};");
      return;
    }
    if (process.env.GNOSTYK_LIGHT_BROWSER_TEST === "1" && relative === "/books/gospel-of-thomas/coptic-data.js") {
      response.writeHead(200, { "cache-control": "no-store", "content-type": mimeTypes[".js"] });
      response.end("window.GNOSTYK_BOOK_MODULES['gospel-of-thomas'].coptic={meta:{source:'browser fixture'},pages:{'1':[{page:'1',ref:'1/1',bookTitle:'Ewangelia Tomasza',text:'ⲡⲓⲥⲧⲓⲥ ⲥⲟⲫⲓⲁ'}],'2':[{page:'2',ref:'2/1',bookTitle:'Ewangelia Tomasza',text:'ⲡⲛⲉⲩⲙⲁ'}]}};");
      return;
    }
    if (process.env.GNOSTYK_LIGHT_BROWSER_TEST === "1" && relative === "/books/gospel-of-philip/data.js") {
      response.writeHead(200, { "cache-control": "no-store", "content-type": mimeTypes[".js"] });
      response.end("window.GNOSTYK_BOOK_MODULES=window.GNOSTYK_BOOK_MODULES||{};window.GNOSTYK_BOOK_MODULES['gospel-of-philip']={id:'gospel-of-philip',title:'Ewangelia Filipa',status:'fixture',type:'logion-reader',language:'pl/en',readerModes:['pl','source'],unitName:'section',data:{title:'Ewangelia Filipa',source:'browser fixture',pageCount:1,chapters:[{number:1,page:1,title:'Sekcja 1',subtitle:''}],pages:[{page:1,text:'Philip browser fixture.',en:'Philip browser fixture.',polish:'Próbny tekst Filipa.'}]},coptic:{meta:{},pages:{}}};");
      return;
    }
    if (process.env.GNOSTYK_LIGHT_BROWSER_TEST === "1" && relative === "/books/pistis-sophia/coptic-data.js") {
      response.writeHead(200, { "cache-control": "no-store", "content-type": mimeTypes[".js"] });
      response.end("window.PISTIS_SOPHIA_COPTIC={meta:{},pages:{}};if(window.GNOSTYK_BOOK_MODULES?.['pistis-sophia'])window.GNOSTYK_BOOK_MODULES['pistis-sophia'].coptic=window.PISTIS_SOPHIA_COPTIC;");
      return;
    }
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": mimeTypes[path.extname(target).toLowerCase()] || "application/octet-stream"
    });
    fs.createReadStream(target).pipe(response);
  });
}

async function launchBrowser() {
  const executablePath = process.env.GNOSTYK_BROWSER_EXECUTABLE || undefined;
  let args = ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"];
  if (process.env.GNOSTYK_SERVERLESS_CHROMIUM === "1") {
    args = [
      "--no-sandbox", "--no-zygote", "--disable-dev-shm-usage",
      "--disable-gpu", "--use-gl=disabled", "--disable-software-rasterizer", "--disable-hang-monitor"
    ];
  }
  return chromium.launch({ executablePath, headless: true, args });
}

async function main() {
  const server = staticServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const port = server.address().port;
  let browser;
  try {
    trace("launch");
    browser = await launchBrowser();
    trace("context");
    const context = await browser.newContext({ serviceWorkers: "block" });
    await context.addInitScript(() => {
      localStorage.setItem("ps.settings", JSON.stringify({ interlinearExperimental: true }));
      localStorage.setItem("ps.readerMode", "interlinear");
    });
    const page = await context.newPage();
    trace("page-ready");
    const runtimeErrors = [];
    page.on("pageerror", error => runtimeErrors.push(`pageerror: ${error.message}`));
    page.on("console", message => {
      if (message.type() === "error") runtimeErrors.push(`console: ${message.text()}`);
    });

    await page.goto(`http://127.0.0.1:${port}/?book=gospel-of-thomas&view=reader&page=1`, {
      waitUntil: "commit", timeout: 20000
    });
    trace("thomas-committed");
    await page.waitForSelector('body[data-view="reader"]', { timeout: 60000 });
    trace("thomas-rendered");
    assert.match(await page.locator("#currentPageLabel").innerText(), /1/);
    assert.ok((await page.locator("#pageText").innerText()).includes("Logion 1"));
    assert.ok((await page.locator("#pageText").innerText()).trim().length > 100);

    trace("reader-settings");
    await page.locator('[data-go-home]').first().click();
    await page.waitForSelector('body[data-view="library"]', { timeout: 5000 });
    await page.locator("#librarySettingsToggle").click();
    await page.waitForFunction(
      () => document.querySelector("#settingsPanel")?.hidden === false,
      null,
      { timeout: 5000 }
    );
    for (const theme of ["light", "sepia", "dark"]) {
      await page.locator("#themeSetting").selectOption(theme);
      await page.waitForFunction(
        theme => document.documentElement.dataset.theme === theme
          && document.body.dataset.theme === theme,
        theme,
        { timeout: 5000 }
      );
    }
    await page.goto(`http://127.0.0.1:${port}/?book=gospel-of-thomas&view=reader&page=1`, {
      waitUntil: "commit", timeout: 20000
    });
    await page.waitForSelector('body[data-view="reader"]', { timeout: 60000 });
    for (const alignment of ["left", "center", "justify"]) {
      await page.locator(`[data-text-align="${alignment}"]`).click();
      await page.waitForFunction(
        alignment => document.body.dataset.textAlign === alignment,
        alignment,
        { timeout: 5000 }
      );
    }
    await page.locator("#citationFormat").selectOption("scholarly");
    assert.equal(await page.locator("#citationFormat").inputValue(), "scholarly");
    await page.locator('[data-language-switch="en"]').first().click();
    await page.waitForFunction(
      () => localStorage.getItem("ps.interfaceLanguage") === "en"
        && document.documentElement.lang === "en",
      null,
      { timeout: 5000 }
    );
    await page.locator('[data-language-switch="pl"]').first().click();
    await page.waitForFunction(
      () => localStorage.getItem("ps.interfaceLanguage") === "pl"
        && document.documentElement.lang === "pl",
      null,
      { timeout: 5000 }
    );

    for (const [selector, pressedMode] of [
      ["#sourceMode", "source"], ["#copticMode", "coptic"],
      ["#interlinearMode", "interlinear"], ["#polishMode", "pl"]
    ]) {
      trace(`mode-${pressedMode}`);
      await page.locator(selector).click({ timeout: 5000 });
      await page.waitForFunction(
        ({ selector, pressedMode }) => document.querySelector(selector)?.getAttribute("aria-pressed") === "true"
          && localStorage.getItem("ps.readerMode") === pressedMode,
        { selector, pressedMode }, { timeout: 5000 }
      );
      assert.ok((await page.locator("#pageText").innerText()).trim().length > 20, `${pressedMode}: empty reader`);
    }

    await page.locator("#nextPage").click();
    trace("thomas-next");
    await page.waitForFunction(() => document.querySelector("#pageInput")?.value === "2", null, { timeout: 5000 });
    assert.match(await page.locator("#currentPageLabel").innerText(), /2/);

    await page.locator("#interlinearMode").click();
    await page.waitForFunction(() => localStorage.getItem("ps.readerMode") === "interlinear", null, { timeout: 5000 });
    await page.goto(`http://127.0.0.1:${port}/?book=pistis-sophia&view=reader&page=48`, {
      waitUntil: "commit", timeout: 20000
    });
    trace("pistis-committed");
    await page.waitForSelector('body[data-view="reader"]', { timeout: 60000 });
    await page.waitForFunction(
      () => document.querySelector("#pageInput")?.value === "48"
        && /48/.test(document.querySelector("#currentPageLabel")?.textContent || ""),
      null,
      { timeout: 60000 }
    );
    trace("pistis-rendered");
    assert.match(await page.locator("#currentPageLabel").innerText(), /48/);
    assert.equal(await page.locator("#interlinearMode").getAttribute("aria-pressed"), "true");
    assert.ok((await page.locator("#pageText").innerText()).trim().length > 20);
    await page.locator("#nextPage").click();
    await page.waitForFunction(() => document.querySelector("#pageInput")?.value === "49", null, { timeout: 5000 });

    if (process.env.GNOSTYK_LIGHT_BROWSER_TEST !== "1") {
      trace("pistis-translation-255-pages");
      const textLayerResult = await page.evaluate(() => {
        const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
        const missing = [];
        for (let number = 49; number <= 255; number += 1) {
          const expected = window.GNOSTYK_POLISH_TRANSLATIONS[number];
          const rendered = polishProseHtml(expected);
          if (typeof rendered !== "string" || normalize(rendered).length < 20 || rendered.includes("\uFFFD")) missing.push(number);
        }
        const page48MainSource = pistisPage48MainText(window.GNOSTYK_POLISH_TRANSLATIONS[48], "pl");
        const page48Main = polishProseHtml(page48MainSource);
        return { missing, page48Main, page48MainSource };
      });
      assert.deepEqual(textLayerResult.missing, [], `pages rejected by the Polish rendering pipeline: ${textLayerResult.missing.join(", ")}`);

      const addendaResult = await page.evaluate(page48Main => {
        const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
        const missing = [];
        for (let number = 1; number <= 47; number += 1) {
          const rendered = highlight(window.GNOSTYK_POLISH_TRANSLATIONS[number]);
          if (typeof rendered !== "string" || normalize(rendered).length < 20 || rendered.includes("\uFFFD")) missing.push(number);
        }
        const page48Intro = splitPistisPage48Text(window.GNOSTYK_POLISH_TRANSLATIONS[48], "pl").introduction;
        const split = splitPistisPage48Text(window.GNOSTYK_POLISH_TRANSLATIONS[48], "pl");
        const page48Complete = normalize(`${split.introduction} ${split.main}`) === normalize(window.GNOSTYK_POLISH_TRANSLATIONS[48]);
        return { missing, page48Complete };
      }, textLayerResult.page48MainSource);
      assert.deepEqual(addendaResult.missing, [], `addenda pages rejected by the Polish rendering pipeline: ${addendaResult.missing.join(", ")}`);
      assert.equal(addendaResult.page48Complete, true, "page 48 split is not fully represented by the rendering pipeline");
      console.log("[OK] Strażnik widoczności: 255/255 polskich stron przechodzi przez właściwą ścieżkę renderowania");
    }
    assert.deepEqual(runtimeErrors, [], runtimeErrors.join("\n"));

    trace("mobile-layout");
    const mobilePage = await context.newPage();
    await mobilePage.setViewportSize({ width: 390, height: 844 });
    await mobilePage.goto(`http://127.0.0.1:${port}/?book=gospel-of-thomas&view=reader&page=1`, {
      waitUntil: "commit", timeout: 20000
    });
    await mobilePage.waitForSelector('body[data-view="reader"]', { timeout: 60000 });
    assert.equal(await mobilePage.locator(".mobile-bottom-nav").isVisible(), true);
    await mobilePage.waitForFunction(
      () => (document.querySelector("#pageText")?.textContent || "").trim().length > 20,
      null,
      { timeout: 5000 }
    );
    await mobilePage.locator('[data-mobile-panel="more"]').click();
    await mobilePage.waitForFunction(
      () => document.querySelector("#mobileSheet")?.getAttribute("aria-hidden") === "false",
      null,
      { timeout: 5000 }
    );
    assert.equal(await mobilePage.locator("#mobileCopyButton").isVisible(), true);
    await mobilePage.close();

    console.log("[OK] Chromium: księgi, tryby, nawigacja, motywy, język, wyrównanie, cytowanie i widok mobilny");
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => {
  console.error(`[X] Test przeglądarkowy: ${error.stack || error.message}`);
  process.exit(1);
});
