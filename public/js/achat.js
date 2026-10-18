/* Page de paiement « Trading institutionnel » : formule, coordonnées, moyen de paiement. */
(function () {
  const f = document.getElementById("achatForm");
  if (!f) return;
  const msg = document.getElementById("achatMsg"), btn = document.getElementById("achatCrypto");
  const EUR_XOF = 655.957, nf = new Intl.NumberFormat("fr-FR");
  const prix = {};

  function lire(el) { return parseFloat(String(el.textContent).replace(/[^\d,.]/g, "").replace(",", ".")) || 0; }
  function maj() {
    const c = document.querySelector("input[name=cycle]:checked");
    const el = c && c.closest("label").querySelector("[data-text]");
    const txt = el ? el.textContent.trim() : "";
    document.getElementById("achatTotal").textContent = txt + (c && c.value === "annuel" ? " / an" : " / mois");
    document.getElementById("achatBouton").textContent = txt;
    const n = el ? lire(el) : 0;
    document.getElementById("achatFcfa").textContent = n ? "≈ " + nf.format(Math.round(n * EUR_XOF / 1000) * 1000) + " FCFA" : "";
  }
  document.querySelectorAll("input[name=cycle]").forEach((r) => r.addEventListener("change", maj));
  document.addEventListener("kbo:settings", () => setTimeout(maj, 0));
  maj();

  fetch("/api/achat/moyens").then((r) => r.json()).then((m) => {
    if (!m.crypto) { btn.disabled = true; msg.textContent = "Le paiement en ligne sera disponible très bientôt."; }
    if (m.carte) {
      const c = document.getElementById("moyenCarte");
      c.classList.remove("is-off"); c.querySelector("input").disabled = false; c.querySelector("small").textContent = "Visa, Mastercard";
    }
  }).catch(() => {});

  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = { cycle: (document.querySelector("input[name=cycle]:checked") || {}).value, nom: f.nom.value.trim(),
                   email: f.email.value.trim(), risques: f.risques.checked,
                   moyen: (f.querySelector("input[name=moyen]:checked") || {}).value || "crypto" };
    if (data.nom.length < 2) { msg.textContent = "Indiquez votre nom."; msg.className = "form-msg err"; return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) { msg.textContent = "Indiquez une adresse e-mail valide."; msg.className = "form-msg err"; return; }
    if (!data.risques) { msg.textContent = "Cochez l'avertissement sur les risques."; msg.className = "form-msg err"; return; }
    const libelle = btn.innerHTML;
    btn.disabled = true; btn.textContent = "Redirection vers le paiement…"; msg.textContent = ""; msg.className = "form-msg";
    fetch("/api/achat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (ok && j.url) { location.href = j.url; return; }
        throw new Error(j.error || "Paiement indisponible.");
      })
      .catch((err) => { msg.textContent = err.message; msg.className = "form-msg err"; btn.disabled = false; btn.innerHTML = libelle; maj(); });
  });
})();
