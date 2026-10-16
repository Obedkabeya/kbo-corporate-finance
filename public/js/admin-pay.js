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

  // ---------- Config FedaPay ----------
  function loadConfig() {
    fetch("/api/payconfig").then(function (r) { return r.ok ? r.json() : null; }).then(function (c) {
      if (!c) return;
      if ($("fpPublic")) $("fpPublic").value = c.public || "";
      if ($("fpDiscord")) $("fpDiscord").value = c.discord || "";
      if ($("fpBinance")) $("fpBinance").value = c.binance || "";
      if ($("fpSecretState")) {
        $("fpSecretState").textContent = c.configured
          ? ("✓ Clé secrète enregistrée (" + (c.live ? "mode réel" : "mode test") + "). Laissez vide pour la conserver.")
          : "Aucune clé secrète enregistrée.";
        $("fpSecretState").style.color = c.configured ? "#1a7a4c" : "";
      }
    }).catch(function () {});
  }
  function saveConfig() {
    var msg = $("fpMsg");
    msg.textContent = "Enregistrement…"; msg.className = "form-msg";
    fetch("/api/payconfig", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        public: $("fpPublic").value.trim(), secret: $("fpSecret").value.trim(),
        discord: $("fpDiscord").value.trim(), binance: $("fpBinance").value.trim(),
      }),
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (o) {
        if (!o.ok) throw new Error(o.j.error || "Erreur");
        $("fpSecret").value = "";
        msg.textContent = "✓ Enregistré."; msg.className = "form-msg ok";
        loadConfig();
      }).catch(function (e) { msg.textContent = e.message; msg.className = "form-msg err"; });
  }
  function clearConfig() {
    if (!confirm("Déconnecter FedaPay ? Les paiements par carte seront désactivés.")) return;
    fetch("/api/payconfig", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clear: true }),
    }).then(function () { $("fpPublic").value = ""; $("fpSecret").value = ""; loadConfig(); });
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
    $("fpClear").addEventListener("click", clearConfig);
    if ($("subReload")) $("subReload").addEventListener("click", loadSubs);
    document.querySelectorAll('.admin-tab[data-tab="paiements"]').forEach(function (b) {
      b.addEventListener("click", function () { loadLinks(); loadConfig(); loadSubs(); });
    });
    loadLinks(); loadConfig(); loadSubs();
  });
})();
