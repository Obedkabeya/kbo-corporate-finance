/* =========================================================================
   Paiements : génération de liens secrets, config FedaPay/Discord, abonnés.
   ========================================================================= */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  var FCFA = new Intl.NumberFormat("fr-FR");
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }); }
    catch (e) { return iso || ""; }
  }
  var CYCLE = { unique: "Unique", mensuel: "Mensuel", annuel: "Annuel" };

  var PRICE_LABEL = {
    priceTradingMonth: "Trading institutionnel",
    priceTradingYear: "Trading institutionnel (annuel)",
    priceFinance: "Finance des marchés",
  };
  var PRICE_CYCLE = { priceTradingMonth: "mensuel", priceTradingYear: "annuel", priceFinance: "unique" };

  // Affiche/masque le montant personnalisé selon le choix « prix du site »
  function syncPriceMode() {
    var key = $("plPrice").value;
    var custom = !key;
    $("plAmountWrap").hidden = !custom;
    $("plCurrencyWrap").hidden = !custom;
    if (!custom) {
      if (!$("plFormation").value.trim()) $("plFormation").value = PRICE_LABEL[key] || "";
      $("plCycle").value = PRICE_CYCLE[key] || "unique";
    }
  }

  // ---------- Générer un lien ----------
  function createLink() {
    var msg = $("plMsg");
    var priceKey = $("plPrice").value;
    var amount = parseInt($("plAmount").value, 10);
    if (!priceKey && (!amount || amount <= 0)) { msg.textContent = "Choisissez une formation ou un montant."; msg.className = "form-msg err"; return; }
    msg.textContent = "Création…"; msg.className = "form-msg";
    fetch("/api/paylink", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceKey: priceKey,
        formation: $("plFormation").value.trim() || PRICE_LABEL[priceKey] || "Formation",
        amount: amount || 0, currency: $("plCurrency").value, cycle: $("plCycle").value,
        nom: $("plNom").value.trim(), email: $("plEmail").value.trim(),
      }),
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (o) {
        if (!o.ok) throw new Error(o.j.error || "Erreur");
        var url = location.origin + o.j.path;
        var box = $("plResult");
        box.hidden = false;
        box.innerHTML = '<div class="settings-block"><p style="margin:0 0 .5rem"><strong>Lien créé</strong> — envoyez-le au candidat (usage unique) :</p>' +
          '<div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center">' +
          '<input type="text" readonly value="' + esc(url) + '" id="plUrl" style="flex:1;min-width:240px;padding:.6em .8em;border:1px solid var(--line);border-radius:8px;font-size:.85rem">' +
          '<button type="button" class="btn btn--primary" id="plCopy">Copier</button></div></div>';
        $("plCopy").addEventListener("click", function () {
          var i = $("plUrl"); i.select();
          if (navigator.clipboard) navigator.clipboard.writeText(i.value);
          else document.execCommand("copy");
          $("plCopy").textContent = "✓ Copié";
        });
        msg.textContent = ""; loadLinks();
      })
      .catch(function (e) { msg.textContent = e.message; msg.className = "form-msg err"; });
  }

  function loadLinks() {
    var host = $("plList"); if (!host) return;
    fetch("/api/paylinks").then(function (r) { return r.ok ? r.json() : []; }).then(function (list) {
      if (!list.length) { host.innerHTML = '<p class="muted" style="font-size:.9rem">Aucun lien pour l\'instant.</p>'; return; }
      host.innerHTML = '<div class="news-emails">' + list.map(function (l) {
        var etat = l.used ? '<em style="color:#b3261e">utilisé</em>' : '<em style="color:#1a7a4c">actif</em>';
        return "<div><span>" + esc(l.formation) + " — " + FCFA.format(l.amount) + " " + esc(l.currency) +
          " · " + (CYCLE[l.cycle] || l.cycle) + (l.nom ? " · " + esc(l.nom) : "") + "</span>" + etat + "</div>";
      }).join("") + "</div>";
    }).catch(function () {});
  }

  // ---------- Config FedaPay (Sandbox / Live) ----------
  var MODES = ["sandbox", "live"];
  function loadConfig() {
    fetch("/api/payconfig").then(function (r) { return r.ok ? r.json() : null; }).then(function (c) {
      if (!c) return;
      document.querySelectorAll("input[name=fpMode]").forEach(function (r) { r.checked = r.value === c.mode; });
      MODES.forEach(function (m) {
        var info = (c.modes || {})[m] || {};
        $("fpPublic_" + m).value = info.public || "";
        var s1 = $("fpSecretState_" + m), s2 = $("fpWebhookState_" + m);
        s1.textContent = info.secretFin ? "✓ Clé secrète enregistrée (…" + info.secretFin + "). Laissez vide pour la conserver." : "Aucune clé secrète enregistrée.";
        s1.style.color = info.secretFin ? "#1a7a4c" : "";
        s2.textContent = info.webhookFin ? "✓ Secret du webhook enregistré (…" + info.webhookFin + ")." : "Aucun secret de webhook : les paiements ne pourront pas être confirmés.";
        s2.style.color = info.webhookFin ? "#1a7a4c" : "#8A5A00";
        $("fpBloc_" + m).classList.toggle("is-actif", c.mode === m);
      });
      $("fpWebhookUrl").value = c.webhookUrl || "";
      $("fpDiscord").value = c.discord || "";
      $("fpBinance").value = c.binance || "";
      var ch = $("fpChiffrement");
      ch.textContent = c.chiffrement ? "🔒 Chiffrement des clés : actif sur le serveur." : "⚠️ Chiffrement non activé sur le serveur : les clés secrètes ne peuvent pas encore être enregistrées.";
      ch.style.color = c.chiffrement ? "#1a7a4c" : "#b3261e";
    }).catch(function () {});
  }
  function saveConfig() {
    var msg = $("fpMsg");
    var mode = (document.querySelector("input[name=fpMode]:checked") || {}).value;
    if (mode === "live" && !confirm("Activer le mode Live ? Les paiements seront réels.")) return;
    var body = { mode: mode, discord: $("fpDiscord").value.trim(), binance: $("fpBinance").value.trim() };
    MODES.forEach(function (m) {
      body["public_" + m] = $("fpPublic_" + m).value.trim();
      body["secret_" + m] = $("fpSecret_" + m).value.trim();
      body["webhook_" + m] = $("fpWebhook_" + m).value.trim();
    });
    msg.textContent = "Enregistrement…"; msg.className = "form-msg";
    fetch("/api/payconfig", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (o) {
        if (!o.ok) throw new Error(o.j.error || "Erreur");
        MODES.forEach(function (m) { $("fpSecret_" + m).value = ""; $("fpWebhook_" + m).value = ""; });
        msg.textContent = "✓ Enregistré. Mode actif : " + (o.j.mode === "live" ? "Live" : "Sandbox") + "."; msg.className = "form-msg ok";
        loadConfig();
      }).catch(function (e) { msg.textContent = e.message; msg.className = "form-msg err"; });
  }
  function testConfig(m) {
    var out = $("fpTestMsg_" + m);
    out.textContent = "Test en cours…"; out.className = "form-msg";
    fetch("/api/payconfig/test?mode=" + m).then(function (r) { return r.json(); }).then(function (j) {
      out.textContent = j.message || (j.ok ? "OK" : "Échec"); out.className = "form-msg " + (j.ok ? "ok" : "err");
    }).catch(function () { out.textContent = "Test impossible."; out.className = "form-msg err"; });
  }
  function clearConfig(m) {
    if (!confirm("Effacer les clés " + (m === "live" ? "Live" : "Sandbox") + " ?")) return;
    fetch("/api/payconfig", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clear: m }) })
      .then(function () { loadConfig(); });
  }

  // ---------- Transactions FedaPay ----------
  var STATUT_COULEUR = { "approuvée": "#1a7a4c", "refusée": "#b3261e", "annulée": "#8A5A00", "en attente": "#5A5F73" };
  function loadTx() {
    var host = $("txList"); if (!host) return;
    fetch("/api/fedapay/transactions").then(function (r) { return r.ok ? r.json() : []; }).then(function (list) {
      $("txCount").textContent = String(list.length);
      if (!list.length) { host.innerHTML = '<p class="muted" style="font-size:.9rem">Aucune transaction pour l\'instant.</p>'; return; }
      host.innerHTML = '<div class="tx-table"><table><thead><tr><th>Date</th><th>Élève</th><th>Formation</th><th>Montant</th><th>Statut</th><th>Référence</th><th></th></tr></thead><tbody>' +
        list.map(function (t) {
          var d = (t.maj || t.date || "").slice(0, 16).replace("T", " ");
          var coul = STATUT_COULEUR[t.statut] || "#5A5F73";
          return "<tr><td>" + esc(d) + "</td><td>" + esc(t.nom || "—") + "<br><small>" + esc(t.email || "") + (t.telephone ? " · " + esc(t.telephone) : "") + "</small></td>" +
            "<td>" + esc(t.formation || "") + "</td><td>" + esc(String(t.montant || "")) + " FCFA</td>" +
            '<td><strong style="color:' + coul + '">' + esc(t.statut || "") + "</strong>" + (t.mode === "sandbox" ? " <small>(test)</small>" : "") + "</td>" +
            "<td><small>" + esc(String(t.id)) + "</small></td>" +
            "<td>" + (t.statut !== "approuvée" ? '<button class="btn btn--ghost" style="padding:.4em .8em;font-size:.78rem" data-tx-verif="' + esc(String(t.id)) + '">Vérifier</button>' : "") + "</td></tr>";
        }).join("") + "</tbody></table></div>";
      host.querySelectorAll("[data-tx-verif]").forEach(function (b) {
        b.addEventListener("click", function () {
          b.disabled = true; b.textContent = "…";
          fetch("/api/fedapay/verifier", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.getAttribute("data-tx-verif") }) })
            .then(function () { loadTx(); loadSubs(); });
        });
      });
    }).catch(function () {});
  }

  // ---------- Abonnés ----------
  function loadSubs() {
    var host = $("subList"); if (!host) return;
    fetch("/api/subscribers").then(function (r) { return r.ok ? r.json() : []; }).then(function (list) {
      $("subCount").textContent = String(list.length);
      if (!list.length) { host.innerHTML = '<p class="muted" style="font-size:.9rem">Aucun abonné pour l\'instant.</p>'; return; }
      var today = new Date().toISOString().slice(0, 10);
      host.innerHTML = list.map(function (s) {
        var expired = s.expires && s.expires < today;
        var exp = s.expires ? (expired ? '<span style="color:#b3261e">expiré le ' + s.expires + "</span>" : "jusqu'au " + s.expires) : "accès permanent";
        return '<div class="inbox__item" style="padding:.9rem 1.1rem;display:flex;gap:.8rem;align-items:center;flex-wrap:wrap">' +
          "<div style=\"flex:1;min-width:200px\"><strong>" + esc(s.nom || "Sans nom") + "</strong> · " + esc(s.email || "") +
          '<div class="muted" style="font-size:.85rem">' + esc(s.formation) + " · " + (CYCLE[s.cycle] || s.cycle) +
          " · " + FCFA.format(s.amount || 0) + " " + esc(s.currency || "") + " · " + esc(s.method || "") +
          " · payé le " + fmtDate(s.paidAt) + " · " + exp + "</div></div>" +
          '<button type="button" class="comment__del" data-rm="' + esc(s.id) + '">Retirer</button></div>';
      }).join("");
      host.querySelectorAll("[data-rm]").forEach(function (b) {
        b.addEventListener("click", function () {
          if (!confirm("Retirer cet abonné de la liste ?")) return;
          fetch("/api/subscribers/remove", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: b.getAttribute("data-rm") }),
          }).then(function () { loadSubs(); });
        });
      });
    }).catch(function () {});
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!$("plCreate")) return;
    $("plCreate").addEventListener("click", createLink);
    if ($("plPrice")) { $("plPrice").addEventListener("change", syncPriceMode); syncPriceMode(); }
    $("fpSave").addEventListener("click", saveConfig);
    document.querySelectorAll("[data-fp-test]").forEach(function (b) { b.addEventListener("click", function () { testConfig(b.getAttribute("data-fp-test")); }); });
    document.querySelectorAll("[data-fp-clear]").forEach(function (b) { b.addEventListener("click", function () { clearConfig(b.getAttribute("data-fp-clear")); }); });
    if ($("txReload")) $("txReload").addEventListener("click", loadTx);
    if ($("subReload")) $("subReload").addEventListener("click", loadSubs);
    document.querySelectorAll('.admin-tab[data-tab="paiements"]').forEach(function (b) {
      b.addEventListener("click", function () { loadLinks(); loadConfig(); loadSubs(); loadTx(); });
    });
    loadLinks(); loadConfig(); loadSubs(); loadTx();
  });
})();
