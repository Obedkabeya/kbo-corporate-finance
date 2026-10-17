/* Inscription directe au Trading institutionnel : formule, coordonnées, paiement. */
(function () {
  const f = document.getElementById("achatForm");
  if (!f) return;
  const msg = document.getElementById("achatMsg"), btn = document.getElementById("achatCrypto");
  const EUR_XOF = 655.957, nf = new Intl.NumberFormat("fr-FR");

  // Équivalent en FCFA (arrondi au millier), à partir des prix réglés dans l'administration.
  document.addEventListener("kbo:settings", (e) => {
    const t = (e.detail && e.detail.texts) || {};
    document.querySelectorAll("[data-fcfa]").forEach((el) => {
      const n = parseFloat(String(t[el.dataset.fcfa] || el.closest("label").querySelector("[data-text]").textContent).replace(/[^\d,.]/g, "").replace(",", "."));
      if (n > 0) el.textContent = "≈ " + nf.format(Math.round(n * EUR_XOF / 1000) * 1000) + " FCFA";
    });
  });

  fetch("/api/achat/moyens").then((r) => r.json()).then((m) => {
    if (!m.crypto) { btn.disabled = true; msg.textContent = "Le paiement en ligne sera disponible très bientôt."; }
    if (m.carte) { const c = document.getElementById("achatCarte"); c.disabled = false; c.textContent = "Payer par carte"; }
  }).catch(() => {});

  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = { cycle: (f.querySelector("input[name=cycle]:checked") || {}).value, nom: f.nom.value.trim(),
                   email: f.email.value.trim(), risques: f.risques.checked, moyen: "crypto" };
    if (data.nom.length < 2) { msg.textContent = "Indiquez votre nom."; msg.className = "form-msg err"; return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) { msg.textContent = "Indiquez une adresse e-mail valide."; msg.className = "form-msg err"; return; }
    if (!data.risques) { msg.textContent = "Merci de confirmer avoir lu l'avertissement sur les risques."; msg.className = "form-msg err"; return; }
    btn.disabled = true; btn.textContent = "Préparation du paiement…"; msg.textContent = ""; msg.className = "form-msg";
    fetch("/api/achat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (ok && j.url) { location.href = j.url; return; }
        throw new Error(j.error || "Paiement indisponible.");
      })
      .catch((err) => {
        msg.textContent = err.message; msg.className = "form-msg err";
        btn.disabled = false; btn.innerHTML = 'Payer en USDT <span class="arrow" aria-hidden="true">→</span>';
      });
  });
})();
