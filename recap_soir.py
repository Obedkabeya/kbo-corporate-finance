#!/usr/bin/env python3
"""Tâche du soir (20 h, heure du Bénin) :
1. relance une seule fois les inscrits qui n'ont pas confirmé depuis 24 h ;
2. envoie à Obed le récapitulatif des inscriptions à L'analyse du matin,
   seulement s'il y a eu du mouvement dans la journée.
Lancée par le minuteur kbo-recap.timer."""
import server

if __name__ == "__main__":
    server._ensure_data()
    print(server._analyse_relances())
    print(server._analyse_recap_soir())
