// Shared helpers: load the data part of index.html into Node (no browser needed).
const fs = require("fs"), path = require("path"), os = require("os");

function scriptOf(file) {
  const html = fs.readFileSync(file, "utf8");
  const parts = html.split("<script>");
  if (parts.length < 2) throw new Error("No <script> found in " + file);
  return { html, js: parts[1].split("</script>")[0] };
}

// Loads everything up to the app UI (buildDict() and before) and returns the data objects.
function loadData(file) {
  const { js } = scriptOf(file);
  const cut = js.lastIndexOf("buildDict();");
  if (cut < 0) throw new Error("buildDict(); not found");
  const src = js.slice(0, cut) +
    "\nbuildDict();\nmodule.exports={WORDS,DETAIL,PHRASES,TOPICS,EXTRA,COGS,IRR,TABLE,FORMS,HEAD,COGH,lookup};";
  const tmp = path.join(os.tmpdir(), "esfc_" + process.pid + "_" + Date.now() + ".js");
  fs.writeFileSync(tmp, src);
  try { return require(tmp); } finally { fs.unlinkSync(tmp); }
}

// Pulls one top-level function's source out of the app code (used to test UI helpers in Node).
function functionSource(file, name, nextMarker) {
  const { js } = scriptOf(file);
  const s = js.indexOf("function " + name + "(");
  if (s < 0) throw new Error("function " + name + " not found");
  const e = js.indexOf(nextMarker, s);
  return js.slice(s, e < 0 ? undefined : e);
}

const tok = s => (s.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/g) || []);
module.exports = { scriptOf, loadData, functionSource, tok };
