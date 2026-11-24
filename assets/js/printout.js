// The optional "printing" reveal for printouts (```printout blocks given
// `{: .printout--reveal}`; see "Printout" in assets/css/main.scss). When the
// block scrolls into view, its lines print one after another, each wiped in
// left to right in one step per character, like a print head.
//
// The text is in the page from the start, so screen readers, copying and
// search see all of it; only its drawing is delayed. With reduced motion,
// nothing happens (and the CSS also turns the effect off).

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

const blocks = [...document.querySelectorAll("pre.printout--reveal > code.language-printout")];

function prepare(code) {
  const lines = code.textContent.replace(/\n$/, "").split("\n");
  code.textContent = "";
  let delay = 0;
  for (const text of lines) {
    const line = document.createElement("span");
    line.className = "printout__line";
    line.textContent = text;
    const steps = Math.max(text.length, 1);
    const dur = Math.min(Math.max(steps * 0.022, 0.15), 1.2);   // seconds
    line.style.setProperty("--po-steps", steps);
    line.style.setProperty("--po-dur", dur.toFixed(2) + "s");
    line.style.setProperty("--po-delay", delay.toFixed(2) + "s");
    delay += dur + 0.18;   // the line feed
    code.append(line);
  }
  code.classList.add("printout--pending");
}

if (!reduce.matches && blocks.length && "IntersectionObserver" in window) {
  const seen = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      seen.unobserve(entry.target);
      entry.target.classList.replace("printout--pending", "printout--printing");
    }
  }, { threshold: 0.4 });
  for (const code of blocks) {
    prepare(code);
    seen.observe(code);
  }
}
