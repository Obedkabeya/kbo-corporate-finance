/* Effets de l'accueil (inspirés d'eloquence360.org, avec la charte KBO) :
   - les images « zooment » doucement en entrant à l'écran (cadre .zoom-cadre) ;
   - les grands titres et la grande phrase se « remplissent » mot à mot au défilement ;
   - le titre d'ouverture s'écrit lettre par lettre ;
   - les chiffres comptent jusqu'à leur valeur ;
   - les cartes apparaissent l'une après l'autre ;
   - les mots géants, les cartes flottantes et les petites photos glissent au défilement ;
   - les grandes lignes de mots défilent sur le côté ;
   - l'étape de la méthode en cours s'allume ;
   - la barre du haut devient bleu nuit après l'ouverture ; bouton « haut de page » ;
   - curseur rond sur ordinateur ; fenêtre vidéo pour le bouton de lecture.
   Rien ne bouge si le visiteur a demandé de réduire les animations. Pendant l'édition
   des textes (« Modifier le texte »), les titres découpés retrouvent leur texte d'origine,
   pour que l'éditeur enregistre un texte propre ; le découpage reprend à la fin. */
(function () {
  var html = document.documentElement;
  var reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window);
  var edition = false;
  var $$ = function (sel, r) { return Array.prototype.slice.call((r || document).querySelectorAll(sel)); };

  // ---- Toujours actifs (même sans animation) : barre du haut, haut de page, vidéo ----
  var header = null, haut = document.querySelector(".a-haut");
  function majBarre() {
    header = header || document.getElementById("siteHeader");
    if (header) header.classList.toggle("is-solid", window.scrollY > 40);
    if (haut) haut.classList.toggle("est-visible", window.scrollY > 700);
  }
  var modale = document.getElementById("aModale");
  function fermerModale() {
    if (!modale) return;
    modale.hidden = true;
    modale.querySelector(".a-modale__cadre").innerHTML = "";
    document.body.style.overflow = "";
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".a-lecture");
    if (b) {
      var v = (b.getAttribute("data-video") || "").trim();
      if (!v || !modale) {                                     // pas encore de vidéo : on descend à la suite
        var cible = document.querySelector(b.getAttribute("data-cible") || "main section:nth-of-type(2)");
        if (cible) cible.scrollIntoView({ behavior: reduit ? "auto" : "smooth" });
        return;
      }
      var cadre = modale.querySelector(".a-modale__cadre");
      var yt = v.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,})/);
      cadre.innerHTML = yt
        ? '<iframe src="https://www.youtube-nocookie.com/embed/' + yt[1] + '?autoplay=1&rel=0" allow="autoplay; fullscreen" allowfullscreen title="Vidéo de présentation"></iframe>'
        : '<video src="' + v.replace(/"/g, "") + '" controls autoplay playsinline></video>';
      modale.hidden = false;
      document.body.style.overflow = "hidden";
      return;
    }
    if (e.target.closest && (e.target.closest(".a-modale__fermer") || e.target === modale)) fermerModale();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") fermerModale(); });

  // Galerie des pages de formation : boutons « Précédent / Suivant ».
  document.addEventListener("click", function (e) {
    var f = e.target.closest && e.target.closest("[data-galerie]");
    if (!f) return;
    var piste = document.querySelector(f.getAttribute("data-galerie"));
    if (piste) piste.scrollBy({ left: (f.getAttribute("data-sens") === "-1" ? -1 : 1) * piste.clientWidth * 0.6, behavior: reduit ? "auto" : "smooth" });
  });

  if (reduit) {
    window.addEventListener("scroll", majBarre, { passive: true });
    document.addEventListener("DOMContentLoaded", majBarre); majBarre();
    return;
  }
  html.classList.add("js-effets");

  // ---- Images qui zooment, cartes qui apparaissent, chiffres qui comptent ----
  var io = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      io.unobserve(el);
      if (el.classList.contains("zoom-cadre")) el.classList.add("zoom-vu");
      else if (el.classList.contains("compteur")) compter(el);
      else setTimeout(function () { el.classList.add("est-apparu"); }, (+el.getAttribute("data-rang") || 0) * 110);
    });
  }, { threshold: 0.15 });
  function observer() {
    $$(".zoom-cadre:not([data-vu]), .compteur:not([data-vu])").forEach(function (el) { el.setAttribute("data-vu", "1"); io.observe(el); });
    [".a-guide__cartes > *", ".a-parcours__grandes > *", ".a-parcours__petites > *",
     ".p-escalier__barres > *", ".p-cartes > *", ".p-reperes__grille > *", ".a-refus > *"].forEach(function (sel) {
      $$(sel).forEach(function (el, i) {
        if (el.hasAttribute("data-vu")) return;
        el.setAttribute("data-vu", "1"); el.setAttribute("data-rang", i); io.observe(el);
      });
    });
  }
  function compter(el) {
    var fin = parseFloat(el.getAttribute("data-valeur")) || 0, t0 = null, duree = 1600;
    (function pas(t) {
      t0 = t0 || t;
      var p = Math.min(1, (t - t0) / duree), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(fin * e);
      if (p < 1) requestAnimationFrame(pas);
    })(performance.now());
    el.textContent = "0";
  }

  // Découpe le texte d'un élément (en gardant ses balises) en mots, et si besoin en lettres.
  var decoupes = [];
  function decouper(el, enLettres) {
    // Texte d'origine : relevé à chaque découpage (il peut avoir été remplacé entre-temps
    // par le texte enregistré par Obed).
    el.__kboOrigine = el.innerHTML;
    if (decoupes.indexOf(el) < 0) decoupes.push(el);
    var n = 0, mots = [];
    (function parcourir(noeud) {
      Array.prototype.slice.call(noeud.childNodes).forEach(function (c) {
        if (c.nodeType === 1) { if (c.tagName !== "BR") parcourir(c); return; }
        if (c.nodeType !== 3 || !c.nodeValue) return;
        var frag = document.createDocumentFragment();
        c.nodeValue.split(/(\s+)/).forEach(function (morceau) {
          if (!morceau) return;
          if (/^\s+$/.test(morceau)) { frag.appendChild(document.createTextNode(morceau)); return; }
          var mot = document.createElement("span");
          mot.className = enLettres ? "mot-ensemble" : "mot-rempli";
          if (enLettres) {
            Array.prototype.forEach.call(morceau, function (ch) {
              var l = document.createElement("span");
              l.className = "lettre"; l.style.setProperty("--n", n++); l.textContent = ch;
              mot.appendChild(l);
            });
          } else mot.textContent = morceau;
          mots.push(mot); frag.appendChild(mot);
        });
        c.parentNode.replaceChild(frag, c);
      });
    })(el);
    return mots;
  }

  // ---- Titre d'ouverture, lettre par lettre ----
  function lettres() {
    if (edition) return;
    var h = document.querySelector(".a-hero__titre, .p-hero__titre") || document.querySelector(".page-head h1");
    if (!h) return;
    h.classList.add("lettres-cible");
    if (!h.querySelector(".lettre")) {
      h.setAttribute("aria-label", h.textContent.replace(/\s+/g, " ").trim());
      decouper(h, true);
    }
    h.classList.add("lettres-pret");
  }

  // ---- Titres et grande phrase qui se remplissent mot à mot ----
  var titres = [];
  function preparerTitres() {
    titres = [];
    if (edition) return;
    $$(".titre-rempli, .texte-rempli").forEach(function (h) {
      var mots = h.querySelector(".mot-rempli") ? $$(".mot-rempli", h) : decouper(h, false);
      if (mots.length) titres.push({ h: h, mots: mots });
    });
  }
  function majTitres(H) {
    var bas = H * 0.9, hautZ = H * 0.4;
    titres.forEach(function (t) {
      var r = t.h.getBoundingClientRect();
      if (r.bottom < 0) return remplir(t, t.mots.length);
      if (r.top > H) return;
      var p = Math.min(1, Math.max(0, (bas - r.top) / (bas - hautZ)));
      remplir(t, Math.round(p * t.mots.length));
    });
  }
  function remplir(t, k) { t.mots.forEach(function (m, i) { m.classList.toggle("plein", i < k); }); }

  // ---- Mouvements liés au défilement ----
  function progression(el, H) {                // 0 quand l'élément entre en bas, 1 quand il sort en haut
    var r = el.getBoundingClientRect();
    return { r: r, p: (H - r.top) / (H + r.height), visible: r.bottom > 0 && r.top < H };
  }
  function majMouvements(H) {
    $$(".a-prog__image").forEach(function (a) {
      var g = progression(a, H); if (!g.visible) return;
      var mot = a.querySelector(".a-prog__mot");
      if (mot) mot.style.setProperty("--py", ((0.5 - g.p) * 90).toFixed(1) + "px");
    });
    $$(".a-flotte, .a-defile__photo").forEach(function (f) {
      var g = progression(f.parentNode, H); if (!g.visible) return;
      var v = parseFloat(f.getAttribute("data-vitesse")) || (f.classList.contains("a-defile__photo--2") ? -0.12 : 0.1);
      f.style.setProperty("--fy", ((g.p - 0.5) * v * H).toFixed(1) + "px");
    });
    $$(".a-defile__ligne").forEach(function (l) {
      var g = progression(l.parentNode, H); if (!g.visible) return;
      var sens = parseFloat(l.getAttribute("data-sens")) || 1;
      l.style.setProperty("--dx", (sens * (g.p - 0.5) * -420).toFixed(1) + "px");
    });
    // Méthode : sur grand écran, le bloc reste fixe et chaque étape monte par-dessus la précédente.
    var pile = document.querySelector(".a-methode");
    if (pile && window.innerWidth > 980) {
      var cartes = $$(".a-mstep", pile), n = cartes.length;
      pile.classList.add("est-empile");
      pile.style.setProperty("--n", n);
      var r = pile.getBoundingClientRect(), course = Math.max(1, r.height - H);
      var p = Math.min(1, Math.max(0, -r.top / course)) * (n - 1);     // 0 → n-1
      cartes.forEach(function (c, i) {
        c.style.setProperty("--d", Math.min(1, Math.max(0, i - p)).toFixed(4));
        var dessous = Math.max(0, p - i);                                  // déjà recouverte
        c.style.setProperty("--e", (1 - Math.min(dessous, 1) * 0.06).toFixed(4));
        c.style.setProperty("--voile", (Math.min(dessous, 1) * 0.55).toFixed(3));
        c.classList.toggle("est-actif", Math.round(p) === i);
      });
      return;
    } else if (pile) pile.classList.remove("est-empile");
    var etapes = $$(".a-mstep"), actif = null, meilleur = 1e9;
    etapes.forEach(function (s) {
      var r = s.getBoundingClientRect(), d = Math.abs(r.top + Math.min(r.height, 260) / 2 - H * 0.45);
      if (d < meilleur) { meilleur = d; actif = s; }
    });
    etapes.forEach(function (s) { s.classList.toggle("est-actif", s === actif); });
  }

  var attente = false;
  function majTout() {
    attente = false;
    var H = window.innerHeight;
    majBarre(); majTitres(H); majMouvements(H);
  }
  window.addEventListener("scroll", function () { if (!attente) { attente = true; requestAnimationFrame(majTout); } }, { passive: true });
  window.addEventListener("resize", majTout);

  // ---- Curseur rond (ordinateur uniquement) ----
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var c = document.createElement("div");
    c.className = "a-curseur"; c.setAttribute("aria-hidden", "true");
    document.body.appendChild(c);
    var cx = 0, cy = 0, x = 0, y = 0;
    document.addEventListener("mousemove", function (e) {
      x = e.clientX; y = e.clientY; c.classList.add("est-visible");
      var cible = e.target.closest ? e.target : null;
      var surImage = cible && cible.closest(".a-prog__image, .a-pcarte__image, .a-flotte, .p-galerie__piste figure");
      var surLien = !surImage && cible && cible.closest("a, button");
      c.classList.toggle("sur-image", !!surImage);
      c.classList.toggle("sur-lien", !!surLien);
      c.textContent = surImage ? "Voir" : "";
    });
    document.addEventListener("mouseleave", function () { c.classList.remove("est-visible"); });
    (function suivre() {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      c.style.transform = "translate(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px)";
      requestAnimationFrame(suivre);
    })();
  }

  // Mode « Modifier le texte » de l'administrateur : on rend aux titres leur texte d'origine
  // (l'éditeur enregistre alors un texte propre), puis on redécoupe quand il a terminé.
  function restaurer() {
    decoupes.forEach(function (el) {
      if (el.__kboOrigine != null) { el.innerHTML = el.__kboOrigine; el.__kboOrigine = null; }
    });
    decoupes = []; titres = [];
  }
  new MutationObserver(function () {
    var e = document.body.classList.contains("editing");
    if (e === edition) return;
    edition = e;
    if (edition) restaurer(); else { lettres(); preparerTitres(); majTout(); }
  }).observe(document.body, { attributes: true, attributeFilter: ["class"] });

  // Les textes modifiés par Obed arrivent après le chargement (événement kbo:content) :
  // on découpe une fois qu'ils sont en place, avec une sécurité si l'événement tarde.
  var fait = false;
  function demarrer() {
    fait = true;
    observer(); lettres(); preparerTitres(); majTout();
  }
  document.addEventListener("kbo:content", demarrer);
  setTimeout(function () { if (!fait) demarrer(); }, 1200);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { observer(); majTout(); });
  else { observer(); majTout(); }
})();
