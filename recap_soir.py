#!/usr/bin/env python3
"""Tâche du soir (20 h, heure du Bénin) : envoie à Obed le récapitulatif des
inscriptions à L'analyse du matin, seulement s'il y a eu du mouvement dans la
journée. Lancée par le minuteur kbo-recap.timer."""
import server

if __name__ == "__main__":
    server._ensure_data()
    print(server._analyse_recap_soir())
