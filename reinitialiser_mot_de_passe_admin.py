#!/usr/bin/env python3
"""Réinitialise le mot de passe de l'administration, depuis le serveur.

À utiliser si le mot de passe est perdu et que l'envoi d'e-mails ne marche pas.
Le mot de passe se tape au clavier : il ne s'affiche pas à l'écran, il n'est
écrit nulle part en clair, et seule son empreinte est enregistrée.
Tous les appareils connectés à l'administration sont ensuite déconnectés.

Sur le serveur Hostinger :  sudo kbo-reset-admin
En local (iMac)          :  python3 reinitialiser_mot_de_passe_admin.py
"""
import getpass
import sys

import server


def main():
    print("Nouveau mot de passe de l'administration KBO.")
    print("(Les caractères ne s'affichent pas pendant la saisie : c'est normal.)\n")
    for _ in range(3):
        pw = getpass.getpass("Nouveau mot de passe : ")
        problem = server._password_problem(pw)
        if problem:
            print("  ✗ " + problem + "\n")
            continue
        if getpass.getpass("Retapez-le pour confirmer : ") != pw:
            print("  ✗ Les deux saisies sont différentes.\n")
            continue
        server._ensure_data()
        server._set_password(pw)
        server._destroy_all_sessions()
        print("\n  ✓ Mot de passe changé. Vous pouvez vous connecter à l'administration.")
        return 0
    print("Abandon : rien n'a été modifié.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
