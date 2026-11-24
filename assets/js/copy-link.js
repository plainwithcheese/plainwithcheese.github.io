// "[copy link]" controls (the end of a post, and /feed/ for the feed's
// address). A click copies the address, shows the "[copied]" state for two
// seconds and tells screen readers ("copied"). The address is the button's
// data-copy (resolved against the page), or else the page's own address
// without any query or #fragment, so nothing extra (no tracking) goes with
// it. The clipboard API needs a secure (https) page; elsewhere, or if it
// refuses, a hidden textarea does the copying, and then gives back the
// reader's focus and text selection as they were. If neither copies, the
// control shows "[copy failed]" for two seconds and tells screen readers.
// Without JavaScript the controls stay hidden (their wrapper has
// data-needs-js and hidden).

(function () {
  function fallback(text) {
    var active = document.activeElement, sel = document.getSelection(), ranges = [], i, ok = false;
    for (i = 0; sel && i < sel.rangeCount; i++) ranges.push(sel.getRangeAt(i));
    var t = document.createElement("textarea");
    t.value = text; t.setAttribute("readonly", ""); t.setAttribute("aria-hidden", "true"); t.tabIndex = -1;
    t.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none";
    document.body.appendChild(t);
    try { t.focus({ preventScroll: true }); t.select(); ok = document.execCommand("copy"); } catch (e) { ok = false; }
    t.remove();
    if (sel) { sel.removeAllRanges(); ranges.forEach(function (r) { sel.addRange(r); }); }
    if (active && active.focus) active.focus({ preventScroll: true });
    return ok ? Promise.resolve() : Promise.reject();
  }

  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    var wrap = btn.closest("[data-needs-js]");
    if (wrap) wrap.hidden = false;
    var idle = btn.querySelector(".copy-btn__idle"), done = btn.querySelector(".copy-btn__done"), fail = btn.querySelector(".copy-btn__fail");
    var status = (wrap || btn.parentElement).querySelector("[role=status]"), timer;
    btn.addEventListener("click", function () {
      var url = btn.dataset.copy ? new URL(btn.dataset.copy, location.href).href : location.origin + location.pathname;
      var copied = navigator.clipboard && window.isSecureContext
        ? navigator.clipboard.writeText(url).catch(function () { return fallback(url); })
        : fallback(url);
      function flash(shown) {
        idle.hidden = true; done.hidden = shown !== done; if (fail) fail.hidden = shown !== fail;
        if (status) status.textContent = shown.textContent.replace(/[\[\]]/g, "").trim();
        clearTimeout(timer);
        timer = setTimeout(function () {
          idle.hidden = false; done.hidden = true; if (fail) fail.hidden = true;
          if (status) status.textContent = "";
        }, 2000);
      }
      copied.then(function () { flash(done); }, function () { if (fail) flash(fail); });
    });
  });
})();
