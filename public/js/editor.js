/* Owner-only tools: a fixed admin bar + click-to-edit for every text on the site.
   Loads on public pages but does NOTHING for visitors — everything is gated behind
   body.is-admin (set by components.js only for a logged-in owner). */
(function () {
  function $(id) { return document.getElementById(id); }

  // Liste de polices (façon traitement de texte). Les polices « système »
  // s'affichent si elles sont installées sur l'appareil du visiteur.
  function fontSelectHTML() {
    // Uniquement des polices sans empattements (charte KBO) : les deux polices
    // du site, puis quelques polices système équivalentes.
    var groups = [
      ["Polices du site", [
        ["Inter Tight (titres)", "var(--title)"],
        ["Inter (texte)", "var(--sans)"],
      ]],
      ["Système (sans empattements)", [
        ["Arial", "Arial, sans-serif"],
        ["Helvetica", "Helvetica, Arial, sans-serif"],
        ["Verdana", "Verdana, sans-serif"],
        ["Tahoma", "Tahoma, sans-serif"],
        ["Trebuchet MS", "'Trebuchet MS', sans-serif"],
      ]],
    ];
    var opts = '<option value="">Police…</option>';
    groups.forEach(function (g) {
      opts += '<optgroup label="' + g[0] + '">';
      g[1].forEach(function (f) {
        opts += '<option value="' + f[1].replace(/"/g, "&quot;") + '">' + f[0] + "</option>";
      });
      opts += "</optgroup>";
    });
    return '<select class="fmt-bar__font" data-font title="Police du texte">' + opts + "</select>";
  }

  function init() {
    if (window.__KBO_ADMIN__ !== true) return;                 // serveur : admin uniquement
    if (!document.body.classList.contains("is-admin")) return;
    if (document.querySelector(".admin-bar")) return;
    if (new URLSearchParams(location.search).get("visitor") === "1") return; // preview mode
    if (!window.KBO || !window.KBO.editableElements) return;

    const bar = document.createElement("div");
    bar.className = "admin-bar";
    bar.innerHTML =
      '<span class="admin-bar__tag">● Mode administrateur</span>' +
      '<button type="button" class="admin-bar__btn" id="abEdit">✏️ Modifier la page</button>' +
      '<a class="admin-bar__btn" href="/admin">⚙ Tableau de bord</a>' +
      '<a class="admin-bar__btn" id="abPreview" href="?visitor=1">👁 Aperçu visiteur</a>' +
      '<button type="button" class="admin-bar__btn admin-bar__btn--out" id="abLogout">Déconnexion</button>' +
      '<span class="admin-bar__hint" id="abHint"></span>';
    document.body.appendChild(bar);
    document.body.classList.add("has-admin-bar");
    $("abPreview").href = location.pathname + "?visitor=1";

    // ---- Barre de mise en forme (style traitement de texte) ----
    // Apparaît en mode édition et s'applique au texte sélectionné / au bloc actif.
    let activeEl = null;
    const tb = document.createElement("div");
    tb.className = "fmt-bar";
    tb.hidden = true;
    tb.innerHTML =
      '<span class="fmt-bar__cible" title="Texte en cours de modification">Cliquez un texte</span>' +
      '<button type="button" data-cmd="undo" title="Annuler la dernière modification"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg></button>' +
      '<button type="button" data-cmd="redo" title="Rétablir"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/></svg></button>' +
      '<span class="fmt-bar__sep"></span>' +
      '<button type="button" data-cmd="bold" title="Gras"><b>G</b></button>' +
      '<button type="button" data-cmd="italic" title="Italique"><i>I</i></button>' +
      '<button type="button" data-cmd="underline" title="Souligné"><u>S</u></button>' +
      '<button type="button" data-link title="Mettre un lien sur le texte sélectionné (vide = retirer le lien)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg></button>' +
      '<span class="fmt-bar__sep"></span>' +
      '<button type="button" data-align="left" title="Aligner à gauche"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 10h10M4 14h16M4 18h10"/></svg></button>' +
      '<button type="button" data-align="center" title="Centrer"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M7 10h10M4 14h16M7 18h10"/></svg></button>' +
      '<button type="button" data-align="justify" title="Justifier (aligné des deux côtés)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg></button>' +
      '<button type="button" data-align="right" title="Aligner à droite"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M10 10h10M4 14h16M10 18h10"/></svg></button>' +
      '<span class="fmt-bar__sep"></span>' +
      '<button type="button" data-size="-1" title="Réduire la taille du texte">A−</button>' +
      '<button type="button" class="fmt-bar__taille" data-size="0" title="Taille d\'origine">100 %</button>' +
      '<button type="button" data-size="1" title="Agrandir la taille du texte">A+</button>' +
      '<button type="button" data-lh="-1" title="Resserrer les lignes">↕−</button>' +
      '<button type="button" data-lh="1" title="Espacer les lignes">↕+</button>' +
      '<button type="button" data-case="upper" title="MAJUSCULES">AA</button>' +
      '<span class="fmt-bar__sep"></span>' +
      '<span class="fmt-bar__cible">Cadre</span>' +
      '<button type="button" data-larg="-1" title="Rétrécir le cadre du texte">⇥⇤</button>' +
      '<button type="button" data-larg="1" title="Élargir le cadre du texte">⇤⇥</button>' +
      '<button type="button" data-dep="x-1" title="Déplacer vers la gauche">←</button>' +
      '<button type="button" data-dep="x1" title="Déplacer vers la droite">→</button>' +
      '<button type="button" data-dep="y-1" title="Monter">↑</button>' +
      '<button type="button" data-dep="y1" title="Descendre">↓</button>' +
      '<button type="button" data-cadre title="Remettre le cadre comme à l\'origine (taille et place)">⟲ cadre</button>' +
      '<span class="fmt-bar__sep"></span>' +
      fontSelectHTML() +
      '<span class="fmt-bar__sep"></span>' +
      '<label class="fmt-bar__color" title="Couleur du texte">A<input type="color" data-color value="#1e3b8b"></label>' +
      '<button type="button" data-clear title="Effacer la mise en forme">✕ mise en forme</button>';
    document.body.appendChild(tb);

    // Ne jamais perdre la sélection quand on clique un bouton de la barre.
    // (On laisse passer les menus/champs, sinon la liste des polices ne s'ouvre pas.)
    tb.addEventListener("mousedown", (e) => {
      if (!e.target.closest("select, input")) e.preventDefault();
    });

    function targetEl() {
      return activeEl && activeEl.isContentEditable ? activeEl : null;
    }
    function afterFormat(el) { if (el) { save(el); majCible(); } }
    function taillePct(el, w) {
      const v = w.style.fontSize || "";
      if (/%$/.test(v)) return parseFloat(v);
      if (/px$/.test(v)) return Math.round(parseFloat(v) / (parseFloat(getComputedStyle(el).fontSize) || 16) * 100);
      return 100;
    }
    // Nom lisible du texte en cours de modification, et sa taille.
    function majCible() {
      const c = tb.querySelector(".fmt-bar__cible"), t = tb.querySelector(".fmt-bar__taille");   // 1re étiquette : la cible
      const el = targetEl();
      if (!el) { c.textContent = "Cliquez un texte"; t.textContent = "100 %"; return; }
      const noms = { H1: "Grand titre", H2: "Titre", H3: "Sous-titre", H4: "Sous-titre", H5: "Sous-titre", P: "Paragraphe",
                     LI: "Élément de liste", A: "Lien", BLOCKQUOTE: "Citation", FIGCAPTION: "Légende" };
      c.textContent = noms[el.tagName] || "Texte";
      const w = el.querySelector(":scope > span[data-fmt]");
      t.textContent = (w ? taillePct(el, w) : 100) + " %";
    }

    // Les styles posés sur l'élément lui-même ne sont pas enregistrés (seul son
    // contenu l'est) : on les applique donc à un conteneur INTERNE, qui, lui,
    // fait partie du contenu et survit au rechargement.
    function fmtWrap(el) {
      let w = el.querySelector(":scope > span[data-fmt]");
      if (!w) {
        w = document.createElement("span");
        w.setAttribute("data-fmt", "");
        w.style.display = "block";
        while (el.firstChild) w.appendChild(el.firstChild);
        el.appendChild(w);
      }
      w.style.display = "block";        // (les anciens réglages enregistrés n'avaient plus ce réglage)
      return w;
    }
    function unwrapFmt(el) {
      const w = el.querySelector(":scope > span[data-fmt]");
      if (!w) return;
      while (w.firstChild) el.insertBefore(w.firstChild, w);
      w.remove();
    }

    tb.addEventListener("click", (e) => {
      const btn = e.target.closest("button, label");
      if (!btn) return;
      const el = targetEl();
      if (!el) { hint("Cliquez d'abord dans un texte à modifier.", "err"); return; }
      el.focus();
      try { document.execCommand("styleWithCSS", false, true); } catch (e) {}
      if (btn.dataset.cmd) {
        document.execCommand(btn.dataset.cmd, false, null);
      } else if (btn.dataset.align) {
        fmtWrap(el).style.textAlign = btn.dataset.align;
      } else if (btn.dataset.size) {
        // Taille en pourcentage de la taille d'origine : le texte garde sa taille
        // adaptée à chaque écran (téléphone, ordinateur), même agrandi ou réduit.
        const w = fmtWrap(el);
        const pas = parseInt(btn.dataset.size, 10);
        const p = pas === 0 ? 100 : Math.min(300, Math.max(30, taillePct(el, w) + pas * 10));
        w.style.fontSize = p === 100 ? "" : p + "%";
      } else if (btn.dataset.larg) {
        // Largeur du cadre en % de sa largeur d'origine (ordinateur ; sur téléphone le texte reprend toute la largeur).
        const w = fmtWrap(el);
        const cur = parseFloat(w.style.width) || 100;
        const next = Math.min(220, Math.max(30, cur + parseInt(btn.dataset.larg, 10) * 10));
        w.style.width = next === 100 ? "" : next + "%";
        w.style.maxWidth = next > 100 ? "none" : "";
      } else if (btn.dataset.dep) {
        // Déplacement par pas de 8 px (0,5 rem), dans les deux sens.
        const w = fmtWrap(el);
        const axe = btn.dataset.dep[0] === "x" ? "left" : "top";
        const cur = parseFloat(w.style[axe]) || 0;
        const next = Math.min(40, Math.max(-40, Math.round((cur + parseInt(btn.dataset.dep.slice(1), 10) * 0.5) * 10) / 10));
        w.style[axe] = next ? next + "rem" : "";
        w.style.position = (w.style.left || w.style.top) ? "relative" : "";
      } else if (btn.hasAttribute("data-cadre")) {
        const w = fmtWrap(el);
        ["width", "maxWidth", "left", "top", "position"].forEach(k => { w.style[k] = ""; });
      } else if (btn.dataset.lh) {
        const w = fmtWrap(el);
        const cs = getComputedStyle(w);
        const cur = parseFloat(w.style.lineHeight) || (parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)) || 1.4;
        w.style.lineHeight = String(Math.min(2.6, Math.max(0.8, Math.round((cur + parseInt(btn.dataset.lh, 10) * 0.1) * 10) / 10)));
      } else if (btn.hasAttribute("data-link")) {
        const actuel = (window.getSelection().anchorNode && window.getSelection().anchorNode.parentElement.closest("a")) || null;
        const url = prompt("Adresse du lien (laisser vide pour retirer le lien) :", actuel ? actuel.getAttribute("href") : "https://");
        if (url === null) return;
        if (!url.trim() || url.trim() === "https://") document.execCommand("unlink", false, null);
        else if (/^(https?:\/\/|\/|mailto:|tel:|#)/i.test(url.trim())) document.execCommand("createLink", false, url.trim());
        else { hint("Adresse non valable : elle doit commencer par https://, / ou mailto:", "err"); return; }
      } else if (btn.dataset.case) {
        const w = fmtWrap(el);
        w.style.textTransform = w.style.textTransform === "uppercase" ? "none" : "uppercase";
      } else if (btn.hasAttribute("data-clear")) {
        document.execCommand("removeFormat", false, null);
        unwrapFmt(el);
      } else { return; }
      afterFormat(el);
    });
    tb.querySelector("[data-font]").addEventListener("change", (e) => {
      const el = targetEl();
      if (!el) { hint("Cliquez d'abord dans un texte à modifier.", "err"); e.target.value = ""; return; }
      if (e.target.value) fmtWrap(el).style.fontFamily = e.target.value;
      e.target.value = "";
      afterFormat(el);
    });
    tb.querySelector("[data-color]").addEventListener("input", (e) => {
      const el = targetEl();
      if (!el) return;
      el.focus();
      try { document.execCommand("styleWithCSS", false, true); } catch (err) {}
      document.execCommand("foreColor", false, e.target.value);
      afterFormat(el);
    });

    let editing = false;
    const editBtn = $("abEdit");
    editBtn.addEventListener("click", () => setEditing(!editing));
    $("abLogout").addEventListener("click", () => {
      fetch("/api/logout", { method: "POST" }).finally(() => { location.href = location.pathname; });
    });

    // En modification, un clic sur un lien sert à écrire dedans, pas à changer de page.
    document.addEventListener("click", (e) => {
      if (!editing) return;
      const a = e.target.closest && e.target.closest("main a[href]");
      if (a && !e.target.closest(".kbo-imgbtn, .slot-admin, .kbo-fm")) e.preventDefault();
    }, true);

    function setEditing(on) {
      editing = on;
      document.body.classList.toggle("editing", on);
      editBtn.classList.toggle("is-on", on);
      editBtn.textContent = on ? "✓ Terminer" : "✏️ Modifier la page";
      hint(on ? "Cliquez un texte pour le modifier, ou « Image ou vidéo » sur une photo. Tout s'enregistre tout seul." : "");
      tb.hidden = !on;
      if (!on) activeEl = null;
      window.KBO.editableElements().forEach(el => {
        if (on) {
          el.setAttribute("contenteditable", "true");
          el.classList.add("kbo-editable");
          if (!el.__wired) {
            el.__wired = true;
            el.addEventListener("focus", () => { activeEl = el; majCible(); });
            el.addEventListener("blur", () => save(el));
            el.addEventListener("keydown", (e) => {
              if (e.key === "Enter" && /^(H[1-5]|SPAN)$/.test(el.tagName)) { e.preventDefault(); el.blur(); }
              if (e.key === "Escape") el.blur();
            });
          }
        } else {
          el.removeAttribute("contenteditable");
          el.classList.remove("kbo-editable");
        }
      });
      wireImages(on);
      wireSlots(on);
    }

    // ---- Upload helper (cookie de session envoyé automatiquement) ----
    function chooseAndUpload(onDone) {
      const input = document.createElement("input");
      input.type = "file"; input.accept = "image/*,video/*"; input.style.display = "none";
      document.body.appendChild(input);
      input.addEventListener("change", () => {
        const file = input.files[0];
        if (!file) { input.remove(); return; }
        hint("Téléversement…");
        fetch("/api/upload-raw", {
          method: "POST",
          headers: { "X-Filename": encodeURIComponent(file.name), "Content-Type": file.type || "application/octet-stream" },
          body: file,
        })
          .then(r => r.json().then(j => { if (!r.ok) throw new Error(j.error); return j; }))
          .then(up => onDone(up.path))
          .catch(err => hint("Échec : " + (err.message || "image"), "err"))
          .finally(() => input.remove());
      });
      input.click();
    }

    // ---- Image slots : plusieurs images par carré (carrousel) ----
    function wireSlots(on) {
      document.querySelectorAll("[data-slot]").forEach(slot => {
        let bar = slot.querySelector(".slot-admin");
        if (on) {
          slot.classList.add("kbo-slot-editing");
          if (!bar) {
            bar = document.createElement("div");
            bar.className = "slot-admin";
            bar.innerHTML = '<button type="button" class="slot-admin__btn" data-act="media">🎬 Image ou vidéo</button>' +
                            '<button type="button" class="slot-admin__btn" data-act="add">＋ Ajouter au carrousel</button>' +
                            '<button type="button" class="slot-admin__btn slot-admin__btn--del" data-act="del">🗑 Retirer le média affiché</button>' +
                            '<span class="slot-admin__count"></span>';
            slot.appendChild(bar);
            bar.querySelector('[data-act="media"]').addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); changeSlotMedia(slot); });
            bar.querySelector('[data-act="add"]').addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); addToSlot(slot); });
            bar.querySelector('[data-act="del"]').addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); removeFromSlot(slot); });
          }
          updateSlotCount(slot);
        } else {
          slot.classList.remove("kbo-slot-editing");
          if (bar) bar.remove();
        }
      });
    }
    function currentSlotImages(slot) {
      if (Array.isArray(slot.__images) && slot.__images.length) return slot.__images.slice();
      const def = slot.getAttribute("data-default");
      return def ? [] : [];   // 1re image ajoutée remplace l'illustration par défaut
    }
    function saveSlot(slot, arr) {
      hint("Enregistrement…");
      return fetch("/api/slides", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: slot.getAttribute("data-slot"), paths: arr }),
      }).then(r => r.json().then(j => { if (!r.ok) throw new Error(j.error || "Échec de l'enregistrement"); }))
        .then(() => { window.KBO.renderSlot(slot, arr); wireSlots(true); hint("Média mis à jour ✓", "ok"); })
        .catch(err => { hint(err.message || "Échec de l'enregistrement", "err"); throw err; });
    }
    function slotShownImg(slot) {
      const imgs = [...slot.querySelectorAll("img")];
      return imgs[Math.min(slot.__index || 0, Math.max(0, imgs.length - 1))] || null;
    }
    function changeSlotMedia(slot) {
      const arr = currentSlotImages(slot);
      const i = Math.min(slot.__index || 0, Math.max(0, arr.length - 1));
      const img = slotShownImg(slot);
      openMediaDialog({
        valeur: arr.length ? arr[i] : null,
        img: img, cadre: slot,
        altDefaut: slot.getAttribute("data-alt") || (img && img.alt) || "",
        peutRevenir: arr.length > 0,
        enregistrer: v => {
          const next = arr.slice();
          if (!v) next.splice(i, 1); else if (next.length) next[i] = v; else next.push(v);
          return saveSlot(slot, next);
        },
      });
    }
    function addToSlot(slot) {
      const img = slotShownImg(slot);
      openMediaDialog({
        valeur: null, nouveau: true, img: img, cadre: slot,
        altDefaut: slot.getAttribute("data-alt") || "",
        enregistrer: v => { const arr = currentSlotImages(slot); arr.push(v); return saveSlot(slot, arr); },
      });
    }
    function removeFromSlot(slot) {
      const arr = currentSlotImages(slot);
      if (!arr.length) { hint("Cette image est l'illustration par défaut.", "err"); return; }
      const i = Math.min(slot.__index || 0, arr.length - 1);
      arr.splice(i, 1);
      saveSlot(slot, arr);
    }
    function updateSlotCount(slot) {
      const bar = slot.querySelector(".slot-admin__count");
      if (bar) { const n = (slot.__images && slot.__images.length) || 0; bar.textContent = n > 1 ? (n + " médias — glissez pour défiler") : (n === 1 ? "1 média" : "média par défaut"); }
    }

    function save(el) {
      const info = window.KBO.editableKey(el);
      const value = el.innerHTML.trim();
      const url = info.kind === "setting" ? "/api/settings/text" : "/api/content";
      hint("Enregistrement…");
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: info.key, value: value }),
      })
        .then(r => { if (!r.ok) throw new Error(); hint("Enregistré ✓", "ok"); })
        .catch(() => hint("Échec de l'enregistrement", "err"));
    }

    // ---- Editable images ----
    function wireImages(on) {
      window.KBO.editableImages().forEach(img => {
        const parent = img.parentElement;
        if (!parent) return;
        if (on) {
          parent.classList.add("kbo-imgwrap");
          // Le bouton se place dans le cadre ; on ne touche pas aux cadres déjà positionnés.
          if (getComputedStyle(parent).position === "static") parent.classList.add("kbo-imgwrap--rel");
          if (!img.__imgwired) {
            img.__imgwired = true;
            const btn = document.createElement("button");
            btn.type = "button"; btn.className = "kbo-imgbtn"; btn.textContent = "🎬 Image ou vidéo";
            btn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); pickImage(img); });
            parent.appendChild(btn);
            img.__imgbtn = btn;
          }
          if (img.__imgbtn) img.__imgbtn.style.display = "";
        } else {
          parent.classList.remove("kbo-imgwrap", "kbo-imgwrap--rel");
          if (img.__imgbtn) img.__imgbtn.style.display = "none";
        }
      });
    }

    function pickImage(img) {
      const info = window.KBO.imageKey(img);
      if (info.kind === "img") {
        openMediaDialog({
          valeur: img.__kboValeur || null, img: img, cadre: img,
          altDefaut: (img.__orig && img.__orig.alt) || img.alt || "",
          peutRevenir: !!img.__kboValeur,
          enregistrer: v => fetch("/api/imgcontent", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(v ? { key: info.key, media: v } : { key: info.key, path: "" }),
          }).then(r => r.json().then(j => { if (!r.ok) throw new Error(j.error || "Échec de l'enregistrement"); }))
            .then(() => { window.KBO.appliquerMedia(img, v); hint(v ? "Média mis à jour ✓" : "Image d'origine remise ✓", "ok"); }),
        });
        return;
      }
      pickSettingImage(img);
    }
    // Photos réglées dans les paramètres du site (portrait, biographie) : image seulement.
    function pickSettingImage(img) {
      const input = document.createElement("input");
      input.type = "file"; input.accept = "image/*"; input.style.display = "none";
      document.body.appendChild(input);
      input.addEventListener("change", () => {
        const file = input.files[0];
        if (!file) { input.remove(); return; }
        hint("Téléversement de l'image…");
        fetch("/api/upload-raw", {
          method: "POST",
          headers: { "X-Filename": encodeURIComponent(file.name), "Content-Type": file.type || "application/octet-stream" },
          body: file,
        })
          .then(r => r.json().then(j => { if (!r.ok) throw new Error(j.error); return j; }))
          .then(up => {
            const info = window.KBO.imageKey(img);
            const url = info.kind === "setting-image" ? "/api/settings/image" : "/api/imgcontent";
            return fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ key: info.key, path: up.path }),
            }).then(r => { if (!r.ok) throw new Error(); img.src = up.path; hint("Image mise à jour ✓", "ok"); });
          })
          .catch(err => hint("Échec : " + (err.message || "image"), "err"))
          .finally(() => input.remove());
      });
      input.click();
    }

    // ---- Fenêtre « Image ou vidéo » (chaque emplacement d'image du site) ----
    const MAX_VIDEO = 200 * 1024 * 1024;
    function mo(n) { return (n / 1048576).toFixed(n < 10485760 ? 1 : 0).replace(".", ",") + " Mo"; }
    function cheminLocal(url) {
      try { const u = new URL(url, location.href); return u.origin === location.origin ? u.pathname : ""; } catch (e) { return ""; }
    }
    // Meilleure version d'une image d'origine (la plus grande jusqu'à 1600 px de large).
    function imageOrigine(img) {
      if (!img) return "";
      const o = img.__orig || { src: img.getAttribute("src"), srcset: img.getAttribute("srcset") };
      let best = o.src, bw = 0;
      (o.srcset || "").split(",").forEach(c => {
        const m = c.trim().match(/^(\S+)\s+(\d+)w$/);
        if (m && +m[2] <= 1600 && +m[2] > bw) { bw = +m[2]; best = m[1]; }
      });
      return cheminLocal(best) || best || "";
    }
    function lireLien(txt) {
      txt = (txt || "").trim();
      let m = txt.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{11})/);
      if (m) return { source: "youtube", src: m[1] };
      m = txt.match(/vimeo\.com\/(?:video\/)?(\d{5,12})(?:\/([0-9a-f]{6,20}))?(?:[^#]*[?&]h=([0-9a-f]{6,20}))?/);
      if (m) return { source: "vimeo", src: m[1] + ((m[2] || m[3]) ? "/" + (m[2] || m[3]) : "") };
      return null;
    }
    function lienAffiche(l) {
      if (!l) return "";
      if (l.source === "youtube") return "https://www.youtube.com/watch?v=" + l.src;
      return "https://vimeo.com/" + l.src;
    }
    function choisirFichier(accept) {
      return new Promise(resolve => {
        const input = document.createElement("input");
        input.type = "file"; input.accept = accept; input.style.display = "none";
        document.body.appendChild(input);
        input.addEventListener("change", () => { resolve(input.files[0] || null); input.remove(); });
        input.addEventListener("cancel", () => { resolve(null); input.remove(); });
        input.click();
      });
    }
    function envoyerFichier(file, onProgress) {
      return new Promise((resolve, reject) => {
        const x = new XMLHttpRequest();
        x.open("POST", "/api/upload-raw");
        x.setRequestHeader("X-Filename", encodeURIComponent(file.name));
        x.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        x.upload.onprogress = e => { if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total); };
        x.onload = () => {
          let j = {}; try { j = JSON.parse(x.responseText); } catch (e) { /* réponse vide */ }
          if (x.status >= 200 && x.status < 300) resolve(j); else reject(new Error(j.error || "Échec de l'envoi du fichier."));
        };
        x.onerror = () => reject(new Error("La connexion a été coupée pendant l'envoi. Réessayez."));
        x.send(file);
      });
    }

    function openMediaDialog(o) {
      const ouvreur = document.activeElement;
      const v0 = window.KBO.normMedia(o.valeur);
      const origine = imageOrigine(o.img) || (o.cadre && o.cadre.getAttribute && cheminLocal(o.cadre.getAttribute("data-default") || "")) || "";
      const estVideo = !!(v0 && v0.type === "video");
      const st = {
        type: estVideo ? "video" : (o.nouveau ? "video" : "image"),
        image: v0 && v0.type === "image" ? v0.src : "",
        source: estVideo ? v0.source : "fichier",
        fichier: estVideo && v0.source === "fichier" ? v0.src : "",
        lien: estVideo && v0.source !== "fichier" ? { source: v0.source, src: v0.src } : null,
        poster: (estVideo && v0.poster) || origine,
        posterVideo: "", posterChoisi: estVideo,
        mode: estVideo ? (v0.mode || "fond") : "fond",
        alt: (v0 && v0.alt) || o.altDefaut || "",
        titre: (v0 && v0.titre) || "",
        sansSon: false, occupe: false,
      };
      const fm = document.createElement("div");
      fm.className = "kbo-fm";
      fm.innerHTML =
        '<div class="kbo-fm__boite" role="dialog" aria-modal="true" aria-labelledby="kboFmTitre">' +
        '<div class="kbo-fm__tete"><h2 id="kboFmTitre">' + (o.nouveau ? "Ajouter une image ou une vidéo" : "Image ou vidéo") + '</h2>' +
        '<button type="button" class="kbo-fm__fermer" data-act="annuler" aria-label="Fermer">✕</button></div>' +
        '<div class="kbo-fm__corps"><div class="kbo-fm__col">' +
        '<div class="kbo-fm__choix kbo-fm__choix--type" role="radiogroup" aria-label="Type de média">' +
        '<label><input type="radio" name="kfm-type" value="image"> 🖼 Image</label>' +
        '<label><input type="radio" name="kfm-type" value="video"> 🎬 Vidéo</label></div>' +
        '<div data-pour="image">' +
        '<button type="button" class="kbo-fm__btn" data-act="image">Choisir une image…</button>' +
        '<div class="kbo-fm__etat" data-etat="image"></div></div>' +
        '<div data-pour="video">' +
        '<div class="kbo-fm__label">Mode de lecture</div>' +
        '<div class="kbo-fm__choix kbo-fm__choix--mode" role="radiogroup" aria-label="Mode de lecture">' +
        '<label><input type="radio" name="kfm-mode" value="fond"> <b>Fond</b><small>Lecture automatique, sans son, en boucle, sans boutons. Pour les grandes bandes et les ouvertures.</small></label>' +
        '<label><input type="radio" name="kfm-mode" value="lecteur"> <b>Lecteur</b><small>Un bouton de lecture rond, puis la vidéo avec le son. Pour les présentations et les témoignages.</small></label></div>' +
        '<div class="kbo-fm__label">D\'où vient la vidéo ?</div>' +
        '<div class="kbo-fm__choix" role="radiogroup" aria-label="Source de la vidéo">' +
        '<label><input type="radio" name="kfm-src" value="fichier"> Fichier MP4</label>' +
        '<label><input type="radio" name="kfm-src" value="youtube"> Lien YouTube</label>' +
        '<label><input type="radio" name="kfm-src" value="vimeo"> Lien Vimeo</label></div>' +
        '<div data-pour-src="fichier">' +
        '<button type="button" class="kbo-fm__btn" data-act="video">Envoyer la vidéo…</button>' +
        '<div class="kbo-fm__barre" hidden><span></span></div>' +
        '<div class="kbo-fm__etat" data-etat="video"></div>' +
        '<div class="kbo-fm__note">200 Mo au maximum. Le site réduit la vidéo tout seul (720p) et coupe le son des vidéos de fond. ' +
        'Pour une vidéo de plus de 2 minutes, mettez-la plutôt sur YouTube en « non répertorié » et collez son lien.</div></div>' +
        '<div data-pour-src="lien"><label class="kbo-fm__champ"><span>Lien de la vidéo</span>' +
        '<input type="url" data-champ="lien" placeholder="https://www.youtube.com/watch?v=…" autocomplete="off"></label>' +
        '<div class="kbo-fm__etat" data-etat="lien"></div>' +
        '<div class="kbo-fm__note">Pour une vidéo de fond, un fichier MP4 donne le rendu le plus propre (YouTube montre parfois son titre au démarrage).</div></div>' +
        '<div class="kbo-fm__label">Image d\'aperçu <em>(obligatoire)</em></div>' +
        '<div class="kbo-fm__poster"><img alt="" data-poster><div>' +
        '<button type="button" class="kbo-fm__lien" data-act="poster-origine">Garder l\'image actuelle</button>' +
        '<button type="button" class="kbo-fm__lien" data-act="poster-video" hidden>Prendre une image de la vidéo</button>' +
        '<button type="button" class="kbo-fm__lien" data-act="poster">Choisir une autre image…</button>' +
        '<div class="kbo-fm__note">Elle s\'affiche pendant le chargement, sur connexion lente, et si la vidéo ne peut pas être lue.</div></div></div>' +
        '<label class="kbo-fm__champ" data-pour-mode="lecteur"><span>Titre de la vidéo</span><input type="text" data-champ="titre" maxlength="160"></label>' +
        '</div>' +
        '<label class="kbo-fm__champ"><span>Texte alternatif <small>— une phrase qui décrit le média, pour les personnes qui ne le voient pas</small></span>' +
        '<input type="text" data-champ="alt" maxlength="300"></label>' +
        '</div><div class="kbo-fm__col kbo-fm__col--apercu">' +
        '<div class="kbo-fm__label">Aperçu de l\'emplacement</div>' +
        '<div class="kbo-fm__apercu zoom-cadre zoom-vu"></div>' +
        '<div class="kbo-fm__note">C\'est ce que verront vos visiteurs, dans le même cadre. Sur connexion lente ou en économie de données, seule l\'image d\'aperçu s\'affiche.</div>' +
        '</div></div>' +
        '<div class="kbo-fm__pied">' +
        '<button type="button" class="kbo-fm__lien kbo-fm__revenir" data-act="revenir">↺ Revenir à l\'image d\'origine</button>' +
        '<div class="kbo-fm__erreur" role="alert"></div>' +
        '<button type="button" class="kbo-fm__btn kbo-fm__btn--sec" data-act="annuler">Annuler</button>' +
        '<button type="button" class="kbo-fm__btn kbo-fm__btn--ok" data-act="ok">Enregistrer</button>' +
        '</div></div>';
      document.body.appendChild(fm);
      document.body.classList.add("kbo-fm-ouverte");
      const q = sel => fm.querySelector(sel);
      const qa = sel => [...fm.querySelectorAll(sel)];
      const champ = n => q('[data-champ="' + n + '"]');
      champ("alt").value = st.alt;
      champ("titre").value = st.titre;
      champ("lien").value = lienAffiche(st.lien);

      // Aperçu : même proportion que l'emplacement sur la page.
      const apercu = q(".kbo-fm__apercu");
      const cadre = o.cadre || o.img;
      let ratio = cadre && cadre.offsetHeight ? cadre.offsetWidth / cadre.offsetHeight : 16 / 9;
      if (!isFinite(ratio) || ratio <= 0) ratio = 16 / 9;
      apercu.style.aspectRatio = String(ratio);
      apercu.style.width = "min(100%, " + Math.round(320 * ratio) + "px)";

      function etat(nom, texte, genre) {
        const el = q('[data-etat="' + nom + '"]');
        el.textContent = texte || "";
        el.className = "kbo-fm__etat" + (genre ? " kbo-fm__etat--" + genre : "");
      }
      function barre(p) {
        const b = q(".kbo-fm__barre");
        b.hidden = p === false;
        b.classList.toggle("est-indeterminee", p === null);
        if (typeof p === "number") b.firstChild.style.width = Math.round(p * 100) + "%";
      }
      function valeur() {
        if (st.type === "image") return st.image ? { type: "image", src: st.image, alt: st.alt.trim() } : null;
        const src = st.source === "fichier" ? st.fichier : (st.lien && st.lien.source === st.source ? st.lien.src : "");
        if (!src) return null;
        return { type: "video", source: st.source, src: src, poster: st.poster, mode: st.mode, alt: st.alt.trim(), titre: st.titre.trim() };
      }
      function probleme() {
        if (st.occupe) return "Patientez : la vidéo est en cours de préparation.";
        if (st.type === "image") {
          if (!st.image) return "Choisissez une image.";
        } else {
          if (st.source === "fichier" && !st.fichier) return "Envoyez le fichier vidéo (MP4).";
          if (st.source !== "fichier" && !(st.lien && st.lien.source === st.source)) return "Collez le lien " + (st.source === "youtube" ? "YouTube" : "Vimeo") + " de la vidéo.";
          if (!st.poster) return "Choisissez l'image d'aperçu.";
          if (st.mode === "lecteur" && !st.titre.trim()) return "Donnez un titre à la vidéo.";
        }
        if (!st.alt.trim()) return "Écrivez le texte alternatif (une phrase qui décrit le média).";
        return "";
      }
      let tApercu, cleApercu = null;
      function rendreApercu() {
        clearTimeout(tApercu);
        tApercu = setTimeout(() => {
          const v = valeur();
          const cle = JSON.stringify(v);
          if (cle === cleApercu) return;
          cleApercu = cle;
          apercu.innerHTML = "";
          const img = document.createElement("img");
          img.src = window.KBO.cheminAbsolu(origine);
          img.alt = "";
          apercu.appendChild(img);
          window.KBO.appliquerMedia(img, v);
        }, 300);
      }
      function maj() {
        qa('[name="kfm-type"]').forEach(r => { r.checked = r.value === st.type; });
        qa('[name="kfm-mode"]').forEach(r => { r.checked = r.value === st.mode; });
        qa('[name="kfm-src"]').forEach(r => { r.checked = r.value === st.source; });
        qa("[data-pour]").forEach(el => { el.hidden = el.getAttribute("data-pour") !== st.type; });
        q('[data-pour-src="fichier"]').hidden = st.source !== "fichier";
        q('[data-pour-src="lien"]').hidden = st.source === "fichier";
        q('[data-pour-mode="lecteur"]').hidden = st.mode !== "lecteur";
        champ("lien").placeholder = st.source === "vimeo" ? "https://vimeo.com/…" : "https://www.youtube.com/watch?v=…";
        const pi = q("[data-poster]");
        pi.hidden = !st.poster;
        if (st.poster) pi.src = window.KBO.cheminAbsolu(st.poster);
        q('[data-act="poster-video"]').hidden = !st.posterVideo;
        q('[data-act="poster-origine"]').hidden = !origine;
        q(".kbo-fm__revenir").hidden = !o.peutRevenir;
        q('[data-act="ok"]').disabled = st.occupe;
        if (st.type === "image" && st.image) etat("image", "Image choisie ✓", "ok");
        if (st.type === "video" && st.source === "fichier" && st.fichier && !st.occupe && !q('[data-etat="video"]').textContent) etat("video", "Vidéo en place ✓", "ok");
        if (st.sansSon && st.mode === "lecteur") etat("video", "Cette vidéo a été préparée sans le son (mode « Fond »). Pour l'avoir avec le son, renvoyez le fichier.", "attention");
        q(".kbo-fm__erreur").textContent = "";
        rendreApercu();
      }
      function lienSaisi() {
        const txt = champ("lien").value.trim();
        const l = lireLien(txt);
        if (!txt) { st.lien = null; etat("lien", ""); }
        else if (!l) { st.lien = null; etat("lien", "Lien non reconnu. Copiez l'adresse de la vidéo depuis YouTube ou Vimeo.", "err"); }
        else {
          st.lien = l;
          if (l.source !== st.source) st.source = l.source;
          etat("lien", "Lien " + (l.source === "youtube" ? "YouTube" : "Vimeo") + " reconnu ✓", "ok");
        }
        maj();
      }
      function suivre(job) {
        return new Promise((res, rej) => {
          if (job.error) { rej(new Error(job.error)); return; }
          if (job.etat === "pret") { res(job); return; }
          const t0 = Date.now();
          const tic = () => fetch("/api/media/compresser?id=" + encodeURIComponent(job.id))
            .then(r => r.json())
            .then(j => {
              if (j.etat === "pret") return res(j);
              if (j.etat === "erreur") return rej(new Error("La vidéo n'a pas pu être préparée. Essayez un autre fichier MP4, ou passez par un lien YouTube."));
              if (j.etat === "inconnu") return rej(new Error("Le site a redémarré pendant la préparation : renvoyez la vidéo."));
              const sec = Math.round((Date.now() - t0) / 1000);
              etat("video", (j.etat === "attente" ? "En attente : une autre vidéo est en préparation… " : "Préparation de la vidéo pour le web… ") + sec + " s");
              setTimeout(tic, 2000);
            })
            .catch(() => setTimeout(tic, 4000));
          setTimeout(tic, 1500);
        });
      }
      async function envoyerVideo() {
        const f = await choisirFichier("video/mp4,video/quicktime,video/webm,.mp4,.mov,.m4v,.webm");
        if (!f) return;
        if (f.size > MAX_VIDEO) {
          etat("video", "Ce fichier fait " + mo(f.size) + " : c'est plus que la limite de 200 Mo. Mettez la vidéo sur YouTube en « non répertorié », puis choisissez « Lien YouTube » et collez son lien.", "err");
          return;
        }
        st.occupe = true; maj();
        barre(0); etat("video", "Envoi de la vidéo… 0 %");
        try {
          const up = await envoyerFichier(f, p => { barre(p); etat("video", "Envoi de la vidéo… " + Math.round(p * 100) + " %"); });
          if (up.kind !== "video") throw new Error("Ce fichier n'est pas une vidéo.");
          barre(null);
          etat("video", "Préparation de la vidéo pour le web… cela peut prendre quelques minutes.");
          const r = await fetch("/api/media/compresser", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: up.path, mode: st.mode, titre: f.name }),
          });
          const fin = await suivre(await r.json());
          st.fichier = fin.path;
          st.sansSon = st.mode === "fond" && !fin.sans_compression;
          if (fin.poster) { st.posterVideo = fin.poster; if (!st.posterChoisi) st.poster = fin.poster; }
          let t = "Vidéo prête ✓";
          if (fin.apres) t += " — " + mo(fin.apres) + (fin.avant && fin.avant > fin.apres ? " au lieu de " + mo(fin.avant) : "");
          if (fin.longue) t += ". Elle dure plus de 2 minutes : pour une vidéo longue, YouTube en « non répertorié » est plus léger pour le site.";
          etat("video", t, fin.longue ? "attention" : "ok");
        } catch (e) {
          etat("video", e.message || "Échec de l'envoi.", "err");
        } finally {
          st.occupe = false; barre(false); maj();
        }
      }
      async function envoyerImage(versPoster) {
        const f = await choisirFichier("image/png,image/jpeg,image/webp,image/gif");
        if (!f) return;
        const nom = versPoster ? "video" : "image";
        if (!versPoster) etat("image", "Envoi de l'image…");
        try {
          const up = await envoyerFichier(f);
          if (up.kind !== "image") throw new Error("Ce fichier n'est pas une image.");
          if (versPoster) { st.poster = up.path; st.posterChoisi = true; }
          else st.image = up.path;
        } catch (e) {
          etat(nom, e.message || "Échec de l'envoi.", "err");
        }
        maj();
      }
      function fermer() {
        clearTimeout(tApercu);
        document.removeEventListener("keydown", clavier, true);
        fm.remove();
        document.body.classList.remove("kbo-fm-ouverte");
        if (ouvreur && ouvreur.focus) ouvreur.focus();
      }
      function enregistrer(v) {
        const b = q('[data-act="ok"]');
        b.disabled = true;
        Promise.resolve(o.enregistrer(v))
          .then(fermer)
          .catch(err => { q(".kbo-fm__erreur").textContent = (err && err.message) || "Échec de l'enregistrement."; b.disabled = false; });
      }
      function clavier(e) {
        if (e.key === "Escape" && !st.occupe) { e.preventDefault(); fermer(); }
        if (e.key === "Tab") {           // le clavier reste dans la fenêtre
          const f = qa("button:not([hidden]):not(:disabled), input:not([hidden])").filter(el => el.offsetParent);
          if (!f.length) return;
          if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        }
      }
      document.addEventListener("keydown", clavier, true);
      fm.addEventListener("change", e => {
        const t = e.target;
        if (t.name === "kfm-type") st.type = t.value;
        if (t.name === "kfm-mode") st.mode = t.value;
        if (t.name === "kfm-src") { st.source = t.value; if (st.source !== "fichier") lienSaisi(); }
        maj();
      });
      champ("lien").addEventListener("input", lienSaisi);
      champ("alt").addEventListener("input", e => { st.alt = e.target.value; });
      champ("titre").addEventListener("input", e => { st.titre = e.target.value; });
      fm.addEventListener("click", e => {
        if (e.target === fm && !st.occupe) { fermer(); return; }
        const b = e.target.closest("[data-act]");
        if (!b) return;
        const act = b.getAttribute("data-act");
        if (act === "annuler") { if (!st.occupe || confirm("Une vidéo est en cours de préparation. Fermer quand même ?")) fermer(); }
        else if (act === "image") envoyerImage(false);
        else if (act === "video") envoyerVideo();
        else if (act === "poster") envoyerImage(true);
        else if (act === "poster-origine") { st.poster = origine; st.posterChoisi = true; maj(); }
        else if (act === "poster-video") { st.poster = st.posterVideo; st.posterChoisi = true; maj(); }
        else if (act === "revenir") enregistrer(null);
        else if (act === "ok") {
          const pb = probleme();
          if (pb) { q(".kbo-fm__erreur").textContent = pb; return; }
          enregistrer(valeur());
        }
      });
      if (st.source !== "fichier" && st.lien) etat("lien", "Lien " + (st.lien.source === "youtube" ? "YouTube" : "Vimeo") + " reconnu ✓", "ok");
      maj();
      const premier = q('[name="kfm-type"]:checked') || q('[name="kfm-type"]');
      if (premier) premier.focus();
    }

    let ft;
    function hint(msg, kind) {
      const h = $("abHint");
      h.textContent = msg;
      h.style.color = kind === "ok" ? "#8fe3b0" : kind === "err" ? "#ffb4ad" : "";
      if (kind) { clearTimeout(ft); ft = setTimeout(() => { h.style.color = ""; h.textContent = editing ? "Cliquez un texte pour le modifier." : ""; }, 2200); }
    }
  }

  if (document.body.classList.contains("is-admin")) init();
  document.addEventListener("kbo:admin", init);
})();
