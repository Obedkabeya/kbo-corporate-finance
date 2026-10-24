"""Pôle « Initiative Jeunes Entreprenants » (IJE) — module séparé de l'école.

Accompagnement des jeunes entrepreneurs informels : structurer, piloter, financer.
Le pôle a son propre menu, ses pages (/jeunes-entreprenants/…), ses formulaires et
ses données. Pour les visiteurs, l'école et le pôle sont deux sites séparés : aucun
ne mène à l'autre. Seul l'administrateur connecté voit la barre de bascule entre les deux.
Le site du pôle présente la vision et la démarche : pas de prix, pas de fiches
(ces éléments se traitent en privé).

Tant que le pôle n'est pas validé (réglage « public » à faux) :
  - ses pages ne s'ouvrent qu'avec le lien de prévisualisation (ou pour l'administrateur) ;
  - toutes portent la balise noindex ;
  - la barre de bascule n'apparaît qu'aux mêmes personnes.

Les données (demandes de diagnostic, demandes partenaires) sont personnelles :
réservées à l'administrateur, stockées dans la base du serveur, jamais sur GitHub.
"""
import csv
import html as _html
import io
import os
import re
import secrets
import uuid
from datetime import datetime
from urllib.parse import urlparse, parse_qs

S = {}                      # fonctions et réglages du serveur (voir installer)
PREFIXE = "/jeunes-entreprenants"
COOKIE = "kbo_apercu_ije"

FICHIERS = {"config": "ije-config.json", "demandes": "ije-demandes.json",
            "partenaires": "ije-partenaires.json", "ressources": "ije-ressources.json"}

STATUTS = ["nouveau", "contacté", "diagnostic fait", "en Structuration", "abandonné"]
ACTIVITES = ["Pâtisserie et cuisine", "Jus et boissons", "Couture et mode", "Coiffure et beauté",
             "Commerce", "Artisanat", "Autre"]
TYPES_PARTENAIRE = ["SFD (microfinance)", "Banque", "Institution publique", "Bailleur ou programme", "Entreprise", "Autre"]

# Les tarifs ne sont pas validés : masqués par défaut (« Tarif communiqué lors du diagnostic »).
TARIF_MASQUE = "Tarif communiqué lors du diagnostic"
DEFAUT_CONFIG = {
    "nom": "Initiative Jeunes Entreprenants", "sigle": "IJE",
    "public": False, "jeton": "", "tarifs_actifs": False,
    "tarifs": {"declic": "15 000 FCFA", "structuration": "Dès 25 000 FCFA / mois",
               "etudiant": "Tarif réduit", "formalisation": "Incluse dans Structuration",
               "financement": "Sur devis", "croissance": "Sur devis"},
}
NOMS_TARIFS = {"declic": "Déclic", "structuration": "Structuration", "etudiant": "Structuration Étudiant",
               "formalisation": "Formalisation", "financement": "Financement", "croissance": "Croissance"}


def installer(g):
    """Appelé par server.py : donne accès à ses fonctions (lecture/écriture, e-mail…)."""
    S.update(g)


def _f(cle):
    return os.path.join(S["DATA_DIR"], FICHIERS[cle])


def _maintenant():
    return datetime.utcnow().isoformat() + "Z"


def config():
    c = S["_read_json"](_f("config"), {})
    if not isinstance(c, dict):
        c = {}
    out = dict(DEFAUT_CONFIG)
    out.update({k: v for k, v in c.items() if k in DEFAUT_CONFIG})
    t = dict(DEFAUT_CONFIG["tarifs"]); t.update(c.get("tarifs") or {}); out["tarifs"] = t
    if not out.get("jeton"):
        out["jeton"] = secrets.token_urlsafe(18)
        S["_write_json"](_f("config"), out)
    return out


def _sauver_config(c):
    S["_write_json"](_f("config"), c)


PAGES_PUBLIQUES = ("", "/parcours", "/offres", "/partenaires", "/diagnostic", "/mentions-legales", "/confidentialite")


