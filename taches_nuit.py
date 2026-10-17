#!/usr/bin/env python3
"""Tâche de chaque nuit : retire le rôle Discord des accès expirés et remet
celui des accès actifs s'il manque. Lancée par le minuteur kbo-nuit.timer."""
import server

if __name__ == "__main__":
    server._ensure_data()
    for ligne in server._acces_nightly():
        print(ligne)
