(() => {
    const strips = document.querySelectorAll(".strip");
    const views = document.querySelectorAll("[data-album-view]");
    if (!strips.length) return;

    function apply(btn) {
        const root = document.documentElement;

        // 主题色
        root.style.setProperty("--accent", btn.dataset.accent || "#E06D14");
        root.style.setProperty("--bar", btn.dataset.bar || "rgba(120,54,54,.92)");
        root.style.setProperty(
            "--bg-color",
            btn.dataset.bgcolor || "#1a1a1a"
        );


        // 中央正方形封面
        const img = btn.style.getPropertyValue("--img").trim();
        root.style.setProperty("--focus-img", img || "none");

        // active
        strips.forEach(s => s.classList.toggle("is-active", s === btn));

        // 内容切换
        const key = btn.dataset.album;
        views.forEach(v =>
            v.classList.toggle("is-active", v.dataset.albumView === key)
        );

        history.replaceState(null, "", `#${key}`);
    }

    strips.forEach(btn =>
        btn.addEventListener("click", () => apply(btn))
    );

    // 初始状态
    const hash = location.hash.slice(1);
    const fromHash = hash && document.querySelector(`.strip[data-album="${hash}"]`);
    apply(fromHash || document.querySelector(".strip.is-active") || strips[0]);
})();
