#!/usr/bin/env bash
# Arrêter immédiatement l'exécution du script si une commande échoue
set -o errexit

# 1. Mettre à jour pip et installer les dépendances
python -m pip install --upgrade pip
pip install -r requirements.txt

# 2. Collecter les fichiers statiques (admin Django, CSS/JS) pour WhiteNoise
python manage.py collectstatic --no-input

# 3. Appliquer les migrations sur la base de données Neon
python manage.py migrate