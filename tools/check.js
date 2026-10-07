// Full quality check. Usage: node tools/check.js [index.html] [--shadow]
// Exit code 1 if any ERROR is found. WARN items are worth a look but do not fail.
const { scriptOf, loadData, functionSource, tok } = require("./lib");
const file = process.argv.find(a => a.endsWith(".html")) || "index.html";
const SHOW_SHADOW = process.argv.includes("--shadow");
const err = {}, warn = {};
const E = (k, v) => (err[k] = err[k] || []).push(v), W = (k, v) => (warn[k] = warn[k] || []).push(v);

// 1) syntax of the whole script
try { new Function(scriptOf(file).js); } catch (e) { E("syntax", e.message); }

const D = loadData(file);
const { WORDS, DETAIL, PHRASES, TOPICS, EXTRA, COGS, HEAD, COGH, FORMS, lookup } = D;
const POS = new Set(["phr","m","f","f!","mf","v","v:ie","v:ue","v:i","v:zc","v:irr","adj","adv","prep","conj","pron","det","num","int"]);
const cogS = new Set(COGS.map(c => c.es));
const seen = new Set();

// 2) per-word checks
for (const w of WORDS) {
  if (seen.has(w.es)) E("duplicate headword", w.es); seen.add(w.es);
  if (!POS.has(w.pos)) E("unknown pos", w.es + ":" + w.pos);
  if (!/^(A1|A2|B1|B2|C1|C2)$/.test(w.cefr)) E("bad cefr", w.es);
  if (!w.en || !w.en.trim()) E("missing en", w.es);
  if (w.es !== w.es.toLowerCase()) E("headword not lowercase", w.es);
  if (w.cog && !cogS.has(w.es)) E("cog:1 but not in COGS", w.es);
  if (!w.cog && cogS.has(w.es)) E("in COGS but no cog:1", w.es);
  if (w.pos[0] === "v" && !/(ar|er|ir|ír)(se)?$/.test(w.es)) E("verb headword not an infinitive", w.es);
  if (w.pos === "m" && /(ción|sión|dad|tad|tud|umbre)$/.test(w.es)) W("masculine with feminine ending (check)", w.es);
  if (w.pos === "m" && /a$/.test(w.es) && !(DETAIL[w.es] && DETAIL[w.es].n)) W("masculine -a without note", w.es);
  const d = DETAIL[w.es];
  if (!d) { E("no DETAIL", w.es); continue; }
  if (!Array.isArray(d.s) || d.s.length < 1 || d.s.length > 4) E("needs 1-4 senses", w.es);
  const exs = new Set();
  d.s.forEach((s, i) => {
    if (!Array.isArray(s) || s.length !== 6) return E("sense shape", w.es + " #" + i);
    if (!(s[0] === 0 || typeof s[0] === "string")) E("sense label", w.es);
    if (!s[1] || !s[2] || !s[3]) E("empty sense field", w.es + " #" + i);
    if (exs.has(s[2])) E("same example twice in one card", w.es); exs.add(s[2]);
    if (s[4].includes(w.es) || s[5].includes(w.es)) E("word lists itself as syn/ant", w.es);
    s[4].forEach(x => { if (s[5].includes(x)) E("same word as synonym and antonym", w.es + ":" + x); });
    const q1 = (s[2].match(/¿/g) || []).length, q2 = (s[2].match(/\?/g) || []).length;
    const x1 = (s[2].match(/¡/g) || []).length, x2 = (s[2].match(/!/g) || []).length;
    if (q1 !== q2 || x1 !== x2) E("unbalanced ¿? or ¡!", w.es + ": " + s[2]);
    if (/[¿¡]/.test(s[3])) E("Spanish punctuation in English translation", w.es);
    tok(s[2]).forEach(t => { if (!lookup(t).length) E("example word not tappable (add to EXTRA)", t.toLowerCase() + "  <- " + w.es); });
    s[4].concat(s[5]).forEach(t => { if (!lookup(t).length) E("chip not tappable (add to EXTRA)", t + "  <- " + w.es); });
  });
}
for (const p of PHRASES) tok(p[2]).forEach(t => { if (!lookup(t).length) E("phrase example word not tappable", t); });

