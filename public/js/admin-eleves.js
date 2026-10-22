/* Administration : L'analyse du matin + Élèves & Discord. */
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const date = (iso) => { if (!iso) return "—"; try { return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); } catch (e) { return iso; } };
  const STATUT = { confirme: "confirmé", en_attente: "en attente de confirmation", desinscrit: "désinscrit" };
  const ACCES = { actif: "actif", expire: "expiré", retire: "retiré" };
  const table = (heads, rows) => rows.length
    ? '<div style="overflow-x:auto"><table class="compare"><thead><tr>' + heads.map((h) => "<th>" + h + "</th>").join("") + "</tr></thead><tbody>" + rows.join("") + "</tbody></table></div>"
    : '<p class="muted">Rien pour le moment.</p>';

  function chargerAnalyse() {
    fetch("/api/admin/analyse").then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (!d) return;
      $("anStats").innerHTML = [["Inscrits confirmés", d.confirmes], ["En attente", d.enAttente], ["Désinscrits", d.desinscrits], ["Limite Brevo / jour", "≈ " + d.limiteBrevo]]
        .map((x) => '<div class="stat-card"><b>' + x[1] + "</b><span>" + x[0] + "</span></div>").join("");
      const b = $("anSuspendre");
      b.dataset.action = d.demainSuspendu ? "reprendre" : "suspendre";
      b.textContent = d.demainSuspendu ? "Rétablir l'envoi de demain" : "Suspendre l'envoi de demain";
      $("anEnvois").innerHTML = table(["Jour", "Titre", "Envoyés", "Échecs", "Statut"], d.envois.map((e) =>
        "<tr><td>" + esc(e.jour) + "</td><td>" + esc(e.titre) + "</td><td>" + e.envoyes + " / " + e.destinataires + "</td><td>" + e.echecs + "</td><td>" + esc(e.statut) + (e.erreur ? '<br><span class="muted">' + esc(e.erreur) + "</span>" : "") + "</td></tr>"));
    }).catch(() => {});
  }

  // Page « Inscrits — L'analyse du matin » : chiffres en grand, courbe, liste.
  const ORIGINE = { page: "page L'analyse du matin", article: "page d'un article" };
  function chargerInscrits() {
    fetch("/api/admin/analyse").then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (!d) return;
      const s = d.suivi;
      $("insStats").innerHTML = [
        ["Inscrits confirmés", d.confirmes, true], ["En attente de confirmation", d.enAttente],
        ["Nouveaux aujourd'hui", s.aujourdhui], ["Nouveaux sur 7 jours", s.sept], ["Nouveaux sur 30 jours", s.trente],
        ["Désinscriptions (total)", d.desinscrits], ["Désinscriptions aujourd'hui", s.desinscriptionsAujourdhui],
        ["Acceptent les offres", d.acceptentOffres],
      ].map((x) => '<div class="stat-card' + (x[2] ? " stat-card--total" : "") + '"><b>' + x[1] + "</b><span>" + x[0] + "</span></div>").join("");
      const max = Math.max(1, ...s.courbe.map((c) => c.n));
      $("insCourbe").innerHTML = s.courbe.map((c) => '<div class="bar" title="' + esc(c.jour) + " : " + c.n + ' inscrit(s)"><span style="height:' +
        (c.n ? Math.max(6, Math.round((c.n / max) * 100)) : 0) + '%"></span></div>').join("");
      const jour = (j) => new Date(j + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
      $("insCourbeDates").innerHTML = "<span>" + jour(s.courbe[0].jour) + "</span><span>aujourd'hui</span>";
      $("anInscrits").innerHTML = table(["Prénom", "E-mail", "Statut", "Date d'inscription", "Page d'origine", "Offres"], d.inscrits.slice().reverse().map((i) =>
        "<tr><td>" + esc(i.prenom || "—") + "</td><td>" + esc(i.email) + "</td><td>" + esc(STATUT[i.statut] || i.statut) + "</td><td>" +
        date(i.confirme || i.inscrit) + "</td><td>" + esc(ORIGINE[i.source] || i.source || "—") + "</td><td>" + (i.offres ? "oui" : "non") + "</td></tr>"));
    }).catch(() => {});
  }
  // « Écrire aux inscrits » : offres et réductions, envoyées aux inscrits qui les ont acceptées.
  let ofNombre = 0;
  function chargerOffres() {
    fetch("/api/admin/offres").then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (!d) return;
      ofNombre = d.destinataires;
      $("ofCompte").textContent = d.destinataires + " personne" + (d.destinataires > 1 ? "s ont" : " a") + " accepté de recevoir vos offres (sur "
        + d.confirmes + " inscrit" + (d.confirmes > 1 ? "s" : "") + " confirmé" + (d.confirmes > 1 ? "s" : "") + ").";
      $("ofEnvoyer").textContent = "Envoyer à " + d.destinataires + " personne" + (d.destinataires > 1 ? "s" : "");
      $("ofHistorique").innerHTML = table(["Date", "Objet", "Envoyés", "Échecs", "Statut"], d.historique.map((e) =>
        "<tr><td>" + date(e.date) + "</td><td>" + esc(e.objet) + "</td><td>" + e.envoyes + " / " + e.destinataires + "</td><td>" + e.echecs +
        "</td><td>" + esc(e.statut) + (e.erreur ? '<br><span class="muted">' + esc(e.erreur) + "</span>" : "") + "</td></tr>"));
      if (d.historique.some((e) => e.statut === "en cours")) setTimeout(chargerOffres, 4000);
    }).catch(() => {});
  }
  $("ofLien").addEventListener("change", () => { $("ofLienAutre").hidden = $("ofLien").value !== "autre"; });
  function offre(action) {
    const lien = $("ofLien").value === "autre" ? $("ofLienAutre").value.trim() : $("ofLien").value;
    return fetch("/api/admin/offres", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, objet: $("ofObjet").value.trim(), texte: $("ofTexte").value, bouton: $("ofBouton").value.trim(), lien }) })
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })));
  }
  const ofMsg = (ok, t) => { $("ofMsg").textContent = t || ""; $("ofMsg").className = "form-msg " + (ok ? "ok" : "err"); };
  $("ofApercu").addEventListener("click", () => offre("apercu").then(({ ok, j }) => {
    if (!ok) return ofMsg(false, j.error);
    ofMsg(true, ""); $("ofApercuCadre").hidden = false; $("ofApercuCadre").srcdoc = j.html;
  }));
  $("ofEssai").addEventListener("click", () => { ofMsg(true, "Envoi de l'essai…"); offre("essai").then(({ ok, j }) => ofMsg(ok, j.message || j.error)); });
  $("ofEnvoyer").addEventListener("click", () => {
    if (!ofNombre) return ofMsg(false, "Personne n'a encore accepté de recevoir les offres.");
    if (!$("ofObjet").value.trim() || !$("ofTexte").value.trim()) return ofMsg(false, "Écrivez un objet et un message.");
    if (!confirm("Envoyer « " + $("ofObjet").value.trim() + " » à " + ofNombre + " personne" + (ofNombre > 1 ? "s" : "") + " ? L'envoi ne peut pas être annulé.")) return;
    $("ofEnvoyer").disabled = true;
    offre("envoyer").then(({ ok, j }) => { ofMsg(ok, j.message || j.error); chargerOffres(); }).finally(() => { $("ofEnvoyer").disabled = false; });
  });

  $("anSuspendre").addEventListener("click", () => {
    const b = $("anSuspendre");
    fetch("/api/admin/analyse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: b.dataset.action }) })
      .then((r) => r.json()).then((j) => { $("anMsg").textContent = j.message || j.error || ""; $("anMsg").className = "form-msg " + (j.ok ? "ok" : "err"); chargerAnalyse(); });
  });

  function chargerEleves() {
    fetch("/api/admin/discord").then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (!d) return;
      $("dcEtat").innerHTML = "<p>Robot : <strong>" + esc(d.robot || "non configuré") + "</strong> · Membres protégés (historiques et invités) : <strong>" + d.membresProteges + "</strong></p>" +
        (d.lienInvitation ? '<p style="margin-top:10px">Lien d\'invitation pour vos invités (entrée avec « Membre historique ») :<br><input type="text" readonly value="' + esc(d.lienInvitation) + '" style="width:100%;margin-top:6px" onclick="this.select()"></p>' : "");
      $("dcAcces").innerHTML = table(["Élève", "Formation", "Accès", "Fin", "Discord", ""], d.acces.slice().reverse().map((a) =>
        "<tr><td>" + esc(a.nom || "") + "<br><span class=\"muted\">" + esc(a.email || "") + "</span></td><td>" + esc(a.formation) + "</td><td>" + esc(ACCES[a.status] || a.status) +
        "</td><td>" + esc(a.expires || "—") + "</td><td>" + esc(a.discordName || "pas relié") + "</td><td style=\"white-space:nowrap\">" +
        (a.actif ? '<button class="btn-link" data-dc="retirer" data-id="' + a.id + '">Retirer l\'accès</button>' : '<button class="btn-link" data-dc="donner" data-id="' + a.id + '">Rouvrir l\'accès</button>') +
        ' · <button class="btn-link" data-dc="verifier" data-id="' + a.id + '">Vérifier le rôle</button>' +
        (a.lien ? ' · <button class="btn-link" data-copie="' + esc(a.lien) + '">Copier son lien</button>' : "") + "</td></tr>"));
      $("dcJournal").innerHTML = d.journal.length ? '<ul class="stat-lists">' + d.journal.map((j) => "<li><em>" + date(j.date) + "</em> " + esc(j.message) + "</li>").join("") + "</ul>" : '<p class="muted">Rien pour le moment.</p>';
    }).catch(() => {});
  }
  $("dcAcces").addEventListener("click", (e) => {
    const c = e.target.closest("[data-copie]");
    if (c) { navigator.clipboard && navigator.clipboard.writeText(c.dataset.copie); $("dcMsg").textContent = "Lien copié."; $("dcMsg").className = "form-msg ok"; return; }
    const b = e.target.closest("[data-dc]"); if (!b) return;
    if (b.dataset.dc === "retirer" && !confirm("Retirer l'accès de cet élève ? Son rôle Discord sera retiré.")) return;
    fetch("/api/admin/acces", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.dataset.id, action: b.dataset.dc }) })
      .then((r) => r.json()).then((j) => { $("dcMsg").textContent = j.resultat || j.error || ""; $("dcMsg").className = "form-msg " + (j.ok ? "ok" : "err"); chargerEleves(); });
  });

  document.getElementById("adminTabs").addEventListener("click", (e) => {
    const t = e.target.closest(".admin-tab"); if (!t) return;
    if (t.dataset.tab === "analyse") chargerAnalyse();
    if (t.dataset.tab === "inscrits") chargerInscrits();
    if (t.dataset.tab === "offres") chargerOffres();
    if (t.dataset.tab === "eleves") chargerEleves();
  });
})();
