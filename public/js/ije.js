/* Pôle « Jeunes Entreprenants » : en-tête et menu propres au pôle (barre de bascule vers
   l'école pour l'administrateur seulement : les visiteurs ne passent jamais d'un site à l'autre),
   pied de page, bouton WhatsApp, formulaires (diagnostic, partenaire) et liste des fiches.
   Le nom du pôle vient du réglage du serveur (window.__IJE__), modifiable dans l'administration. */
(function () {
  var cfg = window.__IJE__ || { nom: "Initiative Jeunes Entreprenants", sigle: "IJE", ebauche: true };
  var P = "/jeunes-entreprenants";
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var ici = document.body.getAttribute("data-ije-nav") || "";
  var MENU = [["accueil", P, "Accueil"], ["parcours", P + "/parcours", "Le parcours"], ["offres", P + "/offres", "Nos offres"],
              ["partenaires", P + "/partenaires", "Partenaires"],
              ["contact", P + "/diagnostic#contact", "Nous contacter"]];

  var bascule = !cfg.admin ? "" :
    '<div class="bascule" role="navigation" aria-label="Les deux pôles de KBO Corporate Finance"><div class="wrap bascule__in">' +
    '<a class="bascule__lien" href="/"><span class="bascule__long">L\'école · Formation aux marchés</span><span class="bascule__court">Formation</span></a>' +
    '<a class="bascule__lien est-actif" href="' + P + '" aria-current="true"><span class="bascule__long">Jeunes Entreprenants · Accompagnement</span><span class="bascule__court">Jeunes Entreprenants</span></a>' +
    "</div></div>";
  var liens = MENU.map(function (m) {
    return '<a href="' + m[1] + '"' + (m[0] === ici ? ' class="est-actif" aria-current="page"' : "") + ">" + m[2] + "</a>";
  }).join("");
  // Logo du pôle (version sombre, pour le bleu nuit) ; sigle seul sur les très petits écrans.
  // Le PNG reste en secours si le SVG ne peut pas s'afficher.
  var L = "/assets/logo-ije/";
  var secours = ' onerror="this.onerror=null;this.src=\'' + L + 'logo-ije-sombre.png\'"';
  function logo(classe) {
    return '<span class="ije-logo__images ' + (classe || "") + '">' +
      '<img class="ije-logo__complet" src="' + L + 'logo-ije-sombre.svg" alt="' + esc(cfg.nom) + ', by KBO Corporate Finance" width="1449" height="318"' + secours + '>' +
      '<img class="ije-logo__sigle" src="' + L + 'logo-ije-sigle-sombre.svg" alt="" aria-hidden="true" width="555" height="272"></span>';
  }
  var entete =
    '<header class="ije-entete" id="ijeEntete"><div class="wrap ije-entete__barre">' +
    '<a class="ije-logo" href="' + P + '" aria-label="' + esc(cfg.nom) + ', accueil">' + logo() + '</a>' +
    '<nav class="ije-nav" aria-label="Menu du pôle">' + liens + "</nav>" +
    '<a class="ije-cta" href="' + P + '/diagnostic">Demander un diagnostic</a>' +
    '<button class="ije-menu-btn" type="button" aria-expanded="false" aria-controls="ijePanneau">Menu</button>' +
    '</div><div class="ije-panneau" id="ijePanneau"><nav aria-label="Menu du pôle">' + liens +
    '<a class="ije-panneau__cta" href="' + P + '/diagnostic">Demander un diagnostic</a></nav></div></header>';
  var annee = new Date().getFullYear();
  var pied =
    '<footer class="ije-pied"><div class="wrap">' +
    '<div class="ije-pied__grille">' +
    '<div><a class="ije-logo ije-logo--pied" href="' + P + '" aria-label="' + esc(cfg.nom) + ', accueil">' + logo() + '</a>' +
    '<p class="ije-pied__texte">Structurer, piloter, financer : l\'accompagnement des jeunes qui font déjà quelque chose de leurs mains.</p></div>' +
    '<div><h3>Le pôle</h3><ul><li><a href="' + P + '/parcours">Le parcours</a></li><li><a href="' + P + '/offres">Nos offres</a></li>' +
    '<li><a href="' + P + '/partenaires">Partenaires</a></li></ul></div>' +
    '<div><h3>Nous contacter</h3><ul><li><a href="' + P + '/diagnostic">Demander un diagnostic</a></li>' +
    '<li><a href="' + P + '/diagnostic#contact" data-wa-repli="' + P + '/diagnostic#contact" data-wa-link data-wa-msg="Bonjour, je souhaite des informations sur l\'accompagnement ' + esc(cfg.sigle) + '.">WhatsApp</a></li>' +
    '<li><a href="' + P + '/diagnostic#contact">Écrire un message</a></li></ul></div>' +
    "</div>" +
    '<div class="ije-pied__bas"><p>Nous ne prêtons pas d\'argent et ne collectons pas d\'épargne. Les financements sont accordés par des institutions agréées. Aucun financement n\'est garanti.</p>' +
    '<span>© ' + annee + ' KBO Corporate Finance · <a href="' + P + '/mentions-legales">Mentions légales</a> · <a href="' + P + '/confidentialite">Confidentialité</a></span></div>' +
    "</div></footer>";

  var h = document.getElementById("ije-header"), f = document.getElementById("ije-footer");
  if (h) h.outerHTML = bascule + entete;
  if (f) f.outerHTML = pied;

  // Menu sur téléphone
  var hd = document.getElementById("ijeEntete"), btn = hd && hd.querySelector(".ije-menu-btn");
  if (btn) {
    var fermer = function () { hd.classList.remove("est-ouvert"); btn.setAttribute("aria-expanded", "false"); btn.textContent = "Menu"; document.documentElement.style.overflow = ""; };
    btn.addEventListener("click", function () {
      if (hd.classList.contains("est-ouvert")) return fermer();
      hd.classList.add("est-ouvert"); btn.setAttribute("aria-expanded", "true"); btn.textContent = "Fermer";
      document.documentElement.style.overflow = "hidden";
    });
    hd.querySelectorAll(".ije-panneau a").forEach(function (a) { a.addEventListener("click", fermer); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") fermer(); });
  }
  // Hauteur visible de la barre de bascule (l'accueil du pôle a une barre de menu fixe juste dessous).
  var bas = document.querySelector(".bascule");
  function majBarres() {
    if (hd) hd.classList.toggle("est-defile", window.scrollY > 30);
    if (bas) document.documentElement.style.setProperty("--bascule-h", Math.max(0, bas.getBoundingClientRect().bottom) + "px");
  }
  window.addEventListener("scroll", majBarres, { passive: true });
  window.addEventListener("resize", majBarres);
  majBarres();

  // Bouton WhatsApp propre au pôle (le script commun ne l'ajoute pas s'il existe déjà).
  var wa = document.createElement("a");
  wa.className = "wa-fab"; wa.href = P + "/diagnostic#contact"; wa.setAttribute("data-wa-link", ""); wa.setAttribute("data-wa-repli", P + "/diagnostic#contact");
  wa.setAttribute("data-wa-msg", "Bonjour, je souhaite des informations sur l'accompagnement " + cfg.sigle + ".");
  wa.setAttribute("aria-label", "Écrire sur WhatsApp");
  wa.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.9c0 2.1.55 4.06 1.6 5.8L2 22l4.42-1.68a9.9 9.9 0 0 0 5.62 1.74h.01c5.45 0 9.9-4.45 9.9-9.9 0-2.65-1.03-5.14-2.9-7.02A9.82 9.82 0 0 0 12.04 2zm4.52 11.86c-.25-.12-1.47-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43l-.48-.01c-.16 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/></svg><span class="wa-fab__label">WhatsApp</span>';
  document.body.appendChild(wa);

  // Mention « ébauche » tant que le pôle n'est pas publié.
  if (cfg.ebauche) {
    var b = document.createElement("div");
    b.className = "ije-ebauche";
    b.textContent = "Ébauche · visible seulement avec le lien de prévisualisation";
    document.body.appendChild(b);
  }

  // Formulaires (diagnostic, partenaire) : envoi sans recharger la page.
  function brancher(form, adresse) {
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = form.querySelector(".form-msg"), bouton = form.querySelector("button[type=submit]");
      var data = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name) return;
        if (el.type === "checkbox") data[el.name] = el.checked;
        else if (el.type === "radio") { if (el.checked) data[el.name] = el.value; }
        else data[el.name] = el.value.trim();
      });
      bouton.disabled = true; msg.textContent = "Envoi…"; msg.className = "form-msg";
      fetch(adresse, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.j.error || "L'envoi n'a pas abouti. Réessaie dans un instant.");
          var merci = form.parentNode.querySelector(".ije-merci");
          if (merci) { form.hidden = true; merci.hidden = false; merci.scrollIntoView({ behavior: "smooth", block: "center" }); }
          else { msg.textContent = "✓ Message envoyé. Nous revenons vers vous rapidement."; msg.className = "form-msg ok"; form.reset(); }
        })
        .catch(function (err) { msg.textContent = err.message; msg.className = "form-msg err"; })
        .finally(function () { bouton.disabled = false; });
    });
  }
  brancher(document.getElementById("ijeDiagnostic"), "/api/ije/diagnostic");
  brancher(document.getElementById("ijePartenaire"), "/api/ije/partenaire");

  // Apparition des cartes l'une après l'autre (comme sur l'école). Sans effets (réglage
  // « réduire les animations »), la classe js-effets est absente et tout est visible.
  var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      setTimeout(function () { e.target.classList.add("est-apparu"); }, (+e.target.getAttribute("data-rang") || 0) * 110);
    });
  }, { threshold: 0.12 }) : null;
  function apparitions() {
    if (!io) { document.querySelectorAll(".ije-raison,.ije-profil,.ije-offre,.ije-etape,.ije-chiffre,.ije-pilier,.ije-groupe,.ije-fiche-carte,#ijeFiches > *").forEach(function (el) { el.classList.add("est-apparu"); }); return; }
    [".ije-raisons", ".ije-profils", ".ije-offres", ".ije-frise", ".ije-constat__grille", ".ije-piliers", ".ije-ecosysteme", "#ijeFiches"].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (liste) {
        Array.prototype.forEach.call(liste.children, function (el, i) {
          if (el.hasAttribute("data-rang")) return;
          el.setAttribute("data-rang", Math.min(i, 5)); io.observe(el);
        });
      });
    });
  }
  apparitions();

  // Liste des fiches pratiques (Ressources)
  var liste = document.getElementById("ijeFiches");
  if (liste) {
    fetch("/api/ije/ressources").then(function (r) { return r.ok ? r.json() : []; }).then(function (fiches) {
      liste.innerHTML = fiches.map(function (x, i) {
        return '<a class="a-mcarte" href="' + P + "/ressources/" + esc(x.slug) + '"><span class="ije-num">' + (i < 9 ? "0" : "") + (i + 1) + "</span>" +
          "<b>" + esc(x.titre) + "</b><span>" + esc(x.resume) + '</span><em class="a-lien">Lire la fiche</em></a>';
      }).join("");
      apparitions();
    });
  }
})();
