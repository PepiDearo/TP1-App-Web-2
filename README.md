# React Firebase Chat App

Une application web développée avec **React**, **Firebase** et **Bulma**, incluant l'authentification des utilisateurs, la gestion du profil (photo, pseudonyme, courriel) et un chat en temps réel.

Lien du site: https://ex02-9c6d2.web.app/ ou https://ex02-9c6d2.firebaseapp.com/

Plus d'info: https://github.com/PepiDearo/TP1-App-Web-2

---

## Fonctionnalités principales

- Authentification Firebase (email/mot de passe & utilisateurs anonymes)
- Chat en temps réel via Firestore
- Page de profil avec mise à jour de la photo, du pseudonyme et de l'adresse courriel
- Suppression de compte (sauf utilisateurs anonymes)
- Interface stylisée avec **Bulma**
- Navigation gérée avec **React Router DOM**

---

## Choix techniques

### Technologies utilisées

| Outil / Librairie                  | Rôle                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **React**                    | Librairie JavaScript pour la création d’interfaces dynamiques et modulaires                                |
| **React Router DOM**         | Gestion de la navigation entre les différentes pages (Login, Profil, Chat, etc.)                            |
| **Firebase**                 | Backend-as-a-Service : gère l'authentification, la base de données (Firestore) et le stockage des fichiers |
| **Bulma**                    | Framework CSS léger pour un design propre et réactif                                                       |
| **Firebase CLI (optionnel)** | Utilisé pour tester et déployer localement ou sur Firebase Hosting                                         |

## Installation

```bash
git clone https://github.com/PepiDearo/TP1-App-Web-2.git
cd <votre-path-de-repertoire>
npm install bulma, firebase, react-router-dom (dependances)
npm run dev
```
