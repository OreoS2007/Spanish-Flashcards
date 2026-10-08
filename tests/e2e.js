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
  ok((await pg.innerText(".count")) === "1/15", "checkpoint has 15 questions");
  ok(await pg.locator(".opt").count() === 4, "4 choices");
  // answer every question: right = the correct option, wrong = any other option
  const playTest = async right => {
    for (let i = 0; i < 20 && await pg.locator(".opt").count(); i++) {
      const ans = await pg.evaluate(() => testS.qs[testS.i].ans);
      await pg.locator(".opt").nth(right ? ans : (ans + 1) % 4).click(); await pg.waitForTimeout(120);
      if (await pg.locator("#qn").count()) { await pg.click("#qn"); await pg.waitForTimeout(150); } else await pg.waitForTimeout(750);
    }
  };
  await playTest(false);
  let res = await body();
  ok(/0\s*\/ 15 correct · 12 needed/.test(res) && /Not in this test \(35\)/.test(res), "failing shows the score (12 of 15 needed) and the 35 untested words");
  ok(await pg.locator("#tclear").count() === 0, "a failed test cannot clear the units");
  await pg.locator("[data-d]").last().click(); await pg.waitForTimeout(250);
  ok(await pg.locator("#sheet.show").count() === 1, "tapping a listed word opens the detail sheet");
  await pg.click("#shx"); await pg.waitForTimeout(150);
  await pg.click("#tagain"); await pg.waitForTimeout(300);
  await playTest(true);
  ok(await pg.locator("#cklist li").count() === 35 && await pg.locator("#tclear").count() === 1, "passing lists the 35 untested words with a Clear button");
  const flagged = await pg.evaluate(() => [...document.querySelectorAll("#cklist [data-ck]")].slice(0, 2).map(b => b.dataset.ck));
  await pg.locator("#cklist [data-ck]").nth(0).click(); await pg.locator("#cklist [data-ck]").nth(1).click();
  ok(/2 to Review/.test(await pg.innerText("#tclear")), "flagging words updates the Clear button");
  await pg.click("#tclear"); await pg.waitForTimeout(300);
  const st1 = await pg.evaluate(fl => { const blk = cpBlocks(sections()[0])[0], ws = cpWords(blk); return { n: ws.length, o: ws.filter(w => ST[w.es] === "o").length, x: ws.filter(w => ST[w.es] === "x").length, flagX: fl.every(e => ST[e] === "x"), cleared: !!cpRec(blk).cleared }; }, flagged);
  ok(st1.n === 50 && st1.flagX && st1.cleared && st1.o + st1.x === 50, "clearing marks flagged words ✖ and the rest ◯");
  await pg.click("#tagain"); await pg.waitForTimeout(300); await playTest(true);
  await pg.click("#tclear"); await pg.waitForTimeout(300);
  const st2 = await pg.evaluate(() => { const blk = cpBlocks(sections()[0])[0], ws = cpWords(blk); return ws.every(w => ST[w.es] === "o"); });
  ok(st2, "flagging nothing makes all 5 units perfect");
  await pg.click("#tout"); await pg.waitForTimeout(250);
  ok(/Cleared/.test(await pg.locator(".cp").first().innerText()), "checkpoint node shows Cleared");
  // records follow the block's words, not its position (so adding words later can't attach a record to the wrong units)
  const moved = await pg.evaluate(() => { const bs = cpBlocks(sections()[0]), key = Object.keys(S.cp).find(k => S.cp[k].cleared);
    S.cp["A1|moved#9|es"] = S.cp[key]; delete S.cp[key];            // pretend the block shifted to another position
    const a = !!(cpRec(bs[0]) || {}).cleared, b = !!cpRec(bs[1]);
    const rec = S.cp["A1|moved#9|es"]; delete rec.ws;               // an old-format record (no word list) at its original position
    S.cp[cpKey(bs[0])] = rec; delete S.cp["A1|moved#9|es"];
    const c = !!(cpRec(bs[0]) || {}).cleared && Array.isArray(rec.ws);
    return { a, b, c }; });
  ok(moved.a && !moved.b, "a record follows its words when the block moves, and doesn't match a different block");
  ok(moved.c, "old-format records are adopted by the block at their position");
  const lp = await pg.evaluate(() => { const s = sections()[0], us = unitsOf(s); return lastPos({ sec: s.id, j: 0, w: us[2].words[3].es }).j; });
  ok(lp === 2, "\"last played\" finds its unit by word even if the unit number changed");
  // a block that has not been studied yet can be tested too (the test is a way to skip ahead)
  await pg.locator(".cp").nth(1).click(); await pg.waitForTimeout(300);
  ok(await pg.innerText(".count") === "1/15", "a later checkpoint (units not studied yet) can be opened");
  await pg.evaluate(() => { testS = null; screen = null; go("learn"); });

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
  await pg.evaluate(() => { S.world = "A1"; S.grp = { mode: "freq", pos: "noun", sort: "freq" }; save(); go("learn"); });
  await pg.waitForTimeout(200);
  ok(!/Part of speech/i.test(await body()), "Learn has no Part of speech option");
  await pg.evaluate(() => { const g = JSON.parse(localStorage.getItem("esfc-v2")); g.grp = { mode: "pos", pos: "noun", sort: "freq" }; localStorage.setItem("esfc-v2", JSON.stringify(g)); });
  await pg.reload(); await pg.waitForTimeout(500);
  ok(await pg.evaluate(() => S.grp.mode) === "freq", "a saved Part-of-speech setting falls back to Frequency");
  await pg.evaluate(() => { S.world = "A1"; S.grp = { mode: "pos", pos: "phrase", sort: "freq" }; save(); render(); });
  ok(/Phrases/.test(await body()), "Phrases are still reachable (Toolkit)");
  await pg.click("text=Toolkit"); await pg.waitForTimeout(250);
  ok(/Start drill \(10\)/.test(await body()), "conjugation drill is 10 questions");

  console.log("Sound effects");
  await pg.evaluate(() => go("learn")); await pg.waitForTimeout(200);
  ok(await pg.locator("[data-snd]").count() === 1, "the top bar has a sound on/off button");
  await pg.click("[data-snd]");
  ok(await pg.evaluate(() => S.sound === false) && /🔇/.test(await pg.innerText("[data-snd]")), "tapping it turns the sound off");
  await pg.click("[data-snd]");
  ok(await pg.evaluate(() => S.sound !== false) && /🔊/.test(await pg.innerText("[data-snd]")), "tapping again turns it on");
  const sfxOk = await pg.evaluate(() => { try { for (const k of ["ok", "mid", "bad", "flip", "done", "fail"]) SFX[k](); return true; } catch (e) { return false; } });
  ok(sfxOk, "every sound plays without errors");

  console.log("Backup");
  await pg.evaluate(() => go("kit")); await pg.waitForTimeout(200);
  ok(/Save backup/.test(await body()), "Toolkit has a Backup card");
  const [dl] = await Promise.all([pg.waitForEvent("download"), pg.click("#bkx")]);
  const fs = require("fs"), tmp = require("path").join(require("os").tmpdir(), "esfc-backup-test.json");
  await dl.saveAs(tmp);
  const saved = JSON.parse(fs.readFileSync(tmp, "utf8"));
  ok(saved.app === "esfc-v2" && saved.data && typeof saved.data.st === "object", "backup file has the expected shape");
  await pg.evaluate(() => { S.st = {}; S.st2 = {}; ST = S.st; save(); });
  pg.once("dialog", d => d.accept());
  await pg.setInputFiles("#bkf", tmp); await pg.waitForTimeout(400);
  const restored = await pg.evaluate(() => Object.keys(S.st).length);
  ok(restored === Object.keys(saved.data.st).length && restored > 0, "restoring a backup brings the progress back");
  fs.unlinkSync(tmp);

  console.log("Backup reminder (12 days)");
  const dayAgo = n => pg.evaluate(n => { const d = new Date(); d.setDate(d.getDate() - n); delete S.bkLater; S.lastBackup = dayKey(d); save(); go("learn"); }, n);
  await dayAgo(11); await pg.waitForTimeout(200);
  ok(!/Time to back up/.test(await body()), "no reminder after 11 days");
  await dayAgo(12); await pg.waitForTimeout(200);
  ok(/Time to back up/.test(await body()), "reminder appears after 12 days");
  await pg.click("#bklater"); await pg.waitForTimeout(200);
  ok(!/Time to back up/.test(await body()), "Later hides the reminder for today");
  await pg.evaluate(() => { delete S.bkLater; save(); go("learn"); }); await pg.waitForTimeout(200);
  const [dl2] = await Promise.all([pg.waitForEvent("download"), pg.click("#bkgo")]);
  await dl2.cancel().catch(() => {}); await pg.waitForTimeout(300);
  ok(!/Time to back up/.test(await body()), "saving a backup clears the reminder");

  ok(errors.length === 0, "no JavaScript errors" + (errors.length ? ": " + errors.join(" | ") : ""));
  await b.close();
  console.log(fails.length ? `\nFAIL: ${fails.length} problem(s)` : "\nOK: all browser tests passed");
  process.exit(fails.length ? 1 : 0);
})();
