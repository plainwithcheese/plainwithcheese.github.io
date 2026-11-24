// The 404 page's "Burger and a Side". The page renders every
// eligible Burger and Side (404.html), the newest of each showing; this
// shows one of each instead, picked at random on each load, as the footer
// stamp is, and not the one shown last time when there's a choice (the last
// pick is kept in local storage, like the stamp's; nothing else is stored).
// Without scripts, the newest of each stays.
(function () {
  document.querySelectorAll("[data-nf-pick]").forEach(function (group) {
    var rows = Array.prototype.slice.call(group.querySelectorAll(".not-found__row"));
    if (rows.length < 2) return;
    var key = "nf-pick-" + group.getAttribute("data-nf-pick");
    var last = null;
    try { last = localStorage.getItem(key); } catch (e) { /* storage blocked */ }
    var href = function (r) { var a = r.querySelector("a"); return a ? a.getAttribute("href") : ""; };
    var choices = rows.filter(function (r) { return href(r) !== last; });
    var pick = choices[Math.floor(Math.random() * choices.length)];
    rows.forEach(function (r) { r.hidden = r !== pick; });
    try { localStorage.setItem(key, href(pick)); } catch (e) { /* storage blocked */ }
  });
})();
