// The content-warning gate, on posts with `content_warning: true`.
// The gate itself works without this script: "[content notes]" and "Serve
// once" are the browser's own <details>, and CSS hides and shows the piece
// (main.scss, "Content notes and the content-warning gate"). This script adds
// the two "always" choices, which need the browser's local storage, and the
// control that turns warnings back on. One value per choice, no cookies,
// nothing sent anywhere:
//   pwc-cw-all          "off": every gated post is served, site-wide
//   pwc-cw-post:<slug>  "off": this post is served
// A one-line script before the post applies a stored choice before the page
// paints (_layouts/post.html); this keeps that state in step.
(function () {
  var root = document.documentElement;
  var box = document.querySelector("[data-cw]");
  if (!box) return;
  var ALL = "pwc-cw-all";
  var POST = "pwc-cw-post:" + box.getAttribute("data-cw-key");

  var store = null;
  try {
    localStorage.setItem("pwc-cw-test", "1");
    localStorage.removeItem("pwc-cw-test");
    store = localStorage;
  } catch (e) { /* storage unavailable (a private window, say) */ }

  function state() {
    if (!store) return "";
    try {
      if (store.getItem(ALL) === "off") return "all";
      if (store.getItem(POST) === "off") return "post";
    } catch (e) {}
    return "";
  }
  function apply() {
    var s = state();
    if (s) root.setAttribute("data-cw-off", s);
    else root.removeAttribute("data-cw-off");
  }
  // After serving, keyboard and screen-reader users land on the piece.
  function toPiece() {
    var body = document.querySelector(".post__body");
    if (!body) return;
    body.setAttribute("tabindex", "-1");
    body.focus();
  }

  var once = box.querySelector(".cw__serve");
  if (once) once.addEventListener("toggle", function () { if (once.open) toPiece(); });

  // Without storage, only "Serve once" is offered.
  if (!store) return;
  apply();

  box.querySelectorAll("[data-cw-always]").forEach(function (button) {
    button.hidden = false;
    button.addEventListener("click", function () {
      try { store.setItem(button.getAttribute("data-cw-always") === "all" ? ALL : POST, "off"); }
      catch (e) { return; }
      apply();
      toPiece();
    });
  });

  // Turn the warnings back on: both the site-wide choice and this post's own,
  // so neither keeps the piece served. The gate is then as on a first visit,
  // closed. Two controls do this: one in "[content notes]"'s reveal, one at
  // the end of the post.
  document.querySelectorAll("[data-cw-on]").forEach(function (on) { on.addEventListener("click", function () {
    try { store.removeItem(ALL); store.removeItem(POST); } catch (e) {}
    apply();
    var notes = document.querySelector(".post__contents--gate");
    if (notes) notes.open = false;
    if (once) once.open = false;
    var toggle = document.querySelector(".post__contents-toggle");
    if (toggle && !root.hasAttribute("data-cw-off")) toggle.focus();
  }); });
})();
