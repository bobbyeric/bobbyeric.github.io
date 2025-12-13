const bgm = document.getElementById("bgm");
const toggle = document.getElementById("soundToggle");

let isPlaying = false;
let fadeTimer = null;

bgm.volume = 0;

function fadeTo(target, duration = 800){
  clearInterval(fadeTimer);
  const step = 0.02;
  const interval = duration / (1 / step);

  fadeTimer = setInterval(() => {
    if (Math.abs(bgm.volume - target) < step) {
      bgm.volume = target;
      clearInterval(fadeTimer);
    } else {
      bgm.volume += bgm.volume < target ? step : -step;
    }
  }, interval);
}

toggle.addEventListener("click", () => {
  if (!isPlaying) {
    bgm.play().then(() => {
      fadeTo(0.7); // 背景音量上限，可改 0.5~0.8
      toggle.textContent = "Sound: On";
      isPlaying = true;
    }).catch(() => {});
  } else {
    fadeTo(0);
    setTimeout(() => bgm.pause(), 900);
    toggle.textContent = "Sound: Off";
    isPlaying = false;
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && isPlaying) bgm.pause();
});

window.addEventListener("scroll", () => {
  if (!isPlaying) return;

  const heroHeight = window.innerHeight;
  const y = window.scrollY;

  // 0.7 → 0.3
  let vol = 0.7 - Math.min(y / heroHeight, 1) * 0.4;
  bgm.volume = Math.max(0.25, vol);
});
if (localStorage.getItem("bgm") === "on") {
  bgm.play().then(() => fadeTo(0.5)).catch(() => {});
  toggle.textContent = "Sound: On";
  isPlaying = true;
}
localStorage.setItem("bgm", isPlaying ? "on" : "off");
const hero = document.querySelector(".hero");

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!isPlaying) return;
    bgm.volume = e.isIntersecting ? 0.6 : 0.35;
  });
}, { threshold: 0.2 });

observer.observe(hero);
