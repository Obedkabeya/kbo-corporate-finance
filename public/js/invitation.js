/* Page de retour du lien d'invitation d'Obed (accès « Membre historique »). */
(function () {
  const etat = new URLSearchParams(location.search).get("etat");
  const T = {
    ok: ["Bienvenue chez KBO.", "Vous avez rejoint le serveur Discord de KBO Corporate Finance, avec l'accès à tous les salons.", true],
    refuse: ["Invitation non acceptée.", "Vous avez refusé l'autorisation sur Discord. Rouvrez le lien d'invitation pour réessayer.", false],
    invalide: ["Lien d'invitation invalide.", "Ce lien n'est plus valable. Demandez un nouveau lien à la personne qui vous a invité.", false],
    erreur: ["Un problème est survenu.", "La connexion à Discord n'a pas abouti. Réessayez dans un instant.", false],
  }[etat] || ["Invitation", "Utilisez le lien d'invitation que vous avez reçu.", false];
  document.getElementById("invTitre").textContent = T[0];
  document.getElementById("invTexte").textContent = T[1];
  document.getElementById("invOuvrir").hidden = !T[2];
})();
