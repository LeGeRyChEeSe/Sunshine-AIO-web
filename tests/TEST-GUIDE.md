# Guide de Test - Fonctionnalité Auto-Update

## Méthodes de test disponibles

### 1. Test avec script de simulation (`test-script.ps1`)
Ce script simule le processus de mise à jour sans effectuer de vraies modifications.

```powershell
# Test basique
.\test-script.ps1

# Test en ignorant la vérification
.\test-script.ps1 -SkipUpdateCheck

# Test avec un repository personnalisé
.\test-script.ps1 -TestRepo "https://github.com/VOTRE-USER/VOTRE-FORK.git"
```

### 2. Test de scénarios multiples (`test-scenarios.ps1`)
Script qui teste automatiquement différents cas d'usage.

```powershell
# Tester tous les scénarios
.\test-scenarios.ps1

# Tester un scénario spécifique
.\test-scenarios.ps1 -Scenario "updates"
.\test-scenarios.ps1 -Scenario "changes"
.\test-scenarios.ps1 -Scenario "branch"
```

### 3. Test manuel en conditions réelles

#### Option A: Fork temporaire
1. Créer un fork du repository principal
2. Modifier l'URL dans le script de test
3. Faire des commits sur le fork pour simuler des mises à jour
4. Tester le script

#### Option B: Repository local
```powershell
# Créer une copie locale pour test
git clone https://github.com/LeGeRyChEeSe/Sunshine-AIO.git test-sunshine-local
cd test-sunshine-local

# Simuler un état "ancien" en reculant de quelques commits
git reset --hard HEAD~3

# Tester la fonctionnalité
# Le script détectera qu'il y a 3 commits de retard
```

## Scénarios de test recommandés

### ✅ Scénario 1: Aucune mise à jour disponible
- **État**: Repository à jour
- **Résultat attendu**: Message "No updates available"

### ✅ Scénario 2: Mise à jour disponible
- **État**: Repository en retard de quelques commits
- **Résultat attendu**: Fenêtre de dialogue avec détails de la mise à jour

### ✅ Scénario 3: Modifications locales sur main
- **État**: Fichiers modifiés non commitées sur branche main
- **Résultat attendu**: Dialogue pour gérer les modifications

### ✅ Scénario 4: Sur une autre branche
- **État**: Sur une branche de développement
- **Résultat attendu**: Mise à jour uniquement sur main

### ✅ Scénario 5: Erreurs réseau
- **État**: Pas de connexion internet
- **Résultat attendu**: Message d'erreur gracieux

## Vérifications importantes

### Interface utilisateur
- [ ] Fenêtre de dialogue s'affiche correctement
- [ ] Informations de version affichées
- [ ] Changelog résumé visible
- [ ] Lien vers changelog complet fonctionnel
- [ ] Boutons Oui/Non réactifs

### Gestion des branches
- [ ] Détection correcte de la branche actuelle
- [ ] Gestion des modifications non commitées
- [ ] Création de branche de sauvegarde
- [ ] Retour à la branche originale après mise à jour

### Processus de mise à jour
- [ ] Fetch des dernières modifications
- [ ] Pull des changements
- [ ] Mise à jour des dépendances Python
- [ ] Redémarrage de l'application

## Logs et débogage

Les logs de test sont sauvegardés dans:
- `%TEMP%\sunshine-aio-install-test.log` (pour test-script.ps1)
- `%TEMP%\sunshine-aio-install.log` (pour script principal)

### Commandes utiles pour déboguer
```powershell
# Voir l'état git actuel
git status
git log --oneline -5

# Voir les différences avec remote
git fetch origin main
git log --oneline HEAD..origin/main

# Simuler un état ancien
git reset --hard HEAD~2

# Restaurer état récent
git reset --hard origin/main
```

## Conseils de test

1. **Commencer par les tests simulés** avant les tests réels
2. **Sauvegarder votre travail** avant les tests destructifs
3. **Tester sur une copie** du repository principal
4. **Vérifier les logs** après chaque test
5. **Tester les cas d'erreur** (réseau, permissions, etc.)

## Nettoyage après tests

```powershell
# Restaurer l'état original
git reset --hard origin/main
git clean -fd

# Supprimer les branches de test
git branch -D test-branch-*

# Supprimer les repositories de test
Remove-Item test-sunshine-* -Recurse -Force
```