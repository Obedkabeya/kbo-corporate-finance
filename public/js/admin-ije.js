/* Administration : onglet « Jeunes Entreprenants », séparé de l'école.
   Demandes de diagnostic (statut, notes), demandes partenaires, nom du pôle,
   exports CSV, lien de prévisualisation. (Les prix et les fiches se traitent en privé.) Chargé par le serveur uniquement pour l'administrateur. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var date = function (iso) { try { return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); } catch (e) { return iso || "—"; } };
  var tabs = $("adminTabs");
  if (!tabs) return;

  var bouton = document.createElement("button");
  bouton.className = "admin-tab"; bouton.type = "button"; bouton.dataset.tab = "ije";
  bouton.textContent = "🌱 Jeunes Entreprenants";
  var logout = $("logoutBtn");
  tabs.insertBefore(bouton, logout || null);

  var panneau = document.createElement("div");
  panneau.className = "tabpanel"; panneau.dataset.panel = "ije";
  panneau.innerHTML =
    '<div class="form-wrap"><h3>Pôle Jeunes Entreprenants — ébauche</h3>' +
    '<p class="muted" style="font-size:.92rem">Le pôle n\'est pas encore public : ses pages ne s\'ouvrent qu\'avec ce lien de prévisualisation (ou quand vous êtes connecté ici).</p>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:.6rem"><input type="text" id="ijeLien" readonly style="flex:1;min-width:260px" onclick="this.select()">' +
    '<a class="btn btn--ghost" id="ijeOuvrir" target="_blank" rel="noopener">Ouvrir le pôle</a><button class="btn btn--ghost" type="button" id="ijeNouveauLien">Créer un nouveau lien</button></div>' +
    '<span class="form-msg" id="ijeMsgLien"></span></div>' +

    '<div class="form-wrap"><div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap"><h3 style="margin:0">Demandes de diagnostic</h3>' +
    '<a class="btn btn--primary" href="/api/admin/ije/demandes.csv">Exporter (CSV)</a></div><div id="ijeDemandes" class="muted" style="margin-top:1rem">Chargement…</div></div>' +

    '<div class="form-wrap"><div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap"><h3 style="margin:0">Demandes partenaires</h3>' +
    '<a class="btn btn--ghost" href="/api/admin/ije/partenaires.csv">Exporter (CSV)</a></div><div id="ijePartenaires" class="muted" style="margin-top:1rem">Chargement…</div></div>' +

    '<div class="form-wrap"><h3>Nom du pôle</h3><p class="muted" style="font-size:.92rem">Le nom n\'est pas définitif : il change partout sur le pôle dès que vous l\'enregistrez.</p>' +
    '<div class="form-grid"><div class="field"><label for="ijeNom">Nom</label><input type="text" id="ijeNom" maxlength="80"></div>' +
    '<div class="field"><label for="ijeSigle">Sigle</label><input type="text" id="ijeSigle" maxlength="12"></div></div>' +
    '<div class="form-actions"><button class="btn btn--primary" type="button" id="ijeNomOk">Enregistrer le nom</button><span class="form-msg" id="ijeMsgNom"></span></div></div>' +

    '';
  var parent = document.querySelector('.tabpanel[data-panel="compte"]');
  (parent ? parent.parentNode : document.querySelector("main") || document.body).appendChild(panneau);

  var donnees = null;
  function msg(id, ok, t) { $(id).textContent = t || ""; $(id).className = "form-msg " + (ok ? "ok" : "err"); }
  function envoyer(corps) {
    return fetch("/api/admin/ije", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); });
  }
  var table = function (tetes, lignes) {
    return lignes.length ? '<div style="overflow-x:auto"><table class="compare"><thead><tr>' + tetes.map(function (t) { return "<th>" + t + "</th>"; }).join("") +
      "</tr></thead><tbody>" + lignes.join("") + "</tbody></table></div>" : '<p class="muted">Rien pour le moment.</p>';
  };

  function charger() {
    fetch("/api/admin/ije").then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d) return;
      donnees = d;
      var c = d.config;
      $("ijeLien").value = d.lienApercu; $("ijeOuvrir").href = d.lienApercu;
      $("ijeNom").value = c.nom; $("ijeSigle").value = c.sigle;
      var options = d.statuts.map(function (s) { return '<option value="' + esc(s) + '">' + esc(s) + "</option>"; }).join("");
      $("ijeDemandes").innerHTML = table(["Reçue", "Personne", "Activité", "Attentes", "Statut et notes"], d.demandes.slice().reverse().map(function (x) {
        return "<tr><td>" + date(x.date) + "</td><td><strong>" + esc(x.prenom + " " + x.nom) + "</strong><br>" + esc(x.telephone) +
          (x.whatsapp ? "<br>WhatsApp : " + esc(x.whatsapp) : "") + (x.email ? "<br>" + esc(x.email) : "") +
          '<br><span class="muted">' + esc([x.ville, x.quartier].filter(Boolean).join(", ")) + " · " + esc(x.age) + " ans" + (x.etudiant ? " · étudiant : " + esc(x.etudiant) : "") + "</span></td>" +
          "<td>" + esc(x.activite) + (x.anciennete ? '<br><span class="muted">' + esc(x.anciennete) + "</span>" : "") + "</td><td>" + esc(x.attentes || "—") + "</td>" +
          '<td style="min-width:220px"><select data-statut="' + esc(x.id) + '">' + options.replace('value="' + esc(x.statut) + '"', 'value="' + esc(x.statut) + '" selected') + "</select>" +
          '<textarea data-notes="' + esc(x.id) + '" rows="3" style="width:100%;margin-top:6px" placeholder="Notes">' + esc(x.notes || "") + "</textarea>" +
          '<button class="btn-link" type="button" data-enreg="' + esc(x.id) + '">Enregistrer</button> <span class="form-msg" data-msg="' + esc(x.id) + '"></span></td></tr>';
      }));
      $("ijePartenaires").innerHTML = table(["Reçue", "Contact", "Organisation", "Message"], d.partenaires.slice().reverse().map(function (x) {
        return "<tr><td>" + date(x.date) + "</td><td><strong>" + esc(x.nom) + "</strong><br>" + esc(x.email) + (x.telephone ? "<br>" + esc(x.telephone) : "") + "</td><td>" +
          esc(x.organisation) + (x.type ? '<br><span class="muted">' + esc(x.type) + "</span>" : "") + "</td><td>" + esc(x.message) + "</td></tr>";
      }));
    });
  }

  panneau.addEventListener("click", function (e) {
    var id = e.target.getAttribute && e.target.getAttribute("data-enreg");
    if (!id) return;
    envoyer({ action: "demande", id: id, statut: panneau.querySelector('[data-statut="' + id + '"]').value, notes: panneau.querySelector('[data-notes="' + id + '"]').value })
      .then(function (r) { var m = panneau.querySelector('[data-msg="' + id + '"]'); m.textContent = r.j.message || r.j.error || ""; m.className = "form-msg " + (r.ok ? "ok" : "err"); });
  });
  $("ijeNomOk").addEventListener("click", function () {
    envoyer({ action: "nom", nom: $("ijeNom").value, sigle: $("ijeSigle").value }).then(function (r) { msg("ijeMsgNom", r.ok, r.j.message || r.j.error); });
  });
  $("ijeNouveauLien").addEventListener("click", function () {
    if (!confirm("Créer un nouveau lien de prévisualisation ? L'ancien lien ne fonctionnera plus.")) return;
    envoyer({ action: "nouveau-lien" }).then(function (r) { msg("ijeMsgLien", r.ok, r.j.message || r.j.error); charger(); });
  });
  bouton.addEventListener("click", charger);
})();
