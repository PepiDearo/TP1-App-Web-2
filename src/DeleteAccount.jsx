import React from 'react';

const DeleteAccount = () => {
  return (
    <section className="section">
      <div className="container">
        <div className="content">
          <h1 className="title">Suppression de Compte et Données</h1>
          
          <div className="box">
            <h2>Comment Supprimer Votre Compte</h2>
            <p>
              Pour demander la suppression de votre compte et de toutes vos données personnelles, vous avez plusieurs options :
            </p>
            
            <div className="content">
              <h3>Option 1 : Suppression Automatique</h3>
              <ol>
                <li>Connectez-vous à votre compte</li>
                <li>Allez dans les paramètres de votre profil</li>
                <li>Cliquez sur "Supprimer mon compte"</li>
                <li>Confirmez votre choix</li>
              </ol>
              
              <h3>Option 2 : Demande par E-mail</h3>
              <p>
                Envoyez-nous un e-mail à <strong>[alexthach2004@gmail.com]</strong> avec :
              </p>
              <ul>
                <li>L'objet : "Suppression de compte"</li>
                <li>Votre adresse e-mail associée au compte</li>
                <li>Votre nom d'utilisateur</li>
              </ul>
            </div>
          </div>

          <div className="box">
            <h2>Données Qui Seront Supprimées</h2>
            <p>Lorsque vous supprimez votre compte, nous supprimons définitivement :</p>
            <ul>
              <li>Votre profil utilisateur (nom, photo, informations personnelles)</li>
              <li>Votre adresse e-mail et données d'authentification</li>
              <li>Votre historique de messages privés</li>
              <li>Vos paramètres et préférences</li>
              <li>Votre statut en ligne et historique d'activité</li>
            </ul>
          </div>

          <div className="box">
            <h2>Délai de Suppression</h2>
            <p>
              La suppression de vos données est effectuée dans un délai maximum de <strong>30 jours</strong> après 
              votre demande. Vous recevrez une confirmation par e-mail une fois le processus terminé.
            </p>
          </div>

          <div className="box">
            <h2>Données Conservées</h2>
            <p>
              <strong>Note importante :</strong> Les messages que vous avez envoyés dans les salons publics 
              (comme le salon général) peuvent être conservés pour maintenir la cohérence des conversations 
              pour les autres utilisateurs, mais seront anonymisés et ne contiendront plus votre nom ou identifiant.
            </p>
          </div>

          <div className="box">
            <h2>Contact</h2>
            <p>
              Pour toute question concernant la suppression de vos données ou pour suivre l'état de votre demande :
            </p>
            <p>
              <strong>E-mail :</strong> [alexthach2004@gmail.com]<br />
              <strong>Réponse :</strong> Sous 48 heures
            </p>
          </div>

          <div className="notification is-info">
            <p>
              <strong>Conformité RGPD/CCPA :</strong> Cette procédure de suppression de données respecte 
              les réglementations européennes (RGPD) et californiennes (CCPA) sur la protection des données.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeleteAccount;