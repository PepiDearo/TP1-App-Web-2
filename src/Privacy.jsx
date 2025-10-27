import React from 'react';

const Privacy = () => {
  return (
    <section className="section">
      <div className="container">
        <div className="content">
          <h1 className="title">Politique de Confidentialité</h1>
          <p className="subtitle">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          
          <div className="box">
            <h2>Collecte et Utilisation des Données</h2>
            <p>
              Notre application de messagerie collecte et utilise les informations suivantes pour fournir nos services :
            </p>
            <ul>
              <li>
                <strong>Adresse e-mail :</strong> Utilisée pour l'authentification des utilisateurs et la gestion des comptes.
              </li>
              <li>
                <strong>Informations de profil public :</strong> Y compris votre nom et photo de profil, qui sont affichés aux autres utilisateurs dans le chat.
              </li>
              <li>
                <strong>Messages de discussion :</strong> Les messages que vous envoyez dans les discussions publiques et privées sont stockés pour maintenir l'historique des conversations.
              </li>
              <li>
                <strong>Statut en ligne :</strong> Votre statut en ligne/hors ligne est visible par les autres utilisateurs pour indiquer votre disponibilité.
              </li>
            </ul>
          </div>

          <div className="box">
            <h2>Comment Nous Utilisons Vos Données</h2>
            <ul>
              <li>Pour fournir et maintenir nos services de messagerie</li>
              <li>Pour authentifier les utilisateurs et sécuriser les comptes</li>
              <li>Pour afficher les profils utilisateurs dans les conversations</li>
              <li>Pour montrer le statut en ligne/hors ligne aux autres utilisateurs</li>
              <li>Pour maintenir l'historique des discussions pour une conversation continue</li>
            </ul>
          </div>

          <div className="box">
            <h2>Stockage et Sécurité des Données</h2>
            <p>
              Vos données sont stockées de manière sécurisée en utilisant les services Firebase. Nous mettons en œuvre 
              des mesures de sécurité appropriées pour protéger contre l'accès non autorisé, l'altération, la divulgation 
              ou la destruction de vos informations personnelles.
            </p>
          </div>

          <div className="box">
            <h2>Services Tiers</h2>
            <p>
              Nous utilisons Firebase Authentication et Firestore Database (services Google Cloud) pour gérer 
              l'authentification des utilisateurs et le stockage des données. Ces services respectent les pratiques 
              de sécurité standard de l'industrie.
            </p>
          </div>

          <div className="box">
            <h2>Vos Droits</h2>
            <p>
              Vous avez le droit de :
            </p>
            <ul>
              <li>Accéder aux informations personnelles que nous détenons sur vous</li>
              <li>Demander la correction de vos informations personnelles</li>
              <li>Demander la suppression de vos informations personnelles</li>
              <li>Vous opposer au traitement de vos informations personnelles</li>
              <li>Demander le transfert de vos informations personnelles</li>
            </ul>
          </div>

          <div className="box">
            <h2>Suppression des Données</h2>
            <p>
              Pour demander la suppression de votre compte et de toutes vos données personnelles, veuillez :
            </p>
            <ol>
              <li>Vous connecter à votre compte</li>
              <li>Aller dans les paramètres de votre profil</li>
              <li>Utiliser l'option "Supprimer mon compte"</li>
              <li>Ou nous contacter directement par e-mail</li>
            </ol>
            <p>
              Toutes vos données, y compris les messages, le profil et les informations d'authentification, 
              seront définitivement supprimées de nos systèmes sous 30 jours.
            </p>
          </div>

          <div className="box">
            <h2>Informations de Contact</h2>
            <p>
              Si vous avez des questions concernant cette Politique de Confidentialité ou si vous souhaitez 
              exercer vos droits, veuillez nous contacter à :
            </p>
            <p>
              <strong>E-mail :</strong> alexthach2004@gmail.com<br />
              <strong>Délai de réponse :</strong> Nous nous efforçons de répondre à toutes les demandes dans un délai de 48 heures.
            </p>
          </div>

          <div className="box">
            <h2>Modifications de la Politique</h2>
            <p>
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
              Les modifications prendront effet immédiatement après leur publication sur cette page. 
              Nous vous informerons de tout changement important en publiant un avis visible dans notre application.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Privacy;