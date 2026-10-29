/* Blog rendering — fetches articles from the API and renders cards.
   Degrades gracefully if the API is unreachable (e.g. opened as a static file). */
(function () {
  const grid = document.getElementById("blogGrid");
  if (!grid) return;

  // Horizontal carousel navigation (left/right arrows scroll the track only)
  const prevBtn = document.getElementById("blogPrev");
  const nextBtn = document.getElementById("blogNext");
  if (prevBtn && nextBtn) {
    const step = () => Math.min(grid.clientWidth * 0.85, 360);
    prevBtn.addEventListener("click", () => grid.scrollBy({ left: -step(), behavior: "smooth" }));
    nextBtn.addEventListener("click", () => grid.scrollBy({ left: step(), behavior: "smooth" }));
    const sync = () => {
      const max = grid.scrollWidth - grid.clientWidth - 2;
      prevBtn.disabled = grid.scrollLeft <= 2;
      nextBtn.disabled = grid.scrollLeft >= max;
      const hide = grid.scrollWidth <= grid.clientWidth + 4;
      const nav = grid.parentElement.querySelector(".carousel__nav");
      if (nav) nav.style.display = hide ? "none" : "";
    };
    grid.addEventListener("scroll", sync, { passive: true });
    grid.addEventListener("kbo:rendered", sync);
    window.addEventListener("resize", sync);
  }

  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
    } catch (e) { return iso; }
  }

  const kindLabel = { video: "Vidéo", story: "Histoire", article: "Réflexion" };
  const abs = (p) => (!p || /^(https?:)?\/|^data:/.test(p) ? p : "/" + p);
  const categorie = (a) => (a.categorie === "tribunes" ? "tribunes" : "marches");   // anciens articles : Marchés

  function mediaFor(a) {
    let inner;
    if (a.type === "video" && a.videoFile && !a.image) {
      // Miniature directe de la vidéo téléversée (verticale ou horizontale)
      inner = `<video src="${esc(abs(a.videoFile))}#t=0.1" muted playsinline preload="metadata"></video>`;
    } else {
      const src = abs(a.image) || "/images/post-default.svg";
      inner = `<img src="${esc(src)}" alt="${esc(a.title)}" loading="lazy" />`;
    }
    if (a.type === "video") {
      return `<div class="post-card__media">${inner}<span class="post-card__play"><span></span></span></div>`;
    }
    return `<div class="post-card__media">${inner}</div>`;
  }

  function cardFor(a) {
    const cls = a.type === "video" ? "post-card post-card--video" : "post-card";
    const label = a.type === "video" ? "Regarder la vidéo" : (a.type === "story" ? "Lire l'histoire" : "Lire l'article");
    return `
      <article class="${cls} reveal is-in">
        <a href="/article?id=${encodeURIComponent(a.id)}" aria-label="${esc(a.title)}">
          ${mediaFor(a)}
        </a>
        <div class="post-card__body">
          <div class="post-card__meta">
            ${a.statut === "brouillon" ? '<span class="tag tag--brouillon">Brouillon</span>' : ""}
            <span class="tag">${esc(categorie(a) === "tribunes" ? "Tribune" : (a.tag || kindLabel[a.type] || "Réflexion"))}</span>
            <span>${formatDate(a.date)}</span>
          </div>
          <h3><a href="/article?id=${encodeURIComponent(a.id)}" style="color:inherit">${esc(a.title)}</a></h3>
          <p>${esc(a.excerpt || "")}</p>
          <a class="post-card__link" href="/article?id=${encodeURIComponent(a.id)}">${label} →</a>
        </div>
      </article>`;
  }

  // Filtre « Tout · Marchés · Tribunes » (page Publications) : il apparaît dans l'adresse
  // (/publications?categorie=marches, /publications/tribunes) pour pouvoir partager la liste.
  const filtre = document.querySelector(".pub-filtre");
  const rubrique = document.getElementById("pubRubrique");
  let tous = [];
  function choixDepuisAdresse() {
    if (/^\/publications\/tribunes\/?$/.test(location.pathname)) return "tribunes";
    const c = new URLSearchParams(location.search).get("categorie");
    return c === "tribunes" || c === "marches" ? c : "";
  }
  function afficher() {
    const cat = filtre ? choixDepuisAdresse() : "";
    if (filtre) filtre.querySelectorAll("a").forEach(a => {
      const on = a.getAttribute("data-cat") === cat;
      a.classList.toggle("is-on", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    if (rubrique) rubrique.hidden = cat !== "tribunes";
    const list = cat ? tous.filter(a => categorie(a) === cat) : tous;
    if (!list.length) {
      grid.innerHTML = cat === "tribunes"
        ? `<p class="empty-state">Aucune tribune pour le moment. La première arrive bientôt.</p>`
        : `<p class="empty-state">Aucun article pour le moment. Les premières publications arrivent bientôt.</p>`;
      return;
    }
    grid.innerHTML = list.map(cardFor).join("");
    grid.dispatchEvent(new CustomEvent("kbo:rendered"));
  }
  if (filtre) {
    filtre.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-cat]");
      if (!a || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      history.pushState(null, "", a.getAttribute("href"));
      afficher();
    });
    window.addEventListener("popstate", afficher);
  }

  fetch("/api/articles")
    .then(r => { if (!r.ok) throw new Error("api"); return r.json(); })
    .then(list => {
      tous = Array.isArray(list) ? list : [];
      afficher();
    })
    .catch(() => {
      grid.innerHTML = `<p class="empty-state">Le blog se charge lorsque le serveur est démarré (<code>python3 server.py</code>). Aucun article à afficher pour l'instant.</p>`;
    });
})();