def pages_publiques():
    """Adresses du pôle pour le plan du site (seulement une fois le pôle public)."""
    return [PREFIXE + p for p in PAGES_PUBLIQUES] if config().get("public") else []


def lien_apercu(h):
    base = S["_public_url"]() or h._public_base()
    return base + PREFIXE + "?apercu=" + config()["jeton"]


def autorise(h):
    """Le visiteur peut-il voir le pôle ? (public, administrateur, ou lien de prévisualisation)"""
    c = config()
    if c.get("public"):
        return True
    if h._is_admin():
        return True
    jeton = h._get_cookie(COOKIE) or ""
    return bool(jeton) and secrets.compare_digest(jeton, c["jeton"])


# ---------------------------------------------------------------------------
# Fiches pratiques (Ressources) — texte simple, modifiable dans l'administration.
# Syntaxe : paragraphes séparés par une ligne vide ; « ## » = sous-titre ;
# « - » = puce ; **gras** ; [texte](adresse) ; [[à vérifier : …]] = note cachée
# (commentaire HTML, invisible pour le visiteur).
# ---------------------------------------------------------------------------
FIN_FICHE = "Contenu informatif. Pour ta situation précise, demande un diagnostic."

RESSOURCES_DEFAUT = [
    {"slug": "statut-entreprenant",
     "titre": "Le statut de l'entreprenant : c'est quoi, combien ça coûte, comment s'enregistrer",
     "resume": "Le statut le plus simple pour exister officiellement, pensé pour les petites activités.",
     "texte": """Tu vends déjà, tu as des clients, mais ton activité n'existe sur aucun papier. Le **statut de l'entreprenant** est fait pour toi : c'est le statut le plus simple pour exister officiellement, prévu par le droit OHADA pour les petites activités. Le Bénin a été le premier pays à le mettre en œuvre, dès 2015.

## C'est quoi ?
- Un statut pour les personnes qui exercent seules une petite activité : commerce, artisanat, services.
- Tu gardes ton activité telle qu'elle est : tu deviens simplement visible et reconnu.
- Tu obtiens des documents officiels et un numéro d'identification fiscale (IFU).

## Combien ça coûte ?
- La déclaration d'entreprenant est gratuite dans le texte OHADA. [[à vérifier : gratuité de l'enregistrement au Bénin, auprès de l'APIEx]]
- Côté impôts, l'entreprenant relève de la Taxe professionnelle synthétique (TPS) : un impôt unique et simplifié pour les petites activités. [[à vérifier : montants de la TPS et éventuelle exonération de début d'activité, auprès de la DGI]]
- La TPS concerne les activités dont le chiffre d'affaires reste sous un plafond. [[à vérifier : plafond de 50 millions FCFA indiqué dans notre document de référence]]

## Ce que tu dois faire ensuite
- Tenir un livre des recettes et des dépenses : c'est ton cahier de caisse.
- Le garder au moins 5 ans.
- Si ton chiffre d'affaires dépasse le plafond deux années de suite, tu changes de statut : on t'accompagne à ce moment-là.

## Comment s'enregistrer ?
- L'enregistrement se fait en ligne, sur [monentreprise.bj](https://monentreprise.bj), le guichet de l'APIEx.
- Le paiement éventuel se fait par mobile money.
- Nous t'accompagnons à chaque étape : préparation des informations, démarche, compréhension de la TPS."""},
    {"slug": "cahier-de-caisse",
     "titre": "Tenir son cahier de caisse en 5 minutes par jour",
     "resume": "Le geste le plus simple pour savoir, enfin, si ton activité gagne de l'argent.",
     "texte": """Tu ne sais pas exactement combien tu gagnes ? C'est normal quand rien n'est noté. Le cahier de caisse règle ce problème en 5 minutes par jour.

## Le principe
Chaque jour, tu notes tout ce qui entre et tout ce qui sort pour ton activité. Rien de plus.

## Ce que tu notes, à chaque mouvement
- La date.
- Ce que c'est : « vente de 10 gâteaux », « achat de farine », « transport ».
- Le montant qui entre (une vente) ou qui sort (un achat, une dépense).
- Le solde : ce qu'il reste dans la caisse de l'activité.

## Les bons réflexes
- Note tout de suite, même les petites sommes : ce sont elles qui s'accumulent.
- Les ventes payées par mobile money comptent aussi : reprends-les depuis l'historique de ton téléphone.
- Ne mélange pas : ce que tu prends pour toi est une sortie, notée « prélèvement personnel ».
- Le soir, compte ta caisse : le montant doit correspondre au solde du cahier.

## Pourquoi c'est important
- Tu vois enfin si ton activité gagne de l'argent.
- C'est l'obligation légale de l'entreprenant : un livre des recettes et des dépenses.
- C'est la première preuve que tu sais gérer, celle que regardent les prêteurs.

## Le modèle à imprimer
[Télécharger le modèle de cahier de caisse (PDF)](/jeunes-entreprenants/cahier-de-caisse.pdf)"""},
    {"slug": "tontine",
     "titre": "La tontine, oui — mais la bonne : pourquoi cotiser chez un SFD agréé",
     "resume": "Cotiser chaque jour est une excellente habitude. Encore faut-il que ton argent soit protégé.",
     "texte": """Cotiser chaque jour est une très bonne habitude : c'est la preuve que tu sais épargner. Mais toutes les tontines ne se valent pas.

## Ce qui est interdit
- Depuis 2022, la collecte publique de type « Adogbè » pratiquée par des collecteurs non agréés est interdite au Bénin.
- La raison : ton argent n'y est pas protégé. Si le collecteur disparaît, tu perds tout.

## Ce qui est permis
- La tontine en elle-même n'est pas interdite : c'est sa collecte publique sans agrément qui l'est.
- Les SFD agréés (les institutions de microfinance autorisées), les banques et La Poste peuvent proposer la collecte journalière.
- Par exemple, certains SFD envoient des agents qui passent chaque jour, avec un reçu à chaque versement. [[à vérifier : exemple FECECAM « Épargne planifiée digitale », dès 200 FCFA par jour, avant de le citer]]

## Pourquoi c'est mieux pour toi
- Ton épargne est protégée, dans une institution contrôlée.
- Chaque versement laisse une trace : un reçu, un relevé.
- Ces traces deviennent la preuve de ta discipline d'épargne, que les prêteurs regardent.
- Tu gardes la même habitude : cotiser chaque jour.

## Ce que nous faisons, et ce que nous ne faisons pas
- Nous ne collectons jamais d'argent, ne gérons aucune tontine et ne prêtons pas d'argent.
- Ton argent passe toujours par une institution agréée. Nous t'aidons à en faire une preuve."""},
    {"slug": "separer-son-argent",
     "titre": "Séparer son argent et celui de son activité",
     "resume": "Deux caisses au lieu d'une : le premier pas vers une activité qui grandit.",
     "texte": """Quand l'argent de l'activité et ton argent de poche sont dans la même poche, il est impossible de savoir si ton activité gagne de l'argent. La solution : deux caisses.

## Deux caisses, deux usages
- La caisse de l'activité : les ventes y entrent, les achats pour l'activité en sortent.
- Ton argent personnel : tes dépenses à toi (repas, transport personnel, téléphone, famille).

## Comment faire concrètement
- Utilise deux enveloppes, deux boîtes ou deux comptes mobile money différents.
- Fixe-toi une « paie » : une somme régulière que l'activité te verse, par exemple chaque semaine.
- Quand tu prends de l'argent dans la caisse de l'activité, note-le comme « prélèvement personnel » dans ton cahier.

## Ce que ça change
- Tu sais enfin ce que ton activité rapporte vraiment.
- Tu évites de « manger » ton fonds de roulement sans t'en rendre compte.
- Tu montres à un prêteur que tu sais distinguer les deux : c'est un point fort de ton dossier."""},
    {"slug": "prix-de-revient",
     "titre": "Calculer le prix de revient de ses produits",
     "resume": "Savoir combien te coûte vraiment un produit, pour fixer un prix qui te fait gagner de l'argent.",
     "texte": """Beaucoup de jeunes vendent beaucoup… et ne gagnent presque rien, parce que leur prix ne couvre pas tous leurs coûts. Le prix de revient, c'est ce que te coûte vraiment un produit.

## Ce qu'il faut compter
- Les matières premières : farine, sucre, fruits, tissu, mèches…
- L'emballage : boîtes, bouteilles, sachets, étiquettes.
- L'énergie : gaz, charbon, électricité.
- Le transport pour acheter et pour livrer.
- Une part du matériel qui s'use (four, machine, ustensiles).
- Ton temps : il a une valeur, même si tu travailles seul.

## Un exemple simple
- Tu fais 20 gâteaux avec un sac d'ingrédients, du gaz et des boîtes.
- Tu additionnes tout ce que tu as payé pour ces 20 gâteaux.
- Tu divises par 20 : c'est le prix de revient d'un gâteau.
- Ton prix de vente doit être au-dessus, pour te laisser une marge.

## Les bons réflexes
- Recalcule quand les prix de tes matières premières changent.
- Compare ton prix de vente à ton prix de revient : la différence, c'est ce que tu gagnes vraiment sur chaque produit.
- Si la marge est trop faible, il faut agir : acheter mieux, réduire les pertes, ou ajuster le prix."""},
]


