/* L'analyse du matin : formulaires d'inscription (partout sur le site),
   messages de confirmation/désinscription, archives et lecture d'une analyse. */
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const jourFr = (j) => { try { return new Date(j + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); } catch (e) { return j; } };

  document.querySelectorAll(".analyse-form").forEach((f) => {
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = f.querySelector(".form-msg"), btn = f.querySelector("button");
      const email = f.email.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msg.textContent = "Indiquez une adresse e-mail valide."; msg.className = "form-msg err"; return; }
      btn.disabled = true; msg.textContent = "Envoi…"; msg.className = "form-msg";
      fetch("/api/analyse/inscription", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom: f.prenom.value.trim(), email: email, source: f.dataset.source || "",
          offres: !!(f.offres && f.offres.checked) }) })
        .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
        .then(({ ok, j }) => {
          if (!ok) throw new Error(j.error || "Inscription impossible.");
          f.reset();
          msg.textContent = "✓ Presque fini : ouvrez l'e-mail que nous venons de vous envoyer et cliquez sur « Confirmer mon inscription ».";
          msg.className = "form-msg ok";
        })
        .catch((err) => { msg.textContent = err.message; msg.className = "form-msg err"; })
        .finally(() => { btn.disabled = false; });
    });
  });

  // Page dédiée : messages de retour, archives, lecture d'une analyse.
  const etat = $("analyseEtat");
  if (!etat) return;
  const q = new URLSearchParams(location.search);
  const M = {
    confirme: ["ok", "✓ Inscription confirmée. Vous recevrez L'analyse du matin dès demain. Pour ne jamais la manquer, "
      + "ajoutez contact@kbocorporatefinance.com à vos contacts ; si elle arrive dans « Promotions », déplacez-la vers « Principale »."],
    desinscrit: ["ok", "Vous êtes désinscrit. Vous ne recevrez plus L'analyse du matin."],
    "lien-invalide": ["err", "Ce lien n'est plus valable. Inscrivez-vous à nouveau ci-dessous si besoin."],
    "offres-stop": ["ok", "C'est noté : vous ne recevrez plus nos offres. Vous continuez de recevoir L'analyse du matin."],
  }[q.get("etat")];
  if (M) { etat.hidden = false; etat.className = "form-msg " + M[0]; etat.textContent = M[1]; }

  // Lien « Recevez aussi nos offres » d'un e-mail : l'accord se donne par un clic sur un bouton
  // (jamais par la simple ouverture du lien, que certaines messageries visitent toutes seules).
  const jeton = q.get("offres");
  if (jeton) {
    etat.hidden = false; etat.className = "form-msg";
    etat.innerHTML = "Voulez-vous recevoir aussi nos offres et réductions sur les formations KBO ? Vous pourrez arrêter en un clic dans chaque e-mail."
      + '<span class="analyse-offres"><button class="btn" type="button" id="offresOui">Oui, je veux recevoir les offres</button></span>';
    $("offresOui").addEventListener("click", () => {
      fetch("/api/offres/accord", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ j: jeton }) })
        .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
        .then(({ ok, j }) => {
          etat.className = "form-msg " + (ok ? "ok" : "err");
          etat.textContent = ok ? "✓ C'est noté : vous recevrez nos offres et réductions. Merci !" : (j.error || "Ce lien n'est plus valable.");
          history.replaceState(null, "", location.pathname);
        });
    });
  }

  // Un exemple : lien vers la dernière analyse archivée.
  fetch("/api/analyses").then((r) => (r.ok ? r.json() : [])).then((liste) => {
    if (!liste.length) return;
    const ex = $("analyseExemple");
    ex.innerHTML = 'Pour voir un exemple&nbsp;: <a href="analyse-du-matin?d=' + liste[0].jour + '#analyseLecture">la dernière analyse, du ' + esc(jourFr(liste[0].jour)) + "</a>.";
    ex.hidden = false;
  }).catch(() => {});

  const d = q.get("d");
  if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    fetch("/api/analyses/" + d).then((r) => (r.ok ? r.json() : null)).then((a) => {
      if (!a) return;
      const box = $("analyseLecture");
      box.innerHTML = '<p class="eyebrow">' + esc(jourFr(a.jour)) + '</p><article class="analyse-texte">' + a.contenu +
        '</article><p class="form-note">Contenu éducatif, pas un conseil en investissement. Les marchés financiers comportent un risque de perte en capital.</p>';
      box.hidden = false;
      document.title = (a.titre || "L'analyse du matin") + " — KBO Corporate Finance";
    }).catch(() => {});
  }
})();
