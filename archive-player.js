(() => {
  const artistName = "Bobby Eric";

  function extractUrl(value) {
    if (!value) return "";
    const match = value.match(/url\(["']?(.*?)["']?\)/i);
    return match ? match[1] : value;
  }

  const coverMap = new Map();
  document.querySelectorAll(".strip").forEach((strip) => {
    const key = strip.dataset.album;
    const img = strip.style.getPropertyValue("--img").trim();
    const url = extractUrl(img);
    if (key && url) coverMap.set(key, url);
  });

  const players = [];

  document.querySelectorAll(".album-view").forEach((view) => {
    const tracklist = view.querySelector(".tracklist");
    if (!tracklist) return;

    const section = tracklist.closest(".album-section");
    if (!section || section.querySelector(".album-player")) return;

    const albumKey = view.dataset.albumView || "";
    const albumTitle =
      view.querySelector(".album-title")?.textContent?.trim() || "Album";
    const coverUrl = coverMap.get(albumKey) || "";

    const player = document.createElement("div");
    player.className = "album-player";
    player.innerHTML = `
      <div class="album-player__top" tabindex="0" role="group" aria-label="Album player">
        <div class="album-player__cover"></div>
        <div class="album-player__info">
          <div class="album-player__album" data-album-title></div>
          <div class="album-player__artist" data-artist></div>
          <div class="album-player__track" data-track-title></div>
        </div>
        <button class="album-player__main" type="button" data-action="play" aria-label="Play">
          <span class="album-player__icon"></span>
        </button>
      </div>
      <div class="album-player__controls">
        <button class="album-player__btn" type="button" data-action="prev" aria-label="Previous track">
          <span class="album-player__icon-prev"></span>
        </button>
        <button class="album-player__btn" type="button" data-action="play" aria-label="Play">
          <span class="album-player__icon"></span>
        </button>
        <button class="album-player__btn" type="button" data-action="next" aria-label="Next track">
          <span class="album-player__icon-next"></span>
        </button>
        <div class="album-player__progress">
          <input type="range" min="0" max="0" value="0" step="1" aria-label="Seek" />
        </div>
      </div>
      <audio class="album-audio" preload="none"></audio>
    `;

    const cover = player.querySelector(".album-player__cover");
    if (coverUrl) cover.style.backgroundImage = `url("${coverUrl}")`;
    player.querySelector("[data-album-title]").textContent = albumTitle;
    player.querySelector("[data-artist]").textContent = artistName;
    player.querySelector("[data-track-title]").textContent = "Select a track";

    section.insertBefore(player, tracklist);

    const audio = player.querySelector(".album-audio");
    const focusRoot = player.querySelector(".album-player__top");
    const trackTitleEl = player.querySelector("[data-track-title]");
    const progress = player.querySelector(".album-player__progress input");
    const playButtons = player.querySelectorAll('[data-action="play"]');
    const prevButton = player.querySelector('[data-action="prev"]');
    const nextButton = player.querySelector('[data-action="next"]');

    const tracks = [];
    tracklist.querySelectorAll(".track-row").forEach((row) => {
      const title =
        row.querySelector(".track-title")?.textContent?.trim() || "Track";
      const audioEl = row.querySelector("audio");
      const src =
        row.querySelector("source")?.getAttribute("src") ||
        audioEl?.getAttribute("src") ||
        "";

      if (!src) return;
      const index = tracks.length;
      tracks.push({ title, src, row });
      row.dataset.trackIndex = String(index);

      const meta = row.querySelector(".track-meta");
      if (meta) meta.textContent = artistName;

      if (audioEl) {
        audioEl.removeAttribute("controls");
        audioEl.preload = "none";
        audioEl.classList.add("track-audio");
      }

      row.classList.add("track-row--clickable");
    });

    if (!tracks.length) return;

    let currentIndex = 0;

    function setActiveRow(index) {
      tracks.forEach((track, i) => {
        track.row.classList.toggle("is-playing", i === index);
      });
    }

    function loadTrack(index, autoplay) {
      const track = tracks[index];
      if (!track) return;
      currentIndex = index;
      audio.src = track.src;
      trackTitleEl.textContent = track.title;
      setActiveRow(index);
      if (autoplay) audio.play();
    }


    function togglePlay() {
      if (!audio.src) {
        loadTrack(currentIndex, true);
        return;
      }
      if (audio.paused) audio.play();
      else audio.pause();
    }

    playButtons.forEach((btn) => btn.addEventListener("click", togglePlay));
    if (prevButton) {
      prevButton.addEventListener("click", () => {
        const next = (currentIndex - 1 + tracks.length) % tracks.length;
        loadTrack(next, true);
      });
    }
    if (nextButton) {
      nextButton.addEventListener("click", () => {
        const next = (currentIndex + 1) % tracks.length;
        loadTrack(next, true);
      });
    }

    tracklist.addEventListener("click", (event) => {
      const row = event.target.closest(".track-row");
      if (!row) return;
      const index = Number(row.dataset.trackIndex || 0);
      loadTrack(index, true);
    });

    audio.addEventListener("play", () => {
      player.classList.add("is-playing");
    });

    audio.addEventListener("pause", () => {
      player.classList.remove("is-playing");
    });

    audio.addEventListener("ended", () => {
      const next = (currentIndex + 1) % tracks.length;
      loadTrack(next, true);
    });

    audio.addEventListener("loadedmetadata", () => {
      progress.max = Number.isFinite(audio.duration)
        ? Math.floor(audio.duration)
        : 0;
    });

    audio.addEventListener("timeupdate", () => {
      if (!progress.matches(":active")) {
        progress.value = Number.isFinite(audio.currentTime)
          ? Math.floor(audio.currentTime)
          : 0;
      }
    });

    progress.addEventListener("input", () => {
      if (!Number.isFinite(audio.duration)) return;
      audio.currentTime = Number(progress.value || 0);
    });

    if (focusRoot) {
      focusRoot.addEventListener("keydown", (event) => {
        const target = event.target;
        if (target && target.tagName === "INPUT") return;
        if (event.key === " ") {
          event.preventDefault();
          togglePlay();
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          if (Number.isFinite(audio.duration)) {
            audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
          }
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          audio.currentTime = Math.max(audio.currentTime - 5, 0);
        }
      });
    }

    players.push(audio);
  });

  function pauseAll() {
    players.forEach((audio) => audio.pause());
  }

  document.querySelectorAll(".strip").forEach((strip) => {
    strip.addEventListener("click", () => {
      pauseAll();
    });
  });
})();