def ressources():
    r = S["_read_json"](_f("ressources"), None)
    if not isinstance(r, list) or not r:
        return [dict(x) for x in RESSOURCES_DEFAUT]
    return r


def _esc(t):
    return _html.escape(t, quote=True)


def rendu_fiche(texte):
    """Texte simple → HTML sûr (tout est échappé, puis quelques marques sont reconnues)."""
    def en_ligne(t):
        # Notes cachées « à vérifier » : commentaire HTML, invisible pour le visiteur.
        notes = []
        def garder(m):
            notes.append("<!-- " + _esc(m.group(1)).replace("--", "—") + " -->")
            return "\x00%d\x00" % (len(notes) - 1)
        t = re.sub(r"\[\[(.+?)\]\]", garder, t)
        t = _esc(t)
        t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
        def lien(m):
            url = _html.unescape(m.group(2))
            if not (url.startswith("/") or re.match(r"^https?://", url)):
                return m.group(1)
            ext = url.startswith("http")
            return '<a href="%s"%s>%s</a>' % (_esc(url), ' target="_blank" rel="noopener"' if ext else "", m.group(1))
        t = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", lien, t)
        return re.sub("\x00(\\d+)\x00", lambda m: notes[int(m.group(1))], t)
    blocs = [b.strip("\n") for b in re.split(r"\n\s*\n", (texte or "").replace("\r", "")) if b.strip()]
    out = []
    for b in blocs:
        lignes = b.split("\n")
        if lignes[0].startswith("## "):
            out.append("<h2>%s</h2>" % en_ligne(lignes[0][3:].strip()))
            lignes = lignes[1:]
            if not lignes:
                continue
        if all(l.strip().startswith("- ") for l in lignes if l.strip()):
            out.append("<ul>%s</ul>" % "".join("<li>%s</li>" % en_ligne(l.strip()[2:]) for l in lignes if l.strip()))
        else:
            out.append("<p>%s</p>" % "<br>".join(en_ligne(l) for l in lignes))
    return "\n".join(out)


