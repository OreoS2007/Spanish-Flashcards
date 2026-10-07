// Adds a batch of words/phrases to index.html.
// Usage: node tools/add-batch.js data/batches/<file>.js
// A backup of index.html is saved in backups/ first. Run `npm run check` afterwards.
//
// Batch file format (see data/batches/_template.js):
// module.exports = {
//   label: "B2 batch 1",          // shown as a comment in index.html
//   cefr: "B2",                   // default level (an entry can override with opts.cefr)
//   entries: [ [es, pos, en, opts, senses, note?], ... ],
//   extra: { "form": ["English", "base"] },    // EXTRA lookups for tappable words
//   irr:   { verb: { pres:"...", subj:"..." } } // irregular conjugations (merged into IRR)
// };
const fs = require("fs"), path = require("path");
const file = "index.html";
const batchPath = process.argv[2];
if (!batchPath) { console.error("Usage: node tools/add-batch.js data/batches/<file>.js"); process.exit(1); }
const B = require(path.resolve(batchPath));
let h = fs.readFileSync(file, "utf8");
// refuse duplicates up front (headwords are progress keys and must be unique)
const { loadData } = require("./lib");
const HEAD = loadData(file).HEAD, inBatch = new Set();
for (const e of B.entries) {
  if (HEAD[e[0]]) throw new Error(`"${e[0]}" is already in the deck - remove it from the batch`);
  if (inBatch.has(e[0])) throw new Error(`"${e[0]}" appears twice in the batch`); inBatch.add(e[0]);
}

const words = [], detail = {}, cogs = [];
for (const e of B.entries) {
  const [es, pos, en, o = {}, senses, note] = e;
  const cefr = o.cefr || e.cefr || B.cefr;
  if (!cefr) throw new Error("No CEFR level for " + es);
  if (es !== es.toLowerCase()) throw new Error("Headword must be lowercase: " + es);
  const w = { es, pos, en, cefr }; if (o.cog) w.cog = 1; if (o.ff) w.ff = o.ff; w.new = 1;
  words.push(w); detail[es] = note ? { n: note, s: senses } : { s: senses };
  if (o.cog) cogs.push({ es, pos, en });
}
const block = `\n/* ${B.label || "batch"} (+${words.length}) */\nWORDS.push(...[\n${words.map(x => JSON.stringify(x)).join(",\n")}\n]);\n` +
  (cogs.length ? `COGS.push(...[\n${cogs.map(x => JSON.stringify(x)).join(",\n")}\n]);\n` : "") +
  `Object.assign(DETAIL,{\n${Object.entries(detail).map(([k, v]) => JSON.stringify(k) + ":" + JSON.stringify(v)).join(",\n")}\n});\n` +
  (B.extra && Object.keys(B.extra).length ? `Object.assign(EXTRA,${JSON.stringify(B.extra)});\n` : "");

const mark = "\nconst PHRASES=[];";
if (h.split(mark).length !== 2) throw new Error("Insertion point not found (const PHRASES=[];)");

// IRR: merge into an existing verb entry, or add a new one. (Never add a duplicate key: the later one would silently win.)
if (B.irr) {
  const s = h.indexOf("const IRR={\n"), e = h.indexOf("\n};\nfunction stemChange", s);
  if (s < 0 || e < 0) throw new Error("IRR block not found");
  let blk = h.slice(s, e);
  for (const [k, fields] of Object.entries(B.irr)) {
    const re = new RegExp("(?<![\\wáéíóúñ])" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ":\\{([^}]*)\\}", "g");
    const m = [...blk.matchAll(re)];
    if (m.length > 1) throw new Error("IRR has " + k + " more than once");
    const add = Object.entries(fields).map(([f, v]) => f + ":" + JSON.stringify(v)).join(",");
    if (m.length) {
      for (const f of Object.keys(fields)) if (new RegExp("(^|,)\\s*\"?" + f + "\"?\\s*:").test(m[0][1])) throw new Error(`IRR.${k}.${f} already exists - edit it by hand`);
      blk = blk.slice(0, m[0].index) + k + ":{" + m[0][1] + "," + add + "}" + blk.slice(m[0].index + m[0][0].length);
    } else blk = blk.replace("const IRR={\n", "const IRR={\n " + k + ":{" + add + "},\n");
  }
  h = h.slice(0, s) + blk + h.slice(e);
}

fs.mkdirSync("backups", { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
fs.writeFileSync(path.join("backups", "index-" + stamp + ".html"), fs.readFileSync(file));
h = h.replace(mark, block + mark);
fs.writeFileSync(file, h);
const c = {}; words.forEach(w => c[w.cefr] = (c[w.cefr] || 0) + 1);
console.log(`Added ${words.length} cards ${JSON.stringify(c)}. Backup saved. Now run: npm run check`);
