/* Graphique de marché animé derrière l'ouverture de l'accueil : bougies qui montent et
   descendent, moyenne mobile dorée, zone sous la courbe, volumes, grille et échelle de prix
   qui défilent en continu, mêlés à la photo des immeubles.
   Purement décoratif : aucun instrument nommé, aucune cotation réelle.
   Une seule image fixe si le visiteur a demandé de réduire les animations ;
   l'animation s'arrête quand l'ouverture n'est plus à l'écran. */
(function () {
  var canvas = document.querySelector(".a-hero__graphe");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var VERT = "rgba(52,211,153,", ROUGE = "rgba(244,63,94,", OR = "rgba(212,175,106,";
  var W = 0, H = 0, dpr = 1, largeur = 14, bougies = [], prix = 1.0850, tendance = 0, decalage = 0;
  var dureeBougie = 650, dernier = 0, actif = true, visible = true;

  // Marche aléatoire avec des phases de tendance (monte, descend, hésite) : allure d'un vrai marché.
  function nouvelleBougie() {
    if (Math.random() < 0.1) tendance = (Math.random() - 0.5) * 0.0014;
    tendance += (1.0850 - prix) * 0.02;                           // le prix revient peu à peu vers sa zone : il monte et redescend
    tendance = Math.max(-0.0009, Math.min(0.0009, tendance));
    var o = prix, h = o, l = o, c = o;
    for (var i = 0; i < 6; i++) {
      c += tendance * 0.3 + (Math.random() - 0.5) * 0.0011;
      h = Math.max(h, c); l = Math.min(l, c);
    }
    h += Math.random() * 0.0004; l -= Math.random() * 0.0004;
    prix = c;
    return { o: o, h: h, l: l, c: c, v: 0.3 + Math.random() * 0.7 };
  }
  function dimensionner() {
    dpr = Math.min(window.devicePixelRatio || 1, W < 700 ? 1.5 : 2);
    var r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    largeur = W < 700 ? 13 : 19;
    var n = Math.ceil(W / largeur) + 3;
    while (bougies.length < n) bougies.push(nouvelleBougie());
  }

  function dessiner() {
    ctx.clearRect(0, 0, W, H);
    var n = Math.ceil(W / largeur) + 2, vues = bougies.slice(-n);
    var haut = -Infinity, bas = Infinity;
    vues.forEach(function (b) { haut = Math.max(haut, b.h); bas = Math.min(bas, b.l); });
    var marge = (haut - bas) * 0.18 || 0.001; haut += marge; bas -= marge;
    var zoneH = H * 0.62, zoneY = H * 0.16;                      // le graphique occupe le centre de l'image
    var y = function (p) { return zoneY + (haut - p) / (haut - bas) * zoneH; };
    var x0 = W - vues.length * largeur + largeur - decalage * largeur;

    // Grille et échelle de prix (à droite)
    ctx.lineWidth = 1;
    ctx.font = "500 11px Inter, Arial, sans-serif";
    ctx.textAlign = "right";
    for (var g = 0; g <= 5; g++) {
      var gy = zoneY + g * zoneH / 5, gp = haut - g * (haut - bas) / 5;
      ctx.strokeStyle = "rgba(255,255,255,.07)";
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.38)";
      ctx.fillText(gp.toFixed(4), W - 10, gy - 5);
    }
    for (var vx = x0 % (largeur * 8); vx < W; vx += largeur * 8) {
      ctx.strokeStyle = "rgba(255,255,255,.05)";
      ctx.beginPath(); ctx.moveTo(vx, zoneY); ctx.lineTo(vx, zoneY + zoneH + H * 0.12); ctx.stroke();
    }

    // Zone dorée sous la courbe des clôtures
    ctx.beginPath();
    vues.forEach(function (b, i) { var px = x0 + i * largeur; if (i) ctx.lineTo(px, y(b.c)); else ctx.moveTo(px, y(b.c)); });
    ctx.lineTo(x0 + (vues.length - 1) * largeur, zoneY + zoneH); ctx.lineTo(x0, zoneY + zoneH); ctx.closePath();
    var deg = ctx.createLinearGradient(0, zoneY, 0, zoneY + zoneH);
    deg.addColorStop(0, OR + ".3)"); deg.addColorStop(1, OR + "0)");
    ctx.fillStyle = deg; ctx.fill();

    // Volumes (en bas) et bougies
    var volY = zoneY + zoneH + H * 0.12;
    vues.forEach(function (b, i) {
      var px = x0 + i * largeur, monte = b.c >= b.o, coul = monte ? VERT : ROUGE;
      ctx.fillStyle = coul + ".22)";
      ctx.fillRect(px - largeur * 0.32, volY - b.v * H * 0.08, largeur * 0.64, b.v * H * 0.08);
      ctx.strokeStyle = coul + "1)"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(px, y(b.h)); ctx.lineTo(px, y(b.l)); ctx.stroke();
      var c1 = y(Math.max(b.o, b.c)), c2 = y(Math.min(b.o, b.c));
      ctx.fillStyle = coul + "1)";
      ctx.fillRect(px - largeur * 0.32, c1, largeur * 0.64, Math.max(2, c2 - c1));
    });

    // Moyenne mobile (20 bougies), en or
    ctx.beginPath(); ctx.lineWidth = 2.6; ctx.strokeStyle = OR + "1)";
    var debut = bougies.length - vues.length;
    vues.forEach(function (b, i) {
      var s = 0, k = 0;
      for (var j = Math.max(0, debut + i - 19); j <= debut + i; j++) { s += bougies[j].c; k++; }
      var px = x0 + i * largeur, py = y(s / k);
      if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    });
    ctx.stroke();

    // Étiquette du dernier prix (comme sur une plateforme de marché)
    var d = vues[vues.length - 1], ly = y(d.c), up = d.c >= d.o;
    ctx.setLineDash([4, 4]); ctx.lineWidth = 1; ctx.strokeStyle = (up ? VERT : ROUGE) + ".6)";
    ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(W - 74, ly); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = (up ? VERT : ROUGE) + ".95)";
    ctx.fillRect(W - 72, ly - 11, 66, 22);
    ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "600 11px Inter, Arial, sans-serif";
    ctx.fillText(d.c.toFixed(4), W - 39, ly + 4);

    // Fondu vers la gauche : le grand titre reste parfaitement lisible
    ctx.globalCompositeOperation = "destination-in";
    var fondu = ctx.createLinearGradient(0, 0, W, 0);
    fondu.addColorStop(0, "rgba(0,0,0,.3)"); fondu.addColorStop(0.45, "rgba(0,0,0,.75)"); fondu.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = fondu; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
  }

  function boucle(t) {
    if (!actif) return;
    if (!dernier) dernier = t;
    var dt = t - dernier; dernier = t;
    decalage += dt / dureeBougie;
    // La bougie en cours évolue avant de se fermer, puis le graphique avance d'un cran.
    var d = bougies[bougies.length - 1];
    var bruit = tendance * 0.08 + (Math.random() - 0.5) * 0.00018;
    d.c += bruit; d.h = Math.max(d.h, d.c); d.l = Math.min(d.l, d.c); prix = d.c;
    while (decalage >= 1) {
      decalage -= 1;
      bougies.push(nouvelleBougie());
      if (bougies.length > 400) bougies.splice(0, bougies.length - 400);
    }
    dessiner();
    requestAnimationFrame(boucle);
  }
  function lancer() {
    var doit = visible && !document.hidden && !reduit;
    if (doit && !actif) { actif = true; dernier = 0; requestAnimationFrame(boucle); }
    if (!doit) actif = false;
  }

  dimensionner();
  for (var i = 0; i < 80; i++) bougies.push(nouvelleBougie());
  dessiner();
  window.addEventListener("resize", function () { dimensionner(); dessiner(); });
  if (reduit) { actif = false; return; }
  actif = false;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; lancer(); }).observe(canvas);
  }
  document.addEventListener("visibilitychange", lancer);
  lancer();
})();
