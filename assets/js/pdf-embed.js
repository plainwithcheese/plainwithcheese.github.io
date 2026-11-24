// PDF viewer for _includes/pdf.html.
//
// Renders one page at a time onto a <canvas> with PDF.js, so it looks and
// behaves the same on phones (where browsers' built-in PDF viewers don't
// embed) and desktops. PDF.js is only fetched once a viewer is about to
// scroll into view, so pages that never reach it pay nothing.
//
// PDF.js is self-hosted in assets/js/pdfjs/ (pdf.min.mjs, its worker
// pdf.worker.min.mjs, and its Apache 2.0 LICENSE), so the viewer makes no
// requests to other sites.

const PDFJS_VERSION = "6.3.289";  // the copy in assets/js/pdfjs/
const PDFJS_BASE = new URL("./pdfjs/", import.meta.url);

let pdfjsPromise = null;
function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import(new URL("pdf.min.mjs", PDFJS_BASE).href).then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = new URL("pdf.worker.min.mjs", PDFJS_BASE).href;
      if (lib.version && lib.version !== PDFJS_VERSION) {
        console.warn(`pdf-embed: assets/js/pdfjs/ holds PDF.js ${lib.version}, but PDFJS_VERSION says ${PDFJS_VERSION}.`);
      }
      return lib;
    });
  }
  return pdfjsPromise;
}

function setupViewer(root) {
  if (root.dataset.pdfReady) return;
  root.dataset.pdfReady = "1";

  const frame  = root.querySelector(".pdf-embed__frame");
  const canvas = root.querySelector(".pdf-embed__canvas");
  const status = root.querySelector(".pdf-embed__status");
  const prev   = root.querySelector("[data-pdf-prev]");
  const next   = root.querySelector("[data-pdf-next]");
  const pageEl = root.querySelector("[data-pdf-page]");
  const countEl = root.querySelector("[data-pdf-count]");
  const title  = root.dataset.pdfTitle || "PDF";

  let doc = null;
  let pageNum = 1;
  let renderTask = null;
  let lastWidth = 0;

  status.textContent = "Loading…";

  function updateControls() {
    pageEl.textContent = pageNum;
    prev.disabled = pageNum <= 1;
    next.disabled = pageNum >= doc.numPages;
  }

  async function render() {
    const page = await doc.getPage(pageNum);
    const width = frame.clientWidth;
    lastWidth = width;
    const base = page.getViewport({ scale: 1 });
    const scale = width / base.width;
    const dpr = window.devicePixelRatio || 1;
    const viewport = page.getViewport({ scale: scale * dpr });

    if (renderTask) renderTask.cancel();
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    // Lock the frame to this page's shape so the layout doesn't jump.
    frame.style.aspectRatio = `${base.width} / ${base.height}`;
    canvas.setAttribute("aria-label", `${title}, page ${pageNum} of ${doc.numPages}`);

    renderTask = page.render({ canvas, canvasContext: canvas.getContext("2d"), viewport });
    try {
      await renderTask.promise;
    } catch (err) {
      if (err && err.name === "RenderingCancelledException") return;
      throw err;
    }
    updateControls();
  }

  function go(delta) {
    const target = pageNum + delta;
    if (!doc || target < 1 || target > doc.numPages) return;
    pageNum = target;
    render();
  }

  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { go(-1); e.preventDefault(); }
    if (e.key === "ArrowRight") { go(1); e.preventDefault(); }
  });

  // Re-render sharply when the column width changes (rotation, resize).
  let resizeTimer = null;
  new ResizeObserver(() => {
    if (!doc || frame.clientWidth === lastWidth) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 150);
  }).observe(frame);

  loadPdfjs()
    .then((lib) => lib.getDocument({ url: root.dataset.pdfSrc }).promise)
    .then((loaded) => {
      doc = loaded;
      countEl.textContent = doc.numPages;
      root.classList.add("pdf-embed--loaded");
      status.hidden = true;
      return render();
    })
    .catch((err) => {
      console.error("pdf-embed:", err);
      // data-pdf-download is present unless the include set hide_download.
      status.textContent = "pdfDownload" in root.dataset
        ? "This PDF couldn’t be displayed here — use the download link below."
        : "This PDF couldn’t be displayed here.";
      root.classList.add("pdf-embed--error");
    });
}

const viewers = document.querySelectorAll(".pdf-embed[data-pdf-src]");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        io.unobserve(entry.target);
        setupViewer(entry.target);
      }
    }
  }, { rootMargin: "600px 0px" });
  viewers.forEach((v) => io.observe(v));
} else {
  viewers.forEach(setupViewer);
}