# ---------------------------------------------------------------------------
# Remplacements dans les pages du pôle (nom réglable, tarifs masqués, noindex…)
# ---------------------------------------------------------------------------
def _remplacer(texte):
    c = config()
    texte = texte.replace("{{IJE_NOM}}", _esc(c["nom"])).replace("{{IJE_SIGLE}}", _esc(c["sigle"]))
    def tarif(m):
        cle = m.group(1)
        if c.get("tarifs_actifs") and c["tarifs"].get(cle):
            return _esc(c["tarifs"][cle])
        return TARIF_MASQUE
    texte = re.sub(r"\{\{TARIF:([a-z]+)\}\}", tarif, texte)
    phrase = ("Tarif du diagnostic&nbsp;: " + _esc(c["tarifs"].get("declic", "")) + "." if c.get("tarifs_actifs")
              else "Le tarif du diagnostic t'est communiqué lors de notre premier échange.")
    return texte.replace("{{PHRASE_TARIF_DECLIC}}", phrase)


def _est_page_ije(h):
    return urlparse(h.path).path.startswith(PREFIXE)


def injecter(h, texte, base):
    """Appelé par server.py pour chaque page HTML servie."""
    c = config()
    if _est_page_ije(h):
        texte = _remplacer(texte)
        if not c.get("public") and "noindex" not in texte:
            texte = texte.replace("</head>", '<meta name="robots" content="noindex, nofollow"></head>', 1)
        drapeau = '<script>window.__IJE__={nom:%s,sigle:%s,ebauche:%s,admin:%s};</script>' % (
            _json_str(c["nom"]), _json_str(c["sigle"]), "false" if c.get("public") else "true",
            "true" if h._is_admin() else "false")
        return texte.replace("</head>", drapeau + "</head>", 1)
    if base == "admin.html":
        if h._is_admin():
            texte = texte.replace("</body>", '<script src="/js/admin-ije.js"></script></body>', 1)
        return texte
    if not h._is_admin():
        return texte
    # Pages de l'école : barre de bascule entre les deux pôles, pour l'administrateur seulement.
    return texte.replace("</body>", '<script src="/js/bascule.js" data-nom="%s"></script></body>' % _esc(c["nom"]), 1)


