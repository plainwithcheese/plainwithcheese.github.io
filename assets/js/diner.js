// The diner footer's moving parts (_includes/diner-footer.html).
//
// "Now serving" counter: a 3-digit number (100–999) worked out from the
// current time. Time is cut into ticks of `data-tick` seconds, counted from
// the Unix epoch, and each tick number is scrambled into a counter value with
// a fixed integer hash. So the number depends only on the clock: every page,
// and every visitor, shows the same number at the same moment, and when the
// tick changes, the number changes on whatever page is open. A few numbers
// are skipped (see SKIP below). The 404 page's counter is broken on purpose
// and has no [data-diner-counter]; counter-glitch.js runs it there.
//
// Stamp: one entry (word or short phrase) from `data-diner-stamps`, picked at random on each page
// load, avoiding the word shown on the previous page (remembered in
// localStorage when available).

(function () {
  // Integer hash (a "lowbias32" mix): same input, same output, everywhere.
  function hash32(n) {
    let x = n >>> 0;
    x ^= x >>> 16; x = Math.imul(x, 0x7feb352d);
    x ^= x >>> 15; x = Math.imul(x, 0x846ca68b);
    x ^= x >>> 16;
    return x >>> 0;
  }

  function counterFor(tick) {
    return 100 + (hash32(tick) % 900);
  }

  // Skip a few numbers: these are the hash32 values of the numbers the
  // counter never shows. A number whose hash32 is listed moves on to the next
  // value (hash32 never maps two numbers to one value, so nothing else is
  // skipped by mistake).
  const SKIP = new Set([0x34864340, 0x415be00d, 0x188b9448]);
  const nextValue = (n) => 100 + ((n - 100 + 1) % 900);
  function shown(n) {
    while (SKIP.has(hash32(n))) n = nextValue(n);
    return n;
  }
  // The 404 page's broken counter (counter-glitch.js, loaded after this)
  // mustn't show them either, so it asks here: true for a skipped number.
  window.pwcDiner = { skipped: function (n) { return SKIP.has(hash32(n)); } };

  // The number shown for a tick: never a skipped one, and never the same as
  // the number shown on the tick before (which may itself have been moved on,
  // so it's worked out the same way, looking back a few ticks at most).
  function counterAt(tick, depth = 4) {
    const n = shown(counterFor(tick));
    if (depth === 0) return n;
    return n === counterAt(tick - 1, depth - 1) ? shown(nextValue(n)) : n;
  }

  const counterEl = document.querySelector("[data-diner-counter]");
  if (counterEl) {
    const tickMs = Math.max(1, Number(counterEl.dataset.tick) || 45) * 1000;
    const update = () => {
      const now = Date.now();
      counterEl.textContent = String(counterAt(Math.floor(now / tickMs)));
      // Run again right at the next tick boundary, on every page alike.
      setTimeout(update, tickMs - (now % tickMs) + 20);
    };
    update();
  }

  const stampEl = document.querySelector("[data-diner-stamps]");
  if (stampEl) {
    let words = [];
    try { words = JSON.parse(stampEl.dataset.dinerStamps) || []; } catch (e) { words = []; }
    if (words.length > 1) {
      let last = null;
      try { last = localStorage.getItem("diner-stamp"); } catch (e) { /* storage blocked */ }
      const choices = words.filter((w) => w !== last);
      const pick = choices[Math.floor(Math.random() * choices.length)];
      stampEl.textContent = pick;
      try { localStorage.setItem("diner-stamp", pick); } catch (e) { /* storage blocked */ }
    }
  }
})();
