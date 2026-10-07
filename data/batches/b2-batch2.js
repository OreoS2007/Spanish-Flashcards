// Generated from b2-batch2.txt (one line per card: es|pos|en|example|translation|synonyms|antonyms|flags)
const fs = require("fs"), path = require("path");
const lines = fs.readFileSync(path.join(__dirname, "b2-batch2.txt"), "utf8").replace(/^﻿/, "").split(/\r?\n/).filter(Boolean);
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
E("dilema")[5] = "Masculine despite the -a ending: el dilema.";
module.exports = {
  label: "B2 batch 2",
  cefr: "B2",
  entries,
  extra: {
    alba: ["dawn"], anochecer: ["nightfall, dusk"], clarear: ["to get light, to clear up"], perjuicio: ["harm, damage"],
    disputa: ["dispute"], totalidad: ["whole, entirety"], semejanza: ["similarity"], imperfección: ["imperfection"],
    virtud: ["virtue"], renta: ["income, rent"], aceptación: ["acceptance"], lazo: ["tie, bond"], unión: ["union, unity"],
    contribución: ["contribution"], dependencia: ["dependence"], abundancia: ["abundance"], variedad: ["variety"],
    firmeza: ["firmness"], inestabilidad: ["instability"], administración: ["administration, management"],
    progreso: ["progress"], empeoramiento: ["worsening"], reglamento: ["rules, regulations"], alternativa: ["alternative"],
    "punto de vista": ["point of view"], descenso: ["decrease, drop"], insatisfacción: ["dissatisfaction"],
    intolerancia: ["intolerance"], frenar: ["to brake, to slow down"], ajustar: ["to adjust"], calmar: ["to calm"],
    repeler: ["to repel"], ejercer: ["to exercise, to practise"], resaltar: ["to highlight"], diferenciar: ["to differentiate"],
    empobrecer: ["to impoverish"], desarrollarse: ["to develop"], administrar: ["to administer, to manage"],
    conceder: ["to grant"], fortalecer: ["to strengthen"], debilitar: ["to weaken"], holgado: ["loose, roomy"],
    incomprensible: ["incomprehensible"], intencionado: ["intentional"], accidental: ["accidental"], espeso: ["thick"],
    incierto: ["uncertain"], inestable: ["unstable"], desfavorable: ["unfavourable"], amistoso: ["friendly"],
    legal: ["legal"], externo: ["external"], inoportuno: ["ill-timed, inopportune"], posterior: ["later, subsequent"],
    imprudente: ["imprudent, reckless"], irrelevante: ["irrelevant"], absurdo: ["absurd"], diverso: ["diverse"],
    invisible: ["invisible"], "a pesar de todo": ["in spite of everything"], "si no": ["if not, otherwise"],
    "alrededor de": ["around, about"], "sin duda": ["without a doubt"], "para nada": ["not at all"],
    amanece: ["it dawns", "amanecer"], humanidad: ["humanity"], honestidad: ["honesty"], "mantén": ["keep (command)", "mantener"],
    cable: ["cable"], valiosa: ["valuable (feminine)"], juzgues: ["you judge (subjunctive)"],
    ayudarte: ["to help you", "ayudar"], amabilidad: ["kindness"], rival: ["rival"], obstante: ["notwithstanding"],
    aun: ["even"], consiguiente: ["consequent"], torno: ["turn (en torno a: around)"], "inténtalo": ["try it", "intentar"],
  },
  irr: {
    acoger: { pres: "acojo acoges acoge acogemos acogéis acogen", subj: "acoja acojas acoja acojamos acojáis acojan" },
    escoger: { pres: "escojo escoges escoge escogemos escogéis escogen", subj: "escoja escojas escoja escojamos escojáis escojan" },
    exigir: { pres: "exijo exiges exige exigimos exigís exigen", subj: "exija exijas exija exijamos exijáis exijan" },
    distinguir: { pres: "distingo distingues distingue distinguimos distinguís distinguen", subj: "distinga distingas distinga distingamos distingáis distingan" },
    perseguir: { pres: "persigo persigues persigue perseguimos perseguís persiguen", subj: "persiga persigas persiga persigamos persigáis persigan" },
    evaluar: { pres: "evalúo evalúas evalúa evaluamos evaluáis evalúan", subj: "evalúe evalúes evalúe evaluemos evaluéis evalúen" },
    ampliar: { pres: "amplío amplías amplía ampliamos ampliáis amplían", subj: "amplíe amplíes amplíe ampliemos ampliéis amplíen" },
  },
};