def _json_str(s):
    import json
    return json.dumps(s, ensure_ascii=False).replace("</", "<\\/")


def _section_confidentialite(c):
    return ('<section class="block"><div class="wrap narrow legal">'
            '<h2>Pôle %s</h2>'
            '<p>Quand tu demandes un diagnostic ou que tu nous contactes depuis les pages « %s », nous recueillons '
            'les informations du formulaire (nom, téléphone, ville, âge, activité, attentes) pour te recontacter et '
            'préparer ton accompagnement.</p>'
            '<p>Ces données sont réservées à KBO Corporate Finance, conservées sur notre serveur et ne sont partagées '
            'avec personne sans ton accord écrit, y compris avec un prêteur. Tu peux demander à les consulter, '
            'les corriger ou les supprimer en nous écrivant depuis la page Contact.</p></div></section>') % (_esc(c["nom"]), _esc(c["nom"]))


# ---------------------------------------------------------------------------
# Requêtes GET / POST
# ---------------------------------------------------------------------------
def get(h, path):
    """Renvoie True si la requête a été traitée ici."""
    if path.startswith(PREFIXE):
        q = parse_qs(urlparse(h.path).query)
        jeton = (q.get("apercu") or [""])[0]
        if jeton:
            if secrets.compare_digest(jeton, config()["jeton"]):
                h.send_response(302)
                h.send_header("Location", path)
                h.send_header("Set-Cookie", "%s=%s; Path=/; HttpOnly; SameSite=Lax; Max-Age=%d%s" % (
                    COOKIE, jeton, 60 * 60 * 24 * 60, "; Secure" if h.headers.get("X-Forwarded-Proto") == "https" else ""))
                h.send_header("Content-Length", "0")
                h.end_headers()
                return True
        if not autorise(h):
            h._serve_static("/404.html")
            return True
        if path != PREFIXE and path.endswith("/"):
            h._redirect(path.rstrip("/"), permanent=True)
            return True
        if path.endswith(".html"):                           # adresses propres, comme le reste du site
            propre = path[:-5]
            h._redirect(PREFIXE if propre == PREFIXE + "/index" else propre, permanent=True)
            return True
        if path.startswith(PREFIXE + "/ressources") or path.endswith("/fiche") or path.endswith(".pdf"):
            h._serve_static("/404.html")          # fiches et prix : traités en privé, pas sur le site
            return True
        h._serve_static(path)
        return True
    if path == "/api/admin/ije":
        if not h._is_admin():
            return h._send_json({"error": "Non autorisé"}, 401) or True
        c = config()
        h._send_json({"config": c, "lienApercu": lien_apercu(h), "statuts": STATUTS, "nomsTarifs": NOMS_TARIFS,
                      "demandes": S["_read_json"](_f("demandes"), []), "partenaires": S["_read_json"](_f("partenaires"), []),
                      "ressources": ressources()})
        return True
    if path in ("/api/admin/ije/demandes.csv", "/api/admin/ije/partenaires.csv"):
        if not h._is_admin():
            return h._send_json({"error": "Non autorisé"}, 401) or True
        _csv(h, "demandes" if "demandes" in path else "partenaires")
        return True
    return False


