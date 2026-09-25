(() => {
  const hero = document.querySelector(".home-page .hero");
  if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const layer = document.createElement("div");
  layer.className = "letterfall";
  layer.setAttribute("aria-hidden", "true");
  hero.appendChild(layer);

  const mobile = window.matchMedia("(max-width: 768px)").matches;
  const count = mobile ? 8 : 34;
  const random = (min, max) => min + Math.random() * (max - min);
  const fragment = document.createDocumentFragment();
  let remaining = count;
  let observer;

  for (let i = 0; i < count; i++) {
    const sheet = document.createElement("span");
    sheet.className = "letterfall__sheet";
    sheet.style.setProperty("--left", `${random(2, 98).toFixed(1)}%`);
    sheet.style.setProperty("--width", `${random(mobile ? 24 : 36, mobile ? 50 : 76).toFixed(0)}px`);
    sheet.style.setProperty("--duration", `${random(6.5, 11).toFixed(2)}s`);
    sheet.style.setProperty("--delay", `${(i < (mobile ? 2 : 8) ? -random(0, 1.4) : random(0, 2.4)).toFixed(2)}s`);
    sheet.style.setProperty("--drift", `${random(mobile ? -100 : -190, mobile ? 100 : 190).toFixed(0)}px`);
    sheet.style.setProperty("--start-angle", `${random(-40, 40).toFixed(0)}deg`);
    sheet.style.setProperty("--end-angle", `${random(-190, 190).toFixed(0)}deg`);
    if (!mobile) sheet.style.setProperty("--flip", `${Math.random() < .5 ? 180 : 360}deg`);
    sheet.style.setProperty("--opacity", random(.35, .68).toFixed(2));
    if (!mobile) sheet.style.setProperty("--blur", `${random(0, 1.2).toFixed(1)}px`);
    sheet.addEventListener("animationend", () => {
      sheet.remove();
      if (--remaining === 0) {
        layer.remove();
        observer?.disconnect();
      }
    }, { once: true });
    fragment.appendChild(sheet);
  }

  layer.appendChild(fragment);
  if (mobile && "IntersectionObserver" in window) {
    observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        layer.remove();
        observer.disconnect();
      }
    });
    observer.observe(hero);
  }
})();
