// Generated from b2-batch4.txt (one line per card: es|pos|en|example|translation|synonyms|antonyms|flags)
const fs = require("fs"), path = require("path");
const lines = fs.readFileSync(path.join(__dirname, "b2-batch4.txt"), "utf8").replace(/^﻿/, "").split(/\r?\n/).filter(Boolean);
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
const E = n => entries.find(e => e[0] === n);
E("panorama")[5] = "Masculine despite the -a ending: el panorama.";
module.exports = {
  label: "B2 batch 4",
  cefr: "B2",
  entries,
  extra: {
    contratiempo: ["setback"], "simpatía": ["liking, warmth"], proximidad: ["proximity"], "lejanía": ["distance, remoteness"],
    cumbre: ["summit, peak"], avaricia: ["greed"], perseverancia: ["perseverance"], torpeza: ["clumsiness"],
    agarrarse: ["to hold on, cling"], menospreciar: ["to underestimate, look down on"], emotivo: ["emotional, moving"],
    huidizo: ["evasive, elusive"], casual: ["chance, casual"], astuto: ["cunning, shrewd"], borroso: ["blurry"],
    inofensivo: ["harmless"], "categórico": ["categorical"], obstinado: ["obstinate"],
    regañadientes: ["grumbling (a regañadientes: reluctantly)"], antemano: ["beforehand (de antemano: in advance)"],
    vano: ["vain, useless"], duras: ["hard (feminine plural)", "duro"],
  },
  irr: {},
};