def post(h, path):
    if path == "/api/ije/diagnostic":
        _demande_diagnostic(h)
        return True
    if path == "/api/ije/partenaire":
        _demande_partenaire(h)
        return True
    if path == "/api/admin/ije":
        _admin_action(h)
        return True
    return False


def _page_fiche(h, slug):
    fiche = next((r for r in ressources() if r.get("slug") == slug), None)
    if not fiche:
        h._serve_static("/404.html")
        return
    gabarit = os.path.join(S["PUBLIC_DIR"], "jeunes-entreprenants", "fiche.html")
    try:
        with open(gabarit, encoding="utf-8") as f:
            texte = f.read()
    except OSError:
        h._serve_static("/404.html")
        return
    texte = (texte.replace("{{FICHE_TITRE}}", _esc(fiche.get("titre", "")))
                  .replace("{{FICHE_RESUME}}", _esc(fiche.get("resume", "")))
                  .replace("{{FICHE_CONTENU}}", rendu_fiche(fiche.get("texte", "")))
                  .replace("{{FICHE_FIN}}", _esc(FIN_FICHE)))
    corps = h._inject_default_og(texte.encode("utf-8"), 200)
    corps = h._inject_role(corps, h._is_admin(), "fiche.html")
    h.send_response(200)
    h.send_header("Content-Type", "text/html; charset=utf-8")
    h.send_header("Content-Length", str(len(corps)))
    h.send_header("Cache-Control", "no-store")
    h.end_headers()
    h.wfile.write(corps)


def _champ(data, cle, limite=200):
    return S["_clean"](data.get(cle), limite)


