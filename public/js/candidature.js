/* Page de candidature (Finance des marchés) : compteur de caractères des réponses. */
(function () {
  document.querySelectorAll(".char-meter").forEach(function (m) {
    var ta = document.getElementById(m.getAttribute("data-for")); if (!ta) return;
    var min = parseInt(ta.getAttribute("minlength"), 10) || 0;
    var up = function () {
      var n = ta.value.trim().length;
      if (n >= min) { m.className = "char-meter is-ok"; m.textContent = "Minimum atteint (" + n + " caractères)."; }
      else { m.className = "char-meter"; m.textContent = n + " / " + min + " caractères minimum"; }
    };
    ta.addEventListener("input", up); up();
  });
})();
