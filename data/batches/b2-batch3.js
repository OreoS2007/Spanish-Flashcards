// Generated from b2-batch3.txt (one line per card: es|pos|en|example|translation|synonyms|antonyms|flags)
const fs = require("fs"), path = require("path");
const lines = fs.readFileSync(path.join(__dirname, "b2-batch3.txt"), "utf8").replace(/^﻿/, "").split(/\r?\n/).filter(Boolean);
const list = s => (s ? s.split(",").map(x => x.trim()).filter(Boolean) : []);
const entries = [];
for (const ln of lines) {
  const f = ln.split("|");
  if (f[0] === "+") {
    let rest = f.slice(1), label = 0;
    if (rest[0] === "adj" || rest[0] === "v") { label = rest[0] === "adj" ? "adjective" : "verb"; rest = rest.slice(1); }
    else if (/^to /.test(rest[0])) label = "verb";
    const [en, ex, exEn, syn, ant] = rest;
    entries[entries.length - 1][4].push([label, en, ex, exEn, list(syn), list(ant)]);
    continue;
  }
  const [es, pos0, en, ex, exEn, syn = "", ...tail] = f;
  const pos = es.includes(" ") ? "phr" : pos0;
  const o = {}; let ant = "";
  tail.forEach((t, i) => {
    if (t === "c") o.cog = 1;
    else if (t.startsWith("ff:")) o.ff = t.slice(3);
    else if (i === 0) ant = t;
  });
  entries.push([es, pos, en, o, [[0, en, ex, exEn, list(syn), list(ant)]]]);
}
module.exports = {
  label: "B2 batch 3",
  cefr: "B2",
  entries,
  extra: {
    emocionada: ["excited (feminine)", "emocionado"], agotadas: ["sold out; exhausted (feminine plural)", "agotado"], rebajas: ["sales (plural)", "rebaja"],
    hundimiento: ["collapse, sinking"], desacuerdo: ["disagreement"], alabanza: ["praise"], desgana: ["lack of enthusiasm"],
    "categoría": ["category, rank"], pasatiempo: ["pastime"], "inauguración": ["opening ceremony"], inmadurez: ["immaturity"],
    lealtad: ["loyalty"], agobiar: ["to overwhelm, stress"], simplificar: ["to simplify"], absolver: ["to acquit"],
    dificultar: ["to make difficult"], simular: ["to pretend, simulate"], lastimar: ["to hurt"], desafiar: ["to challenge, defy"],
    situar: ["to place, situate"], suertudo: ["lucky (informal)"], desafortunado: ["unlucky"], inapropiado: ["inappropriate"],
    independiente: ["independent"], neto: ["net"], incoherente: ["incoherent"], incompatible: ["incompatible"],
    incompetente: ["incompetent"], inconsciente: ["unconscious; unaware"], progresista: ["progressive"],
    subdesarrollado: ["underdeveloped"], veterano: ["veteran, experienced"], novato: ["beginner, newcomer"],
    previsto: ["foreseen, planned"], regular: ["regular"], minoritario: ["minority"], detallista: ["detail-oriented"],
    opcional: ["optional"], "dañino": ["harmful"], beneficioso: ["beneficial"], imprevisible: ["unpredictable"],
    definitivo: ["final, definitive"], plural: ["plural"], consecutivo: ["consecutive"], opaco: ["opaque"],
    horizontal: ["horizontal"], "pacífico": ["peaceful"], "salvo que": ["unless"], "a largo plazo": ["in the long term"],
    "capitán": ["captain"], presos: ["prisoners"], pescar: ["to fish"], dolorosa: ["painful (feminine)"],
    "céntrate": ["focus (command)", "centrarse"], decepcionarte: ["to disappoint you", "decepcionar"],
    "desconfío": ["I distrust", "desconfiar"], persuadirte: ["to persuade you", "persuadir"], "árabe": ["Arabic"],
    trigo: ["wheat"], "sostén": ["hold (command)", "sostener"], "músico": ["musician"], verbo: ["verb"],
    asistencia: ["attendance"], tabaco: ["tobacco"], "saliéramos": ["we went out (imperfect subjunctive)", "salir"],
  },  irr: {
    proseguir: { pres: "prosigo prosigues prosigue proseguimos proseguís prosiguen", subj: "prosiga prosigas prosiga prosigamos prosigáis prosigan" },
    fingir: { pres: "finjo finges finge fingimos fingís fingen", subj: "finja finjas finja finjamos finjáis finjan" },
  },
};