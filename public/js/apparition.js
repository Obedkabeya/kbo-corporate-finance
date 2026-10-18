/* Apparition au défilement (comme Rothschild & Co) : chaque bloc monte de 48 px en
   passant du transparent au visible, une seule fois, quand environ 15 % entre à l'écran.
   Sans JavaScript, ou si le visiteur a demandé de réduire les animations, tout reste visible.
   Les classes sont posées par ce script : le contenu des pages n'est pas modifié. */
(function () {
  var html = document.documentElement;
  html.classList.add("js");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  html.classList.add("js-apparition");

  // Blocs qui apparaissent d'un seul tenant
  var BLOCS = [
    "main section .sec-head", "main .stance .grid > div", "main .closing .actions", "main .analyse-bande .wrap",
    "main .faq-cat", "main .legal > *", "main .contact-grid > div:first-child", "main .notice",
    "main .comments > h3", "main .article", "main .acces-card", "main #analyseLecture", "main .empty-state"
  ];
  // Listes dont les éléments apparaissent un par un
  var LISTES = [
    "main .list", "main .offers", "main .blog-grid", "main .pubs__track", "main .duo-sec .wrap",
    "main .steps", "main .channels", ".site-footer .fgrid"
  ];
  // Images : leur propre apparition, juste après le texte
  var IMAGES = ["main .media", "main .post-card__media", "main .article__hero"];
  // Jamais : les formulaires (candidature, newsletter, paiement) et le bandeau d'ouverture
  var EXCLU = "form, .checkout, .achat, .page-head, .hero, .analyse-form, .fgroup";

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) jouer(en.target); });
  }, { threshold: 0.15 });

  function jouer(el) { el.classList.add("play"); io.unobserve(el); }

  function preparer(racine) {
    function marquer(sel, cls) {
      (racine || document).querySelectorAll(sel).forEach(function (el) {
        if (el.dataset.apparition || el.closest(EXCLU) || el.querySelector("form")) return;
        el.dataset.apparition = "1";
        if (cls === "reveal-children") {
          Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty("--i", Math.min(i, 8)); });
        }
        // Déjà à l'écran au chargement (lien direct au milieu de la page) : visible tout de suite.
        if (el.getBoundingClientRect().top < window.innerHeight * 0.85) { el.classList.add(cls, "play"); return; }
        el.classList.add(cls);
        io.observe(el);
      });
    }
    marquer(BLOCS.join(","), "reveal");
    marquer(LISTES.join(","), "reveal-children");
    marquer(IMAGES.join(","), "reveal-image");
  }

  // Défilement très rapide : tout ce qui est passé au-dessus de l'écran devient visible.
  var attente = false;
  window.addEventListener("scroll", function () {
    if (attente) return;
    attente = true;
    requestAnimationFrame(function () {
      attente = false;
      document.querySelectorAll(".reveal:not(.play), .reveal-children:not(.play), .reveal-image:not(.play)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) jouer(el);
      });
    });
  }, { passive: true });

  function demarrer() { preparer(document); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer); else demarrer();
  // Contenus ajoutés après coup (publications, textes modifiés) : on les prépare aussi.
  document.addEventListener("kbo:content", function () { preparer(document); });
  window.addEventListener("load", function () { preparer(document); });
  setTimeout(demarrer, 1200);
})();
