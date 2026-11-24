// Minimal lightbox for _includes/gallery.html and the artwork format
// (_includes/format-artwork.html).
//
// Clicking a gallery thumbnail, or an artwork's lead image or one of its
// thumbnails, opens the full image in a <dialog>, with its alt text and
// caption. Escape closes (native <dialog> behavior), as do the × button
// (top-right of the screen) and a click on the backdrop. Left/Right arrows
// (and the prev/next buttons) move through the images in that gallery or
// artwork. Focus returns to the image that opened it. A link with a
// data-webp address opens that WebP where the browser takes it (the image's
// own file otherwise), through a <picture> like the page's. Without JS, each image
// links to its file, and so does a Cmd-, Ctrl-, Shift- or Alt-click (or a
// middle-click), so the browser can open it in a new tab or window. Where
// <dialog> isn't supported, the link opens the image as a plain link.

const dialog = document.createElement("dialog");
dialog.className = "lightbox";
dialog.setAttribute("aria-label", "Image viewer");
dialog.innerHTML = `
  <button type="button" class="lightbox__close" data-lb="close" aria-label="Close"><svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" focusable="false"><path d="M1 1 L9 9 M9 1 L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg></button>
  <figure class="lightbox__figure">
    <picture><source class="lightbox__webp" type="image/webp"><img class="lightbox__img" alt=""></picture>
    <figcaption class="lightbox__caption"></figcaption>
  </figure>
  <div class="lightbox__bar">
    <button type="button" class="lightbox__btn" data-lb="prev" aria-label="Previous image">&lsaquo; prev</button>
    <span class="lightbox__count" aria-live="polite"></span>
    <button type="button" class="lightbox__btn" data-lb="next" aria-label="Next image">next &rsaquo;</button>
  </div>`;
document.body.appendChild(dialog);

const img = dialog.querySelector(".lightbox__img");
const webp = dialog.querySelector(".lightbox__webp");
const caption = dialog.querySelector(".lightbox__caption");
const count = dialog.querySelector(".lightbox__count");
const prevBtn = dialog.querySelector('[data-lb="prev"]');
const nextBtn = dialog.querySelector('[data-lb="next"]');

let links = [];
let index = 0;
let opener = null;

function show(i) {
  index = (i + links.length) % links.length;
  const link = links[index];
  const thumb = link.querySelector("img");
  if (link.dataset.webp) webp.srcset = link.dataset.webp;
  else webp.removeAttribute("srcset");
  img.src = link.href;
  img.alt = thumb ? thumb.alt : "";
  caption.textContent = link.dataset.caption || "";
  caption.hidden = !link.dataset.caption;
  count.textContent = `${index + 1} of ${links.length}`;
  const many = links.length > 1;
  prevBtn.hidden = !many;
  nextBtn.hidden = !many;
}

document.querySelectorAll("[data-gallery]").forEach((gallery) => {
  const galleryLinks = [...gallery.querySelectorAll(".gallery__link, .artwork__link")];
  galleryLinks.forEach((link, i) => {
    link.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (typeof dialog.showModal !== "function") return;
      links = galleryLinks;
      opener = link;
      show(i);
      try { dialog.showModal(); } catch (err) { img.removeAttribute("src"); return; }
      e.preventDefault();
    });
  });
});

dialog.addEventListener("click", (e) => {
  const action = e.target.closest("[data-lb]")?.dataset.lb;
  if (action === "prev") show(index - 1);
  else if (action === "next") show(index + 1);
  else if (action === "close" || e.target === dialog) dialog.close();
});

dialog.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") { show(index - 1); e.preventDefault(); }
  if (e.key === "ArrowRight") { show(index + 1); e.preventDefault(); }
});

dialog.addEventListener("close", () => {
  img.removeAttribute("src");
  webp.removeAttribute("srcset");
  if (opener) opener.focus();
});
