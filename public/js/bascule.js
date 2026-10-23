/* Barre de bascule entre les deux pôles de KBO Corporate Finance, en haut des pages de l'école.
   Le serveur n'ajoute ce script que lorsque le pôle Jeunes Entreprenants est visible
   (publié, lien de prévisualisation ou administrateur). */
(function () {
  if (document.querySelector(".bascule")) return;
  var style = document.createElement("style");
  style.textContent =
    ".bascule{position:relative;z-index:70;background:#0D1A3A;border-bottom:1px solid rgba(255,255,255,.1)}" +
    ".bascule__in{display:flex;gap:28px;height:36px;align-items:stretch}" +
    ".bascule__lien,.bascule__lien:visited{display:flex;align-items:center;font:600 12px Inter,Arial,sans-serif;letter-spacing:.06em;color:rgba(255,255,255,.72);text-decoration:none;border-bottom:2px solid transparent}" +
    ".bascule__lien:hover{color:#fff}" +
    ".bascule__lien.est-actif,.bascule__lien.est-actif:visited{color:#fff;border-bottom-color:#B8934A}" +
    ".bascule__court{display:none}" +
    "@media (max-width:767px){.bascule__in{gap:20px;height:34px}.bascule__long{display:none}.bascule__court{display:inline}}" +
    /* Accueil : la barre du haut est fixe ; on la décale sous la bascule tant que celle-ci est visible. */
    ".accueil .site-header{top:var(--bascule-h,0px)}";
  document.head.appendChild(style);
  var bar = document.createElement("div");
  bar.className = "bascule";
  bar.setAttribute("role", "navigation");
  bar.setAttribute("aria-label", "Les deux pôles de KBO Corporate Finance");
  bar.innerHTML = '<div class="wrap bascule__in">' +
    '<a class="bascule__lien est-actif" href="/" aria-current="true"><span class="bascule__long">L\'école · Formation aux marchés</span><span class="bascule__court">Formation</span></a>' +
    '<a class="bascule__lien" href="/jeunes-entreprenants"><span class="bascule__long">Jeunes Entreprenants · Accompagnement</span><span class="bascule__court">Jeunes Entreprenants</span></a></div>';
  document.body.insertBefore(bar, document.body.firstChild);
  function maj() {
    var h = Math.max(0, bar.getBoundingClientRect().bottom);
    document.documentElement.style.setProperty("--bascule-h", h + "px");
  }
  maj();
  window.addEventListener("scroll", maj, { passive: true });
  window.addEventListener("resize", maj);
})();
