import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  signInAnonymously, 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider
} from 'firebase/auth';
import { auth } from './firebase';
import './css/Login.css';
import './css/LoginSocial.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    verificationCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [activeTab, setActiveTab] = useState('email');
  const navigate = useNavigate();

  // Providers
  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();
  const githubProvider = new GithubAuthProvider();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Format telephone 514-XXX-XXXX
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); 
    
    // Format 514-XXX-XXXX
    if (value.length > 0) {
      value = value.substring(0, 10); // 10 chiffres max
      if (value.length > 6) {
        value = `${value.substring(0, 3)}-${value.substring(3, 6)}-${value.substring(6)}`;
      } else if (value.length > 3) {
        value = `${value.substring(0, 3)}-${value.substring(3)}`;
      }
    }
    
    setFormData({
      ...formData,
      phone: value
    });
  };

  // Connexion email/mot de passe
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/chat');
    } catch (error) {
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Connexion Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/chat');
    } catch (error) {
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Connexion Facebook
  const handleFacebookLogin = async () => {
    console.log("🔹 Bouton Facebook cliqué");
    setLoading(true);
    setError('');

    try {
      const result = await signInWithPopup(auth, facebookProvider);
      console.log("✅ Firebase a renvoyé :", result.user);
      navigate('/chat');
    } catch (error) {
      console.error("❌ Erreur login Facebook :", error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Connexion GitHub
  const handleGitHubLogin = async () => {
    console.log("🔹 Bouton GitHub cliqué");
    setLoading(true);
    setError('');

    try {
      const result = await signInWithPopup(auth, githubProvider);
      console.log("✅ Connexion GitHub réussie:", result.user);
      navigate('/chat');
    } catch (error) {
      console.error("❌ Erreur login GitHub:", error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Connexion anonyme
  const handleAnonymousLogin = async () => {
    setLoading(true);
    setError('');

    try {
      await signInAnonymously(auth);
      navigate('/chat');
    } catch (error) {
      setError('Erreur lors de la connexion anonyme');
    } finally {
      setLoading(false);
    }
  };

  // Connexion téléphone
  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal',
        callback: () => {}
      });

      // Format telephone pour Firebase (Canada +1)
      const cleanPhone = formData.phone.replace(/\D/g, ''); 
      const formattedPhone = `+1${cleanPhone}`; // canadaa code format
      
      const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      setConfirmationResult(result);
      setShowPhoneVerification(true);
    } catch (error) {
      console.error('Phone login error:', error);
      setError('Erreur lors de l\'envoi du code de vérification');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await confirmationResult.confirm(formData.verificationCode);
      navigate('/chat');
    } catch (error) {
      setError('Code de vérification incorrect');
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/user-not-found':
        return 'Aucun utilisateur trouvé avec cette adresse email';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect';
      case 'auth/too-many-requests':
        return 'Trop de tentatives échouées. Veuillez réessayer plus tard';
      case 'auth/account-exists-with-different-credential':
        return 'Un compte existe déjà avec cette adresse email';
      case 'auth/popup-closed-by-user':
        return 'La fenêtre de connexion a été fermée';
      case 'auth/configuration-not-found':
        return 'Configuration GitHub non trouvée';
      case 'auth/invalid-phone-number':
        return 'Numéro de téléphone invalide';
      case 'auth/quota-exceeded':
        return 'Quota SMS dépassé. Veuillez réessayer plus tard';
      default:
        return 'Une erreur est survenue lors de la connexion';
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">Connexion</h1>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Connexion sociale */}
          <div className="social-login">
            <button 
              className="social-button google-button"
              onClick={handleGoogleLogin}
              disabled={loading}
              type="button"
            >
              Continuer avec Google
            </button>
            
            <button 
              className="social-button facebook-button"
              onClick={handleFacebookLogin}
              disabled={loading}
              type="button"
            >
              Continuer avec Facebook
            </button>

            <button 
              className="social-button github-button"
              onClick={handleGitHubLogin}
              disabled={loading}
              type="button"
            >
              Continuer avec GitHub
            </button>
          </div>

          <div className="divider">
            <span>ou</span>
          </div>

          {/* Onglets */}
          <div className="tabs-container">
            <div className="tabs is-centered is-boxed">
              <ul>
                <li className={activeTab === 'email' ? 'is-active' : ''}>
                  <a onClick={() => setActiveTab('email')}>
                    <span className="icon is-small"><i className="fas fa-envelope"></i></span>
                    <span>Email</span>
                  </a>
                </li>
                <li className={activeTab === 'phone' ? 'is-active' : ''}>
                  <a onClick={() => setActiveTab('phone')}>
                    <span className="icon is-small"><i className="fas fa-phone"></i></span>
                    <span>Téléphone</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Connexion Email */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailLogin} className="login-form">
              <div className="field">
                <label className="label">Email</label>
                <div className="control">
                  <input
                    className="input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">Mot de passe</label>
                <div className="control">
                  <input
                    className="input"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Votre mot de passe"
                  />
                </div>
              </div>

              <div className="field">
                <button 
                  className={`login-button ${loading ? 'is-loading' : ''}`}
                  type="submit"
                  disabled={loading}
                >
                  Se connecter
                </button>
              </div>
            </form>
          )}

          {/* Connexion Téléphone */}
          {activeTab === 'phone' && (
            <div className="phone-form">
              {!showPhoneVerification ? (
                <form onSubmit={handlePhoneLogin}>
                  <div className="field">
                    <label className="label">Numéro de téléphone</label>
                    <div className="control">
                      <input
                        className="input"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        required
                        placeholder="514-123-4567"
                        maxLength="12" // 514-123-4567
                      />
                    </div>
                    <p className="help">Format: 514-XXX-XXXX (Canada)</p>
                  </div>

                  <div id="recaptcha-container" className="recaptcha-container"></div>

                  <div className="field">
                    <button 
                      className={`button is-info is-fullwidth ${loading ? 'is-loading' : ''}`}
                      type="submit"
                      disabled={loading}
                    >
                      Recevoir le code SMS
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={verifyCode}>
                  <div className="field">
                    <label className="label">Code de vérification</label>
                    <div className="control">
                      <input
                        className="input"
                        type="text"
                        name="verificationCode"
                        value={formData.verificationCode}
                        onChange={handleChange}
                        required
                        placeholder="Entrez le code reçu par SMS"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <button 
                      className={`button is-info is-fullwidth ${loading ? 'is-loading' : ''}`}
                      type="submit"
                      disabled={loading}
                    >
                      Vérifier le code
                    </button>
                  </div>

                  <button 
                    type="button"
                    className="button is-text is-small"
                    onClick={() => setShowPhoneVerification(false)}
                  >
                    Changer de numéro
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Connexion Anonyme */}
          <div className="anonymous-section">
            <div className="divider">Ou bien</div>
            <button 
              className={`anonymous-button ${loading ? 'is-loading' : ''}`}
              onClick={handleAnonymousLogin}
              disabled={loading}
            >
              Continuer anonymement
            </button>
          </div>

          <div className="login-links">
            <p>
              Pas encore de compte ?{' '}
              <Link to="/inscription" className="link">
                Créer un compte
              </Link>
            </p>
            <Link to="/" className="back-link">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;