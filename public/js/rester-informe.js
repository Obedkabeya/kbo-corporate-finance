/* Fenêtre « Rester informé » : propose L'analyse du matin aux visiteurs de L'école.
   Chargée par components.js après quelques secondes, seulement si elle peut s'afficher.
   Fermée : elle ne revient pas avant 30 jours. Inscription faite : elle ne revient plus. */
(function () {
  if (document.querySelector(".kbo-ri")) return;
  var CLE = "kbo-rester-informe";
  function noter(v) { try { localStorage.setItem(CLE, v); } catch (e) { /* stockage indisponible */ } }

  var style = document.createElement("style");
  style.textContent =
    ".kbo-ri{position:fixed;inset:0;z-index:2147482000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(6,12,28,.55);opacity:0;transition:opacity .35s ease}" +
    ".kbo-ri.est-ouverte{opacity:1}" +
    ".kbo-ri__boite{position:relative;display:grid;grid-template-columns:5fr 7fr;width:min(820px,100%);background:#fff;color:#14161C;box-shadow:0 30px 80px rgba(0,0,0,.35);transform:translateY(16px);transition:transform .35s ease;outline:none}" +
    ".kbo-ri.est-ouverte .kbo-ri__boite{transform:none}" +
    ".kbo-ri__photo{position:relative;min-height:100%;background:#0D1A3A}" +
    ".kbo-ri__photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}" +
    ".kbo-ri__photo::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,26,58,.15),rgba(13,26,58,.55))}" +
    ".kbo-ri__corps{padding:40px 40px 34px;display:flex;flex-direction:column;gap:14px}" +
    ".kbo-ri__badge{font:600 12px var(--sans,Inter,Arial,sans-serif);letter-spacing:.16em;text-transform:uppercase;color:#B8934A}" +
    ".kbo-ri__titre{margin:0;font:700 30px/1.1 var(--title,'Inter Tight',Arial,sans-serif);letter-spacing:-.02em;color:#0D1A3A}" +
    ".kbo-ri__texte{margin:0;font:400 15px/1.6 var(--sans,Inter,Arial,sans-serif);color:#4A5163}" +
    ".kbo-ri__label{font:600 13px var(--sans,Inter,Arial,sans-serif);color:#0D1A3A;margin-top:4px}" +
    ".kbo-ri__champ{height:52px;padding:0 16px;border:1.5px solid #C9CFDB;background:#fff;color:#0D1A3A;font:500 16px var(--sans,Inter,Arial,sans-serif);width:100%;box-sizing:border-box}" +
    ".kbo-ri__champ:focus{outline:3px solid rgba(184,147,74,.45);border-color:#B8934A}" +
    ".kbo-ri__case{display:flex;gap:10px;align-items:flex-start;font:400 13px/1.45 var(--sans,Inter,Arial,sans-serif);color:#4A5163;cursor:pointer}" +
    ".kbo-ri__case input{margin-top:2px;width:17px;height:17px;accent-color:#0D1A3A;flex-shrink:0}" +
    ".kbo-ri__bouton{height:52px;border:0;background:#0D1A3A;color:#fff;font:600 15px var(--sans,Inter,Arial,sans-serif);letter-spacing:.02em;cursor:pointer;transition:background .2s}" +
    ".kbo-ri__bouton:hover,.kbo-ri__bouton:focus-visible{background:#B8934A;color:#0D1A3A}" +
    ".kbo-ri__bouton:disabled{opacity:.6;cursor:wait}" +
    ".kbo-ri__msg{font:500 14px/1.5 var(--sans,Inter,Arial,sans-serif);margin:0}" +
    ".kbo-ri__msg:empty{display:none}.kbo-ri__msg.ok{color:#1A7A4C}.kbo-ri__msg.err{color:#B3261E}" +
    ".kbo-ri__note{margin:0;font:400 12px/1.5 var(--sans,Inter,Arial,sans-serif);color:#7A8197}" +
    ".kbo-ri__fermer{position:absolute;top:10px;right:10px;width:40px;height:40px;border:0;background:none;color:#5A5F73;font-size:22px;line-height:1;cursor:pointer;border-radius:50%}" +
    ".kbo-ri__fermer:hover,.kbo-ri__fermer:focus-visible{background:#F0F2F6;color:#0D1A3A}" +
    ".kbo-ri__non{align-self:center;border:0;background:none;color:#5A5F73;font:500 13px var(--sans,Inter,Arial,sans-serif);text-decoration:underline;text-underline-offset:3px;cursor:pointer;padding:4px}" +
    "@media (max-width:700px){.kbo-ri{align-items:flex-end;padding:0}.kbo-ri__boite{grid-template-columns:1fr;max-height:92vh;overflow:auto}" +
    ".kbo-ri__photo{display:none}.kbo-ri__corps{padding:30px 22px 22px}.kbo-ri__titre{font-size:25px}}" +
    "@media (prefers-reduced-motion:reduce){.kbo-ri,.kbo-ri__boite{transition:none}}";
  document.head.appendChild(style);

  var ouvreur = document.activeElement;
  var fond = document.createElement("div");
  fond.className = "kbo-ri";
  fond.innerHTML =
    '<div class="kbo-ri__boite" role="dialog" aria-modal="true" aria-labelledby="kboRiTitre" tabindex="-1">' +
      '<div class="kbo-ri__photo"><img src="/images/site/home-marches-768.webp" alt="" loading="lazy"></div>' +
      '<form class="kbo-ri__corps" novalidate>' +
        '<span class="kbo-ri__badge">Rester informé</span>' +
        '<h2 class="kbo-ri__titre" id="kboRiTitre">Recevez L\'analyse du matin</h2>' +
        '<p class="kbo-ri__texte">Chaque matin de semaine, gratuitement : la lecture fondamentale des marchés, l\'agenda du jour à l\'heure du Bénin et une notion expliquée simplement.</p>' +
        '<label class="kbo-ri__label" for="kboRiEmail">Votre adresse e-mail</label>' +
        '<input class="kbo-ri__champ" id="kboRiEmail" name="email" type="email" autocomplete="email" inputmode="email" maxlength="200" placeholder="exemple@gmail.com" required>' +
        '<label class="kbo-ri__case"><input type="checkbox" name="offres" value="oui"> <span>Je souhaite aussi recevoir les offres et réductions sur les formations KBO (facultatif).</span></label>' +
        '<button class="kbo-ri__bouton" type="submit">Je m\'inscris</button>' +
        '<p class="kbo-ri__msg" role="status"></p>' +
        '<p class="kbo-ri__note">Un e-mail de confirmation vous sera envoyé. Désinscription en un clic. Contenu éducatif, pas un conseil en investissement.</p>' +
        '<button class="kbo-ri__non" type="button">Non merci</button>' +
      '</form>' +
      '<button class="kbo-ri__fermer" type="button" aria-label="Fermer">×</button>' +
    '</div>';
  document.body.appendChild(fond);
  var boite = fond.querySelector(".kbo-ri__boite");
  var form = fond.querySelector("form");
  var msg = fond.querySelector(".kbo-ri__msg");
  requestAnimationFrame(function () { fond.classList.add("est-ouverte"); boite.focus(); });

  function fermer(valeur) {
    noter(valeur || String(Date.now()));
    document.removeEventListener("keydown", clavier, true);
    fond.classList.remove("est-ouverte");
    setTimeout(function () { fond.remove(); }, 350);
    if (ouvreur && ouvreur.focus && ouvreur !== document.body) ouvreur.focus();
  }
  function clavier(e) {
    if (e.key === "Escape") { e.preventDefault(); fermer(); return; }
    if (e.key !== "Tab") return;
    var f = Array.prototype.filter.call(boite.querySelectorAll("button, input"), function (el) { return el.offsetParent; });
    if (!f.length) return;
    if (e.shiftKey && (document.activeElement === f[0] || document.activeElement === boite)) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }
  document.addEventListener("keydown", clavier, true);
  fond.addEventListener("click", function (e) { if (e.target === fond) fermer(); });
  fond.querySelector(".kbo-ri__fermer").addEventListener("click", function () { fermer(); });
  fond.querySelector(".kbo-ri__non").addEventListener("click", function () { fermer(); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = form.email.value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msg.textContent = "Indiquez une adresse e-mail valide."; msg.className = "kbo-ri__msg err"; form.email.focus(); return; }
    var btn = form.querySelector(".kbo-ri__bouton");
    btn.disabled = true; msg.textContent = "Envoi…"; msg.className = "kbo-ri__msg";
    fetch("/api/analyse/inscription", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prenom: "", email: email, source: "fenetre", offres: !!form.offres.checked }),
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) {
        if (!x.ok) throw new Error(x.j.error || "Inscription impossible.");
        noter("inscrit");
        form.innerHTML = '<span class="kbo-ri__badge">Presque fini</span>' +
          '<h2 class="kbo-ri__titre" id="kboRiTitre">Confirmez votre adresse</h2>' +
          '<p class="kbo-ri__texte">Ouvrez l\'e-mail que nous venons de vous envoyer et cliquez sur « Confirmer mon inscription ». ' +
          'S\'il n\'arrive pas, regardez dans « Promotions » ou dans les courriers indésirables.</p>' +
          '<button class="kbo-ri__bouton" type="button">Fermer</button>';
        var b = form.querySelector("button");
        b.addEventListener("click", function () { fermer("inscrit"); });
        b.focus();
      })
      .catch(function (err) { msg.textContent = err.message; msg.className = "kbo-ri__msg err"; btn.disabled = false; });
  });
})();