def _demande_diagnostic(h):
    if not autorise(h):
        return h._send_json({"error": "Introuvable"}, 404)
    ip = h._client_ip()
    if S["_too_many"]("ije:" + ip, 5, 3600):
        return h._send_json({"error": "Trop de demandes. Réessaie un peu plus tard."}, 429)
    d = h._read_body() or {}
    if _champ(d, "site"):                                    # champ piège invisible : robot
        return h._send_json({"ok": True})
    f = {k: _champ(d, k) for k in ("prenom", "nom", "telephone", "whatsapp", "email", "ville", "quartier",
                                    "age", "etudiant", "activite", "anciennete")}
    f["attentes"] = _champ(d, "attentes", 2000)
    manque = [n for k, n in (("prenom", "ton prénom"), ("nom", "ton nom"), ("telephone", "ton numéro de téléphone"),
                             ("ville", "ta ville"), ("age", "ton âge"), ("activite", "ton activité")) if not f[k]]
    if manque:
        return h._send_json({"error": "Indique " + ", ".join(manque) + "."}, 400)
    if f["email"] and not S["EMAIL_RE"].match(f["email"]):
        return h._send_json({"error": "Ton adresse e-mail ne semble pas valide."}, 400)
    if d.get("consentement") is not True:
        return h._send_json({"error": "Merci d'accepter que nous utilisions ces informations pour te recontacter."}, 400)
    S["_note_attempt"]("ije:" + ip)
    demande = dict(f, id=uuid.uuid4().hex[:10], date=_maintenant(), statut="nouveau", notes="", consentement=True)
    liste = S["_read_json"](_f("demandes"), [])
    liste.append(demande)
    S["_write_json"](_f("demandes"), liste)
    c = config()
    lignes = ["Nouvelle demande de diagnostic — %s" % c["nom"], ""]
    lignes += ["%s : %s" % (n, demande.get(k) or "—") for k, n in (
        ("prenom", "Prénom"), ("nom", "Nom"), ("telephone", "Téléphone"), ("whatsapp", "WhatsApp"), ("email", "E-mail"),
        ("ville", "Ville"), ("quartier", "Quartier"), ("age", "Âge"), ("etudiant", "Étudiant"), ("activite", "Activité"),
        ("anciennete", "Depuis"), ("attentes", "Attentes"))]
    lignes += ["", "Le détail est dans l'espace administrateur, onglet « Jeunes Entreprenants »."]
    try:
        S["_send_email"](S["_get_settings"]()["email"], "%s — nouvelle demande de diagnostic (%s %s)" % (
            c["sigle"], demande["prenom"], demande["nom"]), "\n".join(lignes), reply_to=demande.get("email") or None,
            entete=_entete_email)
    except Exception as e:  # noqa: BLE001
        print("  [IJE] e-mail non envoyé : %s" % e, flush=True)
    return h._send_json({"ok": True})


def _entete_email(base):
    """En-tête des e-mails du pôle : son logo (PNG, lu par toutes les messageries)."""
    return ('<img src="' + base + '/assets/logo-ije/logo-ije-email-600.png" width="260" height="68" '
            'alt="' + _esc(config()["nom"]) + ', by KBO Corporate Finance" '
            'style="display:block;border:0;width:260px;height:auto">')


def _demande_partenaire(h):
    if not autorise(h):
        return h._send_json({"error": "Introuvable"}, 404)
    ip = h._client_ip()
    if S["_too_many"]("ije-p:" + ip, 5, 3600):
        return h._send_json({"error": "Trop de demandes. Réessayez un peu plus tard."}, 429)
    d = h._read_body() or {}
    if _champ(d, "site"):
        return h._send_json({"ok": True})
    f = {k: _champ(d, k) for k in ("nom", "organisation", "type", "email", "telephone")}
    f["message"] = _champ(d, "message", 3000)
    if not (f["nom"] and f["organisation"] and f["message"]):
        return h._send_json({"error": "Indiquez votre nom, votre organisation et votre message."}, 400)
    if not f["email"] or not S["EMAIL_RE"].match(f["email"]):
        return h._send_json({"error": "Indiquez une adresse e-mail valide pour que nous puissions vous répondre."}, 400)
    S["_note_attempt"]("ije-p:" + ip)
    demande = dict(f, id=uuid.uuid4().hex[:10], date=_maintenant(), notes="")
    liste = S["_read_json"](_f("partenaires"), [])
    liste.append(demande)
    S["_write_json"](_f("partenaires"), liste)
    c = config()
    texte = "\n".join(["Nouvelle demande partenaire — %s" % c["nom"], ""] +
                      ["%s : %s" % (n, demande.get(k) or "—") for k, n in (
                          ("nom", "Nom"), ("organisation", "Organisation"), ("type", "Type"), ("email", "E-mail"),
                          ("telephone", "Téléphone"), ("message", "Message"))])
    try:
        S["_send_email"](S["_get_settings"]()["email"], "%s — demande partenaire (%s)" % (c["sigle"], demande["organisation"]),
                         texte, reply_to=demande["email"], entete=_entete_email)
    except Exception as e:  # noqa: BLE001
        print("  [IJE] e-mail non envoyé : %s" % e, flush=True)
    return h._send_json({"ok": True})


