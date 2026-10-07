// Copy this file, rename it (e.g. b2-batch1.js), fill in entries, then:
//   node tools/add-batch.js data/batches/b2-batch1.js
//   npm run check
// Entry: [es, pos, en, opts, senses, note]
//   pos: m f f! mf | v v:ie v:ue v:i v:zc v:irr | adj adv prep conj pron det num int | phr (phrase)
//   opts: { cog:1 } for cognates, { ff:"False friend: ..." }, { cefr:"B1" } to override the batch level
//   senses: [label(0 or "adverb" etc.), English meaning, Spanish example, English translation, [synonyms], [antonyms]]
//   note (optional): gender exceptions, conjugation notes, usage warnings
module.exports = {
  label: "B2 batch 1",
  cefr: "B2",
  entries: [
    ["ejemplo", "m", "example", { cog: 1 }, [
      [0, "example", "Pon un ejemplo, por favor.", "Give an example, please.", [], []]
    ]],
  ],
  extra: {
    // "pon": ["put (command)", "poner"],
  },
  irr: {
    // vencer: { pres: "venzo vences vence vencemos vencéis vencen", subj: "venza venzas venza venzamos venzáis venzan" },
  },
};
