#!/usr/bin/env python3
"""Tâche du matin (7 h 45 à 9 h, heure du Bénin) : envoie L'analyse du matin
aux inscrits confirmés dès que le fichier du jour est dans le dossier Drive.
Lancée toutes les 15 minutes par le minuteur kbo-analyse.timer."""
import server

if __name__ == "__main__":
    server._ensure_data()
    print(server._analyse_matin())
