/* En-tête + pied de page communs, injectés sur chaque page.
   <body data-page="..."> : clé UNIQUE de la page (sert aussi de clé aux textes modifiés en ligne).
   <body data-nav="..."> : entrée de menu à surligner.
   Les réglages (textes, e-mail, réseaux, WhatsApp, prix) viennent de /api/settings. */
(function () {
  const page = document.body.getAttribute("data-page") || "";
  const navKey = document.body.getAttribute("data-nav") || page;
  const year = new Date().getFullYear();

  // Un seul compartiment : la finance des marchés.
  const links = [
    { href: "ecole.html", label: "L'école", key: "ecole" },
    { href: "admission.html", label: "Admission", key: "admission" },
    { href: "publications.html", label: "Publications", key: "publications" },
    { href: "contact.html", label: "Contact", key: "contact" },
  ];
  // Design « La Maison » : le menu comprend aussi L'analyse du matin.
  if (document.body.classList.contains("maison")) {
    links.splice(3, 0, { href: "analyse-du-matin", label: "L'analyse du matin", key: "analyse" });
  }

  // Logo officiel (assets/logo/) : version claire, et version foncée pour les
  // fonds bleu nuit (pied de page, menu transparent posé sur une photo).
  const logo = (extra) => `
    <a class="logo ${extra || ""}" href="ecole.html" aria-label="KBO Corporate Finance — accueil">
      <img class="logo__img logo__img--clair" src="assets/logo/kbo-logo-horizontal-clair.svg" alt="" width="935" height="400">
      <img class="logo__img logo__img--fonce" src="assets/logo/kbo-logo-horizontal-fonce.svg" alt="" width="935" height="400">
    </a>`;

  const header = `
    <header class="site-header" id="siteHeader">
      <div class="wrap bar">
        ${logo()}
        <nav class="mnav" aria-label="Navigation principale">
          <ul>${links.map(l => `<li><a href="${l.href}" class="${navKey === l.key ? "is-active" : ""}">${l.label}</a></li>`).join("")}</ul>
        </nav>
        <a class="cta-top" href="admission.html">Déposer une candidature</a>
        <button class="menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="menuPanel">Menu</button>
      </div>
      <div class="menu-panel" id="menuPanel">
        ${links.map((l, i) => `<a href="${l.href}" class="${navKey === l.key ? "is-active" : ""}">${l.label}<span>0${i + 1}</span></a>`).join("")}
        <a class="btn" href="admission.html">Déposer une candidature <span class="arrow">→</span></a>
      </div>
    </header>`;

  const ic = {
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.82-2.05 3.75-2.05C20.4 8.65 21 11 21 14.1V21h-4v-6.1c0-1.45-.03-3.3-2-3.3s-2.3 1.57-2.3 3.2V21H9z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 3H22l-7 8 8.2 10h-6.4l-5-6.1L6 21H3l7.5-8.6L2.5 3h6.5l4.5 5.6zm-1.1 16h1.7L7.3 4.8H5.5z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.8-1.8C19.3 5 12 5 12 5s-7.3 0-8.8.5A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.8 1.8C4.7 19 12 19 12 19s7.3 0 8.8-.5a2.5 2.5 0 0 0 1.8-1.8C23 15.2 23 12 23 12zM9.8 15.3V8.7l5.7 3.3z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 3c.3 2.3 1.6 3.9 3.9 4.1v3.1a7.7 7.7 0 0 1-3.8-1.2v6.4c0 3.5-2.5 6.1-6 6.1a5.9 5.9 0 0 1-6-6c0-3.6 3-6.3 6.7-5.9v3.3a2.8 2.8 0 0 0-3.5 2.7 2.8 2.8 0 0 0 2.8 2.8c1.7 0 2.9-1.2 2.9-3.3V3z"/></svg>',
  };
  const socialAnchor = (key, label) =>
    `<a href="#" data-social="${key}" aria-label="${label}" target="_blank" rel="noopener" style="display:none">${ic[key]}</a>`;

  const footer = `
    <footer class="site-footer">
      <div class="wrap">
        <div class="fgrid">
          <div>
            ${logo()}
            <p class="about" data-text="footerTagline">École de finance des marchés. Cotonou, Bénin.</p>
            <div class="social">${socialAnchor("linkedin", "LinkedIn")}${socialAnchor("x", "X")}${socialAnchor("youtube", "YouTube")}${socialAnchor("facebook", "Facebook")}${socialAnchor("instagram", "Instagram")}${socialAnchor("tiktok", "TikTok")}</div>
          </div>
          <div><h4>L'école</h4><ul>
            <li><a href="ecole.html">Notre approche</a></li>
            <li><a href="admission.html">Admission</a></li>
            <li><a href="publications.html">Publications</a></li>
            <li><a href="analyse-du-matin.html">L'analyse du matin</a></li>
          </ul></div>
          <div><h4>Informations</h4><ul>
            <li><a href="faq.html">Questions fréquentes</a></li>
            <li><a href="risques.html">Avertissement sur les risques</a></li>
            <li><a href="mentions-legales.html">Mentions légales</a></li>
            <li><a href="confidentialite.html">Confidentialité</a></li>
          </ul></div>
          <div><h4>Contact</h4><ul>
            <li><a href="contact.html" data-wa-link data-wa-msg="Bonjour, je souhaite des informations sur les formations KBO.">WhatsApp</a></li>
            <li><a href="#" data-email-link data-email-text>E-mail</a></li>
            <li><a href="contact.html">Formulaire de contact</a></li>
          </ul></div>
        </div>
        <div class="risk">
          <p data-text="footerRisk">Les formations de KBO Corporate Finance ont une vocation pédagogique. Elles ne constituent ni un conseil en investissement, ni une recommandation d'achat ou de vente. Les marchés financiers comportent un risque de perte en capital.</p>
          <span class="footer__copy">© ${year} KBO Corporate Finance</span>
        </div>
      </div>
    </footer>`;

  // Pages « focalisées » (newsletter, inscription, candidature) : en-tête et pied de
  // page simplifiés, sans menu, pour que rien ne détourne le visiteur.
  // Liens en adresses absolues : ces pages peuvent être servies sous /inscription/…
  const simple = document.body.getAttribute("data-entete") === "simple";
  const retour = document.body.getAttribute("data-retour");
  const headerSimple = `
    <header class="site-header site-header--simple" id="siteHeader">
      <div class="wrap bar">
        <a class="logo" href="/ecole.html" aria-label="KBO Corporate Finance — accueil">
          <img class="logo__img logo__img--clair" src="/assets/logo/kbo-logo-horizontal-clair.svg" alt="" width="935" height="400">
          <img class="logo__img logo__img--fonce" src="/assets/logo/kbo-logo-horizontal-fonce.svg" alt="" width="935" height="400">
        </a>
        ${retour ? `<a class="entete-lien" href="${retour.split("|")[0]}">← ${retour.split("|")[1] || "Retour"}</a>`
                 : `<a class="entete-lien" href="/ecole.html">Découvrir l'école →</a>`}
      </div>
    </header>`;
  const footerSimple = `
    <footer class="site-footer site-footer--simple">
      <div class="wrap">
        <div class="risk">
          <p data-text="footerRisk">Les formations de KBO Corporate Finance ont une vocation pédagogique. Elles ne constituent ni un conseil en investissement, ni une recommandation d'achat ou de vente. Les marchés financiers comportent un risque de perte en capital.</p>
          <span class="footer__copy">© ${year} KBO Corporate Finance · <a href="/mentions-legales.html">Mentions légales</a> · <a href="/confidentialite.html">Confidentialité</a></span>
        </div>
      </div>
    </footer>`;
  const h = document.getElementById("site-header");
  const f = document.getElementById("site-footer");
  if (h) h.outerHTML = simple ? headerSimple : header;
  if (f) f.outerHTML = simple ? footerSimple : footer;

  // Menu téléphone : un panneau plein écran, une entrée = un compartiment.
  (function () {
    const hd = document.getElementById("siteHeader");
    const btn = document.getElementById("menuBtn");
    if (!hd || !btn) return;
    const close = () => { hd.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); btn.textContent = "Menu"; document.documentElement.style.overflow = ""; };
    btn.addEventListener("click", () => {
      const open = !hd.classList.contains("is-open");
      if (!open) return close();
      hd.classList.add("is-open"); btn.setAttribute("aria-expanded", "true"); btn.textContent = "Fermer";
      document.documentElement.style.overflow = "hidden";
    });
    hd.querySelectorAll(".menu-panel a").forEach(a => a.addEventListener("click", close));
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  })();

  // Bouton WhatsApp discret, présent partout. Sans numéro réglé, il renvoie vers Contact.
  (function () {
    if (document.querySelector(".wa-fab")) return;
    if (document.body.getAttribute("data-entete") === "simple") return;
    const waIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.9c0 2.1.55 4.06 1.6 5.8L2 22l4.42-1.68a9.9 9.9 0 0 0 5.62 1.74h.01c5.45 0 9.9-4.45 9.9-9.9 0-2.65-1.03-5.14-2.9-7.02A9.82 9.82 0 0 0 12.04 2zm0 18.02h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-2.62 1 .7-2.56-.2-.32a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43l-.48-.01c-.16 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/></svg>';
    const a = document.createElement("a");
    a.className = "wa-fab";
    a.href = "contact.html";
    a.setAttribute("data-wa-link", "");
    a.setAttribute("aria-label", "Écrire sur WhatsApp");
    a.innerHTML = waIcon + '<span class="wa-fab__label">WhatsApp</span>';
    const mount = () => { if (document.body && !document.querySelector(".wa-fab")) document.body.appendChild(a); };
    if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
  })();

  // Accès propriétaire discret : 5 tapes rapides sur le © du pied de page → connexion.
  (function () {
    const secret = document.querySelector(".footer__copy");
    if (!secret) return;
    let taps = 0, timer = null;
    secret.addEventListener("click", () => {
      taps++;
      if (taps >= 5) { taps = 0; location.href = "admin.html"; return; }
      clearTimeout(timer);
      timer = setTimeout(() => { taps = 0; }, 1600);
    });
  })();

  // Ancienne logique d'apparition au défilement (conservée pour compatibilité).
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("is-in"); obs.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal, .reveal-line").forEach(el => obs.observe(el));

  // ---- Thème (couleurs) : applique les surcharges de design sur :root. ----
  // Chaque réglage pilote une ou plusieurs variables CSS.
  const THEME_VARS = {
    primaire: ["--navy", "--blue"],
    accent:   ["--gold"],
    texte:    ["--ink", "--black"],
    fond:     ["--paper"],
    fonce:    ["--navy-deep"],
  };
  function applyTheme(theme) {
    const root = document.documentElement;
    Object.keys(THEME_VARS).forEach(k => {
      const val = theme && theme[k];
      THEME_VARS[k].forEach(cssVar => {
        if (val) root.style.setProperty(cssVar, val);
        else root.style.removeProperty(cssVar);
      });
    });
  }

  // ---- Live settings: applied to every page ----
  let currentSettings = null;
  function applySettings(s) {
    if (!s) return;
    currentSettings = s;
    applyTheme(s.theme);
    const texts = s.texts || {};
    document.querySelectorAll("[data-text]").forEach(el => {
      const v = texts[el.getAttribute("data-text")];
      // innerHTML (et non textContent) pour conserver la mise en forme
      // (gras, couleur, police…). Le serveur nettoie déjà ce HTML avant stockage.
      if (v != null && v !== "") {
        if (/[<&]/.test(v)) el.innerHTML = v; else el.textContent = v;
      }
    });
    const social = s.social || {};
    document.querySelectorAll("[data-social]").forEach(a => {
      const url = social[a.getAttribute("data-social")];
      if (url) { a.href = url; a.style.display = ""; }
      else { a.style.display = "none"; }
    });
    if (s.email) {
      document.querySelectorAll("[data-email-link]").forEach(a => { a.href = "mailto:" + String(s.email).trim().toLowerCase(); });
      // L'adresse s'affiche comme une information de contact, toujours en minuscules.
      document.querySelectorAll("[data-email-text]").forEach(el => { el.textContent = String(s.email).trim().toLowerCase(); el.classList.add("mail"); });
    }
    // WhatsApp : numéro international sans « + » ni espaces (ex. 22990112233).
    const waRaw = (s.whatsapp || (s.social && s.social.whatsapp) || "").toString();
    const waNum = waRaw.replace(/[^\d]/g, "");
    document.querySelectorAll("[data-wa-link]").forEach(a => {
      if (waNum) {
        const msg = a.getAttribute("data-wa-msg") || "Bonjour, je souhaite des informations sur les formations KBO.";
        a.href = "https://wa.me/" + waNum + "?text=" + encodeURIComponent(msg);
        a.target = "_blank"; a.rel = "noopener";
      } else {
        a.href = "contact.html"; a.removeAttribute("target");
      }
    });
    const photo = document.getElementById("heroPhoto");
    if (photo && s.photo) photo.src = s.photo;
    // Editable images (biography, etc.)
    const images = s.images || {};
    document.querySelectorAll("[data-img]").forEach(el => {
      const src = images[el.getAttribute("data-img")];
      if (src) {
        const img = el.querySelector("img");
        if (img) img.src = src;
      }
    });
    document.dispatchEvent(new CustomEvent("kbo:settings", { detail: s }));
  }

  // ---- Editable free text (biography, service pages, all headings…) ----
  const EDIT_SELECTOR = "h1,h2,h3,h4,h5,p,li,.eyebrow,.lead,figcaption,blockquote,[data-edit]";
  const pageKey = page || "page";

  function domPath(el) {
    const parts = [];
    while (el && el !== document.body && el.nodeType === 1) {
      const parent = el.parentNode; if (!parent) break;
      parts.unshift(el.tagName + Array.prototype.indexOf.call(parent.children, el));
      el = parent;
    }
    return parts.join("/");
  }

  // Text elements that may be edited. Elements with data-text are saved to the
  // site settings; everything else to the content store (keyed by position).
  function editableElements() {
    const set = new Set();
    document.querySelectorAll(EDIT_SELECTOR + ",[data-text]").forEach(el => {
      if (el.hasAttribute("data-noedit")) return;
      if (el.querySelector(EDIT_SELECTOR + ",[data-text]")) return;  // only leaf text blocks
      const inChrome = el.closest(".site-header, .site-footer, form, .admin-bar, .preview-bar");
      if (inChrome && !el.hasAttribute("data-text")) return;         // skip nav/footer chrome
      if (!el.textContent.trim()) return;
      set.add(el);
    });
    return [...set];
  }
  function editableKey(el) {
    if (el.hasAttribute("data-text")) return { kind: "setting", key: el.getAttribute("data-text") };
    return { kind: "content", key: pageKey + "|" + domPath(el) };
  }

  function applyContent(map) {
    if (!map) return;
    editableElements().forEach(el => {
      if (el.hasAttribute("data-text")) return;                 // handled by settings
      const k = pageKey + "|" + domPath(el);
      if (Object.prototype.hasOwnProperty.call(map, k)) el.innerHTML = map[k];
    });
    document.dispatchEvent(new CustomEvent("kbo:content"));
  }

  // ---- Editable images (every illustration/photo on the site) ----
  function editableImages() {
    const out = [];
    document.querySelectorAll("section img").forEach(img => {
      if (img.hasAttribute("data-noedit")) return;
      if (img.closest(".site-header, .site-footer, .admin-bar, #blogGrid, #galleryGrid")) return;
      if (img.closest("[data-slot]")) return;                    // géré par le système de slots
      out.push(img);
    });
    return out;
  }
  function imageKey(img) {
    if (img.id === "heroPhoto") return { kind: "setting-image", key: "photo" };
    const holder = img.closest("[data-img]");
    if (holder) return { kind: "setting-image", key: holder.getAttribute("data-img") };
    return { kind: "img", key: pageKey + "|" + domPath(img) };
  }
  function applyImageContent(map) {
    if (!map) return;
    editableImages().forEach(img => {
      const info = imageKey(img);
      if (info.kind !== "img") return;                          // photo/bio via settings
      if (Object.prototype.hasOwnProperty.call(map, info.key)) img.src = map[info.key];
    });
  }

  // ---- Image slots (carrousels d'images par emplacement) ----
  function defaultSlotImage(slot) {
    return slot.getAttribute("data-default") || "";
  }
  // Un emplacement peut contenir une image OU une vidéo (ou plusieurs, en
  // carrousel). On détecte la vidéo à l'extension du fichier.
  function isVideoPath(p) { return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(p || ""); }
  function mediaTag(p, lazy, alt) {
    if (isVideoPath(p)) {
      return '<video src="' + p + '" muted loop autoplay playsinline preload="metadata"' +
        (lazy ? ' loading="lazy"' : "") + '></video>';
    }
    const txt = String(alt || "ceci est une image du site").replace(/"/g, "&quot;");
    return '<img src="' + p + '" alt="' + txt + '"' + (lazy ? ' loading="lazy"' : "") + ">";
  }
  function renderSlot(slot, arr) {
    // Emplacements « data-keep » (photos du site) : tant qu'aucune image n'a été
    // choisie dans l'administration, on garde le balisage d'origine (tailles
    // adaptées à l'écran, description de l'image).
    if (slot.hasAttribute("data-keep") && slot.__orig == null) slot.__orig = slot.innerHTML;
    const alt = slot.getAttribute("data-alt");
    slot.__images = Array.isArray(arr) ? arr.slice() : null;
    const list = (slot.__images && slot.__images.length) ? slot.__images : null;
    if (!list && slot.__orig != null) { if (slot.innerHTML !== slot.__orig) slot.innerHTML = slot.__orig; return; }
    if (!list) {
      // aucun override : garder / restaurer le média par défaut
      const def = defaultSlotImage(slot);
      if (def) slot.innerHTML = mediaTag(def, false);
      return;
    }
    if (list.length === 1) {
      slot.innerHTML = mediaTag(list[0], false, alt);
      return;
    }
    const media = list.map(p => mediaTag(p, true, alt)).join("");
    const dots = list.map((_, i) => '<button type="button" class="slot-dot' + (i === 0 ? " is-on" : "") + '" data-i="' + i + '" aria-label="Média ' + (i + 1) + '"></button>').join("");
    slot.innerHTML = '<div class="slot-carousel"><div class="slot-track">' + media + '</div><div class="slot-dots">' + dots + '</div></div>';
    wireSlotCarousel(slot);
  }
  function wireSlotCarousel(slot) {
    const track = slot.querySelector(".slot-track");
    const dots = [...slot.querySelectorAll(".slot-dot")];
    if (!track) return;
    const setActive = () => {
      const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
      slot.__index = i;
    };
    track.addEventListener("scroll", () => { window.requestAnimationFrame(setActive); }, { passive: true });
    dots.forEach(d => d.addEventListener("click", () => {
      track.scrollTo({ left: track.clientWidth * parseInt(d.dataset.i, 10), behavior: "smooth" });
    }));
    // Défilement automatique (pause quand l'onglet n'est pas visible ou en édition)
    clearInterval(slot.__timer);
    slot.__timer = setInterval(() => {
      if (document.body.classList.contains("editing") || document.hidden) return;
      const n = dots.length; if (n < 2) return;
      const next = ((slot.__index || 0) + 1) % n;
      track.scrollTo({ left: track.clientWidth * next, behavior: "smooth" });
    }, 5000);
  }
  function applySlides(map) {
    document.querySelectorAll("[data-slot]").forEach(slot => {
      // mémorise l'image par défaut d'origine (avant tout remplacement)
      if (!slot.hasAttribute("data-default")) {
        const img = slot.querySelector("img");
        slot.setAttribute("data-default", img ? img.getAttribute("src") : "");
      }
      const key = slot.getAttribute("data-slot");
      renderSlot(slot, map ? map[key] : null);
    });
  }

  window.KBO = window.KBO || {};
  window.KBO.applySettings = applySettings;
  window.KBO.applyTheme = applyTheme;
  window.KBO.getSettings = () => currentSettings;
  window.KBO.editableElements = editableElements;
  window.KBO.editableKey = editableKey;
  window.KBO.editableImages = editableImages;
  window.KBO.imageKey = imageKey;
  window.KBO.renderSlot = renderSlot;

  fetch("/api/settings")
    .then(r => (r.ok ? r.json() : null))
    .then(applySettings)
    .catch(() => { /* offline: keep static defaults already in the markup */ });

  fetch("/api/content")
    .then(r => (r.ok ? r.json() : null))
    .then(applyContent)
    .catch(() => {});

  fetch("/api/imgcontent")
    .then(r => (r.ok ? r.json() : null))
    .then(applyImageContent)
    .catch(() => {});

  if (document.querySelector("[data-slot]")) {
    fetch("/api/slides")
      .then(r => (r.ok ? r.json() : null))
      .then(map => { applySlides(map); document.dispatchEvent(new CustomEvent("kbo:slides")); })
      .catch(() => applySlides(null));
  }

  // ---- Preview-as-visitor: force the pure visitor view even when logged in ----
  const previewVisitor = new URLSearchParams(location.search).get("visitor") === "1";
  if (previewVisitor) {
    const bar = document.createElement("div");
    bar.className = "preview-bar";
    bar.innerHTML = `<span>👁 Aperçu <strong>visiteur</strong> — voici exactement ce que voient vos visiteurs.</span>
      <a href="admin.html">Quitter l'aperçu</a>`;
    document.addEventListener("DOMContentLoaded", () => document.body.appendChild(bar));
    if (document.body) document.body.appendChild(bar);
    // Keep the visitor flag while navigating within the preview.
    document.addEventListener("click", (e) => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || /^(https?:|mailto:|tel:|#)/.test(href) || a.target === "_blank" || href.indexOf("admin.html") === 0) return;
      if (/[?&]visitor=1/.test(href)) return;
      e.preventDefault();
      const hash = href.indexOf("#"); const base = hash >= 0 ? href.slice(0, hash) : href; const frag = hash >= 0 ? href.slice(hash) : "";
      location.href = base + (base.includes("?") ? "&" : "?") + "visitor=1" + frag;
    });
    return; // do NOT enable admin mode in preview
  }

  // ---- Admin mode: driven by the SERVER (window.__KBO_ADMIN__ injected only
  //      into pages served to an authenticated admin). Visitors never get it. ----
  if (window.__KBO_ADMIN__ === true) {
    document.body.classList.add("is-admin");
    document.dispatchEvent(new CustomEvent("kbo:admin"));
  }
})();