// 3) same example sentence on two different cards
const exMap = {};
for (const w of WORDS) (DETAIL[w.es] ? DETAIL[w.es].s : []).forEach(s => (exMap[s[2]] = exMap[s[2]] || new Set()).add(w.es));
for (const k in exMap) if (exMap[k].size > 1) {
  const ws = [...exMap[k]];
  (ws.some(x => HEAD[x] && HEAD[x].pos === "phr") ? E : W)("same example on different cards", ws.join(" + ") + ": " + k);
}

// 4) dictionary / data integrity
for (const k in DETAIL) if (!HEAD[k]) W("DETAIL without a word (orphan)", k);
for (const k in EXTRA) {
  if (k !== k.toLowerCase()) E("EXTRA key not lowercase", k);
  const e = EXTRA[k]; if (!Array.isArray(e) || !e[0]) E("EXTRA entry malformed", k);
  else if (e[1] && !HEAD[e[1]] && !EXTRA[e[1]] && !COGH[e[1]] && !FORMS[e[1]]) W("EXTRA base form has no entry of its own", k + " -> " + e[1]);
}
const cs = new Set();
for (const c of COGS) { if (cs.has(c.es)) E("COGS duplicate", c.es); cs.add(c.es); if (!HEAD[c.es]) E("COGS entry not in deck", c.es); else if (HEAD[c.es].pos !== c.pos) E("COGS pos differs from deck", c.es); }
for (const t of TOPICS) t[3].split(" ").filter(Boolean).forEach(x => { if (!HEAD[x]) W("TOPICS word not in deck", t[0] + ":" + x); });

// 5) phrase cards: the phrase must be found inside each of its examples (EN->ES blanking)
try {
  const src = functionSource(file, "phraseHits", "function wrapWords(");
  const phraseHits = new Function("lookup", src + "\nreturn phraseHits;")(lookup);
  for (const w of WORDS.filter(w => w.pos === "phr")) {
    const ww = Object.assign({}, w, { disp: w.es });
    DETAIL[w.es].s.forEach((s, i) => { if (!phraseHits(tok(s[2]), ww)) E("phrase not found in its own example", w.es + " #" + i + ": " + s[2]); });
  }
} catch (e) { E("phraseHits check failed", e.message); }

// 6) optional: plural/feminine forms whose noun/adjective reading is hidden by a verb form
if (SHOW_SHADOW) {
  const cands = f => { const t = []; if (f.endsWith("ces")) t.push(f.slice(0, -3) + "z"); if (f.endsWith("es")) t.push(f.slice(0, -2)); if (f.endsWith("s")) t.push(f.slice(0, -1)); if (f.endsWith("as") || f.endsWith("os")) t.push(f.slice(0, -2) + "o"); if (f.endsWith("a")) t.push(f.slice(0, -1) + "o"); return t.filter(c => HEAD[c] && /^(m|f|f!|mf|adj|det|pron|num)$/.test(HEAD[c].pos)); };
  const out = {};
  for (const w of WORDS) (DETAIL[w.es] ? DETAIL[w.es].s : []).forEach(s => tok(s[2]).forEach(t => {
    const f = t.toLowerCase(), c = cands(f); if (!c.length || EXTRA[f]) return;
    const r = lookup(t); if (c.some(x => r.some(y => y.lemma === x))) return;
    out[f] = out[f] || { c, r: r.map(x => x.lemma + "(" + (x.label || "head") + ")").join("|"), ex: w.es + ": " + s[2] };
  }));
  for (const f in out) W("shadowed reading (check the sentence)", f + " | wanted " + out[f].c.join("/") + " | got " + out[f].r + " | " + out[f].ex);
}

// report
const counts = {}; WORDS.forEach(w => { const k = w.cefr + (w.pos === "phr" ? " phrases" : " words"); counts[k] = (counts[k] || 0) + 1; });
console.log("Cards:", WORDS.length, JSON.stringify(counts));
for (const [lvl, obj] of [["ERROR", err], ["WARN", warn]]) for (const k in obj) {
  console.log(`\n[${lvl}] ${k} (${obj[k].length})`); obj[k].slice(0, 40).forEach(x => console.log("  - " + x)); if (obj[k].length > 40) console.log("  ...");
}
const nErr = Object.values(err).reduce((a, b) => a + b.length, 0);
console.log(nErr ? `\nFAIL: ${nErr} error(s). Fix before publishing.` : "\nOK: no errors.");
process.exit(nErr ? 1 : 0);
