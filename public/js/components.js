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
    { href: "/", label: "L'école", key: "ecole" },
    { href: "/admission", label: "Admission", key: "admission" },
    { href: "/publications", label: "Publications", key: "publications" },
    { href: "/contact", label: "Contact", key: "contact" },
  ];
  // Design « La Maison » : le menu comprend aussi L'analyse du matin.
  if (document.body.classList.contains("maison")) {
    links.splice(3, 0, { href: "analyse-du-matin", label: "L'analyse du matin", key: "analyse" });
  }

  // Logo officiel (assets/logo/) : version claire, et version foncée pour les
  // fonds bleu nuit (pied de page, menu transparent posé sur une photo).
  const logo = (extra) => `
    <a class="logo ${extra || ""}" href="/" aria-label="KBO Corporate Finance — accueil">
      <img class="logo__img logo__img--clair" src="/assets/logo/kbo-logo-horizontal-clair.svg" alt="" width="935" height="400">
      <img class="logo__img logo__img--fonce" src="/assets/logo/kbo-logo-horizontal-fonce.svg" alt="" width="935" height="400">
    </a>`;

  const header = `
    <header class="site-header" id="siteHeader">
      <div class="wrap bar">
        ${logo()}
        <nav class="mnav" aria-label="Navigation principale">
          <ul>${links.map(l => `<li><a href="${l.href}" class="${navKey === l.key ? "is-active" : ""}">${l.label}</a></li>`).join("")}</ul>
        </nav>
        <a class="cta-top" href="/admission">Découvrir les formations</a>
        <button class="menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="menuPanel">Menu</button>
      </div>
      <div class="menu-panel" id="menuPanel">
        ${links.map((l, i) => `<a href="${l.href}" class="${navKey === l.key ? "is-active" : ""}">${l.label}<span>0${i + 1}</span></a>`).join("")}
        <a class="btn" href="/admission">Découvrir les formations <span class="arrow">→</span></a>
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
            <li><a href="/">Notre approche</a></li>
            <li><a href="/admission">Admission</a></li>
            <li><a href="/publications">Publications</a></li>
            <li><a href="/analyse-du-matin">L'analyse du matin</a></li>
          </ul></div>
          <div><h4>Informations</h4><ul>
            <li><a href="/faq">Questions fréquentes</a></li>
            <li><a href="/risques">Avertissement sur les risques</a></li>
            <li><a href="/mentions-legales">Mentions légales</a></li>
            <li><a href="/confidentialite">Confidentialité</a></li>
          </ul></div>
          <div><h4>Contact</h4><ul>
            <li><a href="/contact" data-wa-link data-wa-msg="Bonjour, je souhaite des informations sur les formations KBO.">WhatsApp</a></li>
            <li><a href="#" data-email-link data-email-text>E-mail</a></li>
            <li><a href="/contact">Formulaire de contact</a></li>
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
        <a class="logo" href="/" aria-label="KBO Corporate Finance — accueil">
          <img class="logo__img logo__img--clair" src="/assets/logo/kbo-logo-horizontal-clair.svg" alt="" width="935" height="400">
          <img class="logo__img logo__img--fonce" src="/assets/logo/kbo-logo-horizontal-fonce.svg" alt="" width="935" height="400">
        </a>
        ${retour ? `<a class="entete-lien" href="${retour.split("|")[0]}">← ${retour.split("|")[1] || "Retour"}</a>`
                 : `<a class="entete-lien" href="/">Découvrir l'école →</a>`}
      </div>
    </header>`;
  const footerSimple = `
    <footer class="site-footer site-footer--simple">
      <div class="wrap">
        <div class="risk">
          <p data-text="footerRisk">Les formations de KBO Corporate Finance ont une vocation pédagogique. Elles ne constituent ni un conseil en investissement, ni une recommandation d'achat ou de vente. Les marchés financiers comportent un risque de perte en capital.</p>
          <span class="footer__copy">© ${year} KBO Corporate Finance · <a href="/mentions-legales">Mentions légales</a> · <a href="/confidentialite">Confidentialité</a></span>
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
    a.href = "/contact";
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
      if (taps >= 5) { taps = 0; location.href = "/admin"; return; }
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
        a.href = a.getAttribute("data-wa-repli") || "/contact"; a.removeAttribute("target");
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
  // Petits textes « en ligne » (badges, chiffres, intitulés de cartes, liens « Découvrir… ») :
  // modifiables aussi, s'ils portent eux-mêmes du texte et ne sont pas dans un bloc déjà modifiable.
  const INLINE_SELECTOR = "span,b,strong,small,em,i,a,label,dt,dd,td,th";
  const CHROME = ".site-header, .site-footer, form, .admin-bar, .preview-bar, .kbo-fm, .fmt-bar, " +
                 ".ije-entete, .ije-pied, .bascule, .slot-admin, .kbo-imgbtn, .wa-fab, .kbo-media__couche, button, svg, script, noscript";
  function ownText(el) {
    for (const n of el.childNodes) if (n.nodeType === 3 && n.nodeValue.trim()) return true;
    return false;
  }
  function editableElements() {
    const set = new Set();
    document.querySelectorAll(EDIT_SELECTOR + ",[data-text]").forEach(el => {
      if (el.hasAttribute("data-noedit")) return;
      if (el.querySelector(EDIT_SELECTOR + ",[data-text]")) return;  // only leaf text blocks
      const inChrome = el.closest(".site-header, .site-footer, form, .admin-bar, .preview-bar, .kbo-fm");
      if (inChrome && !el.hasAttribute("data-text")) return;         // skip nav/footer chrome
      if (!el.textContent.trim()) return;
      set.add(el);
    });
    const main = document.querySelector("main") || document.body;
    main.querySelectorAll(INLINE_SELECTOR).forEach(el => {
      if (!ownText(el) || el.hasAttribute("data-noedit") || el.closest("[aria-hidden='true'], " + CHROME)) return;
      if (el.closest(".lettre, .mot-rempli, .mot-ensemble")) return;            // découpage des effets
      for (let p = el.parentElement; p; p = p.parentElement) if (set.has(p)) return;
      if (el.querySelector(EDIT_SELECTOR)) return;
      set.add(el);
    });
    // Un élément dont un parent est déjà retenu ne l'est pas deux fois.
    return [...set].filter(el => { for (let p = el.parentElement; p; p = p.parentElement) if (set.has(p)) return false; return true; });
  }
  // data-cle : clé d'enregistrement fixe (un texte déjà modifié garde sa sauvegarde
  // même si la mise en page change et qu'il n'est plus au même endroit).
  function contentKey(el) {
    return el.getAttribute("data-cle") || (pageKey + "|" + domPath(el));
  }
  function editableKey(el) {
    if (el.hasAttribute("data-text")) return { kind: "setting", key: el.getAttribute("data-text") };
    return { kind: "content", key: contentKey(el) };
  }

  function applyContent(map) {
    if (!map) return;
    editableElements().forEach(el => {
      if (el.hasAttribute("data-text")) return;                 // handled by settings
      const k = contentKey(el);
      if (Object.prototype.hasOwnProperty.call(map, k)) el.innerHTML = map[k];
    });
    document.dispatchEvent(new CustomEvent("kbo:content"));
  }

  // ---- Editable images (every illustration/photo on the site) ----
  function editableImages() {
    const out = [];
    document.querySelectorAll("section img").forEach(img => {
      if (img.hasAttribute("data-noedit")) return;
      if (img.closest(".site-header, .site-footer, .admin-bar, .kbo-fm, #blogGrid, #galleryGrid")) return;
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
      if (Object.prototype.hasOwnProperty.call(map, info.key)) appliquerMedia(img, map[info.key]);
    });
  }

  // ---- Médias : une image OU une vidéo dans chaque emplacement d'image ----
  // L'<img> d'origine reste en place et sert d'image d'aperçu : le cadre, le
  // format et les effets ne changent pas. La vidéo se pose par-dessus, sur la
  // même surface, et ne se charge que lorsqu'elle arrive à l'écran.
  // Valeur : chemin d'image (ancien format) ou objet {type:"image"|"video", …}.
  function cheminAbsolu(p) { return !p || /^(https?:)?\/|^data:|^blob:/.test(p) ? p : "/" + p; }
  function normMedia(v) {
    if (!v) return null;
    if (typeof v === "string") {
      return isVideoPath(v) ? { type: "video", source: "fichier", src: v, poster: "", mode: "fond", alt: "" }
                            : { type: "image", src: v, alt: "" };
    }
    return v;
  }
  const reduitMouvement = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  function connexionEconome() {
    const c = navigator.connection;
    return !!(c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || "")));
  }
  function lienVideo(m, fond) {
    if (m.source === "youtube") {
      const u = "https://www.youtube-nocookie.com/embed/" + m.src + "?autoplay=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3";
      return fond ? u + "&mute=1&loop=1&controls=0&disablekb=1&enablejsapi=1&playlist=" + m.src +
                    "&origin=" + encodeURIComponent(location.origin) : u;
    }
    const p = String(m.src).split("/");
    const u = "https://player.vimeo.com/video/" + p[0] + "?autoplay=1&dnt=1" + (p[1] ? "&h=" + p[1] : "");
    return fond ? u + "&background=1&muted=1&loop=1" : u;
  }
  function elementVideo(m, fond, couche) {
    let el;
    if (m.source === "fichier") {
      el = document.createElement("video");
      el.playsInline = true; el.setAttribute("playsinline", "");
      el.src = cheminAbsolu(m.src);
      el.style.objectPosition = couche.__pos || "";
      if (fond) {
        el.muted = true; el.setAttribute("muted", ""); el.loop = true; el.autoplay = true;
        el.preload = "auto"; el.tabIndex = -1; el.setAttribute("aria-hidden", "true"); el.disablePictureInPicture = true;
        el.addEventListener("playing", () => couche.classList.add("est-pret"), { once: true });
      } else {
        el.controls = true; el.autoplay = true; el.preload = "auto";
        if (m.titre) el.title = m.titre;
      }
    } else {
      el = document.createElement("iframe");
      el.src = lienVideo(m, fond);
      el.title = m.titre || m.alt || "Vidéo";
      el.setAttribute("allow", "autoplay; fullscreen; picture-in-picture; encrypted-media");
      el.setAttribute("allowfullscreen", "");
      if (fond) { el.tabIndex = -1; el.setAttribute("aria-hidden", "true"); }
      // Le temps que le lecteur démarre, on garde l'image d'aperçu. YouTube affiche
      // quelques secondes son titre au début de la lecture, même sans contrôles :
      // on attend qu'il annonce « lecture en cours », puis encore 3 secondes.
      const pret = () => couche.classList.add("est-pret");
      if (fond && m.source === "youtube") {
        const ecoute = e => {
          if (e.source !== el.contentWindow) return;
          let d; try { d = JSON.parse(e.data); } catch (err) { return; }
          const st = d && (d.event === "onStateChange" ? d.info : d.info && d.info.playerState);
          if (st === 1) { window.removeEventListener("message", ecoute); setTimeout(pret, 3000); }
        };
        window.addEventListener("message", ecoute);
        el.addEventListener("load", () => {
          el.contentWindow.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*");
          setTimeout(pret, 12000);              // au cas où le lecteur ne répond pas
        });
      } else {
        el.addEventListener("load", () => setTimeout(pret, fond ? 1200 : 0));
      }
    }
    return el;
  }
  const observateur = "IntersectionObserver" in window ? new IntersectionObserver(entrees => {
    entrees.forEach(e => (e.isIntersecting ? activerFond(e.target) : pauseFond(e.target)));
  }, { rootMargin: "250px 0px" }) : null;

  function activerFond(img) {
    const m = img.__kboMedia, c = img.__kboCouche;
    if (!m || !c || m.mode !== "fond") return;
    if (reduitMouvement.matches || connexionEconome()) return;   // on garde l'image d'aperçu
    if (!c.__video) { c.__video = elementVideo(m, true, c); c.appendChild(c.__video); }
    else if (c.__video.play) c.__video.play().catch(() => {});
  }
  function pauseFond(img) {
    const c = img.__kboCouche;
    if (c && c.__video && c.__video.pause && img.__kboMedia && img.__kboMedia.mode === "fond") c.__video.pause();
  }
  function lancerLecteur(img) {
    const m = img.__kboMedia, c = img.__kboCouche;
    if (!m || !c) return;
    c.innerHTML = "";
    c.classList.add("est-lance", "est-pret");
    c.__video = elementVideo(m, false, c);
    c.appendChild(c.__video);
    if (c.__video.play) c.__video.play().catch(() => {});
  }
  function retirerVideo(img) {
    if (img.__kboCouche) { img.__kboCouche.remove(); img.__kboCouche = null; }
    if (observateur) observateur.unobserve(img);
    img.__kboMedia = null;
  }
  function preparerVideo(img, m) {
    retirerVideo(img);
    if (!m || m.type !== "video") return;
    const parent = img.parentElement;
    if (!parent) return;
    if (getComputedStyle(parent).position === "static") parent.style.position = "relative";
    const c = document.createElement("span");
    c.className = "kbo-media__couche kbo-media__couche--" + (m.mode === "lecteur" ? "lecteur" : "fond");
    const cs = getComputedStyle(img);
    c.style.borderRadius = cs.borderRadius;
    if (cs.filter && cs.filter !== "none") c.style.filter = cs.filter;
    c.__pos = cs.objectPosition;
    img.insertAdjacentElement("afterend", c);
    img.__kboMedia = m; img.__kboCouche = c;
    if (m.mode === "lecteur") {
      const b = document.createElement("button");
      b.type = "button"; b.className = "kbo-media__lire";
      b.setAttribute("aria-label", "Lire la vidéo : " + (m.titre || m.alt || ""));
      b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 5.5v13l10.5-6.5z"/></svg>';
      b.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); lancerLecteur(img); });
      c.appendChild(b);
      return;
    }
    if (observateur) observateur.observe(img); else activerFond(img);
  }
  // Applique une valeur (ou null : retour à l'image d'origine) sur une image du site.
  function appliquerMedia(img, v) {
    if (!img.__orig) {
      img.__orig = { src: img.getAttribute("src"), srcset: img.getAttribute("srcset"),
                     sizes: img.getAttribute("sizes"), alt: img.getAttribute("alt") };
    }
    const o = img.__orig;
    const remettre = (attr, val) => (val == null ? img.removeAttribute(attr) : img.setAttribute(attr, val));
    const m = normMedia(v);
    img.__kboValeur = v || null;
    const src = !m ? o.src : cheminAbsolu(m.type === "video" ? (m.poster || o.src) : m.src);
    if (src === o.src) { remettre("src", o.src); remettre("srcset", o.srcset); remettre("sizes", o.sizes); }
    else { img.removeAttribute("srcset"); img.removeAttribute("sizes"); img.setAttribute("src", src); }
    remettre("alt", (m && m.alt) || o.alt);
    preparerVideo(img, m && m.type === "video" ? m : null);
  }
  function hydraterMedias(racine) {
    (racine || document).querySelectorAll("img[data-kbo-media]").forEach(img => {
      if (img.__kboMedia) return;
      try { preparerVideo(img, JSON.parse(img.getAttribute("data-kbo-media"))); } catch (e) { /* valeur illisible : l'image reste */ }
    });
  }

  // ---- Image slots (carrousels d'images par emplacement) ----
  function defaultSlotImage(slot) {
    return slot.getAttribute("data-default") || "";
  }
  // Un emplacement peut contenir une image OU une vidéo (ou plusieurs, en
  // carrousel). On détecte la vidéo à l'extension du fichier.
  function isVideoPath(p) { return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(p || ""); }
  function attrEsc(t) { return String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }
  function mediaTag(v, lazy, alt) {
    const m = normMedia(v);
    if (m && typeof v !== "string") {
      const txt = attrEsc(m.alt || alt || "ceci est une image du site");
      if (m.type === "image") return '<img src="' + attrEsc(cheminAbsolu(m.src)) + '" alt="' + txt + '"' + (lazy ? ' loading="lazy"' : "") + ">";
      return '<span class="slot-item"><img src="' + attrEsc(cheminAbsolu(m.poster)) + '" alt="' + txt + '"' + (lazy ? ' loading="lazy"' : "") +
        ' data-kbo-media="' + attrEsc(JSON.stringify(m)) + '"></span>';
    }
    const p = v;
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
      hydraterMedias(slot);
      return;
    }
    const media = list.map(p => mediaTag(p, true, alt)).join("");
    const dots = list.map((_, i) => '<button type="button" class="slot-dot' + (i === 0 ? " is-on" : "") + '" data-i="' + i + '" aria-label="Média ' + (i + 1) + '"></button>').join("");
    slot.innerHTML = '<div class="slot-carousel"><div class="slot-track">' + media + '</div><div class="slot-dots">' + dots + '</div></div>';
    hydraterMedias(slot);
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
  window.KBO.appliquerMedia = appliquerMedia;
  window.KBO.normMedia = normMedia;
  window.KBO.cheminAbsolu = cheminAbsolu;

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
      <a href="/admin">Quitter l'aperçu</a>`;
    document.addEventListener("DOMContentLoaded", () => document.body.appendChild(bar));
    if (document.body) document.body.appendChild(bar);
    // Keep the visitor flag while navigating within the preview.
    document.addEventListener("click", (e) => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || /^(https?:|mailto:|tel:|#)/.test(href) || a.target === "_blank" || href.indexOf("/admin") === 0) return;
      if (/[?&]visitor=1/.test(href)) return;
      e.preventDefault();
      const hash = href.indexOf("#"); const base = hash >= 0 ? href.slice(0, hash) : href; const frag = hash >= 0 ? href.slice(hash) : "";
      location.href = base + (base.includes("?") ? "&" : "?") + "visitor=1" + frag;
    });
    return; // do NOT enable admin mode in preview
  }

  // ---- Fenêtre « Rester informé » (L'analyse du matin), comme sur eloquence360 ----
  // Après 10 secondes, pour les visiteurs de L'école seulement ; jamais sur les pages
  // d'inscription, de paiement ou légales. Fermée : pas avant 30 jours ; inscrit : plus jamais.
  (function () {
    const SANS = ["m-analyse", "m-paiement", "m-acces", "m-invitation", "m-candidature-finance", "m-inscription-trading",
                  "m-404", "m-confidentialite", "m-mentions", "m-risques"];
    if (window.__KBO_ADMIN__ === true || !page || /^ije-/.test(page) || SANS.indexOf(page) >= 0) return;
    let vu = null;
    try { vu = localStorage.getItem("kbo-rester-informe"); } catch (e) { return; }
    if (vu === "inscrit" || (vu && Date.now() - Number(vu) < 30 * 864e5)) return;
    function ouvrir() {
      // On n'interrompt pas quelqu'un qui écrit dans un formulaire.
      const a = document.activeElement;
      if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) { setTimeout(ouvrir, 8000); return; }
      if (document.querySelector(".analyse-form .form-msg.ok")) return;   // déjà inscrit sur cette page
      const sc = document.createElement("script");
      sc.src = "/js/rester-informe.js";
      document.body.appendChild(sc);
    }
    setTimeout(ouvrir, 10000);
  })();

  // ---- Admin mode: driven by the SERVER (window.__KBO_ADMIN__ injected only
  //      into pages served to an authenticated admin). Visitors never get it. ----
  if (window.__KBO_ADMIN__ === true) {
    document.body.classList.add("is-admin");
    document.dispatchEvent(new CustomEvent("kbo:admin"));
  }
})();
