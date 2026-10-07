// Browser test: plays through the app like a user. Usage: node tests/e2e.js [index.html]
// Needs Playwright:  npm install  &&  npx playwright install chromium
const { chromium } = require("playwright"); const path = require("path");
const file = "file://" + path.resolve(process.argv[2] || "index.html");
const fails = []; const ok = (cond, msg) => { console.log((cond ? "  ✓ " : "  ✗ ") + msg); if (!cond) fails.push(msg); };
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; pg.on("pageerror", e => errors.push(String(e)));
  await pg.goto(file); await pg.waitForTimeout(700);
  const rateAll = async () => { for (let i = 0; i < 40 && await pg.locator("#ro").count(); i++) { await pg.click("#ro"); await pg.waitForTimeout(310); } };
  const body = () => pg.innerText("body");

  console.log("Sessions & Next");
  ok(/Start: 10 new/.test(await body()), "a unit starts with 10 new cards");
  await pg.locator(".path .node[data-u]").nth(0).click({ force: true }); await pg.waitForTimeout(250);
  ok((await pg.innerText(".count")).endsWith("/10"), "session length is 10");
  await rateAll();
  ok(/Next: A1 · Part 1 · Unit 2/.test(await body()), "Next points to the unit right after");
  await pg.click("#out"); await pg.waitForTimeout(250);
  for (let u = 1; u < 4; u++) { await pg.locator(".path .node[data-u]").nth(u).click({ force: true }); await pg.waitForTimeout(250); await rateAll(); await pg.click("#out"); await pg.waitForTimeout(250); }
  await pg.locator(".path .node[data-u]").nth(4).click({ force: true }); await pg.waitForTimeout(250); await rateAll();

  console.log("Checkpoint test");
  ok(await pg.locator("#cpt").count() === 1, "after unit 5 the done screen offers the checkpoint");
  await pg.click("#cpt"); await pg.waitForTimeout(300);
  ok((await pg.innerText(".count")) === "1/20", "checkpoint has 20 questions");
  ok(await pg.locator(".opt").count() === 4, "4 choices");
  for (let i = 0; i < 25 && await pg.locator(".opt").count(); i++) {
    await pg.locator(".opt").nth(i % 4).click(); await pg.waitForTimeout(120);
    if (await pg.locator("#qn").count()) { await pg.click("#qn"); await pg.waitForTimeout(150); } else await pg.waitForTimeout(750);
  }
  const res = await body();
  ok(/correct/.test(res) && /Not in this test \(30\)/.test(res), "results show score and the 30 untested words");
  await pg.locator("[data-d]").last().click(); await pg.waitForTimeout(250);
  ok(await pg.locator("#sheet.show").count() === 1, "tapping a listed word opens the detail sheet");
  await pg.click("#shx"); await pg.waitForTimeout(150);
  await pg.click("#tout"); await pg.waitForTimeout(250);
  ok(/Best \d+\/20/.test(await pg.locator(".cp").first().innerText()), "checkpoint node shows the best score");

  console.log("Quiz generation everywhere");
  const sim = await pg.evaluate(() => { const out = { qs: 0, short: 0, dup: 0 };
    for (const dir of ["es", "en"]) { setDir(dir);
      for (const [c] of WORLDS) { if (!worldWords(c).length) continue; S.world = c;
        for (const g of [{ mode: "freq" }].concat(POS_OPTS.flatMap(([p]) => SORTS[p].map(([s]) => ({ mode: "pos", pos: p, sort: s }))))) {
          S.grp = Object.assign({ mode: "freq", pos: "noun", sort: "freq" }, g);
          for (const s of sections()) for (const blk of cpBlocks(s)) for (const q of makeQuiz(cpWords(blk)).qs) {
            out.qs++; if (q.opts.length < 4) out.short++;
            const l = q.opts.map(o => dir === "en" ? full(o) : firstMeaning(o)); if (new Set(l).size !== l.length) out.dup++; } } } }
    setDir("es"); return out; });
  ok(sim.short === 0 && sim.dup === 0, `all ${sim.qs} simulated questions have 4 distinct choices`);

  console.log("Phrases & toolkit");
  await pg.evaluate(() => { S.world = "A1"; S.grp = { mode: "pos", pos: "phrase", sort: "freq" }; save(); render(); });
  await pg.waitForTimeout(200);
  ok(/Phrases/.test(await body()), "Phrases filter works");
  await pg.click("text=Toolkit"); await pg.waitForTimeout(250);
  ok(/Start drill \(10\)/.test(await body()), "conjugation drill is 10 questions");

  ok(errors.length === 0, "no JavaScript errors" + (errors.length ? ": " + errors.join(" | ") : ""));
  await b.close();
  console.log(fails.length ? `\nFAIL: ${fails.length} problem(s)` : "\nOK: all browser tests passed");
  process.exit(fails.length ? 1 : 0);
})();
