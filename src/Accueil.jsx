import React from 'react';
import { Link } from 'react-router-dom';
import './css/Accueil.css';

const Accueil = () => {
  return (
    <div className="accueil-container">
      <div className="accueil-content">
        
        
        <div className="accueil-header">
          <h1 className="title is-1 has-text-primary">ChatApp</h1>
        </div>

        {/* Connexion/Inscription */}
        <div className="accueil-cards">
          <div className="accueil-card">
            <div className="card">
              <div className="card-content">
                <div className="content has-text-centered">
                  <div className="accueil-icon has-text-primary">
                    <i className="fas fa-sign-in-alt fa-3x"></i>
                  </div>
                  <h3 className="title is-4">Connexion</h3>
                  <p className="mb-4">
                    Déjà un compte ? Connectez-vous pour accéder à vos conversations.
                  </p>
                  <Link to="/login" className="button is-primary is-medium is-fullwidth">
                    Se connecter
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="accueil-card">
            <div className="card">
              <div className="card-content">
                <div className="content has-text-centered">
                  <div className="accueil-icon has-text-info">
                    <i className="fas fa-user-plus fa-3x"></i>
                  </div>
                  <h3 className="title is-4">Inscription</h3>
                  <p className="mb-4">
                    Nouveau ? Créez un compte pour commencer à chatter.
                  </p>
                  <Link to="/inscription" className="button is-info is-medium is-fullwidth">
                    S'inscrire
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        

      </div>
    </div>
  );
};

export default Accueil;