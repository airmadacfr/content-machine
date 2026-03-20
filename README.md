# Content Machine — rmadrid_actu

Transforme un tweet en script TikTok viral + images pour CapCut.

## Stack
- **Frontend** : Next.js / React
- **Backend** : Next.js API Route (serverless)
- **IA** : Gemini 2.5 Pro (Google, free tier)
- **Hébergement** : Vercel (gratuit)

## Déploiement sur Vercel

### Étape 1 : Push sur GitHub
1. Crée un nouveau repo sur github.com → bouton "New repository"
2. Nomme-le `content-machine`
3. Laisse-le en Public ou Private (au choix)
4. Ne coche rien (pas de README, pas de .gitignore)
5. Clique "Create repository"
6. Upload tous les fichiers de ce dossier dans le repo

### Étape 2 : Déployer sur Vercel
1. Va sur vercel.com et connecte-toi avec ton compte GitHub
2. Clique "Add New Project"
3. Sélectionne le repo `content-machine`
4. **IMPORTANT** : Avant de cliquer Deploy, ajoute la variable d'environnement :
   - Clique "Environment Variables"
   - Name: `GEMINI_API_KEY`
   - Value: ta clé API Gemini
5. Clique "Deploy"
6. Attends ~1 minute, ton app est en ligne !

### Étape 3 : Utiliser
- Vercel te donne une URL du type `content-machine.vercel.app`
- Ouvre cette URL, colle ton tweet, génère ton script !
