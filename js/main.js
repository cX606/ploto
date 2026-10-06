/*
 * PLOTO — scroll interactions
 * --------------------------------------------------------------------------
 * No dependencies. One requestAnimationFrame loop reads the scroll position
 * and updates every section:
 *   hero     → the floor plan draws itself, the wordmark breaks apart
 *   about    → the manifesto lights up word by word
 *   spaces   → pinned horizontal gallery, background colour morphs per space,
 *              SVG layers parallax, Seedance clips scrub with the scroll
 *   process  → steps rise in, a line fills
 *   contact  → marquee drifts with the scroll
 */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- config */
  const CONFIG = {
    // Fill in the studio's address to turn the contact button into a mailto link.
    contactEmail: "",
    // Seedance 2.0 output lives here as <id>.mp4 (clip) and <id>.jpg (still).
    // assets/media/manifest.js (written by scripts/prepare-media.sh) lists
    // which files exist, so the site never requests media that is not there.
    mediaDir: "assets/media/",
  };
  const MEDIA = window.PLOTO_MEDIA || {};

  const SPACES = [
    { id: "cafe", bg: "#EADFCF", ink: "#1B1A17" },
    { id: "salon", bg: "#DDE3D6", ink: "#1B1A17" },
    { id: "nail", bg: "#F3DEDA", ink: "#1B1A17" },
    { id: "office", bg: "#DFE3E6", ink: "#1B1A17" },
    { id: "restaurant", bg: "#2A1F1B", ink: "#F4F1EA" },
  ];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrowQuery = window.matchMedia("(max-width: 860px)");

  /* --------------------------------------------------------------- helpers */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const range = (v, a, b) => clamp((v - a) / (b - a));
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  const hexToRgb = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const mix = (a, b, t) => {
    const A = hexToRgb(a);
    const B = hexToRgb(b);
    return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
  };

  /** 0 → section top hits viewport top, 1 → section bottom hits viewport bottom */
  const sectionProgress = (el) => {
    const r = el.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    return total <= 0 ? 0 : clamp(-r.top / total);
  };

  /* ================================================================ MEDIA */
  const VIDEO_TYPES = { webm: 'video/webm; codecs="vp9"', mp4: 'video/mp4; codecs="avc1.42E01E"' };
  const probe = document.createElement("video");

  /** First listed format this browser can play, or null. */
  const pickVideoFormat = (formats) =>
    (Array.isArray(formats) ? formats : []).find((f) => VIDEO_TYPES[f] && probe.canPlayType(VIDEO_TYPES[f])) || null;

  const mediaFrames = $$(".space__media").map((frame) => {
    const id = frame.dataset.media;
    frame.innerHTML = window.PLOTO_SCENES[id] || "";

    const layers = $$("[data-depth]", frame).map((g) => ({
      el: g,
      depth: parseFloat(g.dataset.depth) || 0,
    }));

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = "Concept sketch";
    frame.appendChild(badge);

    // Still frame from Seedance 2.0 (optional)
    const img = new Image();
    img.alt = "";
    img.decoding = "async";
    img.addEventListener("load", () => {
      img.classList.add("is-ready");
      badge.textContent = "Seedance 2.0";
    });
    img.addEventListener("error", () => img.remove());
    if (MEDIA[id] && MEDIA[id].still) {
      img.src = `${CONFIG.mediaDir}${id}.jpg`;
      frame.appendChild(img);
    }

    // Clip from Seedance 2.0 (optional, loaded lazily, scrubbed by scroll)
    const video = pickVideoFormat(MEDIA[id] && MEDIA[id].video) ? document.createElement("video") : null;
    const state = { id, frame, layers, img, video, badge, requested: false, ready: false };

    if (video) {
      video.muted = true;
      video.playsInline = true;
      video.preload = "none";
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      frame.appendChild(video);
      video.addEventListener("loadeddata", () => {
        state.ready = true;
        video.classList.add("is-ready");
        badge.textContent = "Seedance 2.0";
        if (reduceMotion) video.currentTime = Math.min(1, video.duration / 2);
      });
      video.addEventListener("error", () => {
        video.remove();
        state.video = null;
      });
    }

    return state;
  });

  const requestVideo = (m) => {
    if (m.requested || !m.video) return;
    m.requested = true;
    m.video.preload = "auto";
    m.video.src = `${CONFIG.mediaDir}${m.id}.${pickVideoFormat(MEDIA[m.id].video)}`;
    m.video.load();
  };

  /** Seek a clip to t (0..1). Seeks are skipped while one is in flight. */
  const scrubVideo = (m, t) => {
    const v = m.video;
    if (!v || !m.ready || reduceMotion || !isFinite(v.duration)) return;
    const target = clamp(t) * Math.max(0, v.duration - 0.05);
    if (v.seeking || Math.abs(v.currentTime - target) < 0.03) return;
    v.currentTime = target;
  };

  /* ================================================================= HERO */
  const hero = $(".hero");
  const heroSticky = $(".hero__sticky");
  const planGroups = {
    walls: $$(".plan--walls > *"),
    doors: $$(".plan--doors > *"),
    furniture: $$(".plan--furniture > *"),
    dims: $$(".plan--dims path"),
    labels: $$(".plan text"),
  };
  const heroLetters = $$(".hero__title span");
  const heroCopy = $(".hero__copy");

  const drawStagger = (els, p, start, end) => {
    const n = els.length;
    const span = end - start;
    els.forEach((el, i) => {
      const s = start + (span * 0.6 * i) / Math.max(1, n - 1);
      const local = ease(range(p, s, s + span * 0.4));
      el.style.strokeDashoffset = String(1 - local);
      el.style.opacity = local > 0.001 ? "1" : "0";
    });
  };

  const updateHero = () => {
    const p = reduceMotion ? 1 : sectionProgress(hero);

    drawStagger(planGroups.walls, p, 0.02, 0.36);
    drawStagger(planGroups.doors, p, 0.26, 0.5);
    drawStagger(planGroups.furniture, p, 0.34, 0.74);
    drawStagger(planGroups.dims, p, 0.66, 0.86);
    planGroups.labels.forEach((t, i) => {
      t.style.opacity = String(range(p, 0.58 + i * 0.03, 0.7 + i * 0.03));
    });

    heroSticky.style.setProperty("--plan-scale", String(1.18 - 0.18 * ease(range(p, 0, 0.8))));
    heroSticky.style.setProperty("--hint-opacity", String(1 - range(p, 0, 0.08)));

    // Letters drift apart and fade as the plan completes
    const spread = ease(range(p, 0.08, 0.7));
    heroLetters.forEach((l, i) => {
      const dir = i - (heroLetters.length - 1) / 2;
      const x = dir * spread * 9;
      const y = (i % 2 ? -1 : 1) * spread * 18;
      const r = dir * spread * 4;
      l.style.transform = `translate(${x}vw, ${y}vh) rotate(${r}deg)`;
    });
    heroCopy.style.setProperty("--copy-opacity", String(1 - range(p, 0.4, 0.72)));
  };

  /* ================================================================ ABOUT */
  const about = $(".about");
  const aboutText = $("[data-words]");
  const words = [];
  (() => {
    const raw = aboutText.textContent.trim().split(/\s+/);
    aboutText.textContent = "";
    raw.forEach((w, i) => {
      const s = document.createElement("span");
      s.className = "w";
      s.textContent = w;
      aboutText.appendChild(s);
      if (i < raw.length - 1) aboutText.appendChild(document.createTextNode(" "));
      words.push(s);
    });
  })();

  const updateAbout = () => {
    const p = reduceMotion ? 1 : range(sectionProgress(about), 0.05, 0.85);
    const lit = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle("is-on", i < lit));
  };

  /* =============================================================== SPACES */
  const spaces = $(".spaces");
  const track = $(".spaces__track");
  const panels = $$(".space");
  const indexItems = $$(".spaces__index li");
  const spacesBar = $(".spaces__bar");
  let activeIndex = -1;

  const setActive = (i) => {
    if (i === activeIndex) return;
    activeIndex = i;
    indexItems.forEach((li, j) => li.classList.toggle("is-active", j === i));
  };

  const applyTheme = (f) => {
    // f is a fractional index into SPACES (e.g. 1.4 → 40% between salon and nail)
    const i = clamp(Math.floor(f), 0, SPACES.length - 1);
    const j = clamp(i + 1, 0, SPACES.length - 1);
    const t = ease(clamp(f - i));
    spaces.style.setProperty("--space-bg", mix(SPACES[i].bg, SPACES[j].bg, t));
    spaces.style.setProperty("--space-ink", t < 0.5 ? SPACES[i].ink : SPACES[j].ink);
  };

  /** d: -1 (panel left of centre) … 0 (centred) … 1 (right of centre) */
  const updatePanel = (k, d, horizontal) => {
    const m = mediaFrames[k];
    const panel = panels[k];
    const ad = Math.abs(d);

    if (ad < 1.6) requestVideo(m);

    if (!reduceMotion) {
      m.layers.forEach((L) => {
        L.el.setAttribute("transform", `translate(${(-d * L.depth * 1.6).toFixed(2)} 0)`);
      });
      panel.style.setProperty("--media-scale", String(1 - Math.min(ad, 1) * 0.08));
      if (horizontal) {
        panel.style.setProperty("--info-shift", String(d * 120));
        panel.style.setProperty("--info-opacity", String(1 - range(ad, 0.25, 0.85)));
      }
    }

    // Clip plays forwards as the panel travels from entry to exit
    scrubVideo(m, (1 - clamp(d, -1, 1)) / 2);
  };

  const updateSpaces = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (narrowQuery.matches) {
      // Vertical stack: themes follow whichever panel is nearest the centre
      let best = 0;
      let bestDist = Infinity;
      panels.forEach((panel, k) => {
        const r = panel.getBoundingClientRect();
        const d = (r.top + r.height / 2 - vh / 2) / vh;
        if (Math.abs(d) < bestDist) {
          bestDist = Math.abs(d);
          best = k;
        }
        updatePanel(k, clamp(d, -1.5, 1.5), false);
      });
      setActive(best);
      applyTheme(best);
      return;
    }

    const p = sectionProgress(spaces);
    const distance = track.scrollWidth - vw;
    track.style.transform = `translate3d(${(-p * distance).toFixed(1)}px,0,0)`;
    spacesBar.style.setProperty("--spaces-progress", String(p));

    const f = p * (panels.length - 1);
    applyTheme(f);
    setActive(Math.round(f));
    panels.forEach((_, k) => updatePanel(k, k - f, true));
  };

  // Clicking the index jumps to that space
  indexItems.forEach((li) => {
    li.style.cursor = "pointer";
    li.addEventListener("click", () => {
      const k = Number(li.dataset.index);
      let y;
      if (narrowQuery.matches) {
        y = panels[k].getBoundingClientRect().top + window.scrollY - 80;
      } else {
        const total = spaces.offsetHeight - window.innerHeight;
        y = spaces.offsetTop + (total * k) / (panels.length - 1);
      }
      window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  /* ============================================================== PROCESS */
  const process = $(".process");
  const steps = $$(".step");
  const stepList = $(".steps");
  const processLine = $(".process__line");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = steps.indexOf(e.target);
          e.target.style.transitionDelay = `${(i % 4) * 0.12}s`;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        });
      },
      { threshold: 0.3 }
    );
    steps.forEach((s) => io.observe(s));
  } else {
    steps.forEach((s) => s.classList.add("is-in"));
  }

  const updateProcess = () => {
    processLine.style.setProperty("--line-top", `${stepList.offsetTop}px`);
    const r = process.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = range(vh - r.top, vh * 0.4, vh * 0.4 + r.height * 0.6);
    processLine.style.setProperty("--process-progress", String(p));
  };

  /* ============================================================== CONTACT */
  const marqueeRow = $(".marquee__row");
  const contact = $(".contact");

  const updateMarquee = () => {
    if (reduceMotion) return;
    const half = marqueeRow.scrollWidth / 2;
    const r = contact.getBoundingClientRect();
    const x = -((window.innerHeight - r.top) * 0.6) % half;
    marqueeRow.style.setProperty("--marquee", String(x.toFixed(1)));
  };

  const contactLink = $("#contact-link");
  if (CONFIG.contactEmail) {
    contactLink.href = `mailto:${CONFIG.contactEmail}?subject=${encodeURIComponent("[PLOTO] 프로젝트 문의")}`;
  } else {
    contactLink.title = "js/main.js의 CONFIG.contactEmail에 문의 이메일을 입력하세요";
  }

  /* ========================================================= GLOBAL / LOOP */
  const progressBar = $(".progress span");

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    updateHero();
    updateAbout();
    updateSpaces();
    updateProcess();
    updateMarquee();
  };

  let ticking = false;
  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      update();
    });
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  narrowQuery.addEventListener("change", () => {
    track.style.transform = "";
    panels.forEach((p) => {
      p.style.removeProperty("--info-shift");
      p.style.removeProperty("--info-opacity");
    });
    requestUpdate();
  });
  update();

  /* --------------------------------------------------------------- cursor */
  const cursor = $(".cursor");
  if (window.matchMedia("(hover: hover)").matches && !reduceMotion) {
    let mx = 0;
    let my = 0;
    let cx = 0;
    let cy = 0;
    window.addEventListener("pointermove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.classList.add("is-visible");
    });
    document.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));
    document.addEventListener("pointerover", (e) => {
      const hit = e.target.closest("a, button, .space__media, .spaces__index li");
      cursor.classList.toggle("is-hover", Boolean(hit));
    });
    const follow = () => {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(follow);
    };
    follow();
  }
})();