def _admin_action(h):
    if not h._is_admin():
        return h._send_json({"error": "Non autorisé"}, 401)
    d = h._read_body() or {}
    act = d.get("action")
    if act == "demande":
        liste = S["_read_json"](_f("demandes"), [])
        for x in liste:
            if x.get("id") == d.get("id"):
                if d.get("statut") in STATUTS:
                    x["statut"] = d["statut"]
                if "notes" in d:
                    x["notes"] = S["_clean"](d.get("notes"), 5000)
                x["modifie"] = _maintenant()
        S["_write_json"](_f("demandes"), liste)
        return h._send_json({"ok": True, "message": "Enregistré."})
    if act == "partenaire":
        liste = S["_read_json"](_f("partenaires"), [])
        for x in liste:
            if x.get("id") == d.get("id"):
                x["notes"] = S["_clean"](d.get("notes"), 5000)
        S["_write_json"](_f("partenaires"), liste)
        return h._send_json({"ok": True, "message": "Enregistré."})
    c = config()
    if act == "nom":
        nom, sigle = S["_clean"](d.get("nom"), 80), S["_clean"](d.get("sigle"), 12)
        if not nom or not sigle:
            return h._send_json({"error": "Indiquez le nom et le sigle."}, 400)
        c.update(nom=nom, sigle=sigle)
        _sauver_config(c)
        return h._send_json({"ok": True, "message": "Nom enregistré : il change partout sur le pôle."})
    if act == "tarifs":
        c["tarifs_actifs"] = d.get("actifs") is True
        for k in NOMS_TARIFS:
            if k in (d.get("tarifs") or {}):
                c["tarifs"][k] = S["_clean"](d["tarifs"][k], 80)
        _sauver_config(c)
        return h._send_json({"ok": True, "message": "Tarifs " + ("affichés." if c["tarifs_actifs"] else "enregistrés (masqués).")})
    if act == "ressource":
        liste = ressources()
        slug = d.get("slug")
        for r in liste:
            if r.get("slug") == slug:
                r["titre"] = S["_clean"](d.get("titre"), 200) or r["titre"]
                r["resume"] = S["_clean"](d.get("resume"), 400)
                r["texte"] = str(d.get("texte") or "")[:20000]
        S["_write_json"](_f("ressources"), liste)
        return h._send_json({"ok": True, "message": "Fiche enregistrée."})
    if act == "nouveau-lien":
        c["jeton"] = secrets.token_urlsafe(18)
        _sauver_config(c)
        return h._send_json({"ok": True, "message": "Nouveau lien créé : l'ancien ne fonctionne plus.", "lienApercu": lien_apercu(h)})
    return h._send_json({"error": "Action inconnue."}, 400)


def _csv(h, cle):
    liste = S["_read_json"](_f(cle), [])
    if cle == "demandes":
        cols = ["date", "statut", "prenom", "nom", "telephone", "whatsapp", "email", "ville", "quartier", "age",
                "etudiant", "activite", "anciennete", "attentes", "notes"]
    else:
        cols = ["date", "nom", "organisation", "type", "email", "telephone", "message", "notes"]
    tampon = io.StringIO()
    w = csv.writer(tampon, delimiter=";")
    w.writerow(cols)
    for x in liste:
        w.writerow([str(x.get(k) or "").replace("\n", " ") for k in cols])
    corps = ("﻿" + tampon.getvalue()).encode("utf-8")
    h.send_response(200)
    h.send_header("Content-Type", "text/csv; charset=utf-8")
    h.send_header("Content-Disposition", 'attachment; filename="ije-%s.csv"' % cle)
    h.send_header("Content-Length", str(len(corps)))
    h.send_header("Cache-Control", "no-store")
    h.end_headers()
    h.wfile.write(corps)
