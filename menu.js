

console.log("menu.js loaded");

const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

let scrollY = 0;

function openMenu(){
  scrollY = window.scrollY || 0;

  menu.classList.add("is-open");
  menuBtn.classList.add("is-open");

  document.body.classList.add("menu-open");
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";

  menuBtn.setAttribute("aria-expanded", "true");
  menu.setAttribute("aria-hidden", "false");
}

function closeMenu(){
  menu.classList.remove("is-open");
  menuBtn.classList.remove("is-open");

  document.body.classList.remove("menu-open");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";

  window.scrollTo(0, scrollY);

  menuBtn.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-hidden", "true");
}

if (menuBtn && menu) {
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (menu.classList.contains("is-open")) closeMenu();
    else openMenu();
  });

  // 点遮罩关闭（只点到最外层 menu 才关）
  menu.addEventListener("click", (e) => {
    if (e.target === menu) closeMenu();
  });

  // 点面板内部不关闭
  const panel = menu.querySelector(".menu-panel");
  if (panel) panel.addEventListener("click", (e) => e.stopPropagation());

  // 点链接关闭
  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));

  // ESC 关闭
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) closeMenu();
  });
} else {
  console.log("menuBtn or menu not found", { menuBtn, menu });
}
