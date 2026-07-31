# Plan de réponse aux incidents de sécurité — kawa-salaries

Document de référence en cas d'incident de sécurité suspecté ou avéré (compte compromis, fuite de données, fraude, site piraté). À garder à portée de main — imprimé ou accessible hors ligne si possible, au cas où l'incident toucherait l'accès aux outils eux-mêmes.

## Contacts

- **Thomas Flichy** — thomas.flichy@kawa.coffee
- **Damien Flichy** — signataire du contrat de paiement Crédit Agricole/CAWL
- **CAWL / Crédit Agricole** — conformité : commerçants_conformité_pcidss@ca-ps.com ; support technique/transactions : portail marchand CAWL
- **Supabase** — support via le dashboard (Project Settings → Support)
- **Vercel** — support via le dashboard
- **CNIL** (obligations RGPD) — téléservice de notification de violation de données sur cnil.fr

## Que faire selon le type d'incident

### 1. Compte admin compromis (mot de passe volé ou deviné)

1. Supabase Dashboard → Authentication → Users : retrouver le compte concerné.
2. Révoquer ses sessions actives ("Sign out user" depuis le dashboard) et/ou supprimer le compte si nécessaire.
3. Vérifier l'historique récent dans `/admin/commandes` (remboursements, changements de statut) pour repérer toute activité suspecte.
4. Vérifier la variable d'environnement `KAWA_ADMIN_EMAILS` (Vercel) — s'assurer qu'aucune adresse non autorisée n'a été ajoutée.
5. Si le MFA était activé sur ce compte, le désactiver puis le refaire enrôler après vérification d'identité (jamais par le canal potentiellement compromis).
6. Changer le mot de passe une fois la menace écartée.

### 2. Fuite de données / accès non autorisé à la base

1. Si possible, couper l'accès immédiatement (désactiver temporairement la clé API dans Supabase → Settings → API, ou mettre le site en maintenance depuis Vercel).
2. Identifier l'étendue : quelles tables, combien de personnes concernées.
3. Si des données personnelles de salariés sont concernées (nom, adresse, email) → **obligation RGPD de notifier la CNIL sous 72h**.
4. Si le risque est élevé ou touche un grand nombre de personnes → notifier aussi les personnes concernées directement.
5. Documenter : date de découverte, comment, quelles données, mesures prises — nécessaire pour la notification CNIL et pour la mémoire interne.

### 3. Activité de paiement suspecte / fraude

1. Contacter CAWL/Crédit Agricole immédiatement via le portail marchand.
2. Repérer dans `/admin/commandes` les commandes suspectes (montants inhabituels, remboursements en rafale).
3. Suspendre le ou les comptes salarié concernés (`/admin/comptes` → fiche salarié → "Suspendre ce compte").
4. Ne jamais rembourser sous pression avant d'avoir vérifié la légitimité de la demande.

### 4. Site compromis / code malveillant injecté

1. Vercel → onglet Deployments → revenir à un déploiement antérieur connu sain ("Instant Rollback").
2. Vérifier les commits récents sur GitHub pour toute modification non reconnue.
3. Changer immédiatement les mots de passe/clés : GitHub, Vercel, Supabase, CAWL.
4. Vérifier les paramètres d'accès du repository GitHub (collaborateurs, tokens).

## Sauvegardes et continuité

- Supabase effectue des sauvegardes automatiques selon le plan souscrit — vérifier la fréquence et la fenêtre de rétention dans Project Settings → Database → Backups.
- Vercel conserve l'historique de tous les déploiements — rollback possible en quelques secondes.
- En cas d'indisponibilité de CAWL : le site reste consultable, mais aucune commande ne peut être payée — prévenir les salariés par une bannière si l'indisponibilité dépasse quelques heures.

## Obligations légales

- **RGPD** : notification CNIL sous 72h en cas de violation de données personnelles (voir section 2).
- **PCI-DSS** : kawa-salaries ne stocke jamais de données de carte (SAQ A, redirection intégrale vers CAWL) — en cas de compromission de données de carte, la responsabilité de notification incombe d'abord à CAWL, mais KAWA doit les informer immédiatement si l'incident touche son propre site.

## Révision

À relire et mettre à jour à chaque changement significatif d'architecture (nouveau prestataire, changement de mode de paiement) et au minimum une fois par an, en lien avec le renouvellement annuel du SAQ A.
