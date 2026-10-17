/* Mise en scène visuelle (modèle Rothschild & Co) : menu transparent sur la
   grande photo, ligne de chandeliers décorative, apparition douce des sections,
   carrousel des publications. Tout reste sobre, et les animations sont coupées
   si le visiteur a demandé de réduire les animations. */
(function () {
  const calme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const petitEcran = window.matchMedia("(max-width: 767px)").matches;
  const lent = !!(navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType || "")));

  // ---- Menu transparent sur la photo d'ouverture, plein dès qu'on défile ----
  const header = document.getElementById("siteHeader");
  if (header && document.body.classList.contains("home-photo")) {
    const majMenu = () => header.classList.toggle("is-solid", window.scrollY > 40 || header.classList.contains("is-open"));
    window.addEventListener("scroll", majMenu, { passive: true });
    new MutationObserver(majMenu).observe(header, { attributes: true, attributeFilter: ["class"] });
    majMenu();
  }

  // ---- Ligne de chandeliers, purement décorative (aucun chiffre, aucun prix) :
  //      bandeau d'ouverture de l'accueil et bandeaux marqués « with-candles » ----
  document.querySelectorAll(".hero.with-ph, .with-candles").forEach(hero => {
    const n = 64, w = 22, h = 220;
    let y = 120, seed = 7, svg = "";
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let i = 0; i < n; i++) {
      const o = y, c = Math.max(30, Math.min(h - 30, o + (rnd() - 0.48) * 34));
      const hi = Math.min(o, c) - 4 - rnd() * 14, lo = Math.max(o, c) + 4 + rnd() * 14;
      const x = i * w + w / 2, top = Math.min(o, c), bh = Math.max(2, Math.abs(c - o));
      svg += `<line x1="${x}" y1="${hi.toFixed(1)}" x2="${x}" y2="${lo.toFixed(1)}"/>` +
             `<rect x="${x - 5}" y="${top.toFixed(1)}" width="10" height="${bh.toFixed(1)}"${c < o ? "" : ' class="b"'}/>`;
      y = c;
    }
    const deco = document.createElement("div");
    deco.className = "candles";
    deco.setAttribute("aria-hidden", "true");
    // Deux copies côte à côte : le défilement lent boucle sans à-coup.
    const one = `<svg viewBox="0 0 ${n * w} ${h}" preserveAspectRatio="none">${svg}</svg>`;
    deco.innerHTML = `<div class="candles__track">${one}${one}</div>`;
    hero.appendChild(deco);
  });

  // ---- Vidéo éventuelle dans un emplacement photo : pas sur téléphone ni en connexion lente ----
  if (calme || petitEcran || lent) {
    document.querySelectorAll(".ph video, .media video").forEach(v => { v.removeAttribute("autoplay"); v.pause(); });
  }

  // ---- Apparition douce des sections au défilement ----
  if (!calme && "IntersectionObserver" in window) {
    const cibles = document.querySelectorAll("main > section:not(.hero):not(.page-head) > .wrap, .duo, .pubs__track");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("rv-in"); io.unobserve(en.target); } });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    cibles.forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight) return;   // déjà visible : rien à animer
      el.classList.add("rv");
      io.observe(el);
    });
  }

  // ---- Carrousel des dernières publications (accueil) ----
  const band = document.getElementById("dernieres-publications");
  const track = document.getElementById("pubsTrack");
  if (band && track) {
    const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const genre = { video: "Vidéo", story: "Histoire", article: "Réflexion" };
    fetch("/api/articles").then(r => (r.ok ? r.json() : [])).then(list => {
      list = (Array.isArray(list) ? list : []).filter(a => !a.archived && !a.hidden).slice(0, 9);
      if (!list.length) return;
      track.innerHTML = list.map(a => `
        <a class="pcard" href="article.html?id=${encodeURIComponent(a.id)}">
          <div class="pcard__media media"><img src="${esc(a.image || "images/post-default.svg")}" alt="${esc(a.title)}" loading="lazy" decoding="async"></div>
          <span class="pcard__tag">${esc(a.tag || genre[a.type] || "Réflexion")}</span>
          <h3 class="pcard__title">${esc(a.title)}</h3>
        </a>`).join("");
      band.hidden = false;
      const prev = document.getElementById("pubsPrev"), next = document.getElementById("pubsNext");
      const pas = () => Math.max(260, track.clientWidth * 0.8);
      const maj = () => {
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
      };
      prev.addEventListener("click", () => track.scrollBy({ left: -pas(), behavior: calme ? "auto" : "smooth" }));
      next.addEventListener("click", () => track.scrollBy({ left: pas(), behavior: calme ? "auto" : "smooth" }));
      track.addEventListener("scroll", maj, { passive: true });
      window.addEventListener("resize", maj);
      maj();
    }).catch(() => {});
  }
})();
