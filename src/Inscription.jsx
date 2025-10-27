import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider
} from 'firebase/auth';
import { auth } from './firebase';
import './css/Inscription.css';
import './css/InscriptionSocial.css';

const Inscription = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    verificationCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('email');
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
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
    
    // Format as 514-XXX-XXXX
    if (value.length > 0) {
      value = value.substring(0, 10); // Limit de 10 chiffres
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

  // Inscription Google
  const handleGoogleSignup = async () => {
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

  // Inscription Facebook
  const handleFacebookSignup = async () => {
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

  // Inscription GitHub
  const handleGitHubSignup = async () => {
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

  // Inscription par email
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      await sendEmailVerification(userCredential.user);
      
      alert('Un email de vérification a été envoyé à votre adresse. Veuillez vérifier votre boîte mail.');
      navigate('/login');
    } catch (error) {
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Inscription par téléphone
  const handlePhoneSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-signup', {
        size: 'normal',
        callback: () => {}
      });

      // Format telephone pour Firebase (Canada +1)
      const cleanPhone = formData.phone.replace(/\D/g, ''); 
      const formattedPhone = `+1${cleanPhone}`; // canada code
      
      const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      setConfirmationResult(result);
      setShowPhoneVerification(true);
    } catch (error) {
      console.error('Phone signup error:', error);
      setError('Erreur lors de l\'envoi du code de vérification');
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneCode = async (e) => {
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
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée';
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/weak-password':
        return 'Le mot de passe est trop faible';
      case 'auth/operation-not-allowed':
        return 'Cette opération n\'est pas autorisée';
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
        return 'Une erreur est survenue lors de l\'inscription';
    }
  };

  return (
    <div className="inscription-page">
      <div className="inscription-container">
        <div className="inscription-card">
          <h1 className="inscription-title">Inscription</h1>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Inscription sociale */}
          <div className="social-signup">
            <button 
              className="social-button google-button"
              onClick={handleGoogleSignup}
              disabled={loading}
              type="button"
            >
              S'inscrire avec Google
            </button>
            
            <button 
              className="social-button facebook-button"
              onClick={handleFacebookSignup}
              disabled={loading}
              type="button"
            >
              S'inscrire avec Facebook
            </button>

            <button 
              className="social-button github-button"
              onClick={handleGitHubSignup}
              disabled={loading}
              type="button"
            >
              S'inscrire avec GitHub
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

          {/* Inscription Email */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailSignup} className="inscription-form">
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
                    placeholder="Votre mot de passe (min. 6 caractères)"
                    minLength="6"
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">Confirmer le mot de passe</label>
                <div className="control">
                  <input
                    className="input"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirmez votre mot de passe"
                    minLength="6"
                  />
                </div>
              </div>

              <div className="field">
                <button 
                  className={`inscription-button ${loading ? 'is-loading' : ''}`}
                  type="submit"
                  disabled={loading}
                >
                  S'inscrire
                </button>
              </div>
            </form>
          )}

          {/* Inscription Téléphone */}
          {activeTab === 'phone' && (
            <div className="phone-form">
              {!showPhoneVerification ? (
                <form onSubmit={handlePhoneSignup}>
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

                  <div id="recaptcha-signup" className="recaptcha-container"></div>

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
                <form onSubmit={verifyPhoneCode}>
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
                      Vérifier et s'inscrire
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

          <div className="inscription-links">
            <p>
              Déjà un compte ?{' '}
              <Link to="/login" className="link">
                Se connecter
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

export default Inscription;