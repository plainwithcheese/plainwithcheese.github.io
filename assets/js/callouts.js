// Callouts — turns marked blockquotes into styled callout boxes.
//
// Authoring (in any post):
//
//   > [!note]                                   preset by name
//   > [!tip | A small recommendation]           preset, custom title
//   > [!warning | Read this twice | ⚠ | #c0392b]  preset, override title/glyph/color/bg
//   > [!Field note | ✎ | #4a7a2a | #e8f0d8]     no preset: title | glyph | color | bg
//
// Params after the first are optional and positional. Presets live in
// _data/callouts.yml and reach this script as JSON in the page (see
// _layouts/default.html). Blockquotes without a marker are left alone.
// Without JavaScript, the blockquote still shows, with the marker as text.

(function () {
  const presetsEl = document.getElementById("callout-presets");
  let presets = {};
  try {
    presets = JSON.parse(presetsEl ? presetsEl.textContent : "{}") || {};
  } catch (err) {
    console.error("callouts: couldn't read presets", err);
  }

  const MARKER = /^\s*\[!([^\]\n]+)\]\s*/;

  function parse(markerText) {
    const parts = markerText.split("|").map((p) => p.trim());
    const preset = presets[parts[0].toLowerCase()];
    if (preset) {
      const [, title, glyph, color, bg] = parts;
      return {
        kind: parts[0].toLowerCase(),
        title: title || preset.title || parts[0],
        glyph: glyph || preset.glyph || "",
        // A glyph passed inline replaces the preset's image glyph too.
        glyphImage: glyph ? null : preset.glyph_image || null,
        color: color || preset.color,
        // An overridden color without an explicit bg keeps the preset's bg
        // (it inherits the preset's background tint).
        bg: bg || preset.bg,
      };
    }
    const [title, glyph, color, bg] = parts;
    return { kind: "custom", title, glyph: glyph || "", glyphImage: null, color, bg };
  }

  function transform(bq) {
    const first = bq.firstElementChild;
    if (!first || first.tagName !== "P") return;
    const textNode = first.firstChild;
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;
    const match = textNode.textContent.match(MARKER);
    if (!match) return;

    const c = parse(match[1]);

    // Strip the marker line; drop the paragraph if nothing else was in it.
    textNode.textContent = textNode.textContent.slice(match[0].length);
    if (!first.textContent.trim() && !first.querySelector("img")) first.remove();

    const aside = document.createElement("aside");
    aside.className = `callout callout--${c.kind}`;
    aside.setAttribute("role", "note");
    if (c.color) aside.style.setProperty("--callout-color", c.color);
    if (c.bg) aside.style.setProperty("--callout-bg", c.bg);

    const glyph = document.createElement("div");
    glyph.className = "callout__glyph";
    glyph.setAttribute("aria-hidden", "true");
    if (c.glyphImage) {
      const img = document.createElement("span");
      img.className = "callout__glyph-image";
      img.style.setProperty("--callout-glyph-url", `url("${c.glyphImage}")`);
      glyph.appendChild(img);
    } else {
      glyph.textContent = c.glyph || "";
    }

    const body = document.createElement("div");
    body.className = "callout__body";
    const title = document.createElement("p");
    title.className = "callout__title";
    title.textContent = c.title;
    body.appendChild(title);
    while (bq.firstChild) body.appendChild(bq.firstChild);

    aside.append(glyph, body);
    bq.replaceWith(aside);
  }

  document.querySelectorAll("main blockquote").forEach(transform);
})();
