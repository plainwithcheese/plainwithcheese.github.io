// Dark mode toggle (_includes/diner-topnav.html).
//
// The page follows the visitor's OS setting (prefers-color-scheme) unless they
// pick a mode here. The pick is kept in this browser's local storage only
// ("pwc-theme"; no cookies, nothing sent anywhere), and only while it differs
// from the OS: choosing the OS's own mode clears it, so the page goes back to
// following the OS. A one-line script in <head> applies a stored pick before
// the page paints. Without JavaScript the toggle stays hidden and the page
// follows the OS.

// Tooltips drawn in CSS (data-tip: this toggle, and the post's [print] and
// [copy link]): Escape hides a shown one (WCAG 1.4.13) until the pointer
// leaves the control or focus moves on (.tip-off in main.scss).
(function () {
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    document.querySelectorAll("[data-tip]").forEach(function (el) {
      if (!el.matches(":hover") && !el.matches(":focus-visible")) return;
      el.classList.add("tip-off");
      var on = function () { el.classList.remove("tip-off"); el.removeEventListener("mouseleave", on); el.removeEventListener("blur", on); };
      el.addEventListener("mouseleave", on);
      el.addEventListener("blur", on);
    });
  });
})();

(function () {
  var wrap = document.querySelector(".theme-toggle-wrap");
  var btn = wrap && wrap.querySelector(".theme-toggle");
  var root = document.documentElement;
  if (!btn || !window.matchMedia) return;

  var os = window.matchMedia("(prefers-color-scheme: dark)");

  function current() {
    return root.getAttribute("data-theme") || (os.matches ? "dark" : "light");
  }

  // aria-pressed says whether dark mode is on (CSS shows the moon or the sun
  // from it); the tooltip says what a click does.
  function paint() {
    var dark = current() === "dark";
    btn.setAttribute("aria-pressed", dark ? "true" : "false");
    btn.setAttribute("data-tip", dark ? btn.dataset.tipToLight : btn.dataset.tipToDark);
  }

  btn.addEventListener("click", function () {
    var next = current() === "dark" ? "light" : "dark";
    var system = os.matches ? "dark" : "light";
    try {
      if (next === system) localStorage.removeItem("pwc-theme");
      else localStorage.setItem("pwc-theme", next);
    } catch (e) {}
    if (next === system) root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", next);
    paint();
  });

  if (os.addEventListener) os.addEventListener("change", paint);

  wrap.hidden = false;
  paint();
})();
