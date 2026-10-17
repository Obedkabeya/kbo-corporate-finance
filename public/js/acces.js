/* Page d'accès de l'élève : état de son accès et connexion de son Discord. */
(function () {
  const $ = (id) => document.getElementById(id);
  const q = new URLSearchParams(location.search);
  const t = q.get("t") || "";
  const retour = q.get("discord");
  const MESSAGES = {
    ok: ["ok", "✓ Votre Discord est relié : vous avez reçu votre rôle et accès à la formation."],
    refuse: ["err", "Vous avez refusé l'autorisation sur Discord. Cliquez à nouveau sur « Connecter mon Discord » pour réessayer."],
    inactif: ["err", "Votre accès n'est pas actif. Écrivez-nous si vous pensez que c'est une erreur."],
    indisponible: ["err", "La connexion Discord est momentanément indisponible. Réessayez un peu plus tard."],
    erreur: ["err", "La connexion à Discord n'a pas abouti. Réessayez ; si le problème continue, écrivez-nous sur WhatsApp."],
  };
  const fmt = (iso) => { try { return new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return iso; } };

  if (!t) { $("accesIntro").textContent = "Ce lien d'accès est incomplet. Utilisez le lien reçu après votre paiement."; return; }
  if (retour) history.replaceState(null, "", location.pathname + "?t=" + encodeURIComponent(t));

  fetch("/api/acces?t=" + encodeURIComponent(t))
    .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
    .then(({ ok, j }) => {
      if (!ok) { $("accesIntro").textContent = j.error || "Lien d'accès inconnu."; return; }
      $("accesCarte").hidden = false;
      $("accesTitre").textContent = j.actif ? "Votre accès est ouvert." : "Votre accès est terminé.";
      $("accesIntro").textContent = j.actif
        ? "Merci pour votre confiance. La formation se déroule sur notre serveur Discord : reliez votre compte en un clic."
        : "Pour reprendre la formation, écrivez-nous : nous vous enverrons un nouveau lien de paiement.";
      $("accesFormation").textContent = j.formation || "";
      $("accesEtat").textContent = j.actif ? (j.expire ? "Actif jusqu'au " + fmt(j.expire) : "Actif") : "Inactif";
      $("accesDiscord").textContent = j.discord ? "Relié" + (j.discordNom ? " (" + j.discordNom + ")" : "") : "Pas encore relié";
      if (j.actif && j.discordPret) {
        const c = $("accesConnecter");
        c.href = "/discord/connect?t=" + encodeURIComponent(t);
        c.hidden = false;
        if (j.discord) c.firstChild.textContent = "Reconnecter mon Discord ";
      }
      if (j.actif && j.discord && j.serveur) { $("accesOuvrir").href = j.serveur; $("accesOuvrir").hidden = false; }
      if (retour && MESSAGES[retour]) {
        $("accesMessage").textContent = MESSAGES[retour][1];
        $("accesMessage").className = "form-msg " + MESSAGES[retour][0];
      }
      $("accesAide").hidden = !!j.discord;
    })
    .catch(() => { $("accesIntro").textContent = "Serveur injoignable. Réessayez dans un instant."; });
})();
