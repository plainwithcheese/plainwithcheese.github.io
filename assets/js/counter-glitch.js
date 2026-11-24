// The 404 page's broken "now serving" counter, an easter egg.
// The working counter (diner.js) doesn't run on the 404. Instead its number
// glitches like broken diner equipment: digits scrambling or running one
// past their field (1000, never longer: four characters at most), NaN, ERR,
// -1, stray characters, and a reset to 000 that fails and is tried again. The pattern is `counter_glitch` in _data/diner.yml:
// reset, scramble or stuck (below).
//   - At most three changes a second: every state shows for 350ms or more.
//   - It settles on the still value for good after `counter_glitch_seconds`
//     (data-glitch-seconds; 0 keeps it going).
//   - Reduced motion, or no scripts: the page's still value stays ("ERR").
//   - Screen readers hear one steady label from the page ("now serving:
//     error"). This number is aria-hidden, and nothing here is announced.
//   - Never a number the working counter skips: a state with one in it,
//     anywhere, is passed over (diner.js says which; see SKIP there).
// Nothing is stored, and nothing is sent anywhere.
(function () {
  var el = document.querySelector("[data-diner-glitch]");
  if (!el) return;
  var STILL = el.textContent;
  var MIN_MS = 350;
  var BLANK = "   ";   // spaces, so the line keeps its height

  // Each state: [text, milliseconds, dim]. A loop runs round and round.
  var LOOPS = {
    // Tries to reset to 000 and fails; tries again; runs on past 999 to a
    // fourth digit.
    reset: [
      ["ERR", 1800],
      ["000", 450],
      [BLANK, 350],
      ["0?0", 350],
      ["000", 350, true],
      ["-1", 550],
      ["NaN", 700],
      ["ERR", 1800],
      ["000", 450],
      ["00#", 350],
      ["999", 400],
      ["1000", 600],
      [BLANK, 350]
    ],
    // Mostly stuck on ERR, with a short fit every few seconds.
    stuck: [
      ["ERR", 3800],
      ["ERR", 350, true],
      ["000", 400],
      ["-1", 450],
      ["ERR", 3200],
      ["0#0", 350],
      ["NaN", 500],
      ["ERR", 350, true]
    ]
  };

  // "scramble": digits and stray characters, now and then a word, a number
  // one digit too long for the field (four digits, 1000–1999), or a blank. A fixed pseudo-random
  // sequence (mulberry32), so it's the same on every visit and in tests.
  var seed = 404;
  function rand() {
    seed = (seed + 0x6d2b79f5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function pick(chars) { return chars.charAt(Math.floor(rand() * chars.length)); }
  var DIGITS = "0123456789", JUNK = "#?%*~_/|";
  function scramble() {
    var r = rand(), s = "", k;
    if (r < 0.12) return [["ERR", "NaN", "-1", "000"][Math.floor(rand() * 4)], 500];
    if (r < 0.2) {
      s = "1";
      for (k = 3; k > 0; k--) s += pick(DIGITS);
      return [s, 400];
    }
    if (r < 0.27) return [BLANK, 350];
    for (k = 0; k < 3; k++) s += rand() < 0.25 ? pick(JUNK) : pick(DIGITS);
    return [s, 350 + Math.floor(rand() * 200), rand() < 0.15];
  }

  var style = el.getAttribute("data-diner-glitch");
  var loop = style === "scramble" ? null : (LOOPS[style] || LOOPS.reset);
  var at = -1;
  function next() {
    if (!loop) return scramble();
    at = (at + 1) % loop.length;
    return loop[at];
  }

  var skipped = (window.pwcDiner && window.pwcDiner.skipped) || function () { return false; };
  function allowed(text) {
    for (var i = 0; i + 3 <= text.length; i++) {
      var three = text.substr(i, 3);
      if (/^[0-9]{3}$/.test(three) && skipped(Number(three))) return false;
    }
    return true;
  }

  var timer = null;
  function step() {
    var state = next();
    for (var tries = 0; tries < 50 && !allowed(state[0]); tries++) state = next();
    el.textContent = state[0];
    el.classList.toggle("is-dim", !!state[2]);
    timer = setTimeout(step, Math.max(MIN_MS, state[1]));
  }
  function stop() {
    clearTimeout(timer);
    timer = null;
    el.textContent = STILL;
    el.classList.remove("is-dim");
  }

  var LIMIT = (Number(el.getAttribute("data-glitch-seconds")) || 0) * 1000;
  var done = false;
  if (LIMIT > 0) setTimeout(function () { done = true; stop(); }, LIMIT);

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  function apply() {
    if (done || (reduce && reduce.matches)) stop();
    else if (!timer) step();
  }
  if (reduce) {
    if (reduce.addEventListener) reduce.addEventListener("change", apply);
    else if (reduce.addListener) reduce.addListener(apply);
  }
  apply();
})();